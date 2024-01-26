import bcrypt from 'bcrypt';
import {
  createCookie,
  createSessionStorage,
} from '@remix-run/node';
import { User, sessionSchema } from './types';
import { db } from './db.server';

const PW_SALT = 10;
const SESSION_COOKIE_SECRET =
  process.env.SESSION_COOKIE_SECRET;

const SECONDS_IN_DAY = 60 * 60 * 24;

export const sessionCookie = createCookie('session', {
  maxAge: 30 * SECONDS_IN_DAY,
  httpOnly: true,
  secure: true,
  secrets: SESSION_COOKIE_SECRET
    ? [SESSION_COOKIE_SECRET]
    : [],
});

export const { getSession, commitSession, destroySession } =
  createSessionStorage({
    cookie: sessionCookie,
    async createData(data) {
      await db.execute({
        sql: 'INSERT INTO sessions (user_id) VALUES ($userId)',
        args: {
          userId: data.userId,
        },
      });
      const {
        rows: [sessionRow],
      } = await db.execute(
        'SELECT * FROM sessions ORDER BY id DESC LIMIT 1',
      );
      const session = sessionSchema.parse(sessionRow);
      return session.id.toString();
    },
    async readData(id) {
      const {
        rows: [sessionRow],
      } = await db.execute({
        sql: 'SELECT * FROM sessions WHERE id = ? LIMIT 1',
        args: [id],
      });
      const session = sessionSchema.parse(sessionRow);
      return session;
    },
    async updateData(id, data) {
      await db.execute({
        sql: 'UPDATE sessions SET user_id = $userId WHERE id = $id',
        args: {
          id,
          userId: data.user_id,
        },
      });
    },
    async deleteData(id) {
      await db.execute({
        sql: 'DELETE FROM sessions WHERE id = ?',
        args: [id],
      });
    },
  });

export async function createPasswordHash(password: string) {
  if (!PW_SALT) {
    throw Error('no password salt my guy');
  }
  return await bcrypt.hash(password, PW_SALT);
}

export async function checkPassword(
  password: string,
  hash: string,
) {
  if (!PW_SALT) {
    throw Error('no password salt my guy');
  }
  return await bcrypt.compare(password, hash);
}

export async function checkSession(
  request: Request,
): Promise<User['id'] | undefined> {
  const cookieHeader = request.headers.get('Cookie');
  const remixSession = await getSession(cookieHeader);
  const userId = remixSession.get('user_id');
  if (!userId) {
    return;
  }
  return userId;
}

export async function createSession(userId: User['id']) {
  const newSession = await getSession(null);
  newSession.set('userId', userId);
  return await commitSession(newSession);
}
