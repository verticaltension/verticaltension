import { SocialAdapterError } from "./errors.js";

const safeJsonParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const classifyStatus = (status) => {
  if (status === 401 || status === 403) {
    return { classification: "auth_error", permanent: true };
  }

  if (status === 429) {
    return { classification: "rate_limited", permanent: false };
  }

  if (status >= 400 && status < 500) {
    return { classification: "error", permanent: true };
  }

  if (status >= 500) {
    return { classification: "network_error", permanent: false };
  }

  return { classification: "error", permanent: false };
};

export const requestJson = async ({
  method,
  url,
  headers = {},
  body,
  timeoutMs = 30000,
  errorCode = "HTTP_REQUEST_FAILED",
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    const json = safeJsonParse(text);

    if (!response.ok) {
      const mapped = classifyStatus(response.status);
      throw new SocialAdapterError(
        `HTTP ${response.status} response from ${url}`,
        {
          classification: mapped.classification,
          permanent: mapped.permanent,
          httpStatus: response.status,
          code: errorCode,
          responseExcerpt: text.slice(0, 1000),
        }
      );
    }

    return {
      status: response.status,
      headers: response.headers,
      json,
      rawText: text,
    };
  } catch (error) {
    if (error instanceof SocialAdapterError) {
      throw error;
    }

    throw new SocialAdapterError(
      `Network call failed for ${url}: ${error?.message || "Unknown error."}`,
      {
        classification: "network_error",
        permanent: false,
        code: "NETWORK_ERROR",
        responseExcerpt: String(error?.stack || error?.message || "").slice(0, 1000),
      }
    );
  } finally {
    clearTimeout(timeout);
  }
};
