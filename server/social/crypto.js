import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

const getKey = () => {
  const rawKey = String(process.env.SOCIAL_ENCRYPTION_KEY || "").trim();
  if (!rawKey) {
    throw new Error("SOCIAL_ENCRYPTION_KEY is not configured.");
  }

  return createHash("sha256").update(rawKey).digest();
};

export const encryptSecret = (value) => {
  const plaintext = String(value || "");
  if (!plaintext) {
    return "";
  }

  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptSecret = (encryptedValue) => {
  const raw = String(encryptedValue || "");
  if (!raw) {
    return "";
  }

  const [ivB64, authTagB64, payloadB64] = raw.split(":");
  if (!ivB64 || !authTagB64 || !payloadB64) {
    throw new Error("Invalid encrypted secret format.");
  }

  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const payload = Buffer.from(payloadB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return decrypted.toString("utf8");
};
