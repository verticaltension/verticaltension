const DEFAULT_API_BASE_URL = "https://api.verticaltension.com";

const normalizedBase = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).trim();

export const API_BASE_URL = normalizedBase.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};
