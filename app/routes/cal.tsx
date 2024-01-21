import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react'
import { z } from 'zod'
import { checkSession } from '~/auth.server'
import { DateButton, Layout } from '~/components'
import { months, weekDays } from '~/constants/shared'
import { db } from '~/db.server'
import { workoutSchema } from '~/types'
import {
  buildCalendarDates,
  buildUTCDate,
  getMonthDateBounds,
} from '~/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Gymmy Stewart' },
    {
      name: 'description',
      content: 'Get it, Brother',
    },
  ]
}

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const userId = await checkSession(request)
  if (!userId) {
    return redirect('/login')
  }
  const searchParams = new URLSearchParams(request.url)
  const urlMonth = searchParams.get('month')
  const urlYear = searchParams.get('year')
  const currentMonthDate =
    urlMonth && urlYear
      ? new Date(+urlYear, +urlMonth)
      : new Date()
  const { firstDate, lastDate } = getMonthDateBounds(
    currentMonthDate,
  )
  const { rows } = await db.execute({
    sql: 'select id,epoch_date from workouts where epoch_date >= $first and epoch_date <= $last',
    args: {
      first: firstDate.getTime(),
      last: lastDate.getTime(),
    },
  })
  const workouts = z
    .array(
      workoutSchema.pick({
        id: true,
        epoch_date: true,
      }),
    )
    .parse(rows)
  const startDate = new Date().toUTCString()
  return json({
    user: {
      name: 'Mike',
      startDate,
    },
    workouts: workouts.map((workout) => {
      const date = new Date(workout.epoch_date)
      return {
        ...workout,
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
      }
    }),
  })
}

export default function Index() {
  const { date: selectedUtcDate } = useParams()
  const selectedDate =
    !!selectedUtcDate && new Date(selectedUtcDate)
  const { workouts } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlMonth = searchParams.get('month')
  const urlYear = searchParams.get('year')
  const today =
    urlMonth && urlYear
      ? new Date(+urlYear, +urlMonth)
      : new Date()
  const month = today.getMonth()
  const year = today.getFullYear()
  const dates = buildCalendarDates(today).map((date) => {
    const workout = workouts.find(
      (w) =>
        w.year === year &&
        w.month === month &&
        w.date === date.date,
    )
    return {
      ...date,
      workout,
    }
  })

  function onDateClick(date: number) {
    navigate(
      `/cal/${buildUTCDate(year, month, date)}?${searchParams}`,
    )
  }
  return (
    // <main className="flex h-full flex-col items-center">
    //   <section className="flex h-full w-full max-w-2xl flex-col justify-between md:flex-col-reverse md:justify-end">
    <Layout>
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
              selectedDate.getDate() === date
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
            )
          })}
        </article>
        <Outlet />
      </section>
      <nav className='flex justify-between bg-orange-600 p-4'>
        <button
          className='rounded border-none bg-blue-200 px-7 py-2 text-orange-700'
          onClick={() => {
            const newMonth = month - 1
            const newMonthParam =
              newMonth < 0 ? 11 : newMonth
            searchParams.set(
              'month',
              newMonthParam.toString(),
            )
            const newYearParam =
              newMonth < 0 ? year - 1 : year
            searchParams.set(
              'year',
              newYearParam.toString(),
            )
            navigate(`/cal?${searchParams}`)
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
            const newMonth = month + 1
            const newMonthParam =
              newMonth > 11 ? 0 : newMonth
            searchParams.set(
              'month',
              newMonthParam.toString(),
            )
            const newYearParam =
              newMonth > 11 ? year + 1 : year
            searchParams.set(
              'year',
              newYearParam.toString(),
            )
            navigate(`/cal?${searchParams}`)
          }}
        >
          &#62;
        </button>
      </nav>
    </Layout>
    //   </section>
    // </main>
  )
}
