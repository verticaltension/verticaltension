import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import {
  initDb,
  listCatalog,
  insertContact,
  findUserByEmail,
  createUser,
  markLoginFailure,
  resetLoginFailures,
  createSession,
  pruneUserSessions,
  findSessionWithUserByTokenHash,
  touchSession,
  deleteSessionByTokenHash,
  deleteExpiredSessions,
  updateUserAccount,
} from "./db.js";

const scrypt = promisify(scryptCallback);

const app = express();
const port = Number(process.env.PORT) || 4000;
const trustProxy = process.env.TRUST_PROXY === "1";
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");

if (trustProxy) {
  app.set("trust proxy", 1);
}

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const defaultOrigins = [
  "https://verticaltension.com",
  "https://www.verticaltension.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

const configuredOrigins = parseCsv(process.env.CORS_ORIGINS || "");
const allowedOrigins = new Set(
  configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins
);
const isOriginAllowed = (origin) => !origin || allowedOrigins.has(origin);
const toInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};
const RATE_LIMIT_GLOBAL_MAX = toInt(process.env.RATE_LIMIT_GLOBAL_MAX, 300);
const RATE_LIMIT_HEALTH_MAX = toInt(process.env.RATE_LIMIT_HEALTH_MAX, 120);
const RATE_LIMIT_CATALOG_MAX = toInt(process.env.RATE_LIMIT_CATALOG_MAX, 120);
const RATE_LIMIT_CONTACT_MAX = toInt(process.env.RATE_LIMIT_CONTACT_MAX, 5);
const RATE_LIMIT_AUTH_REGISTER_MAX = toInt(
  process.env.RATE_LIMIT_AUTH_REGISTER_MAX,
  5
);
const RATE_LIMIT_AUTH_LOGIN_MAX = toInt(
  process.env.RATE_LIMIT_AUTH_LOGIN_MAX,
  10
);
const RATE_LIMIT_AUTH_SESSION_MAX = toInt(
  process.env.RATE_LIMIT_AUTH_SESSION_MAX,
  120
);
const RATE_LIMIT_AUTH_ACCOUNT_MAX = toInt(
  process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX,
  20
);

const AUTH_PASSWORD_MIN_LENGTH = toInt(
  process.env.AUTH_PASSWORD_MIN_LENGTH,
  8
);
const AUTH_MAX_FAILED_ATTEMPTS = toInt(
  process.env.AUTH_MAX_FAILED_ATTEMPTS,
  5
);
const AUTH_LOCK_MINUTES = toInt(process.env.AUTH_LOCK_MINUTES, 15);
const AUTH_SESSION_DAYS = toInt(process.env.AUTH_SESSION_DAYS, 14);
const AUTH_SESSION_COOKIE_NAME = (
  process.env.AUTH_SESSION_COOKIE_NAME || "vtp_session"
).trim();
const AUTH_SESSION_COOKIE_DOMAIN = (
  process.env.AUTH_SESSION_COOKIE_DOMAIN || ""
).trim();
const AUTH_SESSION_CLEANUP_EVERY = toInt(
  process.env.AUTH_SESSION_CLEANUP_EVERY,
  25
);
const AUTH_MAX_SESSIONS_PER_USER = toInt(
  process.env.AUTH_MAX_SESSIONS_PER_USER,
  5
);
const AUTH_SESSION_MAX_AGE_MS = AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000;

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};
const PASSWORD_HASH_VERSION = "scrypt";
const PASSWORD_HASH_BYTES = 64;
const ALLOWED_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
]);

const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  ...(AUTH_SESSION_COOKIE_DOMAIN ? { domain: AUTH_SESSION_COOKIE_DOMAIN } : {}),
};

let createdSessionsCount = 0;

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }

  const origin = req.get("origin");
  if (isOriginAllowed(origin)) {
    next();
    return;
  }

  res.status(403).json({ error: "Forbidden origin." });
});

const createRateLimiter = ({ windowMs, max, skipMethods = new Set() }) => {
  const buckets = new Map();
  let requestCount = 0;

  return (req, res, next) => {
    if (skipMethods.has(req.method.toUpperCase())) {
      next();
      return;
    }

    requestCount += 1;
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const existing = buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      existing.count += 1;
    }

    if (requestCount % 200 === 0) {
      for (const [bucketKey, bucketValue] of buckets.entries()) {
        if (now >= bucketValue.resetAt) {
          buckets.delete(bucketKey);
        }
      }
    }

    const current = buckets.get(key);
    const remaining = Math.max(0, max - current.count);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000)
    );

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

    if (current.count > max) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
};

