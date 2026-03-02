import { createHash } from "node:crypto";
import { SocialAdapterError } from "./errors.js";

const toBase64Url = (buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const splitScopes = (value = "") =>
  String(value)
    .split(/[,\s]+/g)
    .map((scope) => scope.trim())
    .filter(Boolean);

const requireEnv = (envKey, platform) => {
  const value = String(process.env[envKey] || "").trim();
  if (!value) {
    throw new SocialAdapterError(
      `Missing required environment variable ${envKey} for ${platform} OAuth.`,
      {
        classification: "auth_error",
        code: "OAUTH_ENV_MISSING",
        permanent: true,
      }
    );
  }

  return value;
};

const validateRedirectUri = (redirectUri) => {
  try {
    const parsed = new URL(redirectUri);
    if (parsed.protocol === "https:") {
      return redirectUri;
    }

    if (parsed.protocol === "http:" && parsed.hostname === "localhost") {
      return redirectUri;
    }

    throw new Error("Unsupported protocol for redirect URI.");
  } catch {
    throw new SocialAdapterError("Invalid OAuth redirectUri.", {
      classification: "error",
      code: "OAUTH_REDIRECT_URI_INVALID",
      permanent: true,
    });
  }
};

const getProviderConfig = (platform) => {
  switch (platform) {
    case "twitter":
      return {
        clientIdEnv: "TWITTER_CLIENT_ID",
        clientSecretEnv: "TWITTER_CLIENT_SECRET",
        redirectUriEnv: "TWITTER_REDIRECT_URI",
        authUrl:
          process.env.TWITTER_AUTH_URL?.trim() ||
          "https://twitter.com/i/oauth2/authorize",
        tokenUrl:
          process.env.TWITTER_TOKEN_URL?.trim() ||
          "https://api.x.com/2/oauth2/token",
        defaultScopes: splitScopes(
          process.env.TWITTER_SCOPES ||
            "tweet.read tweet.write users.read offline.access"
        ),
        authScopeDelimiter: " ",
        tokenScopeDelimiter: " ",
        usePkce: true,
      };
    case "linkedin":
      return {
        clientIdEnv: "LINKEDIN_CLIENT_ID",
        clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
        redirectUriEnv: "LINKEDIN_REDIRECT_URI",
        authUrl:
          process.env.LINKEDIN_AUTH_URL?.trim() ||
          "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl:
          process.env.LINKEDIN_TOKEN_URL?.trim() ||
          "https://www.linkedin.com/oauth/v2/accessToken",
        defaultScopes: splitScopes(
          process.env.LINKEDIN_SCOPES || "openid profile w_member_social"
        ),
        authScopeDelimiter: " ",
        tokenScopeDelimiter: " ",
        usePkce: false,
      };
    case "reddit":
      return {
        clientIdEnv: "REDDIT_CLIENT_ID",
        clientSecretEnv: "REDDIT_CLIENT_SECRET",
        redirectUriEnv: "REDDIT_REDIRECT_URI",
        authUrl:
          process.env.REDDIT_AUTH_URL?.trim() ||
          "https://www.reddit.com/api/v1/authorize",
        tokenUrl:
          process.env.REDDIT_TOKEN_URL?.trim() ||
          "https://www.reddit.com/api/v1/access_token",
        defaultScopes: splitScopes(
          process.env.REDDIT_SCOPES || "identity submit read history"
        ),
        authScopeDelimiter: " ",
        tokenScopeDelimiter: " ",
        usePkce: false,
      };
    case "instagram":
      return {
        clientIdEnv: "INSTAGRAM_CLIENT_ID",
        clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
        redirectUriEnv: "INSTAGRAM_REDIRECT_URI",
        authUrl:
          process.env.INSTAGRAM_AUTH_URL?.trim() ||
          "https://www.facebook.com/v21.0/dialog/oauth",
        tokenUrl:
          process.env.INSTAGRAM_TOKEN_URL?.trim() ||
          "https://graph.facebook.com/v21.0/oauth/access_token",
        defaultScopes: splitScopes(
          process.env.INSTAGRAM_SCOPES ||
            "instagram_basic instagram_content_publish pages_show_list"
        ),
        authScopeDelimiter: ",",
        tokenScopeDelimiter: ",",
        usePkce: false,
      };
    case "tiktok":
      return {
        clientIdEnv: "TIKTOK_CLIENT_KEY",
        clientSecretEnv: "TIKTOK_CLIENT_SECRET",
        redirectUriEnv: "TIKTOK_REDIRECT_URI",
        authUrl:
          process.env.TIKTOK_AUTH_URL?.trim() ||
          "https://www.tiktok.com/v2/auth/authorize/",
        tokenUrl:
          process.env.TIKTOK_TOKEN_URL?.trim() ||
          "https://open.tiktokapis.com/v2/oauth/token/",
        defaultScopes: splitScopes(
          process.env.TIKTOK_SCOPES ||
            "user.info.basic video.publish video.list"
        ),
        authScopeDelimiter: ",",
        tokenScopeDelimiter: ",",
        usePkce: false,
      };
    default:
      throw new SocialAdapterError(`Unsupported OAuth provider '${platform}'.`, {
        classification: "error",
        code: "UNSUPPORTED_PROVIDER",
        permanent: true,
      });
  }
};

export const getOAuthProviderMeta = (platform) => {
  const provider = getProviderConfig(platform);
  const redirectUriValue = String(process.env[provider.redirectUriEnv] || "").trim();

  return {
    platform,
    defaultScopes: provider.defaultScopes,
    redirectUriEnv: provider.redirectUriEnv,
    configuredRedirectUri: redirectUriValue || null,
    authUrl: provider.authUrl,
    tokenUrl: provider.tokenUrl,
    usePkce: provider.usePkce,
  };
};

const buildUrl = (baseUrl, params) => {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, value);
  }
  return url.toString();
};

