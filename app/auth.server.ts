import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createCookie } from "@remix-run/node";
import { Session, User, sessionSchema } from "./types";
import { db } from "./db.server";

const PW_SALT = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_COOKIE_SECRET = process.env.SESSION_COOKIE_SECRET;

const SECONDS_IN_DAY = 60 * 60 * 24;

export const sessionCookie = createCookie("session", {
  maxAge: 30 * SECONDS_IN_DAY,
  httpOnly: true,
  secure: true,
  secrets: SESSION_COOKIE_SECRET ? [SESSION_COOKIE_SECRET] : [],
});

export async function createPasswordHash(password: string) {
  if (!PW_SALT) {
    throw Error("no password salt my guy");
  }
  return await bcrypt.hash(password, PW_SALT);
}

export async function checkPassword(password: string, hash: string) {
  if (!PW_SALT) {
    throw Error("no password salt my guy");
  }
  return await bcrypt.compare(password, hash);
}

export async function serializeSessionCookie(session: Session) {
  if (!JWT_SECRET) {
    throw Error("no secret brother man");
  }
  const token = jwt.sign(session, JWT_SECRET);
  return await sessionCookie.serialize(token);
}

export async function destroySessionCookie() {
  return await sessionCookie.serialize("");
}

export async function checkSession(
  request: Request,
): Promise<User["id"] | undefined> {
  if (!JWT_SECRET) {
    throw Error("no secret brother man");
  }
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await sessionCookie.parse(cookieHeader);
    const tokenSession = jwt.verify(token, JWT_SECRET);
    const { id } = sessionSchema.parse(tokenSession);
    const {
      rows: [sessionRow],
    } = await db.execute({
      sql: "SELECT user_id FROM sessions WHERE id = ? LIMIT 1",
      args: [id],
    });
    const session = sessionSchema.pick({ user_id: true }).parse(sessionRow);
    return session.user_id;
  } catch (err) {
    return;
  }
}

export async function createSession(userId: User["id"]) {
  await db.execute({
    sql: "INSERT INTO sessions (user_id) VALUES ($userId)",
    args: {
      userId: userId,
    },
  });
  const {
    rows: [sessionRow],
  } = await db.execute("SELECT * FROM sessions ORDER BY id DESC LIMIT 1");
  return sessionSchema.parse(sessionRow);
}

export async function destroySession(request: Request): Promise<boolean> {
  if (!JWT_SECRET) {
    throw Error("no secret brother man");
  }
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await sessionCookie.parse(cookieHeader);
    const tokenSession = jwt.decode(token);
    const { id } = sessionSchema.parse(tokenSession);
    await db.execute({
      sql: "DELETE FROM sessions WHERE id = ?",
      args: [id],
    });
    return true;
  } catch (err) {
    return false;
  }
}
