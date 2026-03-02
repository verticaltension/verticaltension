import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiUrl } from "../lib/api";
import { useStorefront } from "../context/StorefrontContext";

type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "reddit"
  | "instagram"
  | "tiktok";

const SUPPORTED: SocialPlatform[] = [
  "twitter",
  "linkedin",
  "reddit",
  "instagram",
  "tiktok",
];

const authFetch = async (path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers || undefined);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
};

const parseError = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
};

export default function SocialOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { platform: platformParam } = useParams<{ platform: string }>();
  const { isAuthLoading } = useStorefront();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Finalizing OAuth connection...");

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const platformRaw = String(platformParam || "").toLowerCase();
    if (!SUPPORTED.includes(platformRaw as SocialPlatform)) {
      setState("error");
      setMessage("Unsupported OAuth platform in callback route.");
      return;
    }

    const stateParam = searchParams.get("state") || "";
    const code = searchParams.get("code") || "";
    const providerError = searchParams.get("error") || "";
    const providerErrorDescription = searchParams.get("error_description") || "";

    if (!stateParam || (!code && !providerError)) {
      setState("error");
      setMessage("Missing required OAuth callback parameters.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const response = await authFetch(
          `/api/social/oauth/${platformRaw}/finalize`,
          {
            method: "POST",
            body: JSON.stringify({
              state: stateParam,
              code,
              error: providerError || undefined,
              errorDescription: providerErrorDescription || undefined,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        if (cancelled) {
          return;
        }

        setState("success");
        setMessage("OAuth connection completed. Redirecting to Social Ops...");
        window.setTimeout(() => {
          if (!cancelled) {
            navigate("/social-ops", { replace: true });
          }
        }, 1300);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "OAuth finalize failed. Return to Social Ops and retry."
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, navigate, platformParam, searchParams]);

  return (
    <div className="page">
      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Social OAuth Callback</h2>
            <p className="muted">{message}</p>
            <div className="form-actions">
              <Link className="button ghost" to="/social-ops">
                Open Social Ops
              </Link>
              {state === "error" && (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
