import { createClient } from '@libsql/client'

function setupDb() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.DB_URL
  ) {
    return createClient({
      url: process.env.DB_URL,
      authToken: process.env.DB_TOKEN,
    })
  }
  if (process.env.NODE_ENV === 'development') {
    return createClient({
      url: 'file:infra/dev.db',
    })
  }
  throw Error("db's a no go, bro")
}

export const db = setupDb()
