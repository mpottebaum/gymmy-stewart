import { Form } from '@remix-run/react'
import { type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  userId?: number
}

export function Layout({ children, userId }: LayoutProps) {
  return (
    <main className='flex h-full flex-col items-center'>
      <ul className='flex w-full justify-end'>
        {userId && (
          <li>
            <Form method='DELETE' action='/logout'>
              <button type='submit'>log out</button>
            </Form>
          </li>
        )}
      </ul>
      <section className='flex h-full w-full max-w-2xl flex-col justify-between md:flex-col-reverse md:justify-end'>
        {children}
      </section>
    </main>
  )
}
