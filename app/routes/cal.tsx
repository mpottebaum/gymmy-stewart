import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { v4 as uuid } from "uuid";
import { db } from "~/db";

export const meta: MetaFunction = () => {
  return [
    { title: "Gymmy Stewart" },
    { name: "description", content: "Get it, Brother" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const result = await db.execute("select * from workouts");
  console.log("res", result);
  const startDate = new Date().toUTCString();
  return json({
    user: {
      name: "Mike",
      startDate,
    },
  });
}

const weekDays = [
  { name: "sunday", abbrev: "s" },
  { name: "monday", abbrev: "m" },
  { name: "tuesday", abbrev: "t" },
  { name: "wednesday", abbrev: "w" },
  { name: "thursday", abbrev: "t" },
  { name: "friday", abbrev: "f" },
  { name: "saturday", abbrev: "s" },
];

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

interface CalendarDate {
  id: string;
  date: number | null;
}

function buildDates(today: Date): CalendarDate[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const days = [...new Array(lastDate.getDate())].map((_, i) => ({
    date: i + 1,
    id: uuid(),
  }));
  const firstDay = firstDate.getDay();
  const daysPad = [...new Array(firstDay)].map(() => ({
    id: uuid(),
    date: null,
  }));
  return [...daysPad, ...days];
}

type DateButtonProps = {
  date: number;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

function DateButton({ date, ...buttonProps }: DateButtonProps) {
  return (
    <div className="flex items-center">
      <button {...buttonProps} className="w-full p-2">
        {date}
      </button>
    </div>
  );
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const today = new Date();
  const month = today.getMonth();
  const dates = buildDates(today);

  function buildUTCDate(date: number) {
    return new Date(today.getFullYear(), month, date).toUTCString();
  }

  function onEmptyClick(date: number) {
    console.log("empty");
    navigate(`/cal/${buildUTCDate(date)}`);
  }
  return (
    <main className="flex h-full flex-col">
      <section>
        <header className="flex justify-center">
          <h1 className="uppercase">{months[month]}</h1>
        </header>
        <article className="grid grid-cols-7">
          {weekDays.map(({ abbrev, name }) => (
            <h2 key={name} className="p-2 text-center uppercase">
              {abbrev}
            </h2>
          ))}
          {dates.map(({ date, id }) => {
            return (
              <div key={id} className="w-full">
                {date && (
                  <DateButton date={date} onClick={() => onEmptyClick(date)} />
                )}
              </div>
            );
          })}
        </article>
      </section>
      <Outlet />
    </main>
  );
}
