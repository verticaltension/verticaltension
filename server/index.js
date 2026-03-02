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
  SOCIAL_PLATFORMS,
  listSocialAccounts,
  findSocialAccountByPlatformLabel,
  upsertSocialAccount,
  getActiveSocialAccountForPlatform,
  hasSocialPost,
  enqueueSocialJob,
  listSocialJobs,
  listSocialJobAttempts,
  retrySocialJob,
  cancelSocialJob,
  cancelQueuedSocialJobs,
  listSocialPosts,
  getSocialSummary,
  getSocialRateLimitSignals,
  listExistingSocialPostsForSlugsPlatforms,
  listExistingSocialJobsByIdempotencyKeys,
  retryDeadLetterSocialJobs,
  retryFailedSocialJobs,
  recoverStaleRunningSocialJobs,
  claimNextSocialJob,
  markSocialJobSucceeded,
  markSocialJobAttemptError,
  createSocialOauthState,
  consumeSocialOauthState,
  createSocialRemediationRun,
  listSocialRemediationRuns,
  countRecentSocialRemediationRuns,
} from "./db.js";
import { getSocialAdapter, supportedSocialPlatforms } from "./social/index.js";
import { SocialAdapterError } from "./social/errors.js";
import { encryptSecret, decryptSecret } from "./social/crypto.js";
import {
  createCodeChallenge,
  getOAuthStartInfo,
  exchangeOAuthCode,
  refreshOAuthToken,
  getOAuthProviderMeta,
} from "./social/oauth.js";

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
const RATE_LIMIT_SOCIAL_ENQUEUE_MAX = toInt(
  process.env.RATE_LIMIT_SOCIAL_ENQUEUE_MAX,
  30
);
const RATE_LIMIT_SOCIAL_READ_MAX = toInt(
  process.env.RATE_LIMIT_SOCIAL_READ_MAX,
  120
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
const SOCIAL_WORKER_ENABLED = process.env.SOCIAL_WORKER_ENABLED === "1";
const SOCIAL_WORKER_POLL_MS = toInt(process.env.SOCIAL_WORKER_POLL_MS, 3000);
const SOCIAL_WORKER_BATCH_SIZE = toInt(
  process.env.SOCIAL_WORKER_BATCH_SIZE,
  3
);
const SOCIAL_WORKER_STALE_LOCK_MINUTES = toInt(
  process.env.SOCIAL_WORKER_STALE_LOCK_MINUTES,
  30
);
const SOCIAL_MAX_ATTEMPTS = toInt(process.env.SOCIAL_MAX_ATTEMPTS, 6);
const SOCIAL_RETRY_BASE_MS = toInt(process.env.SOCIAL_RETRY_BASE_MS, 5000);
const SOCIAL_PUBLISH_MODE =
  process.env.SOCIAL_PUBLISH_MODE === "live" ? "live" : "stub";
const SOCIAL_UTM_ENABLED = process.env.SOCIAL_UTM_ENABLED !== "0";
const SOCIAL_UTM_MEDIUM_RAW = String(process.env.SOCIAL_UTM_MEDIUM || "social").trim();
const SOCIAL_UTM_CAMPAIGN_RAW = String(
  process.env.SOCIAL_UTM_CAMPAIGN || "blog_distribution"
).trim();
const SOCIAL_UTM_CONTENT_PREFIX_RAW = String(
  process.env.SOCIAL_UTM_CONTENT_PREFIX || ""
).trim();
const SOCIAL_OAUTH_STATE_TTL_MINUTES = toInt(
  process.env.SOCIAL_OAUTH_STATE_TTL_MINUTES,
  20
);
const SOCIAL_OAUTH_REQUIRED_ENV_KEYS = {
  twitter: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET", "TWITTER_REDIRECT_URI"],
  linkedin: [
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "LINKEDIN_REDIRECT_URI",
  ],
  reddit: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_REDIRECT_URI"],
  instagram: [
    "INSTAGRAM_CLIENT_ID",
    "INSTAGRAM_CLIENT_SECRET",
    "INSTAGRAM_REDIRECT_URI",
  ],
  tiktok: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "TIKTOK_REDIRECT_URI"],
};
const SOCIAL_REQUIRED_ACCOUNT_CONFIG_KEYS = {
  linkedin: ["actorUrn"],
  instagram: ["igUserId"],
  tiktok: ["openId"],
};
const SOCIAL_REMEDIATION_ACTIONS = new Set([
  "retry_failed_jobs",
  "retry_failed_and_dead_letter_jobs",
  "retry_dead_letter_jobs",
  "cancel_queued_jobs",
  "cancel_queued_and_running_jobs",
]);
const SOCIAL_REMEDIATION_DEFAULT_LIMIT = toInt(
  process.env.SOCIAL_REMEDIATION_DEFAULT_LIMIT,
  100
);
const SOCIAL_REMEDIATION_AUTORUN_ENABLED =
  process.env.SOCIAL_REMEDIATION_AUTORUN_ENABLED === "1";
const SOCIAL_REMEDIATION_AUTORUN_POLL_MS = toInt(
  process.env.SOCIAL_REMEDIATION_AUTORUN_POLL_MS,
  5 * 60 * 1000
);
const SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES = toInt(
  process.env.SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES,
  60
);
const SOCIAL_REMEDIATION_AUTORUN_MAX_ACTIONS_PER_CYCLE = toInt(
  process.env.SOCIAL_REMEDIATION_AUTORUN_MAX_ACTIONS_PER_CYCLE,
  3
);
const SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY =
  process.env.SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY !== "0";
const SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION = toInt(
  process.env.SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
  SOCIAL_REMEDIATION_DEFAULT_LIMIT
);
const SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_RAW = String(
  process.env.SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_JSON || ""
).trim();
const SOCIAL_REMEDIATION_AUTORUN_FREEZE_UTC_HOURS = String(
  process.env.SOCIAL_REMEDIATION_AUTORUN_FREEZE_UTC_HOURS || ""
).trim();
const SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES_RAW = String(
  process.env.SOCIAL_REMEDIATION_ACTION_ESCALATION_JSON || ""
).trim();

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
const socialEnqueueLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: RATE_LIMIT_SOCIAL_ENQUEUE_MAX,
  skipMethods: new Set(["OPTIONS"]),
});
const socialReadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_SOCIAL_READ_MAX,
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

