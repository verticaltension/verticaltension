import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "data", "catalog.json");
export const SOCIAL_PLATFORMS = [
  "twitter",
  "linkedin",
  "reddit",
  "instagram",
  "tiktok",
];

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id BIGSERIAL PRIMARY KEY,
      platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'instagram', 'tiktok')),
      account_label TEXT NOT NULL,
      access_token_encrypted TEXT NOT NULL,
      refresh_token_encrypted TEXT,
      token_expires_at TIMESTAMPTZ,
      scopes TEXT[] NOT NULL DEFAULT '{}',
      config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE social_accounts
    ADD COLUMN IF NOT EXISTS config_json JSONB NOT NULL DEFAULT '{}'::jsonb
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS social_accounts_platform_label_unique
    ON social_accounts (platform, account_label)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_accounts_platform_active_idx
    ON social_accounts (platform, active)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_jobs (
      id BIGSERIAL PRIMARY KEY,
      created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      blog_slug TEXT NOT NULL,
      blog_title TEXT NOT NULL,
      canonical_url TEXT NOT NULL,
      platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'instagram', 'tiktok')),
      status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'dead_letter', 'canceled')),
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attempt_count INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 6,
      next_retry_at TIMESTAMPTZ,
      last_http_status INTEGER,
      last_error TEXT,
      idempotency_key TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      locked_at TIMESTAMPTZ,
      locked_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS social_jobs_idempotency_unique
    ON social_jobs (idempotency_key)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_jobs_status_schedule_idx
    ON social_jobs (status, scheduled_at)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_jobs_platform_status_idx
    ON social_jobs (platform, status)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id BIGSERIAL PRIMARY KEY,
      job_id BIGINT REFERENCES social_jobs(id) ON DELETE SET NULL,
      platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'instagram', 'tiktok')),
      blog_slug TEXT NOT NULL,
      platform_post_id TEXT NOT NULL,
      platform_post_url TEXT,
      posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      raw_response JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS social_posts_platform_slug_unique
    ON social_posts (platform, blog_slug)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_job_attempts (
      id BIGSERIAL PRIMARY KEY,
      job_id BIGINT NOT NULL REFERENCES social_jobs(id) ON DELETE CASCADE,
      attempt_number INTEGER NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ,
      outcome TEXT NOT NULL CHECK (outcome IN ('success', 'error', 'rate_limited', 'auth_error', 'network_error')),
      http_status INTEGER,
      error_code TEXT,
      error_message TEXT,
      response_excerpt TEXT
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_job_attempts_job_attempt_idx
    ON social_job_attempts (job_id, attempt_number)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_oauth_states (
      id BIGSERIAL PRIMARY KEY,
      state TEXT NOT NULL UNIQUE,
      platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'instagram', 'tiktok')),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_label TEXT NOT NULL DEFAULT 'default',
      redirect_uri TEXT NOT NULL,
      code_verifier TEXT,
      requested_scopes TEXT[] NOT NULL DEFAULT '{}',
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_oauth_states_expires_idx
    ON social_oauth_states (expires_at)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_remediation_runs (
      id BIGSERIAL PRIMARY KEY,
      created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'instagram', 'tiktok')),
      action TEXT NOT NULL,
      dry_run BOOLEAN NOT NULL DEFAULT true,
      request_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_remediation_runs_platform_created_idx
    ON social_remediation_runs (platform, created_at DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS social_remediation_runs_action_created_idx
    ON social_remediation_runs (action, created_at DESC)
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

const buildSocialJobsWhereClause = ({ status, platform }) => {
  const values = [];
  const clauses = [];

  if (status) {
    values.push(status);
    clauses.push(`status = $${values.length}`);
  }

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, values };
};

export const listSocialAccounts = async () => {
  const result = await pool.query(
    `
      SELECT
        id,
        platform,
        account_label,
        token_expires_at,
        scopes,
        config_json,
        active,
        created_at,
        updated_at
      FROM social_accounts
      ORDER BY platform ASC, account_label ASC
    `
  );

  return result.rows;
};

