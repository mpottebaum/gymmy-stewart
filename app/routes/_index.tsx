import { redirect } from '@remix-run/node'

export function loader() {
  throw redirect('/cal', 302)
}