const postForm = async ({ url, body, headers = {}, platform, code }) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body: new URLSearchParams(body).toString(),
  });

  const raw = await response.text();
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const status = response.status;
    const classification =
      status === 401 || status === 403
        ? "auth_error"
        : status === 429
          ? "rate_limited"
          : status >= 500
            ? "network_error"
            : "error";
    const permanent =
      classification === "auth_error" || (status >= 400 && status < 500 && status !== 429);

    throw new SocialAdapterError(
      `OAuth token exchange failed for ${platform} (${status}).`,
      {
        classification,
        httpStatus: status,
        code,
        permanent,
        responseExcerpt: raw.slice(0, 1000),
      }
    );
  }

  return parsed || {};
};

const normalizeTokenPayload = (platform, payload, scopeDelimiter) => {
  const root = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const accessToken = String(
    root?.access_token || root?.accessToken || root?.token || ""
  ).trim();
  const refreshToken = String(root?.refresh_token || root?.refreshToken || "").trim();
  const scopeRaw = String(root?.scope || root?.scopes || "").trim();
  const expiresIn = Number(root?.expires_in || root?.expiresIn || 0) || null;

  if (!accessToken) {
    throw new SocialAdapterError(
      `OAuth token payload for ${platform} does not include access_token.`,
      {
        classification: "auth_error",
        code: "OAUTH_TOKEN_INVALID",
        permanent: true,
        responseExcerpt: JSON.stringify(payload || {}).slice(0, 1000),
      }
    );
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    scopes: scopeRaw ? scopeRaw.split(scopeDelimiter).map((scope) => scope.trim()).filter(Boolean) : [],
    providerPayload: payload,
  };
};

export const createCodeChallenge = (codeVerifier) =>
  toBase64Url(createHash("sha256").update(codeVerifier).digest());

export const getOAuthStartInfo = ({
  platform,
  state,
  redirectUriOverride,
  codeChallenge,
  requestedScopes,
}) => {
  const provider = getProviderConfig(platform);
  const clientId = requireEnv(provider.clientIdEnv, platform);
  const redirectUri = validateRedirectUri(
    redirectUriOverride || requireEnv(provider.redirectUriEnv, platform)
  );
  const scopes =
    requestedScopes && requestedScopes.length > 0
      ? requestedScopes
      : provider.defaultScopes;
  const scopeJoined = scopes.join(provider.authScopeDelimiter);

  switch (platform) {
    case "twitter":
      return {
        redirectUri,
        scopes,
        authUrl: buildUrl(provider.authUrl, {
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scopeJoined,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        }),
      };
    case "linkedin":
      return {
        redirectUri,
        scopes,
        authUrl: buildUrl(provider.authUrl, {
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: scopeJoined,
        }),
      };
    case "reddit":
      return {
        redirectUri,
        scopes,
        authUrl: buildUrl(provider.authUrl, {
          client_id: clientId,
          response_type: "code",
          state,
          redirect_uri: redirectUri,
          duration: "permanent",
          scope: scopeJoined,
        }),
      };
    case "instagram":
      return {
        redirectUri,
        scopes,
        authUrl: buildUrl(provider.authUrl, {
          client_id: clientId,
          response_type: "code",
          redirect_uri: redirectUri,
          state,
          scope: scopeJoined,
        }),
      };
    case "tiktok":
      return {
        redirectUri,
        scopes,
        authUrl: buildUrl(provider.authUrl, {
          client_key: clientId,
          response_type: "code",
          scope: scopeJoined,
          redirect_uri: redirectUri,
          state,
        }),
      };
    default:
      throw new SocialAdapterError(`Unsupported OAuth provider '${platform}'.`, {
        classification: "error",
        code: "UNSUPPORTED_PROVIDER",
        permanent: true,
      });
  }
};

