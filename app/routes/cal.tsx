import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import { z } from 'zod';
import { checkSession } from '~/auth.server';
import { DateButton, Layout } from '~/components';
import {
  months,
  weekDays,
  AppSearchParams,
} from '~/constants/shared';
import { db } from '~/db.server';
import { workoutSchema } from '~/types';
import {
  buildCalendarDates,
  buildUTCDate,
  getMonthDateBounds,
} from '~/utils';

export const meta: MetaFunction = () => {
  return [
    { title: 'Gymmy Stewart' },
    {
      name: 'description',
      content: 'Get it, Brother',
    },
  ];
};

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const userId = await checkSession(request);
  if (!userId) {
    return redirect('/login');
  }
  const searchParams = new URLSearchParams(request.url);
  const urlMonth = searchParams.get(AppSearchParams.Month);
  const urlYear = searchParams.get(AppSearchParams.Year);
  const currentMonthDate =
    urlMonth && urlYear
      ? new Date(+urlYear, +urlMonth)
      : new Date();
  const { firstDate, lastDate } = getMonthDateBounds(
    currentMonthDate,
  );
  const { rows } = await db.execute({
    sql: 'SELECT id,epoch_date FROM workouts WHERE epoch_date >= $first AND epoch_date <= $last AND user_id = $userId',
    args: {
      first: firstDate.getTime(),
      last: lastDate.getTime(),
      userId,
    },
  });
  const workouts = z
    .array(
      workoutSchema.pick({
        id: true,
        epoch_date: true,
      }),
    )
    .parse(rows);
  return json({
    userId,
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

interface Stuff {
  urlMonth?: string;
  urlYear?: string;
  selectedDate?: Date;
}

function whatIsToday({
  selectedDate,
  urlMonth,
  urlYear,
}: Stuff) {
  if (selectedDate) {
    return selectedDate;
  }
  if (urlMonth && urlYear) {
    return new Date(+urlYear, +urlMonth);
  }
  return new Date();
}

export default function Index() {
  const { date: selectedUtcDate } = useParams();
  const selectedDate =
    !!selectedUtcDate && new Date(selectedUtcDate);
  const { workouts, userId } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlMonth =
    searchParams.get(AppSearchParams.Month) ?? undefined;
  const urlYear =
    searchParams.get(AppSearchParams.Year) ?? undefined;
  const today = whatIsToday({
    selectedDate: selectedDate ? selectedDate : undefined,
    urlMonth,
    urlYear,
  });
  const month = today.getMonth();
  const year = today.getFullYear();
  const dates = buildCalendarDates(today).map((date) => {
    const workout = workouts.find(
      (w) =>
        w.year === year &&
        w.month === month &&
        w.date === date.date,
    );
    return {
      ...date,
      workout,
    };
  });

  function onDateClick(date: number) {
    searchParams.delete(AppSearchParams.Month);
    searchParams.delete(AppSearchParams.Year);
    navigate(
      `/cal/${buildUTCDate(year, month, date)}?${searchParams}`,
    );
  }
  return (
    <Layout userId={userId}>
      <section className='flex h-full flex-col'>
        <header className='flex flex-col bg-blue-800 p-4'>
          <h1 className='text-center text-2xl font-bold uppercase text-white'>
            {months[month]} {year}
          </h1>
        </header>
        <article className='grid grid-cols-7'>
          {weekDays.map(({ abbrev, name }) => (
            <h2
              key={name}
              className='p-2 text-center uppercase'
            >
              {abbrev}
            </h2>
          ))}
          {dates.map(({ date, id, workout }) => {
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === date;
            return (
              <div key={id} className='w-full'>
                {isSelected && workout && date && (
                  <div className='bg-orange-300 text-blue-700'>
                    <DateButton
                      date={date}
                      onClick={() => onDateClick(date)}
                    />
                  </div>
                )}
                {!isSelected && workout && date && (
                  <div className='bg-orange-600 text-white'>
                    <DateButton
                      date={date}
                      onClick={() => onDateClick(date)}
                    />
                  </div>
                )}
                {isSelected && !workout && date && (
                  <div className='bg-blue-300 text-orange-700'>
                    <DateButton
                      date={date}
                      onClick={() => onDateClick(date)}
                    />
                  </div>
                )}
                {!isSelected && !workout && date && (
                  <DateButton
                    date={date}
                    onClick={() => onDateClick(date)}
                  />
                )}
              </div>
            );
          })}
        </article>
        <Outlet context={userId} />
      </section>
      <nav className='flex justify-between bg-orange-600 p-4'>
        <button
          className='rounded border-none bg-blue-200 px-7 py-2 text-orange-700'
          onClick={() => {
            const newMonth = month - 1;
            const newMonthParam =
              newMonth < 0 ? 11 : newMonth;
            searchParams.set(
              AppSearchParams.Month,
              newMonthParam.toString(),
            );
            const newYearParam =
              newMonth < 0 ? year - 1 : year;
            searchParams.set(
              AppSearchParams.Year,
              newYearParam.toString(),
            );
            navigate(`/cal?${searchParams}`);
          }}
        >
          &#60;
        </button>
        <button
          className='rounded border-none bg-blue-200 px-7 py-2 uppercase text-orange-700'
          onClick={() => navigate('/cal')}
        >
          Now
        </button>
        <button
          className='rounded border-none bg-blue-200 px-7 py-2 text-orange-700'
          onClick={() => {
            const newMonth = month + 1;
            const newMonthParam =
              newMonth > 11 ? 0 : newMonth;
            searchParams.set(
              AppSearchParams.Month,
              newMonthParam.toString(),
            );
            const newYearParam =
              newMonth > 11 ? year + 1 : year;
            searchParams.set(
              AppSearchParams.Year,
              newYearParam.toString(),
            );
            navigate(`/cal?${searchParams}`);
          }}
        >
          &#62;
        </button>
      </nav>
    </Layout>
  );
}
