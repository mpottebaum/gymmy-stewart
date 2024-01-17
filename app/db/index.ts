import { createClient, type Client } from "@libsql/client";

function setupDb() {
  let dbClient: Client;
  if (process.env.NODE_ENV === "production" && process.env.DB_URL) {
    dbClient = createClient({
      url: process.env.DB_URL,
      authToken: process.env.DB_TOKEN,
    });
  } else {
    dbClient = createClient({
      url: "file:infra/dev.db",
    });
  }
  return dbClient;
}

export const db = setupDb();
