import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import { z } from "zod";
import { workoutSchema } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Gymmy Stewart" },
    { name: "description", content: "Get it, Brother" },
  ];
};

function isDateValid(utcDate?: string) {
  if (!utcDate) return false;
  const date = new Date(utcDate);
  return date.toString() !== "Invalid Date";
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { date } = params;
  const parsedDate = z.string().parse(date);
  const { rows } = await db.execute({
    sql: "select * from workouts where utc_date = ?",
    args: [parsedDate],
  });
  const workoutRow = rows[0];
  if (workoutRow) {
    const workout = workoutSchema.parse(workoutRow);
    return json({
      workout,
      utcDate: undefined,
    });
  }
  if (date && isDateValid(date)) {
    return json({
      workout: undefined,
      utcDate: date,
    });
  }
  throw Error("invalid utc date");
}

export default function DateRoute() {
  const { workout, utcDate } = useLoaderData<typeof loader>();
  return (
    <section className="h-full p-4">
      <header className="pb-4">
        <h1>{utcDate}</h1>
        <h4>Workout</h4>
      </header>
      {!workout && (
        <Form method="POST" className="flex flex-col items-center">
          <input name="utcDate" type="hidden" value={utcDate} />
          <div className="flex w-full flex-col pb-4">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="border border-black"
            />
          </div>
          <div className="flex w-full flex-col pb-4">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={10}
              className="border border-black"
            ></textarea>
          </div>
          <button type="submit" className="rounded border border-black p-2">
            Get Some
          </button>
        </Form>
      )}
      {workout && (
        <div>
          <h2>{workout.title}</h2>
          <p>{workout.notes}</p>
        </div>
      )}
    </section>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const utcDate = z.string().parse(formData.get("utcDate"));
  const title = z.string().parse(formData.get("title"));
  const notes = z.string().parse(formData.get("notes"));
  const result = await db.execute({
    sql: "insert into workouts (utc_date,title,notes) values ($utcDate,$title,$notes);",
    args: {
      utcDate,
      title,
      notes,
    },
  });
  return json({
    result,
    ok: true,
  });
}