const normalizeUrl = (value = "") => String(value).trim();
const normalizeSlug = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, "-");
const normalizePlatforms = (platforms) => {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return [...supportedSocialPlatforms];
  }

  const normalized = Array.from(
    new Set(
      platforms
        .map((entry) => String(entry || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );

  return normalized.filter((platform) => supportedSocialPlatforms.includes(platform));
};

const normalizeUtmToken = (value = "", fallback = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
};

const getSocialUtmConfig = () => ({
  enabled: SOCIAL_UTM_ENABLED,
  medium: normalizeUtmToken(SOCIAL_UTM_MEDIUM_RAW, "social"),
  campaign: normalizeUtmToken(SOCIAL_UTM_CAMPAIGN_RAW, "blog_distribution"),
  contentPrefix: normalizeUtmToken(SOCIAL_UTM_CONTENT_PREFIX_RAW, ""),
});

const buildSocialUtmContentValue = (slug = "") => {
  const safeSlug = normalizeUtmToken(slug, "post");
  const config = getSocialUtmConfig();
  return normalizeUtmToken(
    [config.contentPrefix, safeSlug].filter(Boolean).join("_"),
    safeSlug || "post"
  );
};

const buildTrackedSocialUrl = ({ canonicalUrl, platform, slug }) => {
  const url = normalizeUrl(canonicalUrl);
  if (!url) {
    return "";
  }
  const config = getSocialUtmConfig();
  if (!config.enabled) {
    return url;
  }

  const params = {
    utm_source: normalizeUtmToken(platform, "social"),
    utm_medium: config.medium,
    utm_campaign: config.campaign,
    utm_content: buildSocialUtmContentValue(slug),
  };

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", params.utm_source);
    parsed.searchParams.set("utm_medium", params.utm_medium);
    parsed.searchParams.set("utm_campaign", params.utm_campaign);
    parsed.searchParams.set("utm_content", params.utm_content);
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${new URLSearchParams(params).toString()}`;
  }
};

const normalizeScopes = (scopes) =>
  Array.isArray(scopes)
    ? Array.from(
        new Set(
          scopes
            .map((scope) => normalizeText(scope))
            .filter(Boolean)
        )
      )
    : [];

const createOauthState = () => randomBytes(24).toString("hex");
const createCodeVerifier = () =>
  randomBytes(48)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const createSocialIdempotencyKey = ({ platform, slug, canonicalUrl }) =>
  createHash("sha256").update(`${platform}:${slug}:${canonicalUrl}`).digest("hex");

const buildSocialPayload = ({
  slug,
  title,
  canonicalUrl,
  summary = "",
  tags = [],
  imageUrl = "",
}) => ({
  blogSlug: slug,
  title,
  canonicalUrl,
  summary,
  tags,
  imageUrl,
});

const buildPlatformSocialPayload = ({
  platform,
  slug,
  title,
  canonicalUrl,
  summary = "",
  tags = [],
  imageUrl = "",
  basePayload = null,
}) => {
  const sourcePayload =
    basePayload &&
    typeof basePayload === "object" &&
    !Array.isArray(basePayload)
      ? { ...basePayload }
      : buildSocialPayload({
          slug,
          title,
          canonicalUrl,
          summary,
          tags,
          imageUrl,
        });

  const resolvedSlug = normalizeSlug(sourcePayload.blogSlug || sourcePayload.slug || slug || "");
  const resolvedTitle = normalizeText(sourcePayload.title || title || "");
  const resolvedCanonicalUrl = normalizeUrl(
    sourcePayload.canonicalUrl || sourcePayload.url || canonicalUrl || ""
  );
  const resolvedSummary = normalizeText(sourcePayload.summary || summary || "");
  const resolvedTags = Array.isArray(sourcePayload.tags)
    ? sourcePayload.tags
        .map((tag) => normalizeText(tag))
        .filter(Boolean)
        .slice(0, 20)
    : Array.isArray(tags)
      ? tags
          .map((tag) => normalizeText(tag))
          .filter(Boolean)
          .slice(0, 20)
      : [];
  const resolvedImageUrl = normalizeUrl(sourcePayload.imageUrl || imageUrl || "");
  const trackedCanonicalUrl = buildTrackedSocialUrl({
    canonicalUrl: resolvedCanonicalUrl,
    platform,
    slug: resolvedSlug,
  });
  const utmConfig = getSocialUtmConfig();

  return {
    ...sourcePayload,
    blogSlug: resolvedSlug,
    title: resolvedTitle,
    canonicalUrl: trackedCanonicalUrl,
    summary: resolvedSummary,
    tags: resolvedTags,
    imageUrl: resolvedImageUrl,
    tracking: {
      enabled: utmConfig.enabled,
      originalCanonicalUrl: resolvedCanonicalUrl,
      utmSource: normalizeUtmToken(platform, "social"),
      utmMedium: utmConfig.medium,
      utmCampaign: utmConfig.campaign,
      utmContent: buildSocialUtmContentValue(resolvedSlug),
    },
  };
};

const preflightValidateSocialPayloadForPlatform = ({ platform, payload }) => {
  const adapter = getSocialAdapter(platform);
  if (!adapter) {
    return {
      ok: false,
      reason: "unsupported_platform",
      errorCode: "UNSUPPORTED_PLATFORM",
      message: `No adapter registered for platform '${platform}'.`,
      classification: "error",
      permanent: true,
    };
  }

  try {
    const validatedPayload = adapter.validatePayload(payload || {});
    adapter.transform(validatedPayload);
    return {
      ok: true,
      reason: "",
      errorCode: "",
      message: "",
      classification: "",
      permanent: false,
    };
  } catch (error) {
    if (error instanceof SocialAdapterError) {
      return {
        ok: false,
        reason: "preflight_validation_failed",
        errorCode: error.code || "INVALID_PAYLOAD",
        message: error.message || "Payload validation failed.",
        classification: error.classification || "error",
        permanent: error.permanent !== false,
      };
    }

    return {
      ok: false,
      reason: "preflight_validation_failed",
      errorCode: "UNEXPECTED_PRECHECK_ERROR",
      message: error?.message || "Unexpected preflight validation error.",
      classification: "error",
      permanent: false,
    };
  }
};

const buildSocialTransformedPreview = (transformedPayload) => {
  if (
    !transformedPayload ||
    typeof transformedPayload !== "object" ||
    Array.isArray(transformedPayload)
  ) {
    return { raw: transformedPayload };
  }

  const source = transformedPayload;
  const preview = {};
  const includeKeys = [
    "blogSlug",
    "title",
    "canonicalUrl",
    "tracking",
    "summary",
    "tags",
    "imageUrl",
    "postText",
    "postTitle",
    "postBody",
    "caption",
    "mediaUrl",
    "subreddit",
  ];

  for (const key of includeKeys) {
    if (source[key] === undefined) {
      continue;
    }
    preview[key] = source[key];
  }

  const textFields = {};
  for (const key of ["postText", "postBody", "caption", "title", "summary"]) {
    if (typeof source[key] === "string") {
      textFields[`${key}Length`] = source[key].length;
    }
  }
  if (Object.keys(textFields).length > 0) {
    preview.metrics = textFields;
  }

  return preview;
};

const parsePagination = ({ limit, offset }) => {
  const parsedLimit = Math.min(200, Math.max(1, toInt(limit, 50)));
  const parsedOffset = Math.max(0, Number(offset) || 0);
  return { limit: parsedLimit, offset: parsedOffset };
};

const mapErrorToAttemptOutcome = (classification = "error") => {
  if (classification === "rate_limited") {
    return "rate_limited";
  }

  if (classification === "network_error") {
    return "network_error";
  }

  if (classification === "auth_error") {
    return "auth_error";
  }

  return "error";
};

const computeRetryAt = (attemptNumber) => {
  const base = SOCIAL_RETRY_BASE_MS * 2 ** Math.max(0, attemptNumber - 1);
  const jitter = Math.floor(Math.random() * 1000);
  return new Date(Date.now() + base + jitter);
};

const extractResponseExcerpt = (value) => {
  if (!value) {
    return "";
  }

  const raw = typeof value === "string" ? value : JSON.stringify(value);
  return raw.slice(0, 1000);
};

const getMissingAccountConfigKeys = (platform, configJson) => {
  const requiredKeys = SOCIAL_REQUIRED_ACCOUNT_CONFIG_KEYS[platform] || [];
  if (requiredKeys.length === 0) {
    return [];
  }

  const source =
    configJson && typeof configJson === "object" && !Array.isArray(configJson)
      ? configJson
      : {};

  return requiredKeys.filter((key) => {
    const value = source[key];
    return typeof value !== "string" || !value.trim();
  });
};

const parseBoundedInt = ({
  value,
  fallback,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
}) => {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.floor(raw)));
};

const parseBooleanValue = (value, fallback) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return fallback;
};

const tryParseJsonObject = ({
  value,
  label,
  allowEmpty = true,
  logOnError = true,
}) => {
  const rawString =
    typeof value === "string" ? value.trim() : value === undefined ? "" : value;
  if (allowEmpty && (rawString === "" || rawString === null || rawString === undefined)) {
    return { ok: true, data: {} };
  }

  let parsed = rawString;
  if (typeof rawString === "string") {
    try {
      parsed = JSON.parse(rawString);
    } catch (error) {
      if (logOnError) {
        console.error(`Failed to parse ${label}:`, error);
      }
      return {
        ok: false,
        error: `${label} must be valid JSON object text.`,
      };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: `${label} must be a JSON object.`,
    };
  }

  return { ok: true, data: parsed };
};

const normalizeRemediationPlatformOverrides = (parsed) => {
  const output = {};
  for (const platform of supportedSocialPlatforms) {
    const raw = parsed?.[platform];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }

    output[platform] = {
      enabled: parseBooleanValue(raw.enabled, true),
      applyOnCriticalOnly: parseBooleanValue(
        raw.applyOnCriticalOnly,
        SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY
      ),
      limitPerAction: parseBoundedInt({
        value: raw.limitPerAction,
        fallback: SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
        min: 1,
        max: 500,
      }),
      cooldownMinutes: parseBoundedInt({
        value: raw.cooldownMinutes,
        fallback: SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES,
        min: 1,
        max: 24 * 60,
      }),
    };
  }
  return output;
};

const parseRemediationPlatformOverrides = () => {
  if (!SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_RAW) {
    return {};
  }

  const parsed = tryParseJsonObject({
    value: SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_RAW,
    label: "SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_JSON",
    allowEmpty: true,
  });
  if (!parsed.ok) {
    return {};
  }

  return normalizeRemediationPlatformOverrides(parsed.data);
};

const SOCIAL_REMEDIATION_PLATFORM_OVERRIDES = parseRemediationPlatformOverrides();

const getEffectiveRemediationPolicyForPlatform = (platform) => {
  const platformOverride =
    SOCIAL_REMEDIATION_PLATFORM_OVERRIDES[platform] || {};
  return {
    enabled: platformOverride.enabled !== false,
    applyOnCriticalOnly:
      typeof platformOverride.applyOnCriticalOnly === "boolean"
        ? platformOverride.applyOnCriticalOnly
        : SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY,
    limitPerAction: parseBoundedInt({
      value: platformOverride.limitPerAction,
      fallback: SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
      min: 1,
      max: 500,
    }),
    cooldownMinutes: parseBoundedInt({
      value: platformOverride.cooldownMinutes,
      fallback: SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES,
      min: 1,
      max: 24 * 60,
    }),
  };
};

const getSanitizedRemediationPlatformOverrides = () => {
  const output = {};
  for (const platform of supportedSocialPlatforms) {
    const effective = getEffectiveRemediationPolicyForPlatform(platform);
    if (!SOCIAL_REMEDIATION_PLATFORM_OVERRIDES[platform]) {
      continue;
    }
    output[platform] = effective;
  }
  return output;
};

const parseRemediationFreezeUtcRangesDetailed = (rawFreezeHours) => {
  const source = String(rawFreezeHours || "").trim();
  if (!source) {
    return {
      source: "",
      ranges: [],
      invalidSegments: [],
    };
  }

  const ranges = [];
  const invalidSegments = [];
  for (const rawSegment of source.split(",")) {
    const segment = String(rawSegment || "").trim();
    if (!segment) {
      continue;
    }
    const [rawStart, rawEnd] = segment.split("-");
    if (rawStart === undefined || rawEnd === undefined) {
      invalidSegments.push(segment);
      continue;
    }
    const start = Number(rawStart.trim());
    const end = Number(rawEnd.trim());
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      invalidSegments.push(segment);
      continue;
    }
    const normalizedStart = Math.max(0, Math.min(24, Math.floor(start)));
    const normalizedEnd = Math.max(0, Math.min(24, Math.floor(end)));
    ranges.push({
      start: normalizedStart,
      end: normalizedEnd,
      label: `${normalizedStart}-${normalizedEnd}`,
    });
  }

  return {
    source,
    ranges,
    invalidSegments,
  };
};

const parseRemediationFreezeUtcRanges = (
  rawFreezeHours = SOCIAL_REMEDIATION_AUTORUN_FREEZE_UTC_HOURS
) => {
  const details = parseRemediationFreezeUtcRangesDetailed(rawFreezeHours);
  if (!details.source) {
    return [];
  }
  return details.ranges;
};

const SOCIAL_REMEDIATION_FREEZE_UTC_RANGES = parseRemediationFreezeUtcRanges();

const isUtcHourWithinRange = ({ hour, start, end }) => {
  if (start === end) {
    return true;
  }
  if (start < end) {
    return hour >= start && hour < end;
  }
  return hour >= start || hour < end;
};

const isSocialRemediationFreezeActive = (atDate = new Date()) => {
  if (!Array.isArray(SOCIAL_REMEDIATION_FREEZE_UTC_RANGES)) {
    return false;
  }
  if (SOCIAL_REMEDIATION_FREEZE_UTC_RANGES.length === 0) {
    return false;
  }
  const hour = atDate.getUTCHours();
  return SOCIAL_REMEDIATION_FREEZE_UTC_RANGES.some((range) =>
    isUtcHourWithinRange({
      hour,
      start: range.start,
      end: range.end,
    })
  );
};

const normalizeRemediationActionEscalationOverrides = (parsed) => {
  const output = {};
  for (const action of SOCIAL_REMEDIATION_ACTIONS) {
    const raw = parsed?.[action];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }
    output[action] = {
      enabled: parseBooleanValue(raw.enabled, true),
      minEstimatedAffected: parseBoundedInt({
        value: raw.minEstimatedAffected,
        fallback: 1,
        min: 1,
        max: 100000,
      }),
      forceApplyAtOrAbove:
        raw.forceApplyAtOrAbove === null || raw.forceApplyAtOrAbove === undefined
          ? null
          : parseBoundedInt({
              value: raw.forceApplyAtOrAbove,
              fallback: 1,
              min: 1,
              max: 100000,
            }),
      maxApplyLimit:
        raw.maxApplyLimit === null || raw.maxApplyLimit === undefined
          ? null
          : parseBoundedInt({
              value: raw.maxApplyLimit,
              fallback: 500,
              min: 1,
              max: 500,
            }),
    };
  }
  return output;
};

const parseRemediationActionEscalationOverrides = () => {
  if (!SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES_RAW) {
    return {};
  }

  const parsed = tryParseJsonObject({
    value: SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES_RAW,
    label: "SOCIAL_REMEDIATION_ACTION_ESCALATION_JSON",
    allowEmpty: true,
  });
  if (!parsed.ok) {
    return {};
  }

  return normalizeRemediationActionEscalationOverrides(parsed.data);
};

const SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES =
  parseRemediationActionEscalationOverrides();

const getEffectiveRemediationActionEscalation = (action) => {
  const override = SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES[action] || {};
  return {
    enabled: override.enabled !== false,
    minEstimatedAffected: parseBoundedInt({
      value: override.minEstimatedAffected,
      fallback: 1,
      min: 1,
      max: 100000,
    }),
    forceApplyAtOrAbove:
      override.forceApplyAtOrAbove === null ||
      override.forceApplyAtOrAbove === undefined
        ? null
        : parseBoundedInt({
            value: override.forceApplyAtOrAbove,
            fallback: 1,
            min: 1,
            max: 100000,
          }),
    maxApplyLimit:
      override.maxApplyLimit === null || override.maxApplyLimit === undefined
        ? null
        : parseBoundedInt({
            value: override.maxApplyLimit,
            fallback: 500,
            min: 1,
            max: 500,
          }),
  };
};

const getSanitizedRemediationActionEscalationOverrides = () => {
  const output = {};
  for (const action of SOCIAL_REMEDIATION_ACTIONS) {
    if (!SOCIAL_REMEDIATION_ACTION_ESCALATION_OVERRIDES[action]) {
      continue;
    }
    output[action] = getEffectiveRemediationActionEscalation(action);
  }
  return output;
};

const buildSocialProviderHealth = async ({
  windowHours = 24,
  expiringWithinHours = 72,
}) => {
  const [accounts, summary, signals] = await Promise.all([
    listSocialAccounts(),
    getSocialSummary({ fromDate: null, toDate: null }),
    getSocialRateLimitSignals({ windowHours }),
  ]);

  const nowMs = Date.now();
  const expiringThresholdMs = nowMs + expiringWithinHours * 60 * 60 * 1000;
  const byPlatformStatus = new Map();
  const signalByPlatform = new Map(
    signals.map((signal) => [signal.platform, signal])
  );

  for (const row of summary.byPlatformStatus || []) {
    const bucket = byPlatformStatus.get(row.platform) || [];
    bucket.push(row);
    byPlatformStatus.set(row.platform, bucket);
  }

  const health = supportedSocialPlatforms.map((platform) => {
    const oauthMissingEnvKeys = (SOCIAL_OAUTH_REQUIRED_ENV_KEYS[platform] || []).filter(
      (envKey) => !String(process.env[envKey] || "").trim()
    );
    const platformAccounts = accounts.filter(
      (account) => account.platform === platform
    );
    const activeAccounts = platformAccounts.filter((account) => account.active);
    const inactiveAccounts = Math.max(0, platformAccounts.length - activeAccounts.length);

    let tokenExpiredCount = 0;
    let tokenExpiringSoonCount = 0;
    let oldestTokenExpiry = null;
    let oldestTokenExpiryMs = Number.POSITIVE_INFINITY;
    let missingRequiredConfigCount = 0;
    const configWarnings = [];

    for (const account of activeAccounts) {
      if (account.token_expires_at) {
        const expiryMs = Date.parse(account.token_expires_at);
        if (Number.isFinite(expiryMs)) {
          if (expiryMs <= nowMs) {
            tokenExpiredCount += 1;
          } else if (expiryMs <= expiringThresholdMs) {
            tokenExpiringSoonCount += 1;
          }
          if (expiryMs < oldestTokenExpiryMs) {
            oldestTokenExpiryMs = expiryMs;
            oldestTokenExpiry = new Date(expiryMs).toISOString();
          }
        }
      }

      const missingKeys = getMissingAccountConfigKeys(
        platform,
        account.config_json
      );
      if (missingKeys.length > 0) {
        missingRequiredConfigCount += 1;
        configWarnings.push({
          accountLabel: account.account_label,
          missingKeys,
        });
      }
    }

    const queueStats = {
      queued: 0,
      running: 0,
      failed: 0,
      deadLetter: 0,
    };

    for (const row of byPlatformStatus.get(platform) || []) {
      const count = Number(row.count || 0);
      if (row.status === "queued") {
        queueStats.queued += count;
      } else if (row.status === "running") {
        queueStats.running += count;
      } else if (row.status === "failed") {
        queueStats.failed += count;
      } else if (row.status === "dead_letter") {
        queueStats.deadLetter += count;
      }
    }

    const signal = signalByPlatform.get(platform) || null;
    const issues = [];
    let status = "healthy";

    if (oauthMissingEnvKeys.length > 0) {
      issues.push(`oauth_env_missing:${oauthMissingEnvKeys.join(",")}`);
      if (status === "healthy") {
        status = "warning";
      }
    }

    if (activeAccounts.length === 0) {
      issues.push("no_active_account");
      if (queueStats.queued + queueStats.running > 0) {
        status = "critical";
      } else if (status === "healthy") {
        status = "warning";
      }
    }

    if (tokenExpiredCount > 0) {
      issues.push(`expired_tokens:${tokenExpiredCount}`);
      if (queueStats.queued + queueStats.running > 0) {
        status = "critical";
      } else if (status === "healthy") {
        status = "warning";
      }
    }

    if (tokenExpiringSoonCount > 0) {
      issues.push(`expiring_tokens:${tokenExpiringSoonCount}`);
      if (status === "healthy") {
        status = "warning";
      }
    }

    if (missingRequiredConfigCount > 0) {
      issues.push(`missing_required_config:${missingRequiredConfigCount}`);
      if (status === "healthy") {
        status = "warning";
      }
    }

    if (queueStats.deadLetter > 0) {
      issues.push(`dead_letter_jobs:${queueStats.deadLetter}`);
      if (status !== "critical") {
        status = "warning";
      }
    }

    if (queueStats.failed > 0) {
      issues.push(`failed_jobs:${queueStats.failed}`);
      if (status === "healthy") {
        status = "warning";
      }
    }

    if (signal?.cooldownActive) {
      issues.push(`rate_limit_cooldown:${signal.cooldownSecondsRemaining}`);
      if (status === "healthy") {
        status = "warning";
      }
    }

    const recommendedActions = [];
    if (queueStats.queued > 0) {
      recommendedActions.push("drain_queued_if_unsafe");
    }
    if (queueStats.running > 0) {
      recommendedActions.push("monitor_or_cancel_running");
    }
    if (queueStats.failed > 0) {
      recommendedActions.push("retry_failed_jobs");
    }
    if (queueStats.deadLetter > 0) {
      recommendedActions.push("retry_dead_letter_jobs");
    }
    if (tokenExpiredCount > 0 || tokenExpiringSoonCount > 0) {
      recommendedActions.push("refresh_or_rotate_tokens");
    }
    if (missingRequiredConfigCount > 0) {
      recommendedActions.push("fix_account_config_json");
    }
    if (oauthMissingEnvKeys.length > 0) {
      recommendedActions.push("set_missing_oauth_env");
    }

    return {
      platform,
      status,
      issues,
      recommendedActions,
      oauthConfigured: oauthMissingEnvKeys.length === 0,
      oauthMissingEnvKeys,
      activeAccounts: activeAccounts.length,
      inactiveAccounts,
      tokenExpiredCount,
      tokenExpiringSoonCount,
      oldestTokenExpiry,
      missingRequiredConfigCount,
      configWarnings,
      queue: queueStats,
      rateLimit: signal
        ? {
            cooldownActive: signal.cooldownActive,
            cooldownSecondsRemaining: signal.cooldownSecondsRemaining,
            lastRateLimitedAt: signal.lastRateLimitedAt,
            jobId: signal.jobId,
            jobStatus: signal.jobStatus,
          }
        : {
            cooldownActive: false,
            cooldownSecondsRemaining: 0,
            lastRateLimitedAt: null,
            jobId: null,
            jobStatus: null,
          },
    };
  });

  return {
    windowHours,
    expiringWithinHours,
    publishMode: SOCIAL_PUBLISH_MODE,
    utm: getSocialUtmConfig(),
    health,
  };
};

const buildSocialRemediationPlan = ({
  health = [],
  limitPerAction = SOCIAL_REMEDIATION_DEFAULT_LIMIT,
}) => {
  const items = [];
  let sequence = 0;

  const pushItem = ({
    platform,
    action,
    reason,
    estimatedAffectedCount,
    priority,
    risk,
    params,
  }) => {
    sequence += 1;
    items.push({
      id: `${platform}:${action}:${sequence}`,
      platform,
      action,
      reason,
      estimatedAffectedCount,
      priority,
      risk,
      params,
      dryRunDefault: true,
    });
  };

  for (const entry of health) {
    const risk = entry.status === "critical" ? "high" : entry.status === "warning" ? "medium" : "low";
    const hasCriticalQueueRisk =
      entry.status === "critical" ||
      entry.issues.some((issue) => issue.startsWith("oauth_env_missing")) ||
      entry.issues.some((issue) => issue.startsWith("expired_tokens")) ||
      entry.issues.includes("no_active_account");

    if (entry.queue.failed > 0) {
      pushItem({
        platform: entry.platform,
        action: "retry_failed_jobs",
        reason: "failed_jobs_present",
        estimatedAffectedCount: Math.min(limitPerAction, entry.queue.failed),
        priority: entry.status === "critical" ? 95 : 80,
        risk,
        params: {
          platform: entry.platform,
          limit: Math.min(limitPerAction, entry.queue.failed),
        },
      });
    }

    if (entry.queue.deadLetter > 0) {
      pushItem({
        platform: entry.platform,
        action: "retry_dead_letter_jobs",
        reason: "dead_letter_jobs_present",
        estimatedAffectedCount: Math.min(limitPerAction, entry.queue.deadLetter),
        priority: entry.status === "critical" ? 90 : 75,
        risk,
        params: {
          platform: entry.platform,
          limit: Math.min(limitPerAction, entry.queue.deadLetter),
        },
      });
    }

    if (entry.queue.queued > 0 && hasCriticalQueueRisk) {
      pushItem({
        platform: entry.platform,
        action: "cancel_queued_jobs",
        reason: "queued_jobs_unsafe_under_current_health",
        estimatedAffectedCount: Math.min(limitPerAction, entry.queue.queued),
        priority: entry.status === "critical" ? 100 : 70,
        risk: entry.status === "critical" ? "high" : risk,
        params: {
          platform: entry.platform,
          limit: Math.min(limitPerAction, entry.queue.queued),
        },
      });
    }

    if (entry.queue.running > 0 && entry.status === "critical") {
      pushItem({
        platform: entry.platform,
        action: "cancel_queued_and_running_jobs",
        reason: "critical_state_with_running_jobs",
        estimatedAffectedCount: Math.min(
          limitPerAction,
          entry.queue.queued + entry.queue.running
        ),
        priority: 98,
        risk: "high",
        params: {
          platform: entry.platform,
          limit: Math.min(limitPerAction, entry.queue.queued + entry.queue.running),
        },
      });
    }
  }

  return items.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    if (a.platform !== b.platform) {
      return a.platform.localeCompare(b.platform);
    }
    return a.action.localeCompare(b.action);
  });
};

const getSocialJobCountByStatus = async ({ platform, status }) => {
  const result = await listSocialJobs({
    status,
    platform: platform || null,
    limit: 1,
    offset: 0,
  });
  return Number(result.total || 0);
};

const estimateRemediationAffectedCount = async ({ action, platform, limit }) => {
  if (action === "retry_failed_jobs") {
    return Math.min(limit, await getSocialJobCountByStatus({ platform, status: "failed" }));
  }

  if (action === "retry_failed_and_dead_letter_jobs") {
    const [failed, deadLetter] = await Promise.all([
      getSocialJobCountByStatus({ platform, status: "failed" }),
      getSocialJobCountByStatus({ platform, status: "dead_letter" }),
    ]);
    return Math.min(limit, failed + deadLetter);
  }

  if (action === "retry_dead_letter_jobs") {
    return Math.min(
      limit,
      await getSocialJobCountByStatus({ platform, status: "dead_letter" })
    );
  }

  if (action === "cancel_queued_jobs") {
    return Math.min(limit, await getSocialJobCountByStatus({ platform, status: "queued" }));
  }

  if (action === "cancel_queued_and_running_jobs") {
    const [queued, running] = await Promise.all([
      getSocialJobCountByStatus({ platform, status: "queued" }),
      getSocialJobCountByStatus({ platform, status: "running" }),
    ]);
    return Math.min(limit, queued + running);
  }

  return 0;
};

const executeSocialRemediationAction = async ({
  action,
  platform,
  limit,
  dryRun,
}) => {
  const estimatedAffectedCount = await estimateRemediationAffectedCount({
    action,
    platform,
    limit,
  });

  if (dryRun) {
    return {
      estimatedAffectedCount,
      affectedCount: 0,
      affectedIds: [],
      dryRun: true,
    };
  }

  let rows = [];
  if (action === "retry_failed_jobs") {
    rows = await retryFailedSocialJobs({
      platform,
      limit,
      includeDeadLetter: false,
    });
  } else if (action === "retry_failed_and_dead_letter_jobs") {
    rows = await retryFailedSocialJobs({
      platform,
      limit,
      includeDeadLetter: true,
    });
  } else if (action === "retry_dead_letter_jobs") {
    rows = await retryDeadLetterSocialJobs({
      platform,
      limit,
    });
  } else if (action === "cancel_queued_jobs") {
    rows = await cancelQueuedSocialJobs({
      platform,
      limit,
      includeRunning: false,
    });
  } else if (action === "cancel_queued_and_running_jobs") {
    rows = await cancelQueuedSocialJobs({
      platform,
      limit,
      includeRunning: true,
    });
  } else {
    throw new SocialAdapterError("Unsupported remediation action.", {
      classification: "error",
      code: "UNSUPPORTED_REMEDIATION_ACTION",
      permanent: true,
    });
  }

  return {
    estimatedAffectedCount,
    affectedCount: rows.length,
    affectedIds: rows.slice(0, 200).map((row) => row.id),
    affectedIdsTruncated: rows.length > 200,
    dryRun: false,
  };
};

let socialRemediationPolicyInFlight = false;
const socialRemediationPolicyState = {
  inFlight: false,
  lastRunAt: null,
  lastRunFinishedAt: null,
  lastDurationMs: null,
  lastReason: null,
  lastError: null,
  runCount: 0,
  successCount: 0,
  failureCount: 0,
  lastSummary: null,
};

const getSocialRemediationPolicyConfig = () => ({
  enabled: SOCIAL_REMEDIATION_AUTORUN_ENABLED,
  pollMs: SOCIAL_REMEDIATION_AUTORUN_POLL_MS,
  cooldownMinutes: SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES,
  maxActionsPerCycle: SOCIAL_REMEDIATION_AUTORUN_MAX_ACTIONS_PER_CYCLE,
  applyOnCriticalOnly: SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY,
  limitPerAction: SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
  freezeUtcHours: SOCIAL_REMEDIATION_AUTORUN_FREEZE_UTC_HOURS || "",
  freezeRanges: SOCIAL_REMEDIATION_FREEZE_UTC_RANGES,
  freezeActiveNow: isSocialRemediationFreezeActive(),
  platformOverrides: getSanitizedRemediationPlatformOverrides(),
  actionEscalationOverrides: getSanitizedRemediationActionEscalationOverrides(),
});

const validateSocialRemediationPolicyDraft = ({
  freezeUtcHours,
  platformOverridesJson,
  actionEscalationJson,
}) => {
  const errors = [];
  const warnings = [];

  const freezeDetails = parseRemediationFreezeUtcRangesDetailed(freezeUtcHours);
  if (freezeDetails.invalidSegments.length > 0) {
    warnings.push(
      `Ignored invalid freeze segments: ${freezeDetails.invalidSegments.join(", ")}`
    );
  }
  if (freezeDetails.source && freezeDetails.ranges.length === 0) {
    errors.push("Freeze UTC windows contain no valid ranges.");
  }

  const platformParsed = tryParseJsonObject({
    value: platformOverridesJson,
    label: "platformOverridesJson",
    allowEmpty: true,
    logOnError: false,
  });
  const actionParsed = tryParseJsonObject({
    value: actionEscalationJson,
    label: "actionEscalationJson",
    allowEmpty: true,
    logOnError: false,
  });

  if (!platformParsed.ok) {
    errors.push(platformParsed.error || "Invalid platform overrides JSON.");
  }
  if (!actionParsed.ok) {
    errors.push(actionParsed.error || "Invalid action escalation JSON.");
  }

  const parsedPlatformOverrides = platformParsed.ok ? platformParsed.data : {};
  const parsedActionEscalation = actionParsed.ok ? actionParsed.data : {};

  const unknownPlatforms = Object.keys(parsedPlatformOverrides).filter(
    (key) => !supportedSocialPlatforms.includes(key)
  );
  const unknownActions = Object.keys(parsedActionEscalation).filter(
    (key) => !SOCIAL_REMEDIATION_ACTIONS.has(key)
  );
  if (unknownPlatforms.length > 0) {
    warnings.push(
      `Ignored unsupported platforms in overrides: ${unknownPlatforms.join(", ")}`
    );
  }
  if (unknownActions.length > 0) {
    warnings.push(
      `Ignored unsupported actions in escalation overrides: ${unknownActions.join(", ")}`
    );
  }

  const normalizedPlatformOverrides = normalizeRemediationPlatformOverrides(
    parsedPlatformOverrides
  );
  const normalizedActionEscalation = normalizeRemediationActionEscalationOverrides(
    parsedActionEscalation
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: {
      freezeUtcHours: freezeDetails.source,
      freezeRanges: freezeDetails.ranges,
      platformOverrides: normalizedPlatformOverrides,
      actionEscalationOverrides: normalizedActionEscalation,
    },
    observed: {
      invalidFreezeSegments: freezeDetails.invalidSegments,
      unknownPlatforms,
      unknownActions,
    },
  };
};

const runSocialRemediationPolicyCycle = async ({
  reason = "interval",
  dryRunOnly = false,
  forceApply = false,
  triggeredByUserId = null,
} = {}) => {
  if (socialRemediationPolicyInFlight) {
    return {
      ok: false,
      skipped: true,
      reason: "policy_in_flight",
    };
  }

  const startedAt = new Date();
  socialRemediationPolicyInFlight = true;
  socialRemediationPolicyState.inFlight = true;
  socialRemediationPolicyState.lastRunAt = startedAt.toISOString();
  socialRemediationPolicyState.lastReason = reason;
  socialRemediationPolicyState.lastError = null;
  socialRemediationPolicyState.runCount += 1;

  try {
    const report = await buildSocialProviderHealth({
      windowHours: 24,
      expiringWithinHours: 72,
    });
    const plan = buildSocialRemediationPlan({
      health: report.health,
      limitPerAction: SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
    });
    const healthByPlatform = new Map(
      report.health.map((entry) => [entry.platform, entry])
    );
    const freezeActive = isSocialRemediationFreezeActive(startedAt);

    let dryRunCount = 0;
    let appliedCount = 0;
    let skippedPolicyCount = 0;
    let skippedCooldownCount = 0;
    let skippedDisabledCount = 0;
    let skippedFreezeCount = 0;
    let skippedEscalationCount = 0;
    const actionResults = [];

    for (const entry of plan) {
      const platformHealth = healthByPlatform.get(entry.platform) || null;
      const platformStatus = platformHealth?.status || "healthy";
      const platformPolicy = getEffectiveRemediationPolicyForPlatform(
        entry.platform
      );
      const actionEscalation = getEffectiveRemediationActionEscalation(
        entry.action
      );
      const actionHardLimit = Math.min(
        platformPolicy.limitPerAction,
        actionEscalation.maxApplyLimit || platformPolicy.limitPerAction
      );
      const actionLimit = parseBoundedInt({
        value: entry.params?.limit,
        fallback: actionHardLimit,
        min: 1,
        max: actionHardLimit,
      });
      const canApplyByStatus =
        forceApply ||
        !platformPolicy.applyOnCriticalOnly ||
        platformStatus === "critical";
      const shouldApply = !dryRunOnly && canApplyByStatus;

      const dryRunResult = await executeSocialRemediationAction({
        action: entry.action,
        platform: entry.platform,
        limit: actionLimit,
        dryRun: true,
      });
      dryRunCount += 1;

      await createSocialRemediationRun({
        createdByUserId: triggeredByUserId,
        platform: entry.platform,
        action: entry.action,
        dryRun: true,
        requestJson: {
          source: "policy_cycle",
          reason,
          forceApply,
          dryRunOnly,
          planEntryId: entry.id,
          platformStatus,
          platformPolicy,
          actionEscalation,
          freezeActive,
          limit: actionLimit,
        },
        resultJson: dryRunResult,
      });

      if ((dryRunResult.estimatedAffectedCount || 0) <= 0) {
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "no_effect",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      if (!platformPolicy.enabled && !forceApply) {
        skippedDisabledCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_policy_disabled",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      if (!shouldApply) {
        skippedPolicyCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_policy_guardrail",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      if (freezeActive && !forceApply) {
        skippedFreezeCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_freeze_window",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      if (!actionEscalation.enabled && !forceApply) {
        skippedEscalationCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_action_escalation_disabled",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      if (
        (dryRunResult.estimatedAffectedCount || 0) <
          actionEscalation.minEstimatedAffected &&
        !forceApply
      ) {
        skippedEscalationCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_below_min_estimated_threshold",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
          minEstimatedAffected: actionEscalation.minEstimatedAffected,
        });
        continue;
      }

      if (
        !forceApply &&
        actionEscalation.forceApplyAtOrAbove !== null &&
        actionEscalation.forceApplyAtOrAbove !== undefined &&
        (dryRunResult.estimatedAffectedCount || 0) >=
          actionEscalation.forceApplyAtOrAbove
      ) {
        skippedEscalationCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_requires_force_apply_threshold",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
          forceApplyAtOrAbove: actionEscalation.forceApplyAtOrAbove,
        });
        continue;
      }

      if (appliedCount >= SOCIAL_REMEDIATION_AUTORUN_MAX_ACTIONS_PER_CYCLE) {
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_cycle_action_limit",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
        });
        continue;
      }

      const recentApplies = await countRecentSocialRemediationRuns({
        platform: entry.platform,
        action: entry.action,
        dryRun: false,
        sinceIso: new Date(
          Date.now() - platformPolicy.cooldownMinutes * 60 * 1000
        ).toISOString(),
      });
      if (!forceApply && recentApplies > 0) {
        skippedCooldownCount += 1;
        actionResults.push({
          platform: entry.platform,
          action: entry.action,
          mode: "dry_run_only",
          outcome: "skipped_cooldown",
          estimatedAffectedCount: dryRunResult.estimatedAffectedCount || 0,
          recentApplies,
        });
        continue;
      }

      const applyResult = await executeSocialRemediationAction({
        action: entry.action,
        platform: entry.platform,
        limit: actionLimit,
        dryRun: false,
      });

      await createSocialRemediationRun({
        createdByUserId: triggeredByUserId,
        platform: entry.platform,
        action: entry.action,
        dryRun: false,
        requestJson: {
          source: "policy_cycle",
          reason,
          forceApply,
          dryRunOnly,
          planEntryId: entry.id,
          platformStatus,
          platformPolicy,
          actionEscalation,
          freezeActive,
          limit: actionLimit,
        },
        resultJson: applyResult,
      });

      appliedCount += 1;
      actionResults.push({
        platform: entry.platform,
        action: entry.action,
        mode: "apply",
        outcome: "applied",
        estimatedAffectedCount: applyResult.estimatedAffectedCount || 0,
        affectedCount: applyResult.affectedCount || 0,
      });
    }

    const finishedAt = new Date();
    const summary = {
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      reason,
      forceApply,
      dryRunOnly,
      planCount: plan.length,
      dryRunCount,
      appliedCount,
      skippedPolicyCount,
      skippedCooldownCount,
      skippedDisabledCount,
      skippedFreezeCount,
      skippedEscalationCount,
      freezeActive,
      policyConfigSnapshot: getSocialRemediationPolicyConfig(),
      actionResults,
    };

    socialRemediationPolicyState.lastRunFinishedAt = finishedAt.toISOString();
    socialRemediationPolicyState.lastDurationMs =
      finishedAt.getTime() - startedAt.getTime();
    socialRemediationPolicyState.lastSummary = summary;
    socialRemediationPolicyState.lastError = null;
    socialRemediationPolicyState.successCount += 1;

    return {
      ok: true,
      skipped: false,
      ...summary,
    };
  } catch (error) {
    const finishedAt = new Date();
    socialRemediationPolicyState.lastRunFinishedAt = finishedAt.toISOString();
    socialRemediationPolicyState.lastDurationMs =
      finishedAt.getTime() - startedAt.getTime();
    socialRemediationPolicyState.lastError =
      error?.message || "Policy cycle failed.";
    socialRemediationPolicyState.failureCount += 1;
    throw error;
  } finally {
    socialRemediationPolicyInFlight = false;
    socialRemediationPolicyState.inFlight = false;
  }
};

const simulateSocialRemediationPolicy = async ({
  windowHours = 24,
  expiringWithinHours = 72,
  limitPerAction = SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
}) => {
  const report = await buildSocialProviderHealth({
    windowHours,
    expiringWithinHours,
  });
  const plan = buildSocialRemediationPlan({
    health: report.health,
    limitPerAction,
  });
  const healthByPlatform = new Map(
    report.health.map((entry) => [entry.platform, entry])
  );
  const freezeActive = isSocialRemediationFreezeActive(new Date());
  const rows = [];
  let totalEstimatedAffected = 0;

  for (const entry of plan) {
    const platformHealth = healthByPlatform.get(entry.platform) || null;
    const platformStatus = platformHealth?.status || "healthy";
    const platformPolicy = getEffectiveRemediationPolicyForPlatform(
      entry.platform
    );
    const actionEscalation = getEffectiveRemediationActionEscalation(
      entry.action
    );
    const actionHardLimit = Math.min(
      platformPolicy.limitPerAction,
      actionEscalation.maxApplyLimit || platformPolicy.limitPerAction
    );
    const actionLimit = parseBoundedInt({
      value: entry.params?.limit,
      fallback: actionHardLimit,
      min: 1,
      max: actionHardLimit,
    });
    const dryRunResult = await executeSocialRemediationAction({
      action: entry.action,
      platform: entry.platform,
      limit: actionLimit,
      dryRun: true,
    });
    const estimatedAffectedCount = Number(
      dryRunResult.estimatedAffectedCount || 0
    );
    totalEstimatedAffected += estimatedAffectedCount;

    let applyEligible = false;
    let applyBlocker = "";
    if (!platformPolicy.enabled) {
      applyBlocker = "policy_disabled_for_platform";
    } else if (freezeActive) {
      applyBlocker = "freeze_window_active";
    } else if (
      platformPolicy.applyOnCriticalOnly &&
      platformStatus !== "critical"
    ) {
      applyBlocker = "critical_only_guardrail";
    } else if (!actionEscalation.enabled) {
      applyBlocker = "action_escalation_disabled";
    } else if (
      estimatedAffectedCount < actionEscalation.minEstimatedAffected
    ) {
      applyBlocker = "below_min_estimated_threshold";
    } else if (
      actionEscalation.forceApplyAtOrAbove !== null &&
      actionEscalation.forceApplyAtOrAbove !== undefined &&
      estimatedAffectedCount >= actionEscalation.forceApplyAtOrAbove
    ) {
      applyBlocker = "requires_force_apply_threshold";
    } else {
      applyEligible = true;
    }

    rows.push({
      platform: entry.platform,
      platformStatus,
      action: entry.action,
      reason: entry.reason,
      priority: entry.priority,
      risk: entry.risk,
      estimatedAffectedCount,
      applyEligible,
      applyBlocker,
      freezeActive,
      actionLimit,
      policyEnabled: platformPolicy.enabled,
      policyApplyOnCriticalOnly: platformPolicy.applyOnCriticalOnly,
      policyCooldownMinutes: platformPolicy.cooldownMinutes,
      policyLimitPerAction: platformPolicy.limitPerAction,
      escalationEnabled: actionEscalation.enabled,
      escalationMinEstimatedAffected: actionEscalation.minEstimatedAffected,
      escalationForceApplyAtOrAbove: actionEscalation.forceApplyAtOrAbove,
      escalationMaxApplyLimit: actionEscalation.maxApplyLimit,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    windowHours,
    expiringWithinHours,
    limitPerAction,
    publishMode: report.publishMode,
    planCount: plan.length,
    totalEstimatedAffected,
    freezeActive,
    rows,
  };
};

const csvEscape = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const toPolicySimulationCsv = (simulation) => {
  const header = [
    "generated_at",
    "platform",
    "platform_status",
    "action",
    "reason",
    "priority",
    "risk",
    "estimated_affected_count",
    "apply_eligible",
    "apply_blocker",
    "freeze_active",
    "action_limit",
    "policy_enabled",
    "policy_apply_on_critical_only",
    "policy_cooldown_minutes",
    "policy_limit_per_action",
    "escalation_enabled",
    "escalation_min_estimated_affected",
    "escalation_force_apply_at_or_above",
    "escalation_max_apply_limit",
  ];

  const lines = [header.join(",")];
  for (const row of simulation.rows || []) {
    const values = [
      simulation.generatedAt,
      row.platform,
      row.platformStatus,
      row.action,
      row.reason,
      row.priority,
      row.risk,
      row.estimatedAffectedCount,
      row.applyEligible ? "1" : "0",
      row.applyBlocker || "",
      row.freezeActive ? "1" : "0",
      row.actionLimit,
      row.policyEnabled ? "1" : "0",
      row.policyApplyOnCriticalOnly ? "1" : "0",
      row.policyCooldownMinutes,
      row.policyLimitPerAction,
      row.escalationEnabled ? "1" : "0",
      row.escalationMinEstimatedAffected,
      row.escalationForceApplyAtOrAbove,
      row.escalationMaxApplyLimit,
    ];
    lines.push(values.map(csvEscape).join(","));
  }

  return lines.join("\n");
};

const requireAuthenticatedUser = async (req, res, next) => {
  try {
    const session = await resolveAuthenticatedSession(req);
    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    req.authSession = session;
    await touchSession(session.sessionId);
    next();
  } catch (error) {
    console.error("Authentication middleware failed:", error);
    res.status(500).json({ error: "Unable to validate session." });
  }
};

let socialWorkerTickInFlight = false;
const socialWorkerId = `worker-${process.pid}`;
const socialWorkerState = {
  inFlight: false,
  lastRunAt: null,
  lastRunFinishedAt: null,
  lastDurationMs: null,
  lastReason: null,
  lastError: null,
  tickCount: 0,
  successCount: 0,
  failureCount: 0,
  processedCount: 0,
  staleRecoveryCount: 0,
  lastSummary: null,
};

const classifySocialError = (error) => {
  if (error instanceof SocialAdapterError) {
    return {
      classification: error.classification || "error",
      permanent: !!error.permanent,
      httpStatus: Number.isFinite(error.httpStatus) ? error.httpStatus : null,
      errorCode: error.code || "",
      message: error.message || "Social adapter error.",
      responseExcerpt: extractResponseExcerpt(error.responseExcerpt),
    };
  }

  return {
    classification: "network_error",
    permanent: false,
    httpStatus: null,
    errorCode: "UNEXPECTED_ERROR",
    message: error?.message || "Unexpected social worker error.",
    responseExcerpt: extractResponseExcerpt(error?.stack || ""),
  };
};

const processSingleSocialJob = async (job) => {
  const attemptNumber = Number(job.attempt_count || 0) + 1;
  const maxAttempts = Number(job.max_attempts || SOCIAL_MAX_ATTEMPTS);
  const adapter = getSocialAdapter(job.platform);

  if (!adapter) {
    await markSocialJobAttemptError({
      jobId: job.id,
      attemptNumber,
      outcome: "error",
      httpStatus: null,
      errorCode: "UNSUPPORTED_PLATFORM",
      errorMessage: `No adapter registered for platform '${job.platform}'.`,
      responseExcerpt: "",
      nextStatus: "failed",
      nextRetryAt: null,
    });
    return {
      ok: false,
      jobId: job.id,
      outcome: "error",
      finalStatus: "failed",
      errorCode: "UNSUPPORTED_PLATFORM",
    };
  }

  const account = await getActiveSocialAccountForPlatform(job.platform);
  if (!account) {
    await markSocialJobAttemptError({
      jobId: job.id,
      attemptNumber,
      outcome: "auth_error",
      httpStatus: null,
      errorCode: "ACCOUNT_NOT_CONFIGURED",
      errorMessage: `No active social account configured for platform '${job.platform}'.`,
      responseExcerpt: "",
      nextStatus: "failed",
      nextRetryAt: null,
    });
    return {
      ok: false,
      jobId: job.id,
      outcome: "auth_error",
      finalStatus: "failed",
      errorCode: "ACCOUNT_NOT_CONFIGURED",
    };
  }

  let decryptedAccessToken = "";
  let decryptedRefreshToken = "";
  try {
    decryptedAccessToken = decryptSecret(account.access_token_encrypted);
    decryptedRefreshToken = account.refresh_token_encrypted
      ? decryptSecret(account.refresh_token_encrypted)
      : "";
  } catch (error) {
    await markSocialJobAttemptError({
      jobId: job.id,
      attemptNumber,
      outcome: "auth_error",
      httpStatus: null,
      errorCode: "TOKEN_DECRYPT_FAILED",
      errorMessage: "Failed to decrypt stored social account credentials.",
      responseExcerpt: extractResponseExcerpt(error?.message || ""),
      nextStatus: "failed",
      nextRetryAt: null,
    });
    return {
      ok: false,
      jobId: job.id,
      outcome: "auth_error",
      finalStatus: "failed",
      errorCode: "TOKEN_DECRYPT_FAILED",
    };
  }

  try {
    const platformPayload = buildPlatformSocialPayload({
      platform: job.platform,
      slug: job.blog_slug,
      title: job.blog_title,
      canonicalUrl: job.canonical_url,
      basePayload: job.payload || {},
    });
    const validatedPayload = adapter.validatePayload(platformPayload);
    const transformedPayload = adapter.transform(validatedPayload);
    let accessToken = decryptedAccessToken;
    let refreshToken = decryptedRefreshToken;
    let tokenRefreshed = false;

    const publishWithCredentials = async (nextAccessToken, nextRefreshToken) =>
      adapter.publish(
        transformedPayload,
        {
          ...account,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        },
        { mode: SOCIAL_PUBLISH_MODE }
      );

    let result = null;
    try {
      result = await publishWithCredentials(accessToken, refreshToken);
    } catch (initialPublishError) {
      const initialDetail = classifySocialError(initialPublishError);
      const canAttemptRefresh =
        initialDetail.classification === "auth_error" &&
        typeof refreshToken === "string" &&
        !!refreshToken.trim();

      if (!canAttemptRefresh) {
        throw initialPublishError;
      }

      const tokenData = await refreshOAuthToken({
        platform: job.platform,
        refreshToken,
        scopes: Array.isArray(account.scopes) ? account.scopes : [],
      });
      accessToken = String(tokenData.accessToken || "").trim();
      refreshToken = String(tokenData.refreshToken || refreshToken || "").trim();
      const tokenExpiresAt = tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
        : null;

      await upsertSocialAccount({
        platform: account.platform,
        accountLabel: account.account_label || "default",
        accessTokenEncrypted: encryptSecret(accessToken),
        refreshTokenEncrypted: refreshToken ? encryptSecret(refreshToken) : "",
        tokenExpiresAt,
        scopes:
          Array.isArray(tokenData.scopes) && tokenData.scopes.length > 0
            ? tokenData.scopes
            : Array.isArray(account.scopes)
              ? account.scopes
              : [],
        configJson: account.config_json || {},
        active: account.active !== false,
      });
      tokenRefreshed = true;

      result = await publishWithCredentials(accessToken, refreshToken);
    }

    await markSocialJobSucceeded({
      jobId: job.id,
      attemptNumber,
      platformPostId: String(result?.platformPostId || `post-${Date.now()}`),
      platformPostUrl: String(result?.platformPostUrl || ""),
      rawResponse: result?.raw || null,
    });
    return {
      ok: true,
      jobId: job.id,
      outcome: "success",
      finalStatus: "succeeded",
      tokenRefreshed,
      platformPostId: String(result?.platformPostId || ""),
    };
  } catch (error) {
    const detail = classifySocialError(error);
    const exhausted = attemptNumber >= maxAttempts;
    const shouldRetry =
      !detail.permanent &&
      !exhausted &&
      (detail.classification === "rate_limited" ||
        detail.classification === "network_error");

    await markSocialJobAttemptError({
      jobId: job.id,
      attemptNumber,
      outcome: mapErrorToAttemptOutcome(detail.classification),
      httpStatus: detail.httpStatus,
      errorCode: detail.errorCode,
      errorMessage: detail.message,
      responseExcerpt: detail.responseExcerpt,
      nextStatus: shouldRetry ? "queued" : exhausted ? "dead_letter" : "failed",
      nextRetryAt: shouldRetry ? computeRetryAt(attemptNumber) : null,
    });
    return {
      ok: false,
      jobId: job.id,
      outcome: mapErrorToAttemptOutcome(detail.classification),
      finalStatus: shouldRetry ? "queued" : exhausted ? "dead_letter" : "failed",
      errorCode: detail.errorCode || "",
      httpStatus: detail.httpStatus,
    };
  }
};

const getSocialWorkerRuntimeStatus = () => ({
  config: {
    enabled: SOCIAL_WORKER_ENABLED,
    pollMs: SOCIAL_WORKER_POLL_MS,
    batchSize: SOCIAL_WORKER_BATCH_SIZE,
    staleLockMinutes: SOCIAL_WORKER_STALE_LOCK_MINUTES,
    publishMode: SOCIAL_PUBLISH_MODE,
    utm: getSocialUtmConfig(),
  },
  state: socialWorkerState,
});

const runSocialWorkerTick = async ({
  reason = "interval",
  maxJobs = SOCIAL_WORKER_BATCH_SIZE,
  allowWhenDisabled = false,
} = {}) => {
  if (socialWorkerTickInFlight) {
    return {
      ok: false,
      skipped: true,
      reason: "worker_tick_in_flight",
    };
  }
  if (!SOCIAL_WORKER_ENABLED && !allowWhenDisabled) {
    return {
      ok: false,
      skipped: true,
      reason: "worker_disabled",
    };
  }

  const startedAt = new Date();
  const safeMaxJobs = parseBoundedInt({
    value: maxJobs,
    fallback: SOCIAL_WORKER_BATCH_SIZE,
    min: 1,
    max: 100,
  });

  socialWorkerTickInFlight = true;
  socialWorkerState.inFlight = true;
  socialWorkerState.lastRunAt = startedAt.toISOString();
  socialWorkerState.lastReason = reason;
  socialWorkerState.lastError = null;
  socialWorkerState.tickCount += 1;

  let claimedCount = 0;
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let recoveredStaleCount = 0;
  const outcomes = [];

  try {
    const staleBeforeIso = new Date(
      Date.now() - SOCIAL_WORKER_STALE_LOCK_MINUTES * 60 * 1000
    ).toISOString();
    const recoveredStale = await recoverStaleRunningSocialJobs({
      staleBeforeIso,
      limit: Math.max(50, safeMaxJobs * 5),
    });
    recoveredStaleCount = recoveredStale.length;
    if (recoveredStaleCount > 0) {
      socialWorkerState.staleRecoveryCount += recoveredStaleCount;
    }

    for (let index = 0; index < safeMaxJobs; index += 1) {
      const job = await claimNextSocialJob(socialWorkerId);
      if (!job) {
        break;
      }

      claimedCount += 1;
      const outcome = await processSingleSocialJob(job);
      processedCount += 1;
      if (outcome?.ok) {
        successCount += 1;
      } else {
        errorCount += 1;
      }
      outcomes.push({
        jobId: Number(outcome?.jobId || job.id),
        ok: !!outcome?.ok,
        outcome: outcome?.outcome || "",
        finalStatus: outcome?.finalStatus || "",
        errorCode: outcome?.errorCode || "",
        tokenRefreshed: outcome?.tokenRefreshed === true,
      });
    }

    const finishedAt = new Date();
    const summary = {
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      reason,
      maxJobs: safeMaxJobs,
      recoveredStaleCount,
      claimedCount,
      processedCount,
      successCount,
      errorCount,
      outcomes: outcomes.slice(0, 50),
    };

    socialWorkerState.lastRunFinishedAt = finishedAt.toISOString();
    socialWorkerState.lastDurationMs = finishedAt.getTime() - startedAt.getTime();
    socialWorkerState.lastSummary = summary;
    socialWorkerState.lastError = null;
    socialWorkerState.successCount += 1;
    socialWorkerState.processedCount += processedCount;

    return {
      ok: true,
      skipped: false,
      ...summary,
    };
  } catch (error) {
    const finishedAt = new Date();
    socialWorkerState.lastRunFinishedAt = finishedAt.toISOString();
    socialWorkerState.lastDurationMs = finishedAt.getTime() - startedAt.getTime();
    socialWorkerState.lastError = error?.message || "Worker tick failed.";
    socialWorkerState.failureCount += 1;
    throw error;
  } finally {
    socialWorkerTickInFlight = false;
    socialWorkerState.inFlight = false;
  }
};

const startSocialWorker = () => {
  if (!SOCIAL_WORKER_ENABLED) {
    console.log("Social worker is disabled (SOCIAL_WORKER_ENABLED=0).");
    return;
  }

  console.log(
    `Social worker started (poll ${SOCIAL_WORKER_POLL_MS}ms, mode=${SOCIAL_PUBLISH_MODE}).`
  );
  setInterval(() => {
    void runSocialWorkerTick({ reason: "interval" }).catch((error) => {
      console.error("Social worker tick failed:", error);
    });
  }, SOCIAL_WORKER_POLL_MS);
};

const startSocialRemediationPolicyRunner = () => {
  if (!SOCIAL_REMEDIATION_AUTORUN_ENABLED) {
    console.log(
      "Social remediation auto-policy is disabled (SOCIAL_REMEDIATION_AUTORUN_ENABLED=0)."
    );
    return;
  }

  const config = getSocialRemediationPolicyConfig();
  console.log(
    `Social remediation auto-policy started (poll=${config.pollMs}ms, cooldown=${config.cooldownMinutes}m, criticalOnly=${config.applyOnCriticalOnly ? "1" : "0"}, maxActions=${config.maxActionsPerCycle}).`
  );

  setInterval(() => {
    void runSocialRemediationPolicyCycle({
      reason: "interval",
      dryRunOnly: false,
      forceApply: false,
      triggeredByUserId: null,
    }).catch((error) => {
      console.error("Social remediation policy interval failed:", error);
    });
  }, SOCIAL_REMEDIATION_AUTORUN_POLL_MS);
};

const validateSocialOauthPlatform = (platform) => {
  const normalized = normalizeText(platform || "").toLowerCase();
  if (!supportedSocialPlatforms.includes(normalized)) {
    throw new SocialAdapterError("Unsupported social platform.", {
      classification: "error",
      code: "UNSUPPORTED_PLATFORM",
      permanent: true,
    });
  }
  return normalized;
};

const finalizeSocialOauth = async ({ platform, state, code }) => {
  const oauthState = await consumeSocialOauthState(state);
  if (!oauthState) {
    throw new SocialAdapterError(
      "OAuth state is invalid, expired, or already consumed.",
      {
        classification: "error",
        code: "OAUTH_STATE_INVALID",
        permanent: true,
      }
    );
  }

  if (oauthState.platform !== platform) {
    throw new SocialAdapterError(
      "OAuth callback platform does not match original request.",
      {
        classification: "error",
        code: "OAUTH_PLATFORM_MISMATCH",
        permanent: true,
      }
    );
  }

  const tokenData = await exchangeOAuthCode({
    platform,
    code,
    redirectUri: oauthState.redirect_uri,
    codeVerifier: oauthState.code_verifier || "",
  });

  const existingAccount = await findSocialAccountByPlatformLabel(
    platform,
    oauthState.account_label
  );
  const providerPayload = tokenData.providerPayload || {};
  const providerRoot =
    providerPayload?.data && typeof providerPayload.data === "object"
      ? providerPayload.data
      : providerPayload;

  const mergedConfig = {
    ...(existingAccount?.config_json || {}),
  };

  if (platform === "tiktok" && providerRoot?.open_id) {
    mergedConfig.openId = String(providerRoot.open_id);
  }

  const tokenExpiresAt = tokenData.expiresIn
    ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
    : null;

  await upsertSocialAccount({
    platform,
    accountLabel: oauthState.account_label,
    accessTokenEncrypted: encryptSecret(tokenData.accessToken),
    refreshTokenEncrypted: tokenData.refreshToken
      ? encryptSecret(tokenData.refreshToken)
      : "",
    tokenExpiresAt,
    scopes:
      tokenData.scopes && tokenData.scopes.length > 0
        ? tokenData.scopes
        : oauthState.requested_scopes || [],
    configJson: mergedConfig,
    active: true,
  });

  return {
    platform,
    accountLabel: oauthState.account_label,
  };
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
  const company = normalizeText(req.body?.company || "");

  // Honeypot trap for automated spam submissions.
  if (company) {
    res.json({ ok: true });
    return;
  }

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

app.get(
  "/api/social/providers",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (_req, res) => {
    try {
      const accounts = await listSocialAccounts();
      const configuredSet = new Set(
        accounts.filter((account) => account.active).map((account) => account.platform)
      );

      const providers = supportedSocialPlatforms.map((platform) => ({
        platform,
        configured: configuredSet.has(platform),
      }));
      const oauthMetadata = supportedSocialPlatforms.map((platform) =>
        getOAuthProviderMeta(platform)
      );

      res.json({
        ok: true,
        providers,
        supportedPlatforms: SOCIAL_PLATFORMS,
        oauthMetadata,
        utm: getSocialUtmConfig(),
      });
    } catch (error) {
      console.error("Social providers lookup failed:", error);
      res.status(500).json({ error: "Unable to list social providers." });
    }
  }
);

app.get(
  "/api/social/accounts",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (_req, res) => {
    try {
      const accounts = await listSocialAccounts();
      res.json({ ok: true, accounts });
    } catch (error) {
      console.error("Social account list failed:", error);
      res.status(500).json({ error: "Unable to list social accounts." });
    }
  }
);

app.get(
  "/api/social/providers/health",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const windowHours = parseBoundedInt({
      value: req.query?.windowHours,
      fallback: 24,
      min: 1,
      max: 168,
    });
    const expiringWithinHours = parseBoundedInt({
      value: req.query?.expiringWithinHours,
      fallback: 72,
      min: 1,
      max: 720,
    });

    try {
      const report = await buildSocialProviderHealth({
        windowHours,
        expiringWithinHours,
      });
      res.json({
        ok: true,
        ...report,
      });
    } catch (error) {
      console.error("Social provider health failed:", error);
      res.status(500).json({ error: "Unable to compute social provider health." });
    }
  }
);

app.get(
  "/api/social/worker/status",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (_req, res) => {
    res.json({
      ok: true,
      ...getSocialWorkerRuntimeStatus(),
    });
  }
);

app.post(
  "/api/social/worker/run-now",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const maxJobs = parseBoundedInt({
      value: req.body?.maxJobs,
      fallback: SOCIAL_WORKER_BATCH_SIZE,
      min: 1,
      max: 100,
    });
    const allowWhenDisabled = req.body?.allowWhenDisabled === true;

    try {
      const result = await runSocialWorkerTick({
        reason: "manual_trigger",
        maxJobs,
        allowWhenDisabled,
      });
      if (result?.skipped) {
        res.status(202).json({ ok: true, ...result });
        return;
      }

      res.json({ ok: true, ...result });
    } catch (error) {
      console.error("Social worker manual run failed:", error);
      res.status(500).json({ error: "Unable to run social worker now." });
    }
  }
);

app.get(
  "/api/social/remediation/plan",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const windowHours = parseBoundedInt({
      value: req.query?.windowHours,
      fallback: 24,
      min: 1,
      max: 168,
    });
    const expiringWithinHours = parseBoundedInt({
      value: req.query?.expiringWithinHours,
      fallback: 72,
      min: 1,
      max: 720,
    });
    const limitPerAction = parseBoundedInt({
      value: req.query?.limitPerAction,
      fallback: SOCIAL_REMEDIATION_DEFAULT_LIMIT,
      min: 1,
      max: 500,
    });

    try {
      const report = await buildSocialProviderHealth({
        windowHours,
        expiringWithinHours,
      });
      const plan = buildSocialRemediationPlan({
        health: report.health,
        limitPerAction,
      });
      res.json({
        ok: true,
        generatedAt: new Date().toISOString(),
        limitPerAction,
        ...report,
        plan,
      });
    } catch (error) {
      console.error("Social remediation plan failed:", error);
      res.status(500).json({ error: "Unable to build remediation plan." });
    }
  }
);

app.get(
  "/api/social/remediation/runs",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.query?.platform || "").toLowerCase();
    const { limit, offset } = parsePagination({
      limit: req.query?.limit,
      offset: req.query?.offset,
    });

    if (platform && !supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    try {
      const result = await listSocialRemediationRuns({
        platform: platform || null,
        limit,
        offset,
      });
      res.json({ ok: true, ...result, limit, offset });
    } catch (error) {
      console.error("Social remediation runs list failed:", error);
      res.status(500).json({ error: "Unable to list remediation runs." });
    }
  }
);

app.get(
  "/api/social/remediation/policy/status",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (_req, res) => {
    res.json({
      ok: true,
      config: getSocialRemediationPolicyConfig(),
      state: socialRemediationPolicyState,
    });
  }
);

app.post(
  "/api/social/remediation/policy/validate-config",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const freezeUtcHours = String(req.body?.freezeUtcHours || "").trim();
    const platformOverridesJson = String(
      req.body?.platformOverridesJson || ""
    ).trim();
    const actionEscalationJson = String(
      req.body?.actionEscalationJson || ""
    ).trim();

    const result = validateSocialRemediationPolicyDraft({
      freezeUtcHours,
      platformOverridesJson,
      actionEscalationJson,
    });

    if (!result.valid) {
      res.status(400).json({
        ok: false,
        ...result,
      });
      return;
    }

    res.json({
      ok: true,
      ...result,
    });
  }
);

app.get(
  "/api/social/remediation/policy/simulate",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const windowHours = parseBoundedInt({
      value: req.query?.windowHours,
      fallback: 24,
      min: 1,
      max: 168,
    });
    const expiringWithinHours = parseBoundedInt({
      value: req.query?.expiringWithinHours,
      fallback: 72,
      min: 1,
      max: 720,
    });
    const limitPerAction = parseBoundedInt({
      value: req.query?.limitPerAction,
      fallback: SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION,
      min: 1,
      max: 500,
    });
    const format = normalizeText(req.query?.format || "json").toLowerCase();

    try {
      const simulation = await simulateSocialRemediationPolicy({
        windowHours,
        expiringWithinHours,
        limitPerAction,
      });

      if (format === "csv") {
        const csv = toPolicySimulationCsv(simulation);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=\"social-remediation-policy-simulation-${stamp}.csv\"`
        );
        res.status(200).send(csv);
        return;
      }

      res.json({
        ok: true,
        ...simulation,
      });
    } catch (error) {
      console.error("Social remediation policy simulation failed:", error);
      res.status(500).json({ error: "Unable to simulate remediation policy." });
    }
  }
);

