import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { db } from "~/db.server";
import { z } from "zod";
import { Workout, workoutSchema } from "~/types";
import { months } from "~/constants/shared";

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
  const epochDate = new Date(parsedDate).getTime();
  const { rows } = await db.execute({
    sql: "select * from workouts where epoch_date = ?",
    args: [epochDate],
  });
  const workoutRow = rows[0];
  let workout: Workout | undefined;
  if (workoutRow) {
    workout = workoutSchema.parse(workoutRow);
  }
  let utcDate: string | undefined;
  if (date && isDateValid(date)) {
    utcDate = date;
  }
  return json({
    workout,
    utcDate,
  });
}

export default function DateRoute() {
  const { workout, utcDate } = useLoaderData<typeof loader>();
  const date = new Date(utcDate ?? "");
  const epochDate = date.getTime();
  return (
    <section className="h-full p-4">
      <header className="flex w-full justify-evenly pb-4 capitalize">
        <h4>Workout</h4>
        <h1>
          {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
        </h1>
      </header>
      {!workout && (
        <Form method="POST" className="flex flex-col items-center">
          <input name="epoch_date" type="hidden" value={epochDate} />
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
  const epochDate = z.coerce.number().parse(formData.get("epoch_date"));
  const title = z.string().parse(formData.get("title"));
  const notes = z.string().parse(formData.get("notes"));
  const result = await db.execute({
    sql: "insert into workouts (epoch_date,title,notes) values ($epochDate,$title,$notes);",
    args: {
      epochDate,
      title,
      notes,
    },
  });
  return json({
    result,
    ok: true,
  });
}
