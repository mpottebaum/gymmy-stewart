import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { months, weekDays } from "~/constants/shared";
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
  const searchParams = new URLSearchParams(args.request.url);
  const urlMonth = searchParams.get("month");
  const urlYear = searchParams.get("year");
  const currentMonthDate =
    urlMonth && urlYear ? new Date(+urlYear, +urlMonth) : new Date();
  const { firstDate, lastDate } = getMonthDateBounds(currentMonthDate);
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
  const { date: selectedUtcDate } = useParams();
  const selectedDate = !!selectedUtcDate && new Date(selectedUtcDate);
  const { workouts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlMonth = searchParams.get("month");
  const urlYear = searchParams.get("year");
  const today =
    urlMonth && urlYear ? new Date(+urlYear, +urlMonth) : new Date();
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

  function onDateClick(date: number) {
    navigate(`/cal/${buildUTCDate(date)}?${searchParams}`);
  }
  return (
    <main className="flex h-full flex-col items-center">
      <section className="flex h-full w-full max-w-2xl flex-col justify-between md:flex-col-reverse md:justify-end">
        <section className="flex flex-col">
          <header className="flex flex-col bg-blue-800 p-4">
            <h1 className="text-center text-2xl font-bold uppercase text-white">
              {months[month]} {year}
            </h1>
          </header>
          <article className="grid grid-cols-7">
            {weekDays.map(({ abbrev, name }) => (
              <h2 key={name} className="p-2 text-center uppercase">
                {abbrev}
              </h2>
            ))}
            {dates.map(({ date, id, workout }) => {
              const isSelected =
                selectedDate && selectedDate.getDate() === date;
              return (
                <div key={id} className="w-full">
                  {isSelected && workout && date && (
                    <div className="bg-orange-300 text-blue-700">
                      <DateButton
                        date={date}
                        onClick={() => onDateClick(date)}
                      />
                    </div>
                  )}
                  {!isSelected && workout && date && (
                    <div className="bg-orange-600 text-white">
                      <DateButton
                        date={date}
                        onClick={() => onDateClick(date)}
                      />
                    </div>
                  )}
                  {isSelected && !workout && date && (
                    <div className="bg-blue-300 text-orange-700">
                      <DateButton
                        date={date}
                        onClick={() => onDateClick(date)}
                      />
                    </div>
                  )}
                  {!isSelected && !workout && date && (
                    <DateButton date={date} onClick={() => onDateClick(date)} />
                  )}
                </div>
              );
            })}
          </article>
          <Outlet />
        </section>
        <nav className="flex justify-between bg-orange-600 p-4">
          <button
            className="rounded border-none bg-blue-200 px-7 py-2 text-orange-700"
            onClick={() => {
              const newMonth = month - 1;
              const newMonthParam = newMonth < 0 ? 11 : newMonth;
              searchParams.set("month", newMonthParam.toString());
              const newYearParam = newMonth < 0 ? year - 1 : year;
              searchParams.set("year", newYearParam.toString());
              navigate(`/cal?${searchParams}`);
            }}
          >
            &#60;
          </button>
          <button
            className="rounded border-none bg-blue-200 px-7 py-2 uppercase text-orange-700"
            onClick={() => navigate("/cal")}
          >
            Now
          </button>
          <button
            className="rounded border-none bg-blue-200 px-7 py-2 text-orange-700"
            onClick={() => {
              const newMonth = month + 1;
              const newMonthParam = newMonth > 11 ? 0 : newMonth;
              searchParams.set("month", newMonthParam.toString());
              const newYearParam = newMonth > 11 ? year + 1 : year;
              searchParams.set("year", newYearParam.toString());
              navigate(`/cal?${searchParams}`);
            }}
          >
            &#62;
          </button>
        </nav>
      </section>
    </main>
  );
}