app.post(
  "/api/social/remediation/policy/run-now",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const dryRunOnly = req.body?.dryRunOnly !== false;
    const forceApply = req.body?.forceApply === true;

    try {
      const result = await runSocialRemediationPolicyCycle({
        reason: "manual_trigger",
        dryRunOnly,
        forceApply,
        triggeredByUserId: req.authSession?.user?.id || null,
      });

      if (result?.skipped) {
        res.status(202).json({ ok: true, ...result });
        return;
      }

      res.json({ ok: true, ...result });
    } catch (error) {
      console.error("Social remediation manual policy run failed:", error);
      res.status(500).json({ error: "Unable to run remediation policy now." });
    }
  }
);

app.post(
  "/api/social/remediation/execute",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const action = normalizeText(req.body?.action || "").toLowerCase();
    const platform = normalizeText(req.body?.platform || "").toLowerCase();
    const limit = parseBoundedInt({
      value: req.body?.limit,
      fallback: SOCIAL_REMEDIATION_DEFAULT_LIMIT,
      min: 1,
      max: 500,
    });
    const dryRun = req.body?.dryRun !== false;

    if (!SOCIAL_REMEDIATION_ACTIONS.has(action)) {
      res.status(400).json({ error: "Unsupported remediation action." });
      return;
    }

    if (!platform || !supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Supported platform is required." });
      return;
    }

    try {
      const result = await executeSocialRemediationAction({
        action,
        platform,
        limit,
        dryRun,
      });

      const audit = await createSocialRemediationRun({
        createdByUserId: req.authSession?.user?.id || null,
        platform,
        action,
        dryRun,
        requestJson: {
          action,
          platform,
          limit,
          dryRun,
        },
        resultJson: result,
      });

      res.json({
        ok: true,
        action,
        platform,
        limit,
        dryRun,
        ...result,
        run: audit,
      });
    } catch (error) {
      if (error instanceof SocialAdapterError) {
        res.status(400).json({
          error: error.message,
          code: error.code || "SOCIAL_REMEDIATION_FAILED",
        });
        return;
      }

      console.error("Social remediation execute failed:", error);
      res.status(500).json({ error: "Unable to execute remediation action." });
    }
  }
);