const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: RATE_LIMIT_GLOBAL_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const healthLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_HEALTH_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const catalogLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_CATALOG_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const contactLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: RATE_LIMIT_CONTACT_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const authRegisterLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: RATE_LIMIT_AUTH_REGISTER_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: RATE_LIMIT_AUTH_LOGIN_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const authSessionLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: RATE_LIMIT_AUTH_SESSION_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const authAccountLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: RATE_LIMIT_AUTH_ACCOUNT_MAX,
  skipMethods: new Set(["OPTIONS"]),
});

app.use(globalLimiter);

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  MAIL_TO,
} = process.env;
const mailConfigured =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && MAIL_FROM && MAIL_TO;
const mailTransporter = mailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

const normalizeText = (value = "") => String(value).trim().replace(/\s+/g, " ");
const normalizeEmail = (value = "") => String(value).trim().toLowerCase();
const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const hashSessionToken = (token) =>
  createHash("sha256").update(token).digest("hex");
const createSessionToken = () => randomBytes(32).toString("hex");
const getClientIp = (req) =>
  String(req.ip || req.socket?.remoteAddress || "").slice(0, 200);
const getUserAgent = (req) => String(req.get("user-agent") || "").slice(0, 500);

const parseCookies = (cookieHeader = "") => {
  const parsed = {};

  for (const segment of cookieHeader.split(";")) {
    const separatorIndex = segment.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = segment.slice(0, separatorIndex).trim();
    const rawValue = segment.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    try {
      parsed[key] = decodeURIComponent(rawValue);
    } catch {
      parsed[key] = rawValue;
    }
  }

  return parsed;
};

const getCookie = (req, cookieName) => {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[cookieName] || "";
};

const setSessionCookie = (res, token) => {
  res.cookie(AUTH_SESSION_COOKIE_NAME, token, {
    ...sessionCookieOptions,
    maxAge: AUTH_SESSION_MAX_AGE_MS,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(AUTH_SESSION_COOKIE_NAME, sessionCookieOptions);
};

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  preferredCurrency:
    user.preferredCurrency || user.preferred_currency || "USD",
});

