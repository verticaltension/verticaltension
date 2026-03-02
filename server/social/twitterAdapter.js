import { BaseSocialAdapter } from "./baseAdapter.js";
import { SocialAdapterError } from "./errors.js";
import { requestJson } from "./http.js";

const MAX_LENGTH = 270;

const clamp = (value, max) =>
  value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;

export class TwitterAdapter extends BaseSocialAdapter {
  constructor() {
    super("twitter");
  }

  transform(payload) {
    const tags = payload.tags.slice(0, 2).map((tag) => `#${tag.replace(/\s+/g, "")}`);
    const teaser = payload.summary || payload.title;
    const body = `${payload.title} — ${teaser}\n${payload.canonicalUrl}${
      tags.length ? `\n${tags.join(" ")}` : ""
    }`;

    return {
      ...payload,
      postText: clamp(body, MAX_LENGTH),
    };
  }

  async publishLive(payload, account) {
    const accessToken = String(account?.accessToken || "").trim();
    if (!accessToken) {
      throw new SocialAdapterError("Twitter/X access token is missing.", {
        classification: "auth_error",
        code: "MISSING_ACCESS_TOKEN",
        permanent: true,
      });
    }

    const baseUrl =
      process.env.TWITTER_API_BASE_URL?.trim() || "https://api.x.com";
    const response = await requestJson({
      method: "POST",
      url: `${baseUrl}/2/tweets`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: {
        text: payload.postText,
      },
      errorCode: "TWITTER_PUBLISH_FAILED",
    });

    const postId = response?.json?.data?.id || "";
    if (!postId) {
      throw new SocialAdapterError(
        "Twitter/X API response did not include a tweet id.",
        {
          classification: "error",
          code: "TWITTER_INVALID_RESPONSE",
          permanent: true,
          responseExcerpt: JSON.stringify(response?.json || {}).slice(0, 1000),
        }
      );
    }

    return {
      platformPostId: postId,
      platformPostUrl: `https://x.com/i/web/status/${encodeURIComponent(postId)}`,
      raw: response.json,
    };
  }
}
