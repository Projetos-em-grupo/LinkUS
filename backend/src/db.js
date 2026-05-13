import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nao definida");
}

const globalForSql = globalThis;

export const sql =
  globalForSql.sql ||
  postgres(connectionString, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForSql.sql = sql;
}

function normalizeParams(params) {
  if (params === undefined) return [];
  return Array.isArray(params) ? params : [params];
}

function convertPlaceholders(query) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function query(text, params) {
  const values = normalizeParams(params);

  const result = await sql.unsafe(
    convertPlaceholders(text),
    values
  );

  if (result.command === "SELECT") {
    return [result, null];
  }

  return [
    {
      affectedRows: result.count ?? 0,
      command: result.command,
      rows: result,
    },
    null,
  ];
}

export default {
  query,
};