const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters.`;
  }

  if (password.length > 128) {
    return "Password must be at most 128 characters.";
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    return "Password must include uppercase, lowercase, number, and symbol.";
  }

  return null;
};

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, PASSWORD_HASH_BYTES, SCRYPT_PARAMS);
  const hashHex = Buffer.from(derived).toString("hex");
  return `${PASSWORD_HASH_VERSION}$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${hashHex}`;
};

const verifyPassword = async (password, passwordHash) => {
  try {
    const parts = String(passwordHash || "").split("$");
    if (parts.length !== 6 || parts[0] !== PASSWORD_HASH_VERSION) {
      return false;
    }

    const n = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = parts[4];
    const expectedHash = Buffer.from(parts[5], "hex");

    if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return false;
    }

    const derived = await scrypt(password, salt, expectedHash.length, {
      N: n,
      r,
      p,
      maxmem: SCRYPT_PARAMS.maxmem,
    });
    const actualHash = Buffer.from(derived);

    if (actualHash.length !== expectedHash.length) {
      return false;
    }

    return timingSafeEqual(expectedHash, actualHash);
  } catch {
    return false;
  }
};

const maybeCleanupExpiredSessions = async () => {
  createdSessionsCount += 1;
  if (createdSessionsCount % AUTH_SESSION_CLEANUP_EVERY !== 0) {
    return;
  }
  try {
    await deleteExpiredSessions();
  } catch (error) {
    console.error("Session cleanup failed:", error);
  }
};

const resolveAuthenticatedSession = async (req) => {
  const sessionToken = getCookie(req, AUTH_SESSION_COOKIE_NAME);
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);
  const session = await findSessionWithUserByTokenHash(tokenHash);
  if (!session) {
    return null;
  }

  return { ...session, tokenHash };
};

app.get("/api/health", healthLimiter, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/catalog", catalogLimiter, async (_req, res) => {
  try {
    const items = await listCatalog();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Unable to load catalog." });
  }
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const name = normalizeText(req.body?.name || "");
  const email = normalizeEmail(req.body?.email || "");
  const subject = normalizeText(req.body?.subject || "");
  const message = normalizeText(req.body?.message || "");

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  if (name.length > 120 || !isValidEmail(email) || message.length > 5000) {
    res.status(400).json({ error: "One or more fields are invalid." });
    return;
  }

  if (subject.length > 200) {
    res.status(400).json({ error: "Subject is too long." });
    return;
  }

  try {
    await insertContact({ name, email, subject, message });
  } catch (error) {
    res.status(500).json({ error: "Unable to store contact message." });
    return;
  }

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: subject || "Vertical Tension Press inquiry",
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
    } catch (error) {
      console.error("Email delivery failed:", error);
    }
  }

  res.json({ ok: true });
});

app.post("/api/auth/register", authRegisterLimiter, async (req, res) => {
  const name = normalizeText(req.body?.name || "");
  const email = normalizeEmail(req.body?.email || "");
  const password = String(req.body?.password || "");
  const preferredCurrencyRaw = String(
    req.body?.preferredCurrency || "USD"
  ).toUpperCase();
  const preferredCurrency = ALLOWED_CURRENCIES.has(preferredCurrencyRaw)
    ? preferredCurrencyRaw
    : "USD";

  if (name.length < 1 || name.length > 120) {
    res.status(400).json({ error: "Name is required and must be under 120 characters." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    res.status(400).json({ error: passwordError });
    return;
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      passwordHash,
      preferredCurrency,
    });

    const sessionToken = createSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + AUTH_SESSION_MAX_AGE_MS);

    await createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
    await pruneUserSessions({
      userId: user.id,
      maxSessions: AUTH_MAX_SESSIONS_PER_USER,
    });

    setSessionCookie(res, sessionToken);
    await maybeCleanupExpiredSessions();
    res.status(201).json({ ok: true, user: toPublicUser(user) });
  } catch (error) {
    if (error?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    console.error("Register failed:", error);
    res.status(500).json({ error: "Unable to register account." });
  }
});

app.post("/api/auth/login", authLoginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email || "");
  const password = String(req.body?.password || "");

  if (!isValidEmail(email) || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      res.status(429).json({
        error: `Too many failed login attempts. Try again in about ${AUTH_LOCK_MINUTES} minutes.`,
      });
      return;
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
      const failure = await markLoginFailure({
        userId: user.id,
        maxFailedAttempts: AUTH_MAX_FAILED_ATTEMPTS,
        lockMinutes: AUTH_LOCK_MINUTES,
      });

      if (failure?.locked_until && new Date(failure.locked_until).getTime() > Date.now()) {
        res.status(429).json({
          error: `Too many failed login attempts. Try again in about ${AUTH_LOCK_MINUTES} minutes.`,
        });
        return;
      }

      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    await resetLoginFailures(user.id);

    const sessionToken = createSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + AUTH_SESSION_MAX_AGE_MS);

    await createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
    await pruneUserSessions({
      userId: user.id,
      maxSessions: AUTH_MAX_SESSIONS_PER_USER,
    });

    setSessionCookie(res, sessionToken);
    await maybeCleanupExpiredSessions();
    res.json({ ok: true, user: toPublicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Unable to login." });
  }
});

app.post("/api/auth/logout", authSessionLimiter, async (req, res) => {
  try {
    const sessionToken = getCookie(req, AUTH_SESSION_COOKIE_NAME);
    if (sessionToken) {
      const tokenHash = hashSessionToken(sessionToken);
      await deleteSessionByTokenHash(tokenHash);
    }
  } catch (error) {
    console.error("Logout cleanup failed:", error);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/me", authSessionLimiter, async (req, res) => {
  try {
    const session = await resolveAuthenticatedSession(req);
    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    await touchSession(session.sessionId);
    res.json({ ok: true, user: toPublicUser(session.user) });
  } catch (error) {
    console.error("Auth session lookup failed:", error);
    res.status(500).json({ error: "Unable to read session." });
  }
});

app.post("/api/auth/account", authAccountLimiter, async (req, res) => {
  try {
    const session = await resolveAuthenticatedSession(req);
    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const name = normalizeText(req.body?.name || "");
    const email = normalizeEmail(req.body?.email || "");
    const preferredCurrencyRaw = String(
      req.body?.preferredCurrency || "USD"
    ).toUpperCase();

    if (name.length < 1 || name.length > 120) {
      res.status(400).json({ error: "Name is required and must be under 120 characters." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email address." });
      return;
    }

    if (!ALLOWED_CURRENCIES.has(preferredCurrencyRaw)) {
      res.status(400).json({ error: "Unsupported preferred currency." });
      return;
    }

    const user = await updateUserAccount({
      userId: session.user.id,
      name,
      email,
      preferredCurrency: preferredCurrencyRaw,
    });

    if (!user) {
      res.status(404).json({ error: "Account not found." });
      return;
    }

    await touchSession(session.sessionId);
    res.json({ ok: true, user: toPublicUser(user) });
  } catch (error) {
    if (error?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    console.error("Account update failed:", error);
    res.status(500).json({ error: "Unable to update account." });
  }
});

const startServer = async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Vertical Tension server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed.", error);
    process.exit(1);
  }
};

startServer();
