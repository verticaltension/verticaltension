import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { initDb, listCatalog, insertContact } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const trustProxy = process.env.TRUST_PROXY === "1";

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
const toInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};
const RATE_LIMIT_GLOBAL_MAX = toInt(process.env.RATE_LIMIT_GLOBAL_MAX, 300);
const RATE_LIMIT_HEALTH_MAX = toInt(process.env.RATE_LIMIT_HEALTH_MAX, 120);
const RATE_LIMIT_CATALOG_MAX = toInt(process.env.RATE_LIMIT_CATALOG_MAX, 120);
const RATE_LIMIT_CONTACT_MAX = toInt(process.env.RATE_LIMIT_CONTACT_MAX, 5);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: "1mb" }));

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
  const { name, email, subject, message } = req.body ?? {};

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields." });
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
