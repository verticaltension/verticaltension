import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { initDb, listCatalog, insertContact } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/catalog", async (_req, res) => {
  try {
    const items = await listCatalog();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Unable to load catalog." });
  }
});

app.post("/api/contact", async (req, res) => {
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

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    MAIL_TO,
  } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && MAIL_FROM && MAIL_TO) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: subject || "Vertical Tension Press inquiry",
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
    } catch (error) {
      console.error("Email delivery failed:", error);
    }
  } else {
    console.warn("SMTP env not configured. Contact saved locally.");
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