app.post(
  "/api/social/jobs/cancel-queued",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.body?.platform || "").toLowerCase();
    const rawLimit = Number(req.body?.limit || 50);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(500, Math.floor(rawLimit)))
      : 50;
    const includeRunning = req.body?.includeRunning === true;

    if (platform && !supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    try {
      const canceled = await cancelQueuedSocialJobs({
        platform: platform || null,
        limit,
        includeRunning,
      });

      res.json({
        ok: true,
        includeRunning,
        canceledCount: canceled.length,
        canceledIds: canceled.map((entry) => entry.id),
      });
    } catch (error) {
      console.error("Cancel queued jobs failed:", error);
      res.status(500).json({ error: "Unable to cancel queued jobs." });
    }
  }
);

app.post(
  "/api/social/accounts",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.body?.platform || "").toLowerCase();
    const accountLabel = normalizeText(req.body?.accountLabel || "default");
    const accessToken = String(req.body?.accessToken || "").trim();
    const refreshToken = String(req.body?.refreshToken || "").trim();
    const tokenExpiresAtRaw = normalizeText(req.body?.tokenExpiresAt || "");
    const active = req.body?.active !== false;
    const configJson =
      req.body?.config && typeof req.body.config === "object" && !Array.isArray(req.body.config)
        ? req.body.config
        : {};
    const scopes = Array.isArray(req.body?.scopes)
      ? req.body.scopes
          .map((scope) => normalizeText(scope))
          .filter(Boolean)
          .slice(0, 40)
      : [];

    if (!supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    if (!accountLabel || accountLabel.length > 80) {
      res.status(400).json({ error: "accountLabel must be 1-80 characters." });
      return;
    }

    if (!accessToken || accessToken.length > 4096) {
      res.status(400).json({ error: "accessToken is required." });
      return;
    }

    let tokenExpiresAt = null;
    if (tokenExpiresAtRaw) {
      const parsedDate = new Date(tokenExpiresAtRaw);
      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: "tokenExpiresAt must be a valid ISO datetime." });
        return;
      }
      tokenExpiresAt = parsedDate.toISOString();
    }

    try {
      const account = await upsertSocialAccount({
        platform,
        accountLabel,
        accessTokenEncrypted: encryptSecret(accessToken),
        refreshTokenEncrypted: refreshToken ? encryptSecret(refreshToken) : "",
        tokenExpiresAt,
        scopes,
        configJson,
        active,
      });

      res.status(201).json({ ok: true, account });
    } catch (error) {
      console.error("Social account upsert failed:", error);
      res.status(500).json({
        error:
          "Unable to save social account. Ensure SOCIAL_ENCRYPTION_KEY is configured on the server.",
      });
    }
  }
);

