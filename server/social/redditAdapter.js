import { BaseSocialAdapter } from "./baseAdapter.js";
import { SocialAdapterError } from "./errors.js";
import { requestJson } from "./http.js";

export class RedditAdapter extends BaseSocialAdapter {
  constructor() {
    super("reddit");
  }

  transform(payload) {
    const defaultSubreddit = "self";
    const subreddit = String(payload.subreddit || defaultSubreddit).trim() || defaultSubreddit;

    return {
      ...payload,
      subreddit,
      postTitle: payload.title,
      postBody: [
        payload.summary || payload.title,
        "",
        `Source: ${payload.canonicalUrl}`,
      ].join("\n"),
    };
  }

  async publishLive(payload, account) {
    const accessToken = String(account?.accessToken || "").trim();
    const subreddit =
      String(payload?.subreddit || account?.config_json?.defaultSubreddit || "")
        .trim()
        .replace(/^r\//i, "") || "self";

    if (!accessToken) {
      throw new SocialAdapterError("Reddit access token is missing.", {
        classification: "auth_error",
        code: "MISSING_ACCESS_TOKEN",
        permanent: true,
      });
    }

    if (!subreddit || subreddit === "self") {
      throw new SocialAdapterError(
        "Reddit requires a concrete subreddit (e.g. philosophy).",
        {
          classification: "error",
          code: "MISSING_SUBREDDIT",
          permanent: true,
        }
      );
    }

    const baseUrl =
      process.env.REDDIT_API_BASE_URL?.trim() || "https://oauth.reddit.com";

    const response = await requestJson({
      method: "POST",
      url: `${baseUrl}/api/submit`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: {
        sr: subreddit,
        kind: "self",
        title: payload.postTitle,
        text: payload.postBody,
        resubmit: false,
      },
      errorCode: "REDDIT_PUBLISH_FAILED",
    });

    const submitted = response?.json?.json?.data;
    const postId = submitted?.id || `reddit-${Date.now()}`;
    const permalink = submitted?.url || submitted?.permalink || "";
    const postUrl = permalink
      ? permalink.startsWith("http")
        ? permalink
        : `https://reddit.com${permalink}`
      : "";

    return {
      platformPostId: postId,
      platformPostUrl: postUrl,
      raw: response.json,
    };
  }
}
