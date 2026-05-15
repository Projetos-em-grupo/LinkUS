import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../scripts/schema.sql");

const connectionString =
  process.env.DATABASE_URL;

console.log("Conectando ao banco...", connectionString);

if (!connectionString) {
  throw new Error(
    "Banco nao configurado. Defina DATABASE_URL com a connection string do Supabase."
  );
}

export const sql = postgres(connectionString);

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
  const result = await sql.unsafe(convertPlaceholders(text), values);

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

async function initializeSchema() {
  const shouldInitializeSchema = process.env.DB_INIT_SCHEMA !== "false";

  if (!shouldInitializeSchema) {
    return;
  }

  const schema = fs.readFileSync(schemaPath, "utf8");
  await sql.unsafe(schema);
}

await initializeSchema();

export default {
  query,
  end: () => sql.end(),
};