export const findSocialAccountByPlatformLabel = async (platform, accountLabel) => {
  const result = await pool.query(
    `
      SELECT
        id,
        platform,
        account_label,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        config_json,
        active,
        created_at,
        updated_at
      FROM social_accounts
      WHERE platform = $1
        AND account_label = $2
      LIMIT 1
    `,
    [platform, accountLabel]
  );

  return result.rows[0] || null;
};

export const upsertSocialAccount = async ({
  platform,
  accountLabel,
  accessTokenEncrypted,
  refreshTokenEncrypted,
  tokenExpiresAt,
  scopes,
  configJson,
  active,
}) => {
  const result = await pool.query(
    `
      INSERT INTO social_accounts (
        platform,
        account_label,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        config_json,
        active,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (platform, account_label)
      DO UPDATE SET
        access_token_encrypted = EXCLUDED.access_token_encrypted,
        refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
        token_expires_at = EXCLUDED.token_expires_at,
        scopes = EXCLUDED.scopes,
        config_json = EXCLUDED.config_json,
        active = EXCLUDED.active,
        updated_at = NOW()
      RETURNING
        id,
        platform,
        account_label,
        token_expires_at,
        scopes,
        config_json,
        active,
        created_at,
        updated_at
    `,
    [
      platform,
      accountLabel,
      accessTokenEncrypted,
      refreshTokenEncrypted || null,
      tokenExpiresAt || null,
      scopes || [],
      configJson || {},
      active !== false,
    ]
  );

  return result.rows[0] || null;
};

export const getActiveSocialAccountForPlatform = async (platform) => {
  const result = await pool.query(
    `
      SELECT
        id,
        platform,
        account_label,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        config_json,
        active,
        created_at,
        updated_at
      FROM social_accounts
      WHERE platform = $1
        AND active = true
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `,
    [platform]
  );

  return result.rows[0] || null;
};

export const hasSocialPost = async ({ platform, blogSlug }) => {
  const result = await pool.query(
    `
      SELECT 1
      FROM social_posts
      WHERE platform = $1
        AND blog_slug = $2
      LIMIT 1
    `,
    [platform, blogSlug]
  );

  return !!result.rows[0];
};

export const enqueueSocialJob = async ({
  createdByUserId,
  blogSlug,
  blogTitle,
  canonicalUrl,
  platform,
  idempotencyKey,
  payload,
  scheduledAt,
  maxAttempts,
}) => {
  const result = await pool.query(
    `
      INSERT INTO social_jobs (
        created_by_user_id,
        blog_slug,
        blog_title,
        canonical_url,
        platform,
        status,
        scheduled_at,
        max_attempts,
        idempotency_key,
        payload
      )
      VALUES ($1, $2, $3, $4, $5, 'queued', COALESCE($6, NOW()), $7, $8, $9)
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING *
    `,
    [
      createdByUserId || null,
      blogSlug,
      blogTitle,
      canonicalUrl,
      platform,
      scheduledAt || null,
      maxAttempts,
      idempotencyKey,
      payload || {},
    ]
  );

  return result.rows[0] || null;
};

export const listSocialJobs = async ({
  status,
  platform,
  limit = 50,
  offset = 0,
}) => {
  const { where, values } = buildSocialJobsWhereClause({ status, platform });
  const listValues = [...values, limit, offset];
  const listResult = await pool.query(
    `
      SELECT *
      FROM social_jobs
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
    listValues
  );

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::bigint AS total
      FROM social_jobs
      ${where}
    `,
    values
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total || 0),
  };
};