export const exchangeOAuthCode = async ({
  platform,
  code,
  redirectUri,
  codeVerifier,
}) => {
  const provider = getProviderConfig(platform);
  const clientId = requireEnv(provider.clientIdEnv, platform);
  const clientSecret = requireEnv(provider.clientSecretEnv, platform);

  switch (platform) {
    case "twitter": {
      const headers = {};
      if (clientSecret) {
        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        headers.Authorization = `Basic ${basic}`;
      }

      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "TWITTER_OAUTH_EXCHANGE_FAILED",
        headers,
        body: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: codeVerifier || "",
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "linkedin": {
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "LINKEDIN_OAUTH_EXCHANGE_FAILED",
        body: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "reddit": {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "REDDIT_OAUTH_EXCHANGE_FAILED",
        headers: {
          Authorization: `Basic ${basic}`,
          "User-Agent": process.env.REDDIT_USER_AGENT || "verticaltension-social/1.0",
        },
        body: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "instagram": {
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "INSTAGRAM_OAUTH_EXCHANGE_FAILED",
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "tiktok": {
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "TIKTOK_OAUTH_EXCHANGE_FAILED",
        body: {
          client_key: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    default:
      throw new SocialAdapterError(`Unsupported OAuth provider '${platform}'.`, {
        classification: "error",
        code: "UNSUPPORTED_PROVIDER",
        permanent: true,
      });
  }
};

export const refreshOAuthToken = async ({
  platform,
  refreshToken,
  scopes,
}) => {
  const provider = getProviderConfig(platform);
  const clientId = requireEnv(provider.clientIdEnv, platform);
  const clientSecret = requireEnv(provider.clientSecretEnv, platform);
  const safeRefreshToken = String(refreshToken || "").trim();
  if (!safeRefreshToken) {
    throw new SocialAdapterError("Missing refresh token.", {
      classification: "auth_error",
      code: "OAUTH_REFRESH_TOKEN_MISSING",
      permanent: true,
    });
  }

  const requestedScopes = Array.isArray(scopes)
    ? scopes.map((scope) => String(scope || "").trim()).filter(Boolean)
    : [];
  const scopeJoined =
    requestedScopes.length > 0
      ? requestedScopes.join(provider.tokenScopeDelimiter)
      : "";

  switch (platform) {
    case "twitter": {
      const headers = {};
      if (clientSecret) {
        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        headers.Authorization = `Basic ${basic}`;
      }
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "TWITTER_OAUTH_REFRESH_FAILED",
        headers,
        body: {
          grant_type: "refresh_token",
          refresh_token: safeRefreshToken,
          client_id: clientId,
          ...(scopeJoined ? { scope: scopeJoined } : {}),
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "linkedin": {
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "LINKEDIN_OAUTH_REFRESH_FAILED",
        body: {
          grant_type: "refresh_token",
          refresh_token: safeRefreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          ...(scopeJoined ? { scope: scopeJoined } : {}),
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "reddit": {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "REDDIT_OAUTH_REFRESH_FAILED",
        headers: {
          Authorization: `Basic ${basic}`,
          "User-Agent": process.env.REDDIT_USER_AGENT || "verticaltension-social/1.0",
        },
        body: {
          grant_type: "refresh_token",
          refresh_token: safeRefreshToken,
          ...(scopeJoined ? { scope: scopeJoined } : {}),
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    case "instagram": {
      throw new SocialAdapterError(
        "Instagram token refresh is not supported through this OAuth refresh flow. Reconnect account.",
        {
          classification: "auth_error",
          code: "INSTAGRAM_REFRESH_NOT_SUPPORTED",
          permanent: true,
        }
      );
    }
    case "tiktok": {
      const payload = await postForm({
        url: provider.tokenUrl,
        platform,
        code: "TIKTOK_OAUTH_REFRESH_FAILED",
        body: {
          client_key: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: safeRefreshToken,
          ...(scopeJoined ? { scope: scopeJoined } : {}),
        },
      });
      return normalizeTokenPayload(platform, payload, provider.tokenScopeDelimiter);
    }
    default:
      throw new SocialAdapterError(`Unsupported OAuth provider '${platform}'.`, {
        classification: "error",
        code: "UNSUPPORTED_PROVIDER",
        permanent: true,
      });
  }
};
