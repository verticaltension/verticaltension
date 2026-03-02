import { BaseSocialAdapter } from "./baseAdapter.js";
import { SocialAdapterError } from "./errors.js";
import { requestJson } from "./http.js";

export class TikTokAdapter extends BaseSocialAdapter {
  constructor() {
    super("tiktok");
  }

  transform(payload) {
    if (!payload.imageUrl) {
      throw new SocialAdapterError(
        "TikTok integration requires a media URL (image/video) in payload.",
        {
          classification: "error",
          code: "MISSING_MEDIA",
          permanent: true,
        }
      );
    }

    const hashtags = payload.tags
      .slice(0, 6)
      .map((tag) => `#${tag.replace(/\s+/g, "")}`)
      .join(" ");

    return {
      ...payload,
      caption: [payload.summary || payload.title, hashtags || ""]
        .filter(Boolean)
        .join("\n"),
      mediaUrl: payload.imageUrl,
    };
  }

  async publishLive(payload, account) {
    const accessToken = String(account?.accessToken || "").trim();
    const creatorInfo = String(account?.config_json?.openId || "").trim();

    if (!accessToken) {
      throw new SocialAdapterError("TikTok access token is missing.", {
        classification: "auth_error",
        code: "MISSING_ACCESS_TOKEN",
        permanent: true,
      });
    }

    if (!creatorInfo) {
      throw new SocialAdapterError(
        "TikTok account config must include openId.",
        {
          classification: "error",
          code: "MISSING_OPEN_ID",
          permanent: true,
        }
      );
    }

    const baseUrl =
      process.env.TIKTOK_API_BASE_URL?.trim() || "https://open.tiktokapis.com";
    const initEndpoint =
      process.env.TIKTOK_PUBLISH_INIT_PATH?.trim() ||
      "/v2/post/publish/video/init/";

    const response = await requestJson({
      method: "POST",
      url: `${baseUrl}${initEndpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: {
        source_info: {
          source: "PULL_FROM_URL",
          video_url: payload.mediaUrl,
        },
        post_info: {
          title: payload.caption.slice(0, 2200),
          privacy_level: "SELF_ONLY",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        open_id: creatorInfo,
      },
      errorCode: "TIKTOK_PUBLISH_INIT_FAILED",
    });

    const publishId =
      response?.json?.data?.publish_id ||
      response?.json?.data?.task_id ||
      `tiktok-${Date.now()}`;

    return {
      platformPostId: String(publishId),
      platformPostUrl: "",
      raw: response.json,
    };
  }
}
