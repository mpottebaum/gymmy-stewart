import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node'
import { z } from 'zod'
import { UserForm } from '~/components/user-form'
import { db } from '~/db.server'
import { userSchema } from '~/types'
import {
  checkSession,
  createPasswordHash,
  createSession,
  serializeSessionCookie,
} from '~/auth.server'
import { useEffect, useState } from 'react'
import { Link, useActionData } from '@remix-run/react'
import { routes } from '~/constants/shared'

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const userId = await checkSession(request)
  if (userId) {
    return redirect('/')
  }
  return json({})
}

export default function Register() {
  const [loginError, setLoginError] = useState<
    string | undefined
  >()
  const actionData = useActionData<typeof action>()
  useEffect(() => {
    if (actionData && !actionData.ok) {
      setLoginError(actionData.error)
    }
  }, [actionData])
  return (
    <main>
      <section className='p-2'>
        <h1>Register</h1>
        <p>
          yo c&apos;mon in the water&apos;s warm here in the
          Gymmy Stew
        </p>
        <UserForm
          method='POST'
          type='register'
          onInputsChange={() => setLoginError(undefined)}
        />
      </section>
      <section>
        <Link to={routes.login}>
          <button>
            <p>log in</p>
          </button>
        </Link>
      </section>
      {loginError && <section>{loginError}</section>}
    </main>
  )
}

export async function action({
  request,
}: ActionFunctionArgs) {
  if (request.method === 'POST') {
    const formData = await request.formData()
    const username = z
      .string()
      .parse(formData.get('username'))
    const password = z
      .string()
      .parse(formData.get('password'))
    const confirmPassword = z
      .string()
      .parse(formData.get('confirmPassword'))
    if (password !== confirmPassword) {
      return json({
        ok: false,
        error: 'passwords need to match dude',
      })
    }
    const passwordHash = await createPasswordHash(password)
    await db.execute({
      sql: 'INSERT INTO users (username, password_hash) VALUES ($username, $passwordHash)',
      args: {
        username,
        passwordHash,
      },
    })
    const {
      rows: [userRow],
    } = await db.execute(
      'SELECT id FROM users ORDER BY id DESC LIMIT 1',
    )
    const user = userSchema
      .pick({ id: true })
      .parse(userRow)
    const session = await createSession(user.id)
    return redirect('/', {
      headers: {
        'Set-Cookie': await serializeSessionCookie(session),
      },
    })
  }
  return json({
    ok: false,
    error: '/register unhandled method',
  })
}
