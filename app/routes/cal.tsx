import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "~/db.server";
import { workoutSchema } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Gymmy Stewart" },
    { name: "description", content: "Get it, Brother" },
  ];
};

function getMonthDateBounds(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  return {
    firstDate,
    lastDate,
  };
}

export async function loader(args: LoaderFunctionArgs) {
  const { firstDate, lastDate } = getMonthDateBounds(new Date());
  const { rows } = await db.execute({
    sql: "select id,epoch_date from workouts where epoch_date >= $first and epoch_date <= $last",
    args: {
      first: firstDate.getTime(),
      last: lastDate.getTime(),
    },
  });
  const workouts = z
    .array(workoutSchema.pick({ id: true, epoch_date: true }))
    .parse(rows);
  const startDate = new Date().toUTCString();
  return json({
    user: {
      name: "Mike",
      startDate,
    },
    workouts: workouts.map((workout) => {
      const date = new Date(workout.epoch_date);
      return {
        ...workout,
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
      };
    }),
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
  const { firstDate, lastDate } = getMonthDateBounds(today);
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
  const { workouts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const dates = buildDates(today).map((date) => {
    const workout = workouts.find(
      (w) => w.year === year && w.month === month && w.date === date.date,
    );
    return {
      ...date,
      workout,
    };
  });

  function buildUTCDate(date: number) {
    return new Date(today.getFullYear(), month, date).toUTCString();
  }

  function onEmptyClick(date: number) {
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
          {dates.map(({ date, id, workout }) => {
            return (
              <div key={id} className="w-full">
                {workout && date && (
                  <div className="bg-red-400">
                    <DateButton
                      date={date}
                      onClick={() => onEmptyClick(date)}
                    />
                  </div>
                )}
                {!workout && date && (
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