export const listSocialJobAttempts = async ({
  jobId,
  limit = 50,
  offset = 0,
}) => {
  const safeJobId = Number(jobId);
  if (!Number.isFinite(safeJobId) || safeJobId <= 0) {
    return { items: [], total: 0 };
  }

  const listResult = await pool.query(
    `
      SELECT
        id,
        job_id,
        attempt_number,
        started_at,
        finished_at,
        outcome,
        http_status,
        error_code,
        error_message,
        response_excerpt
      FROM social_job_attempts
      WHERE job_id = $1
      ORDER BY attempt_number DESC, id DESC
      LIMIT $2
      OFFSET $3
    `,
    [safeJobId, limit, offset]
  );

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::bigint AS total
      FROM social_job_attempts
      WHERE job_id = $1
    `,
    [safeJobId]
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total || 0),
  };
};

export const retrySocialJob = async (jobId) => {
  const result = await pool.query(
    `
      UPDATE social_jobs
      SET
        status = 'queued',
        scheduled_at = NOW(),
        next_retry_at = NULL,
        last_http_status = NULL,
        last_error = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('failed', 'dead_letter', 'canceled')
      RETURNING *
    `,
    [jobId]
  );

  return result.rows[0] || null;
};

export const cancelSocialJob = async (jobId) => {
  const result = await pool.query(
    `
      UPDATE social_jobs
      SET
        status = 'canceled',
        next_retry_at = NULL,
        last_error = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('queued', 'running')
      RETURNING *
    `,
    [jobId]
  );

  return result.rows[0] || null;
};

export const cancelQueuedSocialJobs = async ({
  platform,
  limit = 50,
  includeRunning = false,
}) => {
  const values = [];
  const statuses = includeRunning ? ["queued", "running"] : ["queued"];
  values.push(statuses);
  const clauses = [`status = ANY($${values.length}::text[])`];

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  values.push(limit);
  const limitParam = `$${values.length}`;

  const result = await pool.query(
    `
      WITH target AS (
        SELECT id
        FROM social_jobs
        WHERE ${clauses.join(" AND ")}
        ORDER BY scheduled_at ASC, id ASC
        LIMIT ${limitParam}
      )
      UPDATE social_jobs AS jobs
      SET
        status = 'canceled',
        next_retry_at = NULL,
        last_error = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = NOW()
      FROM target
      WHERE jobs.id = target.id
      RETURNING jobs.*
    `,
    values
  );

  return result.rows;
};

export const listSocialPosts = async ({
  blogSlug,
  platform,
  limit = 50,
  offset = 0,
}) => {
  const values = [];
  const clauses = [];

  if (blogSlug) {
    values.push(blogSlug);
    clauses.push(`blog_slug = $${values.length}`);
  }

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  values.push(limit, offset);

  const result = await pool.query(
    `
      SELECT *
      FROM social_posts
      ${where}
      ORDER BY posted_at DESC, id DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  );

  return result.rows;
};

