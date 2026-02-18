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

const mapPublicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  preferredCurrency: row.preferred_currency,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastLoginAt: row.last_login_at,
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      preferred_currency TEXT NOT NULL DEFAULT 'USD',
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD'
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
    ON users (LOWER(email))
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      user_agent TEXT
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx
    ON user_sessions (user_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx
    ON user_sessions (expires_at)
  `);

  if (existsSync(seedPath)) {
    const seed = JSON.parse(readFileSync(seedPath, "utf-8"));
    if (Array.isArray(seed) && seed.length > 0) {
      const ids = seed.map((item) => item.id);
      const titles = seed.map((item) => item.title);
      const categories = seed.map((item) => item.category);
      const statuses = seed.map((item) => item.status);
      const descriptions = seed.map((item) => item.description);
      const formats = seed.map((item) => item.format);

      await pool.query(
        `
        INSERT INTO catalog (id, title, category, status, description, format)
        SELECT *
        FROM UNNEST(
          $1::text[],
          $2::text[],
          $3::text[],
          $4::text[],
          $5::text[],
          $6::text[]
        ) AS rows(id, title, category, status, description, format)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          description = EXCLUDED.description,
          format = EXCLUDED.format
      `,
        [ids, titles, categories, statuses, descriptions, formats]
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

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        preferred_currency,
        failed_login_attempts,
        locked_until,
        last_login_at,
        created_at,
        updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
};

export const createUser = async ({
  name,
  email,
  passwordHash,
  preferredCurrency = "USD",
}) => {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash, preferred_currency)
      VALUES ($1, LOWER($2), $3, $4)
      RETURNING
        id,
        name,
        email,
        preferred_currency,
        created_at,
        updated_at,
        last_login_at
    `,
    [name, email, passwordHash, preferredCurrency]
  );

  return mapPublicUser(result.rows[0]);
};

export const markLoginFailure = async ({
  userId,
  maxFailedAttempts,
  lockMinutes,
}) => {
  const result = await pool.query(
    `
      UPDATE users
      SET
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE
          WHEN locked_until IS NOT NULL AND locked_until > NOW() THEN locked_until
          WHEN failed_login_attempts + 1 >= $2 THEN NOW() + (($3::text || ' minutes')::interval)
          ELSE NULL
        END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING failed_login_attempts, locked_until
    `,
    [userId, maxFailedAttempts, lockMinutes]
  );

  return result.rows[0] || null;
};

export const resetLoginFailures = async (userId) => {
  await pool.query(
    `
      UPDATE users
      SET
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `,
    [userId]
  );
};

export const createSession = async ({
  userId,
  tokenHash,
  expiresAt,
  ipAddress,
  userAgent,
}) => {
  const result = await pool.query(
    `
      INSERT INTO user_sessions (
        user_id,
        token_hash,
        expires_at,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [userId, tokenHash, expiresAt, ipAddress || null, userAgent || null]
  );

  return result.rows[0]?.id || null;
};

export const pruneUserSessions = async ({ userId, maxSessions }) => {
  await pool.query(
    `
      DELETE FROM user_sessions
      WHERE user_id = $1
        AND id NOT IN (
          SELECT id
          FROM user_sessions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        )
    `,
    [userId, maxSessions]
  );
};

export const findSessionWithUserByTokenHash = async (tokenHash) => {
  const result = await pool.query(
    `
      SELECT
        s.id AS session_id,
        s.user_id,
        s.expires_at,
        u.id,
        u.name,
        u.email,
        u.preferred_currency,
        u.created_at,
        u.updated_at,
        u.last_login_at
      FROM user_sessions AS s
      INNER JOIN users AS u
        ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  return {
    sessionId: row.session_id,
    expiresAt: row.expires_at,
    user: mapPublicUser(row),
  };
};

export const touchSession = async (sessionId) => {
  await pool.query(
    `
      UPDATE user_sessions
      SET last_seen_at = NOW()
      WHERE id = $1
    `,
    [sessionId]
  );
};

export const deleteSessionByTokenHash = async (tokenHash) => {
  await pool.query(
    `
      DELETE FROM user_sessions
      WHERE token_hash = $1
    `,
    [tokenHash]
  );
};

export const deleteExpiredSessions = async () => {
  await pool.query(
    `
      DELETE FROM user_sessions
      WHERE expires_at <= NOW()
    `
  );
};

export const updateUserAccount = async ({
  userId,
  name,
  email,
  preferredCurrency,
}) => {
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = $2,
        email = LOWER($3),
        preferred_currency = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        email,
        preferred_currency,
        created_at,
        updated_at,
        last_login_at
    `,
    [userId, name, email, preferredCurrency]
  );

  return result.rows[0] ? mapPublicUser(result.rows[0]) : null;
};