app.post(
  "/api/social/oauth/:platform/start",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.params?.platform || "").toLowerCase();
    const accountLabel = normalizeText(req.body?.accountLabel || "default");
    const redirectUriOverride = normalizeText(req.body?.redirectUri || "");
    const requestedScopes = normalizeScopes(req.body?.scopes);

    if (!supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    if (!accountLabel || accountLabel.length > 80) {
      res.status(400).json({ error: "accountLabel must be 1-80 characters." });
      return;
    }

    const state = createOauthState();
    const codeVerifier = createCodeVerifier();
    const codeChallenge = createCodeChallenge(codeVerifier);
    const expiresAt = new Date(
      Date.now() + SOCIAL_OAUTH_STATE_TTL_MINUTES * 60 * 1000
    );

    try {
      const oauth = getOAuthStartInfo({
        platform,
        state,
        redirectUriOverride,
        codeChallenge,
        requestedScopes,
      });

      await createSocialOauthState({
        state,
        platform,
        userId: req.authSession.user.id,
        accountLabel,
        redirectUri: oauth.redirectUri,
        codeVerifier,
        requestedScopes: oauth.scopes,
        expiresAt,
      });

      res.status(201).json({
        ok: true,
        platform,
        accountLabel,
        authUrl: oauth.authUrl,
        state,
        expiresAt: expiresAt.toISOString(),
        redirectUri: oauth.redirectUri,
        scopes: oauth.scopes,
      });
    } catch (error) {
      if (error instanceof SocialAdapterError) {
        res.status(400).json({
          error: error.message,
          code: error.code || "OAUTH_START_FAILED",
        });
        return;
      }

      console.error("Social OAuth start failed:", error);
      res.status(500).json({ error: "Unable to start social OAuth flow." });
    }
  }
);

