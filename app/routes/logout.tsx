import {
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { destroySession, getSession } from '~/auth.server';

export async function action({
  request,
}: ActionFunctionArgs) {
  if (request.method === 'DELETE') {
    const remixSession = await getSession(
      request.headers.get('Cookie'),
    );
    return redirect('/', {
      headers: {
        'Set-Cookie': await destroySession(remixSession),
      },
    });
  }
  return redirect('/');
}
