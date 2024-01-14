import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const dateType = searchParams.get("type");
  return (
    <article>
      <p>{utcDate}</p>
      <p>{dateType}</p>
    </article>
  );
}