app.get("/api/social/oauth/:platform/callback", async (req, res) => {
  const platformRaw = req.params?.platform || "";
  const state = normalizeText(req.query?.state || "");
  const code = normalizeText(req.query?.code || "");
  const providerError = normalizeText(req.query?.error || "");
  const providerErrorDescription = normalizeText(
    req.query?.error_description || ""
  );

  let platform = "";
  try {
    platform = validateSocialOauthPlatform(platformRaw);
  } catch (error) {
    res.status(400).json({ error: "Unsupported social platform." });
    return;
  }

  if (providerError) {
    res.status(400).json({
      error: `Provider returned error: ${providerError}`,
      details: providerErrorDescription || null,
    });
    return;
  }

  if (!state || !code) {
    res.status(400).json({ error: "Missing state or code query parameter." });
    return;
  }

  try {
    const result = await finalizeSocialOauth({ platform, state, code });

    res.json({
      ok: true,
      platform: result.platform,
      accountLabel: result.accountLabel,
      message: "OAuth account connection completed.",
    });
  } catch (error) {
    if (error instanceof SocialAdapterError) {
      res.status(400).json({
        error: error.message,
        code: error.code || "OAUTH_CALLBACK_FAILED",
      });
      return;
    }

    console.error("Social OAuth callback failed:", error);
    res.status(500).json({ error: "Unable to complete OAuth callback." });
  }
});

