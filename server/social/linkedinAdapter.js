import { BaseSocialAdapter } from "./baseAdapter.js";
import { SocialAdapterError } from "./errors.js";
import { requestJson } from "./http.js";

export class LinkedInAdapter extends BaseSocialAdapter {
  constructor() {
    super("linkedin");
  }

  transform(payload) {
    const intro = payload.summary || payload.title;
    const hashtags = payload.tags
      .slice(0, 4)
      .map((tag) => `#${tag.replace(/\s+/g, "")}`)
      .join(" ");

    return {
      ...payload,
      postText: [
        payload.title,
        "",
        intro,
        "",
        `Read more: ${payload.canonicalUrl}`,
        hashtags || "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  async publishLive(payload, account) {
    const accessToken = String(account?.accessToken || "").trim();
    const actorUrn = String(account?.config_json?.actorUrn || "").trim();

    if (!accessToken) {
      throw new SocialAdapterError("LinkedIn access token is missing.", {
        classification: "auth_error",
        code: "MISSING_ACCESS_TOKEN",
        permanent: true,
      });
    }

    if (!actorUrn) {
      throw new SocialAdapterError("LinkedIn account config must include actorUrn.", {
        classification: "error",
        code: "MISSING_ACTOR_URN",
        permanent: true,
      });
    }

    const baseUrl =
      process.env.LINKEDIN_API_BASE_URL?.trim() || "https://api.linkedin.com/v2";

    const response = await requestJson({
      method: "POST",
      url: `${baseUrl}/ugcPosts`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: {
        author: actorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: payload.postText,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      errorCode: "LINKEDIN_PUBLISH_FAILED",
    });

    const locationHeader = response.headers.get("x-restli-id") || "";
    const postId = locationHeader || `linkedin-${Date.now()}`;

    return {
      platformPostId: postId,
      platformPostUrl: "",
      raw: response.json || { restliId: locationHeader },
    };
  }
}
