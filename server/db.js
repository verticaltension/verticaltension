import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "data", "catalog.json");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 5,
});

export const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS catalog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      format TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  if (existsSync(seedPath)) {
    const seed = JSON.parse(readFileSync(seedPath, "utf-8"));
    for (const item of seed) {
      await pool.query(
        `
        INSERT INTO catalog (id, title, category, status, description, format)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          description = EXCLUDED.description,
          format = EXCLUDED.format
      `,
        [
          item.id,
          item.title,
          item.category,
          item.status,
          item.description,
          item.format,
        ]
      );
    }
  }
};

export const listCatalog = async () => {
  const result = await pool.query("SELECT * FROM catalog ORDER BY title ASC");
  return result.rows;
};

export const insertContact = async ({ name, email, subject, message }) => {
  await pool.query(
    `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
    `,
    [name, email, subject || null, message]
  );
};