app.post(
  "/api/social/oauth/:platform/finalize",
  socialEnqueueLimiter,
  async (req, res) => {
    const platformRaw = req.params?.platform || "";
    const state = normalizeText(req.body?.state || "");
    const code = normalizeText(req.body?.code || "");
    const providerError = normalizeText(req.body?.error || "");
    const providerErrorDescription = normalizeText(
      req.body?.errorDescription || req.body?.error_description || ""
    );

    let platform = "";
    try {
      platform = validateSocialOauthPlatform(platformRaw);
    } catch {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    if (providerError) {
      res.status(400).json({
        error: `Provider returned error: ${providerError}`,
        details: providerErrorDescription || null,
      });
      return;
    }

    if (!state || !code) {
      res.status(400).json({ error: "Missing state or code." });
      return;
    }

    try {
      const result = await finalizeSocialOauth({ platform, state, code });
      res.json({
        ok: true,
        platform: result.platform,
        accountLabel: result.accountLabel,
        message: "OAuth account connection completed.",
      });
    } catch (error) {
      if (error instanceof SocialAdapterError) {
        res.status(400).json({
          error: error.message,
          code: error.code || "OAUTH_CALLBACK_FAILED",
        });
        return;
      }

      console.error("Social OAuth finalize failed:", error);
      res.status(500).json({ error: "Unable to complete OAuth callback." });
    }
  }
);

app.post(
  "/api/social/preview",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const slug = normalizeSlug(req.body?.slug || "");
    const title = normalizeText(req.body?.title || "");
    const canonicalUrl = normalizeUrl(req.body?.url || req.body?.canonicalUrl || "");
    const summary = normalizeText(req.body?.summary || "");
    const imageUrl = normalizeUrl(req.body?.imageUrl || "");
    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags
          .map((tag) => normalizeText(tag))
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const selectedPlatforms = normalizePlatforms(req.body?.platforms);

    if (!slug || !title || !canonicalUrl) {
      res
        .status(400)
        .json({ error: "slug, title, and url/canonicalUrl are required fields." });
      return;
    }

    if (selectedPlatforms.length === 0) {
      res.status(400).json({ error: "No supported platforms selected." });
      return;
    }

    const payload = buildSocialPayload({
      slug,
      title,
      canonicalUrl,
      summary,
      tags,
      imageUrl,
    });

    const previews = [];
    for (const platform of selectedPlatforms) {
      const adapter = getSocialAdapter(platform);
      if (!adapter) {
        previews.push({
          platform,
          ok: false,
          reason: "unsupported_platform",
          errorCode: "UNSUPPORTED_PLATFORM",
          message: `No adapter registered for platform '${platform}'.`,
        });
        continue;
      }

      try {
        const platformPayload = buildPlatformSocialPayload({
          platform,
          slug,
          title,
          canonicalUrl,
          summary,
          tags,
          imageUrl,
          basePayload: payload,
        });
        const validatedPayload = adapter.validatePayload(platformPayload);
        const transformedPayload = adapter.transform(validatedPayload);
        previews.push({
          platform,
          ok: true,
          transformed: buildSocialTransformedPreview(transformedPayload),
        });
      } catch (error) {
        if (error instanceof SocialAdapterError) {
          previews.push({
            platform,
            ok: false,
            reason: "preflight_validation_failed",
            errorCode: error.code || "INVALID_PAYLOAD",
            message: error.message || "Payload validation failed.",
            classification: error.classification || "error",
            permanent: error.permanent !== false,
          });
          continue;
        }

        previews.push({
          platform,
          ok: false,
          reason: "preview_failed",
          errorCode: "UNEXPECTED_PREVIEW_ERROR",
          message: error?.message || "Unexpected preview error.",
          classification: "error",
          permanent: false,
        });
      }
    }

    res.json({
      ok: true,
      source: {
        slug,
        title,
        canonicalUrl,
        summary,
        imageUrl,
        tags,
        platforms: selectedPlatforms,
        utm: getSocialUtmConfig(),
      },
      previews,
    });
  }
);

app.post(
  "/api/social/enqueue",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const slug = normalizeSlug(req.body?.slug || "");
    const title = normalizeText(req.body?.title || "");
    const canonicalUrl = normalizeUrl(req.body?.url || req.body?.canonicalUrl || "");
    const summary = normalizeText(req.body?.summary || "");
    const imageUrl = normalizeUrl(req.body?.imageUrl || "");
    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags
          .map((tag) => normalizeText(tag))
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const selectedPlatforms = normalizePlatforms(req.body?.platforms);

    if (!slug || !title || !canonicalUrl) {
      res
        .status(400)
        .json({ error: "slug, title, and url/canonicalUrl are required fields." });
      return;
    }

    if (selectedPlatforms.length === 0) {
      res.status(400).json({ error: "No supported platforms selected." });
      return;
    }

    const enqueued = [];
    const skipped = [];
    const createdByUserId = req.authSession?.user?.id || null;
    const payload = buildSocialPayload({
      slug,
      title,
      canonicalUrl,
      summary,
      tags,
      imageUrl,
    });

    try {
      for (const platform of selectedPlatforms) {
        const platformPayload = buildPlatformSocialPayload({
          platform,
          slug,
          title,
          canonicalUrl,
          summary,
          tags,
          imageUrl,
          basePayload: payload,
        });
        const preflight = preflightValidateSocialPayloadForPlatform({
          platform,
          payload: platformPayload,
        });
        if (!preflight.ok) {
          skipped.push({
            platform,
            reason: preflight.reason || "preflight_validation_failed",
            errorCode: preflight.errorCode,
            message: preflight.message,
          });
          continue;
        }

        const alreadyPosted = await hasSocialPost({ platform, blogSlug: slug });
        if (alreadyPosted) {
          skipped.push({ platform, reason: "already_posted" });
          continue;
        }

        const idempotencyKey = createSocialIdempotencyKey({
          platform,
          slug,
          canonicalUrl,
        });
        const job = await enqueueSocialJob({
          createdByUserId,
          blogSlug: slug,
          blogTitle: title,
          canonicalUrl,
          platform,
          idempotencyKey,
          payload: platformPayload,
          maxAttempts: SOCIAL_MAX_ATTEMPTS,
        });

        if (!job) {
          skipped.push({ platform, reason: "duplicate_idempotency_key" });
          continue;
        }

        enqueued.push({
          id: job.id,
          platform: job.platform,
          status: job.status,
          scheduledAt: job.scheduled_at,
        });
      }

      res.status(201).json({ ok: true, enqueued, skipped });
    } catch (error) {
      console.error("Social enqueue failed:", error);
      res.status(500).json({ error: "Unable to enqueue social jobs." });
    }
  }
);

