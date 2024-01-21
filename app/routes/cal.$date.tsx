import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { db } from '~/db.server'
import { z } from 'zod'
import { Workout, workoutSchema } from '~/types'
import { months } from '~/constants/shared'
import { isDateValid } from '~/utils'
import { v4 as uuid } from 'uuid'
import { useEffect, useState } from 'react'

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
  params,
}: LoaderFunctionArgs) {
  const { date } = params
  const parsedDate = z.string().parse(date)
  const epochDate = new Date(parsedDate).getTime()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM workouts WHERE epoch_date = ?',
    args: [epochDate],
  })
  const workoutRow = rows[0]
  let workout: Workout | undefined
  if (workoutRow) {
    workout = workoutSchema.parse(workoutRow)
  }
  let utcDate: string | undefined
  if (date && isDateValid(date)) {
    utcDate = date
  }
  return json({
    workout,
    utcDate,
  })
}

export default function DateRoute() {
  const [isEditing, setIsEditing] = useState(false)
  const { workout, utcDate } =
    useLoaderData<typeof loader>()
  const date = new Date(utcDate ?? '')
  const epochDate = date.getTime()
  const formattedNotes =
    workout?.notes.split('\n').map((note) => ({
      note,
      id: uuid(),
    })) ?? []
  useEffect(() => {
    setIsEditing(!workout)
  }, [workout])
  return (
    <section className='flex h-full flex-col p-4'>
      <header className='flex w-full justify-between pb-4 capitalize'>
        <h1 className='text-xl font-bold'>
          {months[date.getMonth()]} {date.getDate()},{' '}
          {date.getFullYear()}
        </h1>
        {workout && (
          <Form method='DELETE'>
            <input
              name='epoch_date'
              type='hidden'
              value={epochDate}
            />
            <button
              type='submit'
              className='rounded border-none bg-blue-200 px-7 py-2 uppercase text-orange-700'
            >
              delete
            </button>
          </Form>
        )}
      </header>
      {isEditing && (
        <Form
          method={!workout ? 'POST' : 'PUT'}
          className='flex flex-col items-center'
        >
          <input
            name='epoch_date'
            type='hidden'
            value={epochDate}
          />
          <div className='flex w-full flex-col pb-4'>
            <label htmlFor='title' className='pb-1'>
              Title
            </label>
            <input
              id='title'
              name='title'
              type='text'
              className='w-full rounded border border-blue-700 bg-blue-100 p-2'
              defaultValue={workout?.title}
            />
          </div>
          <div className='flex w-full flex-col pb-4'>
            <label htmlFor='notes' className='pb-1'>
              Notes
            </label>
            <textarea
              id='notes'
              name='notes'
              rows={8}
              className='w-full rounded border border-blue-700 bg-blue-100 p-2'
              defaultValue={workout?.notes}
            ></textarea>
          </div>
          <div className='flex w-full justify-evenly'>
            {workout && (
              <button className='rounded border border-blue-700 bg-orange-100 p-2'>
                Cancel
              </button>
            )}
            <button
              type='submit'
              className='rounded border border-blue-700 bg-orange-600 p-2 text-white'
            >
              {!workout ? 'Get Some' : 'Update'}
            </button>
          </div>
        </Form>
      )}
      {!isEditing && workout && (
        <div className='flex h-full flex-col'>
          <button
            className='grow pb-1 capitalize'
            onClick={() => setIsEditing(true)}
          >
            <h2 className='text-start text-lg'>
              {workout.title}
            </h2>
          </button>
          <button
            className='h-full w-full rounded border border-blue-700 bg-orange-100 p-2'
            onClick={() => setIsEditing(true)}
          >
            <div className='h-full w-full text-start'>
              {formattedNotes.map(({ note, id }) => (
                <p key={id}>
                  {note ? note : <span>&nbsp;</span>}
                </p>
              ))}
            </div>
          </button>
        </div>
      )}
    </section>
  )
}

const sqlers: Record<string, string> = {
  POST: 'INSERT INTO workouts (epoch_date,title,notes) VALUES ($epochDate,$title,$notes);',
  PUT: 'UPDATE workouts SET title = $title, notes = $notes WHERE epoch_date = $epochDate',
  DELETE:
    'DELETE FROM workouts WHERE epoch_date = $epochDate',
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData()
  const epochDate = z.coerce
    .number()
    .parse(formData.get('epoch_date'))
  const title = z
    .union([z.string(), z.null()])
    .parse(formData.get('title'))
  const notes = z
    .union([z.string(), z.null()])
    .parse(formData.get('notes'))
  const sql = sqlers[request.method]
  if (!sql) {
    return json({
      ok: false,
      error: 'cal.$date action: unhandled method',
    })
  }
  const result = await db.execute({
    sql,
    args: {
      epochDate,
      title: title ?? '',
      notes: notes ?? '',
    },
  })
  return json({
    result,
    ok: true,
  })
}
