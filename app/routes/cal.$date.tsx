import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

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

export function loader({ params }: LoaderFunctionArgs) {
  const { date } = params;
  if (date && isDateValid(date)) {
    return json({
      utcDate: date,
    });
  }
  throw Error("invalid utc date");
}

export default function DateRoute() {
  const { utcDate } = useLoaderData<typeof loader>();
  return (
    <section className="h-full p-4">
      <header className="pb-4">
        <h1>{utcDate}</h1>
        <h4>Workout</h4>
      </header>
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
    </section>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const utcDate = formData.get("utcDate");
  const title = formData.get("title");
  const notes = formData.get("notes");
  console.log({
    utcDate,
    title,
    notes,
  });
  return json({});
}