app.post(
  "/api/social/enqueue-bulk/preview",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const selectedPlatforms = normalizePlatforms(req.body?.platforms);

    if (items.length === 0) {
      res.status(400).json({ error: "items[] is required for bulk preview." });
      return;
    }

    if (selectedPlatforms.length === 0) {
      res.status(400).json({ error: "No supported platforms selected." });
      return;
    }

    const normalizedItems = [];
    const invalidItems = [];
    for (const item of items) {
      const slug = normalizeSlug(item?.slug || "");
      const title = normalizeText(item?.title || "");
      const canonicalUrl = normalizeUrl(item?.url || item?.canonicalUrl || "");
      const summary = normalizeText(item?.summary || "");
      const imageUrl = normalizeUrl(item?.imageUrl || "");
      const tags = Array.isArray(item?.tags)
        ? item.tags
            .map((tag) => normalizeText(tag))
            .filter(Boolean)
            .slice(0, 20)
        : [];

      if (!slug || !title || !canonicalUrl) {
        invalidItems.push({
          slug: slug || String(item?.slug || ""),
          reason: "missing_required_fields",
        });
        continue;
      }

      normalizedItems.push({
        slug,
        title,
        canonicalUrl,
        summary,
        imageUrl,
        tags,
      });
    }

    const slugs = Array.from(new Set(normalizedItems.map((item) => item.slug)));
    const idempotencyCandidates = [];

    for (const item of normalizedItems) {
      for (const platform of selectedPlatforms) {
        idempotencyCandidates.push({
          platform,
          slug: item.slug,
          key: createSocialIdempotencyKey({
            platform,
            slug: item.slug,
            canonicalUrl: item.canonicalUrl,
          }),
        });
      }
    }

    try {
      const [existingPosts, existingJobs] = await Promise.all([
        listExistingSocialPostsForSlugsPlatforms({
          blogSlugs: slugs,
          platforms: selectedPlatforms,
        }),
        listExistingSocialJobsByIdempotencyKeys(
          idempotencyCandidates.map((entry) => entry.key)
        ),
      ]);

      const postedSet = new Set(
        existingPosts.map((entry) => `${entry.platform}:${entry.blog_slug}`)
      );
      const existingJobMap = new Map(
        existingJobs.map((entry) => [entry.idempotency_key, entry.status])
      );

      const preview = [];
      const enqueueableTargets = [];
      let enqueueableCount = 0;
      let skippedPostedCount = 0;
      let skippedExistingJobCount = 0;
      let skippedInvalidCount = invalidItems.length;
      let skippedInvalidPayloadCount = 0;

      for (const item of normalizedItems) {
        for (const platform of selectedPlatforms) {
          const postedKey = `${platform}:${item.slug}`;
          const idempotencyKey = createSocialIdempotencyKey({
            platform,
            slug: item.slug,
            canonicalUrl: item.canonicalUrl,
          });

          if (postedSet.has(postedKey)) {
            skippedPostedCount += 1;
            preview.push({
              platform,
              slug: item.slug,
              status: "skipped_posted",
            });
            continue;
          }

          const jobStatus = existingJobMap.get(idempotencyKey);
          if (jobStatus) {
            skippedExistingJobCount += 1;
            preview.push({
              platform,
              slug: item.slug,
              status: "skipped_existing_job",
              existingJobStatus: jobStatus,
            });
            continue;
          }

          const payload = buildSocialPayload({
            slug: item.slug,
            title: item.title,
            canonicalUrl: item.canonicalUrl,
            summary: item.summary,
            tags: item.tags,
            imageUrl: item.imageUrl,
          });
          const platformPayload = buildPlatformSocialPayload({
            platform,
            slug: item.slug,
            title: item.title,
            canonicalUrl: item.canonicalUrl,
            summary: item.summary,
            tags: item.tags,
            imageUrl: item.imageUrl,
            basePayload: payload,
          });
          const preflight = preflightValidateSocialPayloadForPlatform({
            platform,
            payload: platformPayload,
          });
          if (!preflight.ok) {
            skippedInvalidPayloadCount += 1;
            preview.push({
              platform,
              slug: item.slug,
              status: "skipped_invalid_payload",
              errorCode: preflight.errorCode,
              message: preflight.message,
            });
            continue;
          }

          enqueueableCount += 1;
          enqueueableTargets.push({
            platform,
            slug: item.slug,
          });
          preview.push({
            platform,
            slug: item.slug,
            status: "enqueueable",
          });
        }
      }

      res.json({
        ok: true,
        summary: {
          totalInputItems: items.length,
          validItems: normalizedItems.length,
          selectedPlatforms: selectedPlatforms.length,
          totalPlatformCandidates:
            normalizedItems.length * selectedPlatforms.length,
          enqueueableCount,
          skippedPostedCount,
          skippedExistingJobCount,
          skippedInvalidCount,
          skippedInvalidPayloadCount,
        },
        invalidItems,
        preview: preview.slice(0, 500),
        enqueueableTargets,
      });
    } catch (error) {
      console.error("Social bulk preview failed:", error);
      res.status(500).json({ error: "Unable to generate bulk preview." });
    }
  }
);

app.post(
  "/api/social/enqueue-bulk",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const selectedPlatforms = normalizePlatforms(req.body?.platforms);
    const targetsRaw = Array.isArray(req.body?.targets) ? req.body.targets : [];
    const targetSet = new Set();

    for (const target of targetsRaw) {
      const targetPlatform = normalizeText(target?.platform || "").toLowerCase();
      const targetSlug = normalizeSlug(target?.slug || "");
      if (!targetPlatform || !targetSlug) {
        continue;
      }
      if (!selectedPlatforms.includes(targetPlatform)) {
        continue;
      }
      targetSet.add(`${targetPlatform}:${targetSlug}`);
    }

    if (items.length === 0) {
      res.status(400).json({ error: "items[] is required for bulk enqueue." });
      return;
    }

    let enqueuedCount = 0;
    let skippedCount = 0;
    let skippedInvalidPayloadCount = 0;
    const createdByUserId = req.authSession?.user?.id || null;

    try {
      for (const item of items) {
        const slug = normalizeSlug(item?.slug || "");
        const title = normalizeText(item?.title || "");
        const canonicalUrl = normalizeUrl(item?.url || item?.canonicalUrl || "");
        const summary = normalizeText(item?.summary || "");
        const imageUrl = normalizeUrl(item?.imageUrl || "");
        const tags = Array.isArray(item?.tags)
          ? item.tags
              .map((tag) => normalizeText(tag))
              .filter(Boolean)
              .slice(0, 20)
          : [];

        if (!slug || !title || !canonicalUrl) {
          skippedCount += selectedPlatforms.length || 1;
          continue;
        }

        for (const platform of selectedPlatforms) {
          if (
            targetSet.size > 0 &&
            !targetSet.has(`${platform}:${slug}`)
          ) {
            skippedCount += 1;
            continue;
          }

          const payload = buildSocialPayload({
            slug,
            title,
            canonicalUrl,
            summary,
            tags,
            imageUrl,
          });
          const platformPayload = buildPlatformSocialPayload({
            platform,
            slug,
            title,
            canonicalUrl,
            summary,
            tags,
            imageUrl,
            basePayload: payload,
          });
          const preflight = preflightValidateSocialPayloadForPlatform({
            platform,
            payload: platformPayload,
          });
          if (!preflight.ok) {
            skippedCount += 1;
            skippedInvalidPayloadCount += 1;
            continue;
          }

          const alreadyPosted = await hasSocialPost({ platform, blogSlug: slug });
          if (alreadyPosted) {
            skippedCount += 1;
            continue;
          }

          const idempotencyKey = createSocialIdempotencyKey({
            platform,
            slug,
            canonicalUrl,
          });
          const job = await enqueueSocialJob({
            createdByUserId,
            blogSlug: slug,
            blogTitle: title,
            canonicalUrl,
            platform,
            idempotencyKey,
            payload: platformPayload,
            maxAttempts: SOCIAL_MAX_ATTEMPTS,
          });

          if (job) {
            enqueuedCount += 1;
          } else {
            skippedCount += 1;
          }
        }
      }

      res.status(201).json({
        ok: true,
        totalCandidates:
          targetSet.size > 0
            ? targetSet.size
            : items.length * Math.max(1, selectedPlatforms.length),
        enqueuedCount,
        skippedCount,
        skippedInvalidPayloadCount,
      });
    } catch (error) {
      console.error("Social bulk enqueue failed:", error);
      res.status(500).json({ error: "Unable to enqueue social jobs in bulk." });
    }
  }
);

app.post(
  "/api/social/jobs/retry-dead-letter",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.body?.platform || "").toLowerCase();
    const rawLimit = Number(req.body?.limit || 50);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(500, Math.floor(rawLimit)))
      : 50;

    if (platform && !supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    try {
      const retried = await retryDeadLetterSocialJobs({
        platform: platform || null,
        limit,
      });

      res.json({
        ok: true,
        retriedCount: retried.length,
        retriedIds: retried.map((entry) => entry.id),
      });
    } catch (error) {
      console.error("Retry dead-letter jobs failed:", error);
      res.status(500).json({ error: "Unable to retry dead-letter jobs." });
    }
  }
);

app.post(
  "/api/social/jobs/retry-failed",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const platform = normalizeText(req.body?.platform || "").toLowerCase();
    const rawLimit = Number(req.body?.limit || 50);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(500, Math.floor(rawLimit)))
      : 50;
    const includeDeadLetter = req.body?.includeDeadLetter === true;

    if (platform && !supportedSocialPlatforms.includes(platform)) {
      res.status(400).json({ error: "Unsupported social platform." });
      return;
    }

    try {
      const retried = await retryFailedSocialJobs({
        platform: platform || null,
        limit,
        includeDeadLetter,
      });

      res.json({
        ok: true,
        includeDeadLetter,
        retriedCount: retried.length,
        retriedIds: retried.map((entry) => entry.id),
      });
    } catch (error) {
      console.error("Retry failed jobs failed:", error);
      res.status(500).json({ error: "Unable to retry failed jobs." });
    }
  }
);

app.get(
  "/api/social/jobs",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const status = normalizeText(req.query?.status || "").toLowerCase();
    const platform = normalizeText(req.query?.platform || "").toLowerCase();
    const { limit, offset } = parsePagination({
      limit: req.query?.limit,
      offset: req.query?.offset,
    });

    try {
      const result = await listSocialJobs({
        status: status || null,
        platform: platform || null,
        limit,
        offset,
      });
      res.json({ ok: true, ...result, limit, offset });
    } catch (error) {
      console.error("Social jobs list failed:", error);
      res.status(500).json({ error: "Unable to list social jobs." });
    }
  }
);

app.get(
  "/api/social/jobs/:id/attempts",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const jobId = Number(req.params?.id || 0);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      res.status(400).json({ error: "Valid numeric job id is required." });
      return;
    }

    const { limit, offset } = parsePagination({
      limit: req.query?.limit,
      offset: req.query?.offset,
    });

    try {
      const result = await listSocialJobAttempts({
        jobId,
        limit,
        offset,
      });
      res.json({
        ok: true,
        jobId,
        limit,
        offset,
        ...result,
      });
    } catch (error) {
      console.error("Social job attempts list failed:", error);
      res.status(500).json({ error: "Unable to list social job attempts." });
    }
  }
);

app.post(
  "/api/social/jobs/:id/retry",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const jobId = Number(req.params?.id);
    if (!Number.isInteger(jobId) || jobId <= 0) {
      res.status(400).json({ error: "Invalid job id." });
      return;
    }

    try {
      const job = await retrySocialJob(jobId);
      if (!job) {
        res.status(404).json({ error: "Retryable job not found." });
        return;
      }
      res.json({ ok: true, job });
    } catch (error) {
      console.error("Social job retry failed:", error);
      res.status(500).json({ error: "Unable to retry social job." });
    }
  }
);

app.post(
  "/api/social/jobs/:id/cancel",
  socialEnqueueLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const jobId = Number(req.params?.id);
    if (!Number.isInteger(jobId) || jobId <= 0) {
      res.status(400).json({ error: "Invalid job id." });
      return;
    }

    try {
      const job = await cancelSocialJob(jobId);
      if (!job) {
        res.status(404).json({ error: "Cancelable job not found." });
        return;
      }
      res.json({ ok: true, job });
    } catch (error) {
      console.error("Social job cancel failed:", error);
      res.status(500).json({ error: "Unable to cancel social job." });
    }
  }
);

app.get(
  "/api/social/posts",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const slug = normalizeSlug(req.query?.slug || "");
    const platform = normalizeText(req.query?.platform || "").toLowerCase();
    const { limit, offset } = parsePagination({
      limit: req.query?.limit,
      offset: req.query?.offset,
    });

    try {
      const posts = await listSocialPosts({
        blogSlug: slug || null,
        platform: platform || null,
        limit,
        offset,
      });
      res.json({ ok: true, items: posts, limit, offset });
    } catch (error) {
      console.error("Social posts list failed:", error);
      res.status(500).json({ error: "Unable to list social posts." });
    }
  }
);

app.get(
  "/api/social/summary",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const fromDateRaw = normalizeText(req.query?.fromDate || "");
    const toDateRaw = normalizeText(req.query?.toDate || "");

    let fromDate = null;
    let toDate = null;

    if (fromDateRaw) {
      const parsed = new Date(fromDateRaw);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid fromDate value." });
        return;
      }
      fromDate = parsed.toISOString();
    }

    if (toDateRaw) {
      const parsed = new Date(toDateRaw);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid toDate value." });
        return;
      }
      toDate = parsed.toISOString();
    }

    try {
      const summary = await getSocialSummary({ fromDate, toDate });
      res.json({
        ok: true,
        fromDate,
        toDate,
        ...summary,
      });
    } catch (error) {
      console.error("Social summary failed:", error);
      res.status(500).json({ error: "Unable to fetch social summary." });
    }
  }
);

app.get(
  "/api/social/rate-limit-signals",
  socialReadLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const rawWindowHours = Number(req.query?.windowHours || 24);
    const windowHours = Number.isFinite(rawWindowHours)
      ? Math.max(1, Math.min(168, Math.floor(rawWindowHours)))
      : 24;

    try {
      const signals = await getSocialRateLimitSignals({ windowHours });
      res.json({
        ok: true,
        windowHours,
        signals,
      });
    } catch (error) {
      console.error("Social rate-limit signals failed:", error);
      res.status(500).json({ error: "Unable to fetch rate-limit signals." });
    }
  }
);

const startServer = async () => {
  try {
    await initDb();
    startSocialWorker();
    startSocialRemediationPolicyRunner();
    app.listen(port, () => {
      console.log(`Vertical Tension server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed.", error);
    process.exit(1);
  }
};

startServer();
