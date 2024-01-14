import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { v4 as uuid } from "uuid";

export const meta: MetaFunction = () => {
  return [
    { title: "Gymmy Stewart" },
    { name: "description", content: "Get it, Brother" },
  ];
};

const CYCLE_LENGTH = 9;

type GymDayType = "arms" | "legs" | undefined;

interface Workout {
  id: string;
  utcDate: string;
  title: string;
  notes: string;
}

interface FutureGymDay {
  id: string;
  type: GymDayType;
  date: number;
}

type FutureGymDays = Record<FutureGymDay["date"], FutureGymDay>;

function isInCycle(startCycleDate: Date, date: Date) {
  const startNextCycleDate = new Date(
    startCycleDate.getFullYear(),
    startCycleDate.getMonth(),
    startCycleDate.getDate() + CYCLE_LENGTH,
  );
  return date > startCycleDate && date < startNextCycleDate;
}

const futureGymDayTypes: GymDayType[] = [
  "arms",
  undefined,
  "legs",
  undefined,
  "arms",
  undefined,
  "legs",
  undefined,
  undefined,
];

function buildFutureGymDays(startDate: Date, today: Date) {
  let startCycleDate = startDate;
  while (!isInCycle(startCycleDate, today)) {
    startCycleDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + CYCLE_LENGTH,
    );
  }
  const startGymDays = startCycleDate;

  const lastDateInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  );
  let currentDate = startGymDays;
  const gymDays: FutureGymDays = {};
  let cycleDate = 0;
  while (currentDate <= lastDateInMonth) {
    const gymDay = {
      id: uuid(),
      type: futureGymDayTypes[cycleDate],
      date: currentDate.getDate(),
    };
    gymDays[gymDay.date] = gymDay;
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1,
    );
    cycleDate++;
    if (cycleDate >= CYCLE_LENGTH) cycleDate = 0;
  }
  return gymDays;
}

export function loader(args: LoaderFunctionArgs) {
  const startDate = new Date().toUTCString();
  const startDateConstructo = new Date(startDate);
  const futureGymDays = buildFutureGymDays(startDateConstructo, new Date());
  return json({
    user: {
      name: "Mike",
      startDate,
    },
    futureGymDays,
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
  const { user, futureGymDays } = useLoaderData<typeof loader>();
  const today = new Date();
  const month = today.getMonth();
  const dates = buildDates(today);

  function onArmsClick() {
    console.log("arms");
  }
  function onLegsClick() {
    console.log("legs");
  }
  function onEmptyClick() {
    console.log("empty");
  }
  return (
    <main className="flex flex-col">
      <section>
        <header className="flex justify-center">
          <h1 className="uppercase">{months[month]}</h1>
        </header>
        <article className="grid grid-cols-7">
          {weekDays.map(({ abbrev, name }) => (
            <h2 key={name} className="uppercase text-center p-2">
              {abbrev}
            </h2>
          ))}
          {dates.map(({ date, id }) => {
            const futureGymDay = date && futureGymDays[date];
            const isFutureGymDay = futureGymDay && futureGymDay.type;
            return (
              <div key={id} className="w-full">
                {isFutureGymDay && futureGymDay.type === "arms" && (
                  <div className="w-full bg-red-600">
                    <DateButton date={date} onClick={onArmsClick} />
                  </div>
                )}
                {isFutureGymDay && futureGymDay.type === "legs" && (
                  <div className="w-full bg-blue-600">
                    <DateButton date={date} onClick={onLegsClick} />
                  </div>
                )}
                {!isFutureGymDay && date && (
                  <DateButton date={date} onClick={onEmptyClick} />
                )}
              </div>
            );
          })}
        </article>
      </section>
    </main>
  );
}
