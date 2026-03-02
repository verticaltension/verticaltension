import { SocialAdapterError } from "./errors.js";

const normalizeText = (value = "") => String(value).trim().replace(/\s+/g, " ");

export class BaseSocialAdapter {
  constructor(platform) {
    this.platform = platform;
  }

  validatePayload(payload = {}) {
    const blogSlug = normalizeText(payload.blogSlug || payload.slug || "");
    const title = normalizeText(payload.title || "");
    const canonicalUrl = normalizeText(payload.canonicalUrl || payload.url || "");

    if (!blogSlug || !title || !canonicalUrl) {
      throw new SocialAdapterError(
        "Payload is missing required social post fields.",
        {
          classification: "error",
          code: "INVALID_PAYLOAD",
          permanent: true,
        }
      );
    }

    return {
      ...payload,
      blogSlug,
      title,
      canonicalUrl,
      summary: normalizeText(payload.summary || ""),
      tags: Array.isArray(payload.tags)
        ? payload.tags
            .map((item) => normalizeText(item))
            .filter(Boolean)
            .slice(0, 12)
        : [],
      imageUrl: normalizeText(payload.imageUrl || ""),
    };
  }

  transform(payload) {
    return payload;
  }

  async publish(transformedPayload, account, { mode = "stub" } = {}) {
    if (mode !== "live") {
      return this.createStubResult(transformedPayload);
    }

    return this.publishLive(transformedPayload, account);
  }

  async publishLive(_transformedPayload, _account) {
    throw new SocialAdapterError(`Live publish mode is not implemented for ${this.platform}.`, {
      classification: "auth_error",
      code: "LIVE_NOT_IMPLEMENTED",
      permanent: true,
    });
  }

  createStubResult(payload) {
    const slug = payload.blogSlug || "item";
    const id = `${this.platform}-${Date.now()}`;

    return {
      platformPostId: id,
      platformPostUrl: `https://example.com/${this.platform}/${encodeURIComponent(slug)}`,
      raw: {
        mode: "stub",
        platform: this.platform,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