export const getSocialSummary = async ({ fromDate, toDate }) => {
  const values = [];
  const clauses = [];

  if (fromDate) {
    values.push(fromDate);
    clauses.push(`created_at >= $${values.length}`);
  }

  if (toDate) {
    values.push(toDate);
    clauses.push(`created_at <= $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const [statusCounts, platformStatusCounts, postCounts] = await Promise.all([
    pool.query(
      `
        SELECT status, COUNT(*)::bigint AS count
        FROM social_jobs
        ${where}
        GROUP BY status
        ORDER BY status ASC
      `,
      values
    ),
    pool.query(
      `
        SELECT platform, status, COUNT(*)::bigint AS count
        FROM social_jobs
        ${where}
        GROUP BY platform, status
        ORDER BY platform ASC, status ASC
      `,
      values
    ),
    pool.query(
      `
        SELECT platform, COUNT(*)::bigint AS count
        FROM social_posts
        GROUP BY platform
        ORDER BY platform ASC
      `
    ),
  ]);

  const totals = {
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    dead_letter: 0,
    canceled: 0,
    total_jobs: 0,
  };

  for (const row of statusCounts.rows) {
    const count = Number(row.count || 0);
    totals.total_jobs += count;
    if (Object.prototype.hasOwnProperty.call(totals, row.status)) {
      totals[row.status] = count;
    }
  }

  return {
    totals,
    byStatus: statusCounts.rows.map((row) => ({
      status: row.status,
      count: Number(row.count || 0),
    })),
    byPlatformStatus: platformStatusCounts.rows.map((row) => ({
      platform: row.platform,
      status: row.status,
      count: Number(row.count || 0),
    })),
    postCountsByPlatform: postCounts.rows.map((row) => ({
      platform: row.platform,
      count: Number(row.count || 0),
    })),
  };
};

export const getSocialRateLimitSignals = async ({ windowHours = 24 }) => {
  const safeWindowHours = Number.isFinite(windowHours)
    ? Math.max(1, Math.min(168, Math.floor(windowHours)))
    : 24;

  const result = await pool.query(
    `
      WITH latest_rate_limited AS (
        SELECT DISTINCT ON (jobs.platform)
          jobs.platform,
          attempts.job_id,
          jobs.status AS job_status,
          attempts.finished_at AS last_rate_limited_at,
          jobs.next_retry_at AS cooldown_until,
          attempts.error_message
        FROM social_job_attempts AS attempts
        INNER JOIN social_jobs AS jobs
          ON jobs.id = attempts.job_id
        WHERE attempts.outcome = 'rate_limited'
          AND attempts.finished_at IS NOT NULL
          AND attempts.finished_at >= NOW() - make_interval(hours => $1)
        ORDER BY jobs.platform ASC, attempts.finished_at DESC, attempts.id DESC
      )
      SELECT
        platform,
        job_id,
        job_status,
        last_rate_limited_at,
        cooldown_until,
        (cooldown_until IS NOT NULL AND cooldown_until > NOW()) AS cooldown_active,
        GREATEST(
          0,
          COALESCE(EXTRACT(EPOCH FROM (cooldown_until - NOW()))::bigint, 0)
        ) AS cooldown_seconds_remaining,
        error_message
      FROM latest_rate_limited
      ORDER BY platform ASC
    `,
    [safeWindowHours]
  );

  return result.rows.map((row) => ({
    platform: row.platform,
    jobId: Number(row.job_id || 0),
    jobStatus: row.job_status,
    lastRateLimitedAt: row.last_rate_limited_at,
    cooldownUntil: row.cooldown_until,
    cooldownActive: !!row.cooldown_active,
    cooldownSecondsRemaining: Number(row.cooldown_seconds_remaining || 0),
    errorMessage: row.error_message || "",
  }));
};

export const listExistingSocialPostsForSlugsPlatforms = async ({
  blogSlugs,
  platforms,
}) => {
  if (!Array.isArray(blogSlugs) || blogSlugs.length === 0) {
    return [];
  }

  if (!Array.isArray(platforms) || platforms.length === 0) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT platform, blog_slug
      FROM social_posts
      WHERE blog_slug = ANY($1::text[])
        AND platform = ANY($2::text[])
    `,
    [blogSlugs, platforms]
  );

  return result.rows;
};

export const listExistingSocialJobsByIdempotencyKeys = async (idempotencyKeys) => {
  if (!Array.isArray(idempotencyKeys) || idempotencyKeys.length === 0) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT idempotency_key, status
      FROM social_jobs
      WHERE idempotency_key = ANY($1::text[])
    `,
    [idempotencyKeys]
  );

  return result.rows;
};

export const retryDeadLetterSocialJobs = async ({ platform, limit = 50 }) => {
  const values = [];
  const clauses = [`status = 'dead_letter'`];

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  values.push(limit);
  const limitParam = `$${values.length}`;

  const result = await pool.query(
    `
      WITH target AS (
        SELECT id
        FROM social_jobs
        WHERE ${clauses.join(" AND ")}
        ORDER BY updated_at ASC, id ASC
        LIMIT ${limitParam}
      )
      UPDATE social_jobs AS jobs
      SET
        status = 'queued',
        scheduled_at = NOW(),
        next_retry_at = NULL,
        last_http_status = NULL,
        last_error = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = NOW()
      FROM target
      WHERE jobs.id = target.id
      RETURNING jobs.*
    `,
    values
  );

  return result.rows;
};

export const retryFailedSocialJobs = async ({
  platform,
  limit = 50,
  includeDeadLetter = false,
}) => {
  const values = [];
  const statuses = includeDeadLetter
    ? ["failed", "dead_letter"]
    : ["failed"];
  values.push(statuses);
  const clauses = [`status = ANY($${values.length}::text[])`];

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  values.push(limit);
  const limitParam = `$${values.length}`;

  const result = await pool.query(
    `
      WITH target AS (
        SELECT id
        FROM social_jobs
        WHERE ${clauses.join(" AND ")}
        ORDER BY updated_at ASC, id ASC
        LIMIT ${limitParam}
      )
      UPDATE social_jobs AS jobs
      SET
        status = 'queued',
        scheduled_at = NOW(),
        next_retry_at = NULL,
        last_http_status = NULL,
        last_error = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = NOW()
      FROM target
      WHERE jobs.id = target.id
      RETURNING jobs.*
    `,
    values
  );

  return result.rows;
};

export const recoverStaleRunningSocialJobs = async ({
  staleBeforeIso,
  limit = 100,
}) => {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(500, Math.floor(limit)))
    : 100;
  const staleBefore = staleBeforeIso || new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const result = await pool.query(
    `
      WITH target AS (
        SELECT id
        FROM social_jobs
        WHERE status = 'running'
          AND locked_at IS NOT NULL
          AND locked_at < $1
        ORDER BY locked_at ASC, id ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      UPDATE social_jobs AS jobs
      SET
        status = 'queued',
        scheduled_at = NOW(),
        next_retry_at = NOW(),
        locked_at = NULL,
        locked_by = NULL,
        last_error = COALESCE(NULLIF(last_error, ''), 'Recovered stale running lock.'),
        updated_at = NOW()
      FROM target
      WHERE jobs.id = target.id
      RETURNING jobs.*
    `,
    [staleBefore, safeLimit]
  );

  return result.rows;
};

export const claimNextSocialJob = async (workerId) => {
  const result = await pool.query(
    `
      WITH candidate AS (
        SELECT id
        FROM social_jobs
        WHERE status = 'queued'
          AND scheduled_at <= NOW()
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        ORDER BY scheduled_at ASC, id ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE social_jobs AS target
      SET
        status = 'running',
        locked_at = NOW(),
        locked_by = $1,
        updated_at = NOW()
      FROM candidate
      WHERE target.id = candidate.id
      RETURNING target.*
    `,
    [workerId]
  );

  return result.rows[0] || null;
};

export const markSocialJobSucceeded = async ({
  jobId,
  attemptNumber,
  platformPostId,
  platformPostUrl,
  rawResponse,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updateResult = await client.query(
      `
        UPDATE social_jobs
        SET
          status = 'succeeded',
          attempt_count = $2,
          next_retry_at = NULL,
          last_http_status = NULL,
          last_error = NULL,
          locked_at = NULL,
          locked_by = NULL,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, platform, blog_slug
      `,
      [jobId, attemptNumber]
    );

    const job = updateResult.rows[0];
    if (!job) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        INSERT INTO social_posts (
          job_id,
          platform,
          blog_slug,
          platform_post_id,
          platform_post_url,
          raw_response
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (platform, blog_slug)
        DO UPDATE SET
          job_id = EXCLUDED.job_id,
          platform_post_id = EXCLUDED.platform_post_id,
          platform_post_url = EXCLUDED.platform_post_url,
          raw_response = EXCLUDED.raw_response,
          posted_at = NOW()
      `,
      [
        jobId,
        job.platform,
        job.blog_slug,
        platformPostId,
        platformPostUrl || null,
        rawResponse || null,
      ]
    );

    await client.query(
      `
        INSERT INTO social_job_attempts (
          job_id,
          attempt_number,
          started_at,
          finished_at,
          outcome
        )
        VALUES ($1, $2, NOW(), NOW(), 'success')
      `,
      [jobId, attemptNumber]
    );

    await client.query("COMMIT");
    return job;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const markSocialJobAttemptError = async ({
  jobId,
  attemptNumber,
  outcome,
  httpStatus,
  errorCode,
  errorMessage,
  responseExcerpt,
  nextStatus,
  nextRetryAt,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        UPDATE social_jobs
        SET
          status = $2,
          attempt_count = $3,
          next_retry_at = $4,
          last_http_status = $5,
          last_error = $6,
          locked_at = NULL,
          locked_by = NULL,
          updated_at = NOW()
        WHERE id = $1
      `,
      [
        jobId,
        nextStatus,
        attemptNumber,
        nextRetryAt || null,
        httpStatus || null,
        errorMessage || null,
      ]
    );

    await client.query(
      `
        INSERT INTO social_job_attempts (
          job_id,
          attempt_number,
          started_at,
          finished_at,
          outcome,
          http_status,
          error_code,
          error_message,
          response_excerpt
        )
        VALUES ($1, $2, NOW(), NOW(), $3, $4, $5, $6, $7)
      `,
      [
        jobId,
        attemptNumber,
        outcome,
        httpStatus || null,
        errorCode || null,
        errorMessage || null,
        responseExcerpt || null,
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createSocialOauthState = async ({
  state,
  platform,
  userId,
  accountLabel,
  redirectUri,
  codeVerifier,
  requestedScopes,
  expiresAt,
}) => {
  const result = await pool.query(
    `
      INSERT INTO social_oauth_states (
        state,
        platform,
        user_id,
        account_label,
        redirect_uri,
        code_verifier,
        requested_scopes,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        state,
        platform,
        user_id,
        account_label,
        redirect_uri,
        code_verifier,
        requested_scopes,
        expires_at,
        used_at,
        created_at
    `,
    [
      state,
      platform,
      userId,
      accountLabel || "default",
      redirectUri,
      codeVerifier || null,
      requestedScopes || [],
      expiresAt,
    ]
  );

  return result.rows[0] || null;
};

export const consumeSocialOauthState = async (state) => {
  const result = await pool.query(
    `
      UPDATE social_oauth_states
      SET used_at = NOW()
      WHERE state = $1
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING
        id,
        state,
        platform,
        user_id,
        account_label,
        redirect_uri,
        code_verifier,
        requested_scopes,
        expires_at,
        used_at,
        created_at
    `,
    [state]
  );

  return result.rows[0] || null;
};

export const createSocialRemediationRun = async ({
  createdByUserId,
  platform,
  action,
  dryRun,
  requestJson,
  resultJson,
}) => {
  const result = await pool.query(
    `
      INSERT INTO social_remediation_runs (
        created_by_user_id,
        platform,
        action,
        dry_run,
        request_json,
        result_json
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      createdByUserId || null,
      platform || null,
      action,
      dryRun !== false,
      requestJson || {},
      resultJson || {},
    ]
  );

  return result.rows[0] || null;
};

export const listSocialRemediationRuns = async ({
  platform,
  limit = 50,
  offset = 0,
}) => {
  const values = [];
  const clauses = [];

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  values.push(limit, offset);

  const listResult = await pool.query(
    `
      SELECT *
      FROM social_remediation_runs
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  );

  const countValues = values.slice(0, values.length - 2);
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::bigint AS total
      FROM social_remediation_runs
      ${where}
    `,
    countValues
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total || 0),
  };
};

export const countRecentSocialRemediationRuns = async ({
  platform,
  action,
  dryRun,
  sinceIso,
}) => {
  const values = [];
  const clauses = [];

  if (platform) {
    values.push(platform);
    clauses.push(`platform = $${values.length}`);
  }

  if (action) {
    values.push(action);
    clauses.push(`action = $${values.length}`);
  }

  if (typeof dryRun === "boolean") {
    values.push(dryRun);
    clauses.push(`dry_run = $${values.length}`);
  }

  if (sinceIso) {
    values.push(sinceIso);
    clauses.push(`created_at >= $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(
    `
      SELECT COUNT(*)::bigint AS total
      FROM social_remediation_runs
      ${where}
    `,
    values
  );

  return Number(result.rows[0]?.total || 0);
};
