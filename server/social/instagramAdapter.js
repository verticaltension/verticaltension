import { BaseSocialAdapter } from "./baseAdapter.js";
import { SocialAdapterError } from "./errors.js";
import { requestJson } from "./http.js";

export class InstagramAdapter extends BaseSocialAdapter {
  constructor() {
    super("instagram");
  }

  transform(payload) {
    if (!payload.imageUrl) {
      throw new SocialAdapterError("Instagram requires an imageUrl in payload.", {
        classification: "error",
        code: "MISSING_MEDIA",
        permanent: true,
      });
    }

    const hashtags = payload.tags
      .slice(0, 8)
      .map((tag) => `#${tag.replace(/\s+/g, "")}`)
      .join(" ");

    return {
      ...payload,
      caption: [
        payload.summary || payload.title,
        "",
        payload.canonicalUrl,
        hashtags || "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  async publishLive(payload, account) {
    const accessToken = String(account?.accessToken || "").trim();
    const igUserId = String(account?.config_json?.igUserId || "").trim();

    if (!accessToken) {
      throw new SocialAdapterError("Instagram access token is missing.", {
        classification: "auth_error",
        code: "MISSING_ACCESS_TOKEN",
        permanent: true,
      });
    }

    if (!igUserId) {
      throw new SocialAdapterError("Instagram account config must include igUserId.", {
        classification: "error",
        code: "MISSING_IG_USER_ID",
        permanent: true,
      });
    }

    const baseUrl =
      process.env.INSTAGRAM_GRAPH_BASE_URL?.trim() ||
      "https://graph.facebook.com/v21.0";

    const createContainer = await requestJson({
      method: "POST",
      url: `${baseUrl}/${encodeURIComponent(igUserId)}/media`,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        image_url: payload.imageUrl,
        caption: payload.caption,
        access_token: accessToken,
      },
      errorCode: "INSTAGRAM_CREATE_MEDIA_FAILED",
    });

    const containerId = createContainer?.json?.id || "";
    if (!containerId) {
      throw new SocialAdapterError("Instagram media container id missing.", {
        classification: "error",
        code: "INSTAGRAM_INVALID_CONTAINER",
        permanent: true,
        responseExcerpt: JSON.stringify(createContainer?.json || {}).slice(0, 1000),
      });
    }

    const publishResult = await requestJson({
      method: "POST",
      url: `${baseUrl}/${encodeURIComponent(igUserId)}/media_publish`,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        creation_id: containerId,
        access_token: accessToken,
      },
      errorCode: "INSTAGRAM_PUBLISH_FAILED",
    });

    const postId = publishResult?.json?.id || `instagram-${Date.now()}`;

    return {
      platformPostId: postId,
      platformPostUrl: "",
      raw: {
        createContainer: createContainer.json,
        publish: publishResult.json,
      },
    };
  }
}
