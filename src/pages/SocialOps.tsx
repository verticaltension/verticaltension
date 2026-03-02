import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";
import { useStorefront } from "../context/StorefrontContext";
import { getBlogPosts } from "../data/blogPosts";

type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "reddit"
  | "instagram"
  | "tiktok";

type ProviderInfo = {
  platform: SocialPlatform;
  configured: boolean;
};

type SocialUtmConfig = {
  enabled: boolean;
  medium: string;
  campaign: string;
  contentPrefix: string;
};

type OAuthMetadata = {
  platform: SocialPlatform;
  defaultScopes: string[];
  redirectUriEnv: string;
  configuredRedirectUri: string | null;
  authUrl: string;
  tokenUrl: string;
  usePkce: boolean;
};

type SocialAccount = {
  id: number;
  platform: SocialPlatform;
  account_label: string;
  token_expires_at: string | null;
  scopes: string[];
  config_json: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SocialJob = {
  id: number;
  blog_slug: string;
  blog_title: string;
  canonical_url: string;
  platform: SocialPlatform;
  status:
    | "queued"
    | "running"
    | "succeeded"
    | "failed"
    | "dead_letter"
    | "canceled";
  attempt_count: number;
  max_attempts: number;
  scheduled_at: string;
  next_retry_at: string | null;
  last_error: string | null;
  updated_at: string;
};

type SocialJobAttempt = {
  id: number;
  job_id: number;
  attempt_number: number;
  started_at: string;
  finished_at: string | null;
  outcome: "success" | "error" | "rate_limited" | "auth_error" | "network_error";
  http_status: number | null;
  error_code: string | null;
  error_message: string | null;
  response_excerpt: string | null;
};

type SocialPost = {
  id: number;
  platform: SocialPlatform;
  blog_slug: string;
  platform_post_id: string;
  platform_post_url: string | null;
  posted_at: string;
};

type SocialPreviewEntry = {
  platform: SocialPlatform;
  ok: boolean;
  reason?: string;
  errorCode?: string;
  message?: string;
  classification?: string;
  permanent?: boolean;
  transformed?: Record<string, unknown>;
};

type BulkPreviewEntry = {
  platform: SocialPlatform;
  slug: string;
  status:
    | "enqueueable"
    | "skipped_posted"
    | "skipped_existing_job"
    | "skipped_invalid_payload";
  existingJobStatus?: string;
  errorCode?: string;
  message?: string;
};

type BulkPreviewSummary = {
  totalInputItems: number;
  validItems: number;
  selectedPlatforms: number;
  totalPlatformCandidates: number;
  enqueueableCount: number;
  skippedPostedCount: number;
  skippedExistingJobCount: number;
  skippedInvalidCount: number;
  skippedInvalidPayloadCount?: number;
};

type SocialSummary = {
  totals: {
    queued: number;
    running: number;
    succeeded: number;
    failed: number;
    dead_letter: number;
    canceled: number;
    total_jobs: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byPlatformStatus: Array<{
    platform: string;
    status: string;
    count: number;
  }>;
  postCountsByPlatform: Array<{ platform: string; count: number }>;
};

type RateLimitSignal = {
  platform: SocialPlatform;
  jobId: number;
  jobStatus: string;
  lastRateLimitedAt: string | null;
  cooldownUntil: string | null;
  cooldownActive: boolean;
  cooldownSecondsRemaining: number;
  errorMessage: string;
};

type ProviderHealth = {
  platform: SocialPlatform;
  status: "healthy" | "warning" | "critical";
  issues: string[];
  recommendedActions: string[];
  oauthConfigured: boolean;
  oauthMissingEnvKeys: string[];
  activeAccounts: number;
  inactiveAccounts: number;
  tokenExpiredCount: number;
  tokenExpiringSoonCount: number;
  oldestTokenExpiry: string | null;
  missingRequiredConfigCount: number;
  configWarnings: Array<{
    accountLabel: string;
    missingKeys: string[];
  }>;
  queue: {
    queued: number;
    running: number;
    failed: number;
    deadLetter: number;
  };
  rateLimit: {
    cooldownActive: boolean;
    cooldownSecondsRemaining: number;
    lastRateLimitedAt: string | null;
    jobId: number | null;
    jobStatus: string | null;
  };
};

type SocialWorkerStatus = {
  config: {
    enabled: boolean;
    pollMs: number;
    batchSize: number;
    staleLockMinutes: number;
    publishMode: "stub" | "live";
    utm?: SocialUtmConfig;
  };
  state: {
    inFlight: boolean;
    lastRunAt: string | null;
    lastRunFinishedAt: string | null;
    lastDurationMs: number | null;
    lastReason: string | null;
    lastError: string | null;
    tickCount: number;
    successCount: number;
    failureCount: number;
    processedCount: number;
    staleRecoveryCount?: number;
    lastSummary: {
      startedAt: string;
      finishedAt: string;
      reason: string;
      maxJobs: number;
      recoveredStaleCount?: number;
      claimedCount: number;
      processedCount: number;
      successCount: number;
      errorCount: number;
      outcomes: Array<{
        jobId: number;
        ok: boolean;
        outcome: string;
        finalStatus: string;
        errorCode: string;
        tokenRefreshed?: boolean;
      }>;
    } | null;
  };
};

type RemediationPlanEntry = {
  id: string;
  platform: SocialPlatform;
  action: string;
  reason: string;
  estimatedAffectedCount: number;
  priority: number;
  risk: "low" | "medium" | "high";
  params: {
    platform: SocialPlatform;
    limit: number;
  };
  dryRunDefault: boolean;
};

type RemediationRun = {
  id: number;
  created_by_user_id: number | null;
  platform: SocialPlatform | null;
  action: string;
  dry_run: boolean;
  request_json: Record<string, unknown>;
  result_json: {
    estimatedAffectedCount?: number;
    affectedCount?: number;
    dryRun?: boolean;
  };
  created_at: string;
};

type RemediationPolicyStatus = {
  config: {
    enabled: boolean;
    pollMs: number;
    cooldownMinutes: number;
    maxActionsPerCycle: number;
    applyOnCriticalOnly: boolean;
    limitPerAction: number;
    freezeUtcHours?: string;
    freezeRanges?: Array<{
      start: number;
      end: number;
      label: string;
    }>;
    freezeActiveNow?: boolean;
    platformOverrides?: Record<
      string,
      {
        enabled: boolean;
        applyOnCriticalOnly: boolean;
        limitPerAction: number;
        cooldownMinutes: number;
      }
    >;
    actionEscalationOverrides?: Record<
      string,
      {
        enabled: boolean;
        minEstimatedAffected: number;
        forceApplyAtOrAbove: number | null;
        maxApplyLimit: number | null;
      }
    >;
  };
  state: {
    inFlight: boolean;
    lastRunAt: string | null;
    lastRunFinishedAt: string | null;
    lastDurationMs: number | null;
    lastReason: string | null;
    lastError: string | null;
    runCount: number;
    successCount: number;
    failureCount: number;
    lastSummary: {
      startedAt: string;
      finishedAt: string;
      reason: string;
      planCount: number;
      dryRunCount: number;
      appliedCount: number;
      skippedPolicyCount: number;
      skippedCooldownCount: number;
      skippedDisabledCount?: number;
      skippedFreezeCount?: number;
      skippedEscalationCount?: number;
      freezeActive?: boolean;
    } | null;
  };
};

type RemediationPolicySimulation = {
  generatedAt: string;
  windowHours: number;
  expiringWithinHours: number;
  limitPerAction: number;
  publishMode: "stub" | "live";
  planCount: number;
  totalEstimatedAffected: number;
  freezeActive?: boolean;
  rows: Array<{
    platform: SocialPlatform;
    platformStatus: string;
    action: string;
    reason: string;
    priority: number;
    risk: string;
    estimatedAffectedCount: number;
    applyEligible: boolean;
    applyBlocker: string;
    freezeActive?: boolean;
    actionLimit: number;
    policyEnabled: boolean;
    policyApplyOnCriticalOnly: boolean;
    policyCooldownMinutes: number;
    policyLimitPerAction: number;
    escalationEnabled?: boolean;
    escalationMinEstimatedAffected?: number;
    escalationForceApplyAtOrAbove?: number | null;
    escalationMaxApplyLimit?: number | null;
  }>;
};

type RemediationPolicyValidationResult = {
  ok?: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized: {
    freezeUtcHours: string;
    freezeRanges: Array<{
      start: number;
      end: number;
      label: string;
    }>;
    platformOverrides: Record<
      string,
      {
        enabled: boolean;
        applyOnCriticalOnly: boolean;
        limitPerAction: number;
        cooldownMinutes: number;
      }
    >;
    actionEscalationOverrides: Record<
      string,
      {
        enabled: boolean;
        minEstimatedAffected: number;
        forceApplyAtOrAbove: number | null;
        maxApplyLimit: number | null;
      }
    >;
  };
  observed: {
    invalidFreezeSegments: string[];
    unknownPlatforms: string[];
    unknownActions: string[];
  };
};

const ALL_PLATFORMS: SocialPlatform[] = [
  "twitter",
  "linkedin",
  "reddit",
  "instagram",
  "tiktok",
];

const ACCOUNT_CONFIG_TEMPLATES: Record<SocialPlatform, Record<string, string>> = {
  twitter: {},
  linkedin: {
    actorUrn: "urn:li:person:YOUR_LINKEDIN_ACTOR_URN",
  },
  reddit: {
    defaultSubreddit: "verticaltensionpress",
  },
  instagram: {
    igUserId: "YOUR_INSTAGRAM_USER_ID",
  },
  tiktok: {
    openId: "YOUR_TIKTOK_OPEN_ID",
  },
};

const REQUIRED_CONFIG_KEYS: Partial<Record<SocialPlatform, string[]>> = {
  linkedin: ["actorUrn"],
  instagram: ["igUserId"],
  tiktok: ["openId"],
};

const defaultFrontendOauthCallback = (platform: SocialPlatform) =>
  typeof window === "undefined"
    ? ""
    : `${window.location.origin}/social-ops/oauth/${platform}/callback`;

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

const parseApiError = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
};

const toIso = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toISOString();
};

const formatDurationShort = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const formatRemediationAction = (action: string) =>
  action
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

const downloadBlob = ({
  filename,
  content,
  mimeType,
}: {
  filename: string;
  content: string;
  mimeType: string;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function SocialOps() {
  const { isAuthenticated, isAuthLoading } = useStorefront();
  const sourcePosts = useMemo(() => getBlogPosts(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [oauthMetadata, setOauthMetadata] = useState<OAuthMetadata[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [jobs, setJobs] = useState<SocialJob[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobAttemptsJobId, setJobAttemptsJobId] = useState<number | null>(null);
  const [jobAttempts, setJobAttempts] = useState<SocialJobAttempt[]>([]);
  const [jobAttemptsTotal, setJobAttemptsTotal] = useState(0);
  const [enqueuePreview, setEnqueuePreview] = useState<SocialPreviewEntry[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [bulkPreviewSummary, setBulkPreviewSummary] =
    useState<BulkPreviewSummary | null>(null);
  const [bulkPreviewRows, setBulkPreviewRows] = useState<BulkPreviewEntry[]>([]);
  const [bulkEnqueueableTargets, setBulkEnqueueableTargets] = useState<
    Array<{ platform: SocialPlatform; slug: string }>
  >([]);
  const [bulkInvalidItems, setBulkInvalidItems] = useState<
    Array<{ slug: string; reason: string }>
  >([]);
  const [summary, setSummary] = useState<SocialSummary | null>(null);
  const [rateLimitSignals, setRateLimitSignals] = useState<RateLimitSignal[]>([]);
  const [providerHealth, setProviderHealth] = useState<ProviderHealth[]>([]);
  const [workerStatus, setWorkerStatus] = useState<SocialWorkerStatus | null>(
    null
  );
  const [providerHealthWindowHours, setProviderHealthWindowHours] = useState(24);
  const [providerHealthExpiringHours, setProviderHealthExpiringHours] =
    useState(72);
  const [socialPublishMode, setSocialPublishMode] = useState<"stub" | "live">(
    "stub"
  );
  const [socialUtmConfig, setSocialUtmConfig] = useState<SocialUtmConfig>({
    enabled: true,
    medium: "social",
    campaign: "blog_distribution",
    contentPrefix: "",
  });
  const [remediationPlan, setRemediationPlan] = useState<RemediationPlanEntry[]>(
    []
  );
  const [remediationRuns, setRemediationRuns] = useState<RemediationRun[]>([]);
  const [remediationPolicyStatus, setRemediationPolicyStatus] =
    useState<RemediationPolicyStatus | null>(null);
  const [remediationPolicySimulation, setRemediationPolicySimulation] =
    useState<RemediationPolicySimulation | null>(null);
  const [policyConfigDraft, setPolicyConfigDraft] = useState({
    freezeUtcHours: "",
    platformOverridesJson: "",
    actionEscalationJson: "",
  });
  const [policyConfigValidation, setPolicyConfigValidation] =
    useState<RemediationPolicyValidationResult | null>(null);

  const [accountForm, setAccountForm] = useState({
    platform: "twitter" as SocialPlatform,
    accountLabel: "default",
    accessToken: "",
    refreshToken: "",
    tokenExpiresAt: "",
    scopesCsv: "",
    configJson: "{}",
    active: true,
  });

  const [oauthForm, setOauthForm] = useState({
    platform: "twitter" as SocialPlatform,
    accountLabel: "default",
    redirectUri: defaultFrontendOauthCallback("twitter"),
    scopesCsv: "",
  });

  const [enqueueForm, setEnqueueForm] = useState({
    slug: "",
    title: "",
    url: "",
    summary: "",
    tagsCsv: "",
    imageUrl: "",
    platforms: ["twitter", "linkedin"] as SocialPlatform[],
  });

  const [jobsFilter, setJobsFilter] = useState({
    status: "",
    platform: "",
  });

  const [postsFilter, setPostsFilter] = useState({
    slug: "",
    platform: "",
  });

  const [bulkForm, setBulkForm] = useState({
    fromDate: "",
    toDate: "",
    platforms: ["twitter", "linkedin"] as SocialPlatform[],
    includeImageUrl: false,
    imageUrlFallback: "",
    limitPosts: 100,
    onlyPreviewEligible: true,
  });

  const [deadLetterForm, setDeadLetterForm] = useState({
    platform: "",
    limit: 100,
  });
  const [rateLimitWindowHours, setRateLimitWindowHours] = useState(24);

  const providerMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const provider of providers) {
      map.set(provider.platform, provider.configured);
    }
    return map;
  }, [providers]);

  const oauthMetaByPlatform = useMemo(() => {
    const map = new Map<SocialPlatform, OAuthMetadata>();
    for (const metadata of oauthMetadata) {
      map.set(metadata.platform, metadata);
    }
    return map;
  }, [oauthMetadata]);

  const oauthMeta = oauthMetaByPlatform.get(oauthForm.platform) || null;

  const frontendCallbackUrl = useMemo(
    () => defaultFrontendOauthCallback(oauthForm.platform),
    [oauthForm.platform]
  );

  const currentConfigWarnings = useMemo(() => {
    try {
      const parsed = JSON.parse(accountForm.configJson || "{}") as Record<
        string,
        unknown
      >;
      const requiredKeys = REQUIRED_CONFIG_KEYS[accountForm.platform] || [];
      return requiredKeys.filter((key) => {
        const value = parsed[key];
        return typeof value !== "string" || !value.trim();
      });
    } catch {
      return ["config_json_invalid"];
    }
  }, [accountForm.configJson, accountForm.platform]);

  const bulkSelectedPosts = useMemo(() => {
    const from = bulkForm.fromDate ? Date.parse(bulkForm.fromDate) : null;
    const to = bulkForm.toDate ? Date.parse(bulkForm.toDate) : null;

    return sourcePosts
      .filter((post) => {
        const publishedAt = Date.parse(post.publishedAt);
        if (Number.isNaN(publishedAt)) {
          return false;
        }

        if (from !== null && publishedAt < from) {
          return false;
        }

        if (to !== null && publishedAt > to) {
          return false;
        }

        return true;
      })
      .slice(0, Math.max(1, Math.min(500, bulkForm.limitPosts || 100)));
  }, [sourcePosts, bulkForm.fromDate, bulkForm.toDate, bulkForm.limitPosts]);

  const bulkPayloadItems = useMemo(
    () =>
      bulkSelectedPosts.map((post) => ({
        slug: post.slug,
        title: post.title,
        canonicalUrl:
          typeof window === "undefined"
            ? `https://verticaltension.com/blog/${post.slug}`
            : `${window.location.origin}/blog/${post.slug}`,
        summary: post.summary,
        tags: post.tags,
        imageUrl:
          bulkForm.includeImageUrl && bulkForm.imageUrlFallback
            ? bulkForm.imageUrlFallback
            : "",
      })),
    [
      bulkSelectedPosts,
      bulkForm.includeImageUrl,
      bulkForm.imageUrlFallback,
    ]
  );

  const loadProviders = async () => {
    const response = await authFetch("/api/social/providers");
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const data = (await response.json()) as {
      providers?: ProviderInfo[];
      oauthMetadata?: OAuthMetadata[];
      utm?: SocialUtmConfig;
    };
    setProviders(Array.isArray(data.providers) ? data.providers : []);
    setOauthMetadata(Array.isArray(data.oauthMetadata) ? data.oauthMetadata : []);
    if (data.utm) {
      setSocialUtmConfig(data.utm);
    }
  };

  const copyToClipboard = async (value: string, successNotice: string) => {
    if (!value) {
      setNotice("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setNotice(successNotice);
    } catch {
      setNotice("Copy failed. Please copy manually.");
    }
  };

  const loadAccounts = async () => {
    const response = await authFetch("/api/social/accounts");
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const data = (await response.json()) as { accounts?: SocialAccount[] };
    setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
  };

  const loadJobs = async () => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (jobsFilter.status) {
      params.set("status", jobsFilter.status);
    }
    if (jobsFilter.platform) {
      params.set("platform", jobsFilter.platform);
    }

    const response = await authFetch(`/api/social/jobs?${params.toString()}`);
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      items?: SocialJob[];
      total?: number;
    };
    setJobs(Array.isArray(data.items) ? data.items : []);
    setJobsTotal(Number(data.total || 0));
  };

  const loadJobAttempts = async (jobId: number) => {
    const safeJobId = Number(jobId || 0);
    if (!Number.isFinite(safeJobId) || safeJobId <= 0) {
      setJobAttemptsJobId(null);
      setJobAttempts([]);
      setJobAttemptsTotal(0);
      return;
    }

    const params = new URLSearchParams();
    params.set("limit", "50");
    const response = await authFetch(
      `/api/social/jobs/${safeJobId}/attempts?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      jobId?: number;
      items?: SocialJobAttempt[];
      total?: number;
    };

    setJobAttemptsJobId(Number(data.jobId || safeJobId));
    setJobAttempts(Array.isArray(data.items) ? data.items : []);
    setJobAttemptsTotal(Number(data.total || 0));
  };

  const loadPosts = async () => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (postsFilter.slug) {
      params.set("slug", postsFilter.slug);
    }
    if (postsFilter.platform) {
      params.set("platform", postsFilter.platform);
    }

    const response = await authFetch(`/api/social/posts?${params.toString()}`);
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as { items?: SocialPost[] };
    setPosts(Array.isArray(data.items) ? data.items : []);
  };

  const loadSummary = async () => {
    const params = new URLSearchParams();
    if (bulkForm.fromDate) {
      params.set("fromDate", bulkForm.fromDate);
    }
    if (bulkForm.toDate) {
      params.set("toDate", bulkForm.toDate);
    }

    const response = await authFetch(`/api/social/summary?${params.toString()}`);
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as SocialSummary;
    setSummary(data);
  };

  const loadRateLimitSignals = async () => {
    const params = new URLSearchParams();
    params.set("windowHours", String(rateLimitWindowHours));
    const response = await authFetch(
      `/api/social/rate-limit-signals?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as { signals?: RateLimitSignal[] };
    setRateLimitSignals(Array.isArray(data.signals) ? data.signals : []);
  };

  const loadProviderHealth = async () => {
    const params = new URLSearchParams();
    params.set("windowHours", String(providerHealthWindowHours));
    params.set("expiringWithinHours", String(providerHealthExpiringHours));
    const response = await authFetch(
      `/api/social/providers/health?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      health?: ProviderHealth[];
      publishMode?: "stub" | "live";
      utm?: SocialUtmConfig;
    };
    setProviderHealth(Array.isArray(data.health) ? data.health : []);
    setSocialPublishMode(data.publishMode === "live" ? "live" : "stub");
    if (data.utm) {
      setSocialUtmConfig(data.utm);
    }
  };

  const loadWorkerStatus = async () => {
    const response = await authFetch("/api/social/worker/status");
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      config?: SocialWorkerStatus["config"];
      state?: SocialWorkerStatus["state"];
    };

    if (!data.config || !data.state) {
      setWorkerStatus(null);
      return;
    }

    setWorkerStatus({
      config: data.config,
      state: data.state,
    });
  };

  const loadRemediationPlan = async () => {
    const params = new URLSearchParams();
    params.set("windowHours", String(providerHealthWindowHours));
    params.set("expiringWithinHours", String(providerHealthExpiringHours));
    const response = await authFetch(
      `/api/social/remediation/plan?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      plan?: RemediationPlanEntry[];
    };
    setRemediationPlan(Array.isArray(data.plan) ? data.plan : []);
  };

  const loadRemediationRuns = async () => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    const response = await authFetch(
      `/api/social/remediation/runs?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as { items?: RemediationRun[] };
    setRemediationRuns(Array.isArray(data.items) ? data.items : []);
  };

  const loadRemediationPolicyStatus = async () => {
    const response = await authFetch("/api/social/remediation/policy/status");
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as {
      config?: RemediationPolicyStatus["config"];
      state?: RemediationPolicyStatus["state"];
    };

    if (!data.config || !data.state) {
      setRemediationPolicyStatus(null);
      return;
    }

    setRemediationPolicyStatus({
      config: data.config,
      state: data.state,
    });
  };

  const refreshAll = async () => {
    setIsLoading(true);
    setNotice("");
    try {
      await Promise.all([
        loadProviders(),
        loadAccounts(),
        loadJobs(),
        loadPosts(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadWorkerStatus(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load social data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void refreshAll();
  }, [
    isAuthenticated,
    jobsFilter.status,
    jobsFilter.platform,
    postsFilter.slug,
    postsFilter.platform,
    rateLimitWindowHours,
    providerHealthWindowHours,
    providerHealthExpiringHours,
  ]);

  const handleAccountUpsert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("account-upsert");
    setNotice("");
    try {
      const parsedConfig = JSON.parse(accountForm.configJson || "{}") as Record<
        string,
        unknown
      >;
      const scopes = accountForm.scopesCsv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await authFetch("/api/social/accounts", {
        method: "POST",
        body: JSON.stringify({
          platform: accountForm.platform,
          accountLabel: accountForm.accountLabel.trim() || "default",
          accessToken: accountForm.accessToken.trim(),
          refreshToken: accountForm.refreshToken.trim(),
          tokenExpiresAt: accountForm.tokenExpiresAt.trim() || undefined,
          scopes,
          config: parsedConfig,
          active: accountForm.active,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const requiredKeys = REQUIRED_CONFIG_KEYS[accountForm.platform] || [];
      const parsedAfterSave = parsedConfig;
      const missingKeys = requiredKeys.filter((key) => {
        const value = parsedAfterSave[key];
        return typeof value !== "string" || !value.trim();
      });

      setNotice(
        missingKeys.length > 0
          ? `Social account saved. Missing recommended config keys for ${accountForm.platform}: ${missingKeys.join(", ")}`
          : "Social account saved."
      );
      setAccountForm((previous) => ({
        ...previous,
        accessToken: "",
        refreshToken: "",
      }));
      await Promise.all([
        loadProviders(),
        loadAccounts(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Account save failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handleStartOauth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("oauth-start");
    setNotice("");
    try {
      const scopes = oauthForm.scopesCsv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await authFetch(
        `/api/social/oauth/${oauthForm.platform}/start`,
        {
          method: "POST",
          body: JSON.stringify({
            accountLabel: oauthForm.accountLabel.trim() || "default",
            redirectUri: oauthForm.redirectUri.trim() || undefined,
            scopes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { authUrl?: string };
      if (!data.authUrl) {
        throw new Error("OAuth start response did not include authUrl.");
      }

      window.open(data.authUrl, "_blank", "noopener,noreferrer");
      setNotice(
        "OAuth window opened. Complete provider consent, then refresh accounts."
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "OAuth start failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handleEnqueue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("enqueue");
    setNotice("");
    try {
      const tags = enqueueForm.tagsCsv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const response = await authFetch("/api/social/enqueue", {
        method: "POST",
        body: JSON.stringify({
          slug: enqueueForm.slug.trim(),
          title: enqueueForm.title.trim(),
          url: enqueueForm.url.trim(),
          summary: enqueueForm.summary.trim(),
          tags,
          imageUrl: enqueueForm.imageUrl.trim(),
          platforms: enqueueForm.platforms,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        enqueued?: Array<unknown>;
        skipped?: Array<{ reason?: string; errorCode?: string }>;
      };
      const enqueuedCount = Array.isArray(data.enqueued) ? data.enqueued.length : 0;
      const skippedItems = Array.isArray(data.skipped) ? data.skipped : [];
      const skippedCount = skippedItems.length;
      const skippedInvalidPayloadCount = skippedItems.filter(
        (item) => item.reason === "preflight_validation_failed"
      ).length;

      setNotice(
        `Social enqueue complete. Enqueued ${enqueuedCount}, skipped ${skippedCount}` +
          (skippedInvalidPayloadCount > 0
            ? ` (${skippedInvalidPayloadCount} invalid payload)`
            : "") +
          "."
      );
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Enqueue failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handlePreviewEnqueuePayload = async () => {
    setBusyAction("enqueue-preview");
    setNotice("");
    try {
      const tags = enqueueForm.tagsCsv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await authFetch("/api/social/preview", {
        method: "POST",
        body: JSON.stringify({
          slug: enqueueForm.slug.trim(),
          title: enqueueForm.title.trim(),
          url: enqueueForm.url.trim(),
          summary: enqueueForm.summary.trim(),
          tags,
          imageUrl: enqueueForm.imageUrl.trim(),
          platforms: enqueueForm.platforms,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        previews?: SocialPreviewEntry[];
      };
      const items = Array.isArray(data.previews) ? data.previews : [];
      setEnqueuePreview(items);
      const okCount = items.filter((item) => item.ok).length;
      const failCount = Math.max(0, items.length - okCount);
      setNotice(
        `Preview complete. ${okCount} platform payload(s) valid, ${failCount} invalid.`
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Payload preview failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleBulkPreview = async () => {
    if (bulkForm.platforms.length === 0) {
      setNotice("Select at least one platform for bulk preview.");
      return;
    }

    setBusyAction("bulk-preview");
    setNotice("");
    try {
      const response = await authFetch("/api/social/enqueue-bulk/preview", {
        method: "POST",
        body: JSON.stringify({
          items: bulkPayloadItems,
          platforms: bulkForm.platforms,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        summary?: BulkPreviewSummary;
        preview?: BulkPreviewEntry[];
        invalidItems?: Array<{ slug: string; reason: string }>;
        enqueueableTargets?: Array<{ platform: SocialPlatform; slug: string }>;
      };

      setBulkPreviewSummary(data.summary || null);
      setBulkPreviewRows(Array.isArray(data.preview) ? data.preview : []);
      setBulkEnqueueableTargets(
        Array.isArray(data.enqueueableTargets) ? data.enqueueableTargets : []
      );
      setBulkInvalidItems(
        Array.isArray(data.invalidItems) ? data.invalidItems : []
      );
      setNotice("Bulk preview generated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bulk preview failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handleBulkEnqueue = async () => {
    if (bulkForm.platforms.length === 0) {
      setNotice("Select at least one platform for bulk enqueue.");
      return;
    }

    if (bulkForm.onlyPreviewEligible && bulkEnqueueableTargets.length === 0) {
      setNotice(
        "Run bulk preview first, or disable 'only preview-eligible targets'."
      );
      return;
    }

    setBusyAction("bulk-enqueue");
    setNotice("");
    try {
      const response = await authFetch("/api/social/enqueue-bulk", {
        method: "POST",
        body: JSON.stringify({
          items: bulkPayloadItems,
          platforms: bulkForm.platforms,
          targets: bulkForm.onlyPreviewEligible
            ? bulkEnqueueableTargets
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        enqueuedCount?: number;
        skippedCount?: number;
        skippedInvalidPayloadCount?: number;
      };
      setNotice(
        `Bulk enqueue complete. Enqueued ${Number(data.enqueuedCount || 0)} and skipped ${Number(data.skippedCount || 0)}` +
          (Number(data.skippedInvalidPayloadCount || 0) > 0
            ? ` (${Number(data.skippedInvalidPayloadCount || 0)} invalid payload)`
            : "") +
          "."
      );
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bulk enqueue failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handleRetryDeadLetter = async () => {
    setBusyAction("dead-letter-retry");
    setNotice("");
    try {
      const response = await authFetch("/api/social/jobs/retry-dead-letter", {
        method: "POST",
        body: JSON.stringify({
          platform: deadLetterForm.platform || undefined,
          limit: deadLetterForm.limit,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { retriedCount?: number };
      setNotice(
        `Dead-letter retry complete. Requeued ${Number(data.retriedCount || 0)} jobs.`
      );
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Dead-letter retry failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleRetryFailedByPlatform = async (
    platform: SocialPlatform,
    includeDeadLetter = false
  ) => {
    const actionKey = includeDeadLetter
      ? `retry-failed-all-${platform}`
      : `retry-failed-${platform}`;
    setBusyAction(actionKey);
    setNotice("");
    try {
      const response = await authFetch("/api/social/jobs/retry-failed", {
        method: "POST",
        body: JSON.stringify({
          platform,
          limit: deadLetterForm.limit,
          includeDeadLetter,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { retriedCount?: number };
      setNotice(
        `${platform}: requeued ${Number(data.retriedCount || 0)} ${
          includeDeadLetter ? "failed/dead-letter" : "failed"
        } jobs.`
      );
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Failed-job retry failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleCancelQueuedByPlatform = async (
    platform: SocialPlatform,
    includeRunning = false
  ) => {
    const actionKey = includeRunning
      ? `cancel-queued-running-${platform}`
      : `cancel-queued-${platform}`;
    setBusyAction(actionKey);
    setNotice("");
    try {
      const response = await authFetch("/api/social/jobs/cancel-queued", {
        method: "POST",
        body: JSON.stringify({
          platform,
          limit: deadLetterForm.limit,
          includeRunning,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { canceledCount?: number };
      setNotice(
        `${platform}: canceled ${Number(data.canceledCount || 0)} ${
          includeRunning ? "queued/running" : "queued"
        } jobs.`
      );
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Queue-cancel action failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleExecuteRemediationPlanEntry = async (
    entry: RemediationPlanEntry,
    dryRun: boolean
  ) => {
    const actionKey = dryRun
      ? `remediation-dry-${entry.id}`
      : `remediation-apply-${entry.id}`;
    setBusyAction(actionKey);
    setNotice("");
    try {
      const response = await authFetch("/api/social/remediation/execute", {
        method: "POST",
        body: JSON.stringify({
          action: entry.action,
          platform: entry.platform,
          limit: entry.params.limit,
          dryRun,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        estimatedAffectedCount?: number;
        affectedCount?: number;
      };
      if (dryRun) {
        setNotice(
          `${entry.platform} ${formatRemediationAction(
            entry.action
          )}: dry-run estimate ${Number(data.estimatedAffectedCount || 0)} jobs.`
        );
      } else {
        setNotice(
          `${entry.platform} ${formatRemediationAction(
            entry.action
          )}: applied to ${Number(data.affectedCount || 0)} jobs.`
        );
      }
      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Remediation execution failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleRunRemediationPolicyNow = async (
    dryRunOnly: boolean,
    forceApply = false
  ) => {
    const actionKey = dryRunOnly
      ? "policy-run-now-dry"
      : forceApply
        ? "policy-run-now-force"
        : "policy-run-now-apply";
    setBusyAction(actionKey);
    setNotice("");
    try {
      const response = await authFetch("/api/social/remediation/policy/run-now", {
        method: "POST",
        body: JSON.stringify({
          dryRunOnly,
          forceApply,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        skipped?: boolean;
        reason?: string;
        appliedCount?: number;
        dryRunCount?: number;
      };

      if (data.skipped) {
        setNotice(`Policy run skipped: ${data.reason || "unknown reason"}.`);
      } else {
        setNotice(
          `Policy run complete. Dry-runs: ${Number(
            data.dryRunCount || 0
          )}, applied: ${Number(data.appliedCount || 0)}.`
        );
      }

      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Policy run request failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleSimulateRemediationPolicyExport = async (
    format: "json" | "csv"
  ) => {
    const actionKey =
      format === "csv" ? "policy-sim-export-csv" : "policy-sim-export-json";
    setBusyAction(actionKey);
    setNotice("");
    try {
      const params = new URLSearchParams();
      params.set("windowHours", String(providerHealthWindowHours));
      params.set("expiringWithinHours", String(providerHealthExpiringHours));
      params.set("format", format);

      const response = await authFetch(
        `/api/social/remediation/policy/simulate?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (format === "csv") {
        const csv = await response.text();
        downloadBlob({
          filename: `social-remediation-policy-simulation-${stamp}.csv`,
          content: csv,
          mimeType: "text/csv;charset=utf-8",
        });
        setNotice("Policy simulation CSV exported.");
        return;
      }

      const data = (await response.json()) as RemediationPolicySimulation;
      setRemediationPolicySimulation(data);
      downloadBlob({
        filename: `social-remediation-policy-simulation-${stamp}.json`,
        content: JSON.stringify(data, null, 2),
        mimeType: "application/json;charset=utf-8",
      });
      setNotice(
        `Policy simulation JSON exported (${Number(data.planCount || 0)} plan entries).`
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Policy simulation export failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleViewJobAttempts = async (jobId: number) => {
    const actionKey = `job-attempts-${jobId}`;
    setBusyAction(actionKey);
    setNotice("");
    try {
      await loadJobAttempts(jobId);
      setNotice(`Loaded attempt history for job ${jobId}.`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Failed to load job attempt history."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleRunWorkerNow = async (allowWhenDisabled = false) => {
    const actionKey = allowWhenDisabled
      ? "worker-run-now-force"
      : "worker-run-now";
    setBusyAction(actionKey);
    setNotice("");
    try {
      const response = await authFetch("/api/social/worker/run-now", {
        method: "POST",
        body: JSON.stringify({
          maxJobs: 50,
          allowWhenDisabled,
        }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as {
        skipped?: boolean;
        reason?: string;
        processedCount?: number;
        successCount?: number;
        errorCount?: number;
      };

      if (data.skipped) {
        setNotice(`Worker run skipped: ${data.reason || "unknown reason"}.`);
      } else {
        setNotice(
          `Worker run complete. Processed ${Number(
            data.processedCount || 0
          )} jobs (success ${Number(data.successCount || 0)}, errors ${Number(
            data.errorCount || 0
          )}).`
        );
      }

      await Promise.all([
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadWorkerStatus(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Manual worker run failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleLoadPolicyConfigDraftFromCurrent = () => {
    if (!remediationPolicyStatus) {
      setNotice("Load policy status first.");
      return;
    }

    const platformOverrides = remediationPolicyStatus.config.platformOverrides || {};
    const actionEscalationOverrides =
      remediationPolicyStatus.config.actionEscalationOverrides || {};

    setPolicyConfigDraft({
      freezeUtcHours: remediationPolicyStatus.config.freezeUtcHours || "",
      platformOverridesJson:
        Object.keys(platformOverrides).length > 0
          ? JSON.stringify(platformOverrides, null, 2)
          : "",
      actionEscalationJson:
        Object.keys(actionEscalationOverrides).length > 0
          ? JSON.stringify(actionEscalationOverrides, null, 2)
          : "",
    });
    setPolicyConfigValidation(null);
    setNotice("Loaded current policy config into draft.");
  };

  const handleValidatePolicyConfigDraft = async () => {
    setBusyAction("policy-validate-config");
    setNotice("");
    try {
      const response = await authFetch("/api/social/remediation/policy/validate-config", {
        method: "POST",
        body: JSON.stringify({
          freezeUtcHours: policyConfigDraft.freezeUtcHours,
          platformOverridesJson: policyConfigDraft.platformOverridesJson,
          actionEscalationJson: policyConfigDraft.actionEscalationJson,
        }),
      });

      let data: RemediationPolicyValidationResult | null = null;
      try {
        data = (await response.json()) as RemediationPolicyValidationResult;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data) {
          setPolicyConfigValidation(data);
        }
        const firstError =
          data?.errors && data.errors.length > 0
            ? data.errors[0]
            : `Validation request failed (${response.status}).`;
        throw new Error(firstError);
      }

      if (!data) {
        throw new Error("Validation response was empty.");
      }

      setPolicyConfigValidation(data);
      setNotice(
        data.warnings.length > 0
          ? `Policy config is valid with ${data.warnings.length} warning(s).`
          : "Policy config is valid."
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Policy config validation failed."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleJobAction = async (jobId: number, action: "retry" | "cancel") => {
    setBusyAction(`${action}-${jobId}`);
    setNotice("");
    try {
      const response = await authFetch(`/api/social/jobs/${jobId}/${action}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const refreshTasks: Array<Promise<unknown>> = [
        loadJobs(),
        loadSummary(),
        loadRateLimitSignals(),
        loadProviderHealth(),
        loadRemediationPlan(),
        loadRemediationRuns(),
        loadRemediationPolicyStatus(),
      ];
      if (jobAttemptsJobId === jobId) {
        refreshTasks.push(loadJobAttempts(jobId));
      }
      await Promise.all(refreshTasks);
      setNotice(`Job ${jobId} updated: ${action}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Job update failed.");
    } finally {
      setBusyAction("");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="page">
        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Social Operations</h2>
              <p className="muted">Checking your account session...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Social Operations</h2>
              <p className="muted">Login required to access social operations.</p>
              <div className="form-actions">
                <Link className="button ghost" to="/login">
                  Login
                </Link>
                <Link className="button ghost" to="/account">
                  Back to Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Social Ops</span>
            <h1>Provider Accounts, OAuth, Queue, and Post Logs</h1>
            <p>
              Operate social publishing from one control plane. Save provider
              accounts, run OAuth connect, enqueue blog jobs, and handle retry/cancel.
            </p>
            <div className="button-row">
              <button
                className="button ghost"
                type="button"
                onClick={() => void refreshAll()}
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </button>
              <Link className="button ghost" to="/account">
                Back to Account
              </Link>
            </div>
            {notice && <p className="muted">{notice}</p>}
          </div>
          <div className="hero-panel">
            <h2>Provider Status</h2>
            <ul>
              {ALL_PLATFORMS.map((platform) => (
                <li key={platform}>
                  {platform}:{" "}
                  {providerMap.get(platform) ? "configured" : "not configured"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Provider Health Diagnostics</h2>
            <p className="muted">
              Publish mode: <strong>{socialPublishMode}</strong>
            </p>
            <p className="muted">
              UTM:{" "}
              <strong>{socialUtmConfig.enabled ? "enabled" : "disabled"}</strong>{" "}
              | medium <code>{socialUtmConfig.medium}</code> | campaign{" "}
              <code>{socialUtmConfig.campaign}</code> | content prefix{" "}
              <code>{socialUtmConfig.contentPrefix || "-"}</code>
            </p>
            <label>
              Health window (hours)
              <input
                type="number"
                min={1}
                max={168}
                value={providerHealthWindowHours}
                onChange={(event) =>
                  setProviderHealthWindowHours(
                    Math.max(1, Math.min(168, Number(event.target.value) || 24))
                  )
                }
              />
            </label>
            <label>
              Token warning threshold (hours)
              <input
                type="number"
                min={1}
                max={720}
                value={providerHealthExpiringHours}
                onChange={(event) =>
                  setProviderHealthExpiringHours(
                    Math.max(1, Math.min(720, Number(event.target.value) || 72))
                  )
                }
              />
            </label>
            <div className="form-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadProviderHealth()}
              >
                Refresh Provider Health
              </button>
            </div>
            {providerHealth.length === 0 ? (
              <p className="muted">Provider health is not loaded yet.</p>
            ) : (
              <div className="card-grid">
                {providerHealth.map((entry) => (
                  <article className="card" key={`health-${entry.platform}`}>
                    <h3>
                      {entry.platform} ({entry.status})
                    </h3>
                    <ul>
                      <li>
                        OAuth env:{" "}
                        {entry.oauthConfigured
                          ? "configured"
                          : `missing ${entry.oauthMissingEnvKeys.join(", ")}`}
                      </li>
                      <li>
                        Accounts: {entry.activeAccounts} active /{" "}
                        {entry.inactiveAccounts} inactive
                      </li>
                      <li>
                        Tokens: {entry.tokenExpiredCount} expired,{" "}
                        {entry.tokenExpiringSoonCount} expiring soon
                        {entry.oldestTokenExpiry
                          ? ` | earliest expiry ${toIso(entry.oldestTokenExpiry)}`
                          : ""}
                      </li>
                      <li>
                        Queue: {entry.queue.queued} queued, {entry.queue.running}{" "}
                        running, {entry.queue.failed} failed,{" "}
                        {entry.queue.deadLetter} dead-letter
                      </li>
                      <li>
                        Cooldown:{" "}
                        {entry.rateLimit.cooldownActive
                          ? `active (${formatDurationShort(
                              entry.rateLimit.cooldownSecondsRemaining
                            )})`
                          : "none"}
                      </li>
                    </ul>
                    {entry.issues.length > 0 ? (
                      <p className="muted">Issues: {entry.issues.join(" | ")}</p>
                    ) : (
                      <p className="muted">No active issues.</p>
                    )}
                    {entry.recommendedActions.length > 0 && (
                      <p className="muted">
                        Suggested actions:{" "}
                        {entry.recommendedActions.join(" | ")}
                      </p>
                    )}
                    {entry.configWarnings.length > 0 && (
                      <p className="muted">
                        Config warnings:{" "}
                        {entry.configWarnings
                          .map(
                            (warning) =>
                              `${warning.accountLabel} (${warning.missingKeys.join(
                                ", "
                              )})`
                          )
                          .join(" | ")}
                      </p>
                    )}
                    <div className="form-actions">
                      <button
                        className="button ghost"
                        type="button"
                        disabled={
                          busyAction === `cancel-queued-${entry.platform}` ||
                          entry.queue.queued === 0
                        }
                        onClick={() =>
                          void handleCancelQueuedByPlatform(entry.platform, false)
                        }
                      >
                        {busyAction === `cancel-queued-${entry.platform}`
                          ? "Canceling..."
                          : "Cancel Queued"}
                      </button>
                      <button
                        className="button ghost"
                        type="button"
                        disabled={
                          busyAction ===
                            `cancel-queued-running-${entry.platform}` ||
                          entry.queue.queued + entry.queue.running === 0
                        }
                        onClick={() =>
                          void handleCancelQueuedByPlatform(entry.platform, true)
                        }
                      >
                        {busyAction ===
                        `cancel-queued-running-${entry.platform}`
                          ? "Canceling..."
                          : "Cancel Queued + Running"}
                      </button>
                      <button
                        className="button ghost"
                        type="button"
                        disabled={
                          busyAction === `retry-failed-${entry.platform}` ||
                          entry.queue.failed === 0
                        }
                        onClick={() =>
                          void handleRetryFailedByPlatform(entry.platform, false)
                        }
                      >
                        {busyAction === `retry-failed-${entry.platform}`
                          ? "Requeueing..."
                          : "Retry Failed"}
                      </button>
                      <button
                        className="button ghost"
                        type="button"
                        disabled={
                          busyAction === `retry-failed-all-${entry.platform}` ||
                          entry.queue.failed + entry.queue.deadLetter === 0
                        }
                        onClick={() =>
                          void handleRetryFailedByPlatform(entry.platform, true)
                        }
                      >
                        {busyAction === `retry-failed-all-${entry.platform}`
                          ? "Requeueing..."
                          : "Retry Failed + Dead-Letter"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <h2>Social Worker</h2>
            {!workerStatus ? (
              <p className="muted">Worker status not loaded yet.</p>
            ) : (
              <>
                <ul>
                  <li>Enabled: {workerStatus.config.enabled ? "yes" : "no"}</li>
                  <li>Publish mode: {workerStatus.config.publishMode}</li>
                  <li>
                    UTM enabled: {workerStatus.config.utm?.enabled === false ? "no" : "yes"}
                  </li>
                  <li>
                    UTM medium: {workerStatus.config.utm?.medium || socialUtmConfig.medium}
                  </li>
                  <li>
                    UTM campaign: {workerStatus.config.utm?.campaign || socialUtmConfig.campaign}
                  </li>
                  <li>Poll interval: {workerStatus.config.pollMs} ms</li>
                  <li>Batch size: {workerStatus.config.batchSize}</li>
                  <li>
                    Stale lock threshold: {workerStatus.config.staleLockMinutes} min
                  </li>
                  <li>In flight: {workerStatus.state.inFlight ? "yes" : "no"}</li>
                  <li>
                    Last run:{" "}
                    {workerStatus.state.lastRunAt
                      ? toIso(workerStatus.state.lastRunAt)
                      : "-"}
                  </li>
                  <li>
                    Last result:{" "}
                    {workerStatus.state.lastError
                      ? `error (${workerStatus.state.lastError})`
                      : "ok"}
                  </li>
                  <li>
                    Ticks: {workerStatus.state.tickCount} total,{" "}
                    {workerStatus.state.successCount} success,{" "}
                    {workerStatus.state.failureCount} failure
                  </li>
                  <li>
                    Jobs processed total: {workerStatus.state.processedCount}
                  </li>
                  <li>
                    Stale recoveries total:{" "}
                    {Number(workerStatus.state.staleRecoveryCount || 0)}
                  </li>
                  {workerStatus.state.lastSummary && (
                    <li>
                      Last summary: recovered stale{" "}
                      {Number(
                        workerStatus.state.lastSummary.recoveredStaleCount || 0
                      )}
                      , claimed{" "}
                      {workerStatus.state.lastSummary.claimedCount}, processed{" "}
                      {workerStatus.state.lastSummary.processedCount}, success{" "}
                      {workerStatus.state.lastSummary.successCount}, errors{" "}
                      {workerStatus.state.lastSummary.errorCount}
                    </li>
                  )}
                  {workerStatus.state.lastSummary?.outcomes?.length ? (
                    <li>
                      Recent outcomes:{" "}
                      {workerStatus.state.lastSummary.outcomes
                        .slice(0, 6)
                        .map(
                          (outcome) =>
                            `#${outcome.jobId}:${outcome.finalStatus || outcome.outcome || "-"}${
                              outcome.tokenRefreshed ? "[refresh]" : ""
                            }`
                        )
                        .join(" | ")}
                    </li>
                  ) : null}
                  {!workerStatus.state.lastSummary && (
                    <li>
                      Last summary: claimed{" "}
                      0, processed 0, success 0, errors 0
                    </li>
                  )}
                </ul>
                <div className="form-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => void loadWorkerStatus()}
                  >
                    Refresh Worker Status
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "worker-run-now"}
                    onClick={() => void handleRunWorkerNow(false)}
                  >
                    {busyAction === "worker-run-now"
                      ? "Running..."
                      : "Run Worker Now"}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "worker-run-now-force"}
                    onClick={() => void handleRunWorkerNow(true)}
                  >
                    {busyAction === "worker-run-now-force"
                      ? "Running..."
                      : "Run Worker (Force When Disabled)"}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="card">
            <h2>Remediation Policy</h2>
            {!remediationPolicyStatus ? (
              <p className="muted">Policy status not loaded yet.</p>
            ) : (
              <>
                <ul>
                  <li>
                    Enabled:{" "}
                    {remediationPolicyStatus.config.enabled ? "yes" : "no"}
                  </li>
                  <li>
                    Poll interval: {remediationPolicyStatus.config.pollMs} ms
                  </li>
                  <li>
                    Cooldown: {remediationPolicyStatus.config.cooldownMinutes} min
                  </li>
                  <li>
                    Max actions/cycle:{" "}
                    {remediationPolicyStatus.config.maxActionsPerCycle}
                  </li>
                  <li>
                    Critical-only apply:{" "}
                    {remediationPolicyStatus.config.applyOnCriticalOnly
                      ? "yes"
                      : "no"}
                  </li>
                  <li>
                    Limit/action: {remediationPolicyStatus.config.limitPerAction}
                  </li>
                  <li>
                    Freeze windows (UTC):{" "}
                    {remediationPolicyStatus.config.freezeUtcHours?.trim()
                      ? remediationPolicyStatus.config.freezeUtcHours
                      : "none"}
                    {remediationPolicyStatus.config.freezeActiveNow
                      ? " | active now"
                      : ""}
                  </li>
                  <li>
                    Platform overrides:{" "}
                    {Object.keys(remediationPolicyStatus.config.platformOverrides || {})
                      .length || 0}
                  </li>
                  <li>
                    Action escalation overrides:{" "}
                    {Object.keys(
                      remediationPolicyStatus.config.actionEscalationOverrides || {}
                    ).length || 0}
                  </li>
                  <li>
                    Last run:{" "}
                    {remediationPolicyStatus.state.lastRunAt
                      ? toIso(remediationPolicyStatus.state.lastRunAt)
                      : "-"}
                  </li>
                  <li>
                    Last result:{" "}
                    {remediationPolicyStatus.state.lastError
                      ? `error (${remediationPolicyStatus.state.lastError})`
                      : "ok"}
                  </li>
                  <li>
                    Runs: {remediationPolicyStatus.state.runCount} total,{" "}
                    {remediationPolicyStatus.state.successCount} success,{" "}
                    {remediationPolicyStatus.state.failureCount} failure
                  </li>
                  {remediationPolicyStatus.state.lastSummary && (
                    <li>
                      Last summary: dry-runs{" "}
                      {remediationPolicyStatus.state.lastSummary.dryRunCount}, applied{" "}
                      {remediationPolicyStatus.state.lastSummary.appliedCount}, skipped policy{" "}
                      {remediationPolicyStatus.state.lastSummary.skippedPolicyCount}, skipped cooldown{" "}
                      {remediationPolicyStatus.state.lastSummary.skippedCooldownCount}, skipped disabled{" "}
                      {remediationPolicyStatus.state.lastSummary.skippedDisabledCount || 0}, skipped freeze{" "}
                      {remediationPolicyStatus.state.lastSummary.skippedFreezeCount || 0}, skipped escalation{" "}
                      {remediationPolicyStatus.state.lastSummary.skippedEscalationCount || 0}
                      {remediationPolicyStatus.state.lastSummary.freezeActive
                        ? " | freeze active"
                        : ""}
                    </li>
                  )}
                </ul>
                <div className="form-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => void loadRemediationPolicyStatus()}
                  >
                    Refresh Policy Status
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "policy-run-now-dry"}
                    onClick={() => void handleRunRemediationPolicyNow(true, false)}
                  >
                    {busyAction === "policy-run-now-dry"
                      ? "Running..."
                      : "Run Policy Dry-Run"}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "policy-run-now-apply"}
                    onClick={() => void handleRunRemediationPolicyNow(false, false)}
                  >
                    {busyAction === "policy-run-now-apply"
                      ? "Running..."
                      : "Run Policy Apply"}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "policy-run-now-force"}
                    onClick={() => void handleRunRemediationPolicyNow(false, true)}
                  >
                    {busyAction === "policy-run-now-force"
                      ? "Running..."
                      : "Run Policy Force Apply"}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "policy-sim-export-json"}
                    onClick={() =>
                      void handleSimulateRemediationPolicyExport("json")
                    }
                  >
                    {busyAction === "policy-sim-export-json"
                      ? "Exporting..."
                      : "Export Simulation JSON"}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={busyAction === "policy-sim-export-csv"}
                    onClick={() =>
                      void handleSimulateRemediationPolicyExport("csv")
                    }
                  >
                    {busyAction === "policy-sim-export-csv"
                      ? "Exporting..."
                      : "Export Simulation CSV"}
                  </button>
                </div>
                <div className="form">
                  <h3>Validate Policy Config Draft</h3>
                  <label>
                    Freeze windows (UTC)
                    <input
                      type="text"
                      placeholder="Example: 0-6,22-24"
                      value={policyConfigDraft.freezeUtcHours}
                      onChange={(event) =>
                        setPolicyConfigDraft((previous) => ({
                          ...previous,
                          freezeUtcHours: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Platform overrides JSON
                    <textarea
                      rows={6}
                      placeholder='Example: {"twitter":{"enabled":true,"cooldownMinutes":30,"limitPerAction":50}}'
                      value={policyConfigDraft.platformOverridesJson}
                      onChange={(event) =>
                        setPolicyConfigDraft((previous) => ({
                          ...previous,
                          platformOverridesJson: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Action escalation JSON
                    <textarea
                      rows={6}
                      placeholder='Example: {"retry_failed_jobs":{"enabled":true,"minEstimatedAffected":5,"forceApplyAtOrAbove":100,"maxApplyLimit":80}}'
                      value={policyConfigDraft.actionEscalationJson}
                      onChange={(event) =>
                        setPolicyConfigDraft((previous) => ({
                          ...previous,
                          actionEscalationJson: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      className="button ghost"
                      type="button"
                      onClick={handleLoadPolicyConfigDraftFromCurrent}
                    >
                      Load Current Config
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      disabled={busyAction === "policy-validate-config"}
                      onClick={() => void handleValidatePolicyConfigDraft()}
                    >
                      {busyAction === "policy-validate-config"
                        ? "Validating..."
                        : "Validate Draft"}
                    </button>
                  </div>
                  {policyConfigValidation && (
                    <>
                      <p className="muted">
                        Validation:{" "}
                        {policyConfigValidation.valid ? "valid" : "invalid"} | warnings{" "}
                        {policyConfigValidation.warnings.length} | errors{" "}
                        {policyConfigValidation.errors.length}
                      </p>
                      {policyConfigValidation.errors.length > 0 && (
                        <p className="muted">
                          Errors: {policyConfigValidation.errors.join(" | ")}
                        </p>
                      )}
                      {policyConfigValidation.warnings.length > 0 && (
                        <p className="muted">
                          Warnings: {policyConfigValidation.warnings.join(" | ")}
                        </p>
                      )}
                      <p className="muted">
                        Normalized: freeze ranges{" "}
                        {policyConfigValidation.normalized.freezeRanges.length}, platform
                        overrides{" "}
                        {Object.keys(
                          policyConfigValidation.normalized.platformOverrides
                        ).length}
                        , action overrides{" "}
                        {Object.keys(
                          policyConfigValidation.normalized.actionEscalationOverrides
                        ).length}
                      </p>
                    </>
                  )}
                </div>
                {remediationPolicySimulation && (
                  <p className="muted">
                    Last simulation: {toIso(remediationPolicySimulation.generatedAt)} |{" "}
                    mode {remediationPolicySimulation.publishMode} | plan{" "}
                    {remediationPolicySimulation.planCount} | estimated affected{" "}
                    {remediationPolicySimulation.totalEstimatedAffected}
                    {remediationPolicySimulation.freezeActive
                      ? " | freeze active"
                      : ""}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="card">
            <h2>Remediation Plan</h2>
            <p className="muted">
              Deterministic suggested actions derived from current provider
              health.
            </p>
            <div className="form-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadRemediationPlan()}
              >
                Refresh Plan
              </button>
            </div>
            {remediationPlan.length === 0 ? (
              <p className="muted">No remediation actions currently suggested.</p>
            ) : (
              <ul>
                {remediationPlan.slice(0, 20).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.platform}</strong> |{" "}
                    {formatRemediationAction(entry.action)} | priority{" "}
                    {entry.priority} | risk {entry.risk} | est{" "}
                    {entry.estimatedAffectedCount} | reason {entry.reason}
                    <div className="form-actions">
                      <button
                        className="button ghost"
                        type="button"
                        disabled={busyAction === `remediation-dry-${entry.id}`}
                        onClick={() =>
                          void handleExecuteRemediationPlanEntry(entry, true)
                        }
                      >
                        {busyAction === `remediation-dry-${entry.id}`
                          ? "Running..."
                          : "Dry Run"}
                      </button>
                      <button
                        className="button ghost"
                        type="button"
                        disabled={busyAction === `remediation-apply-${entry.id}`}
                        onClick={() =>
                          void handleExecuteRemediationPlanEntry(entry, false)
                        }
                      >
                        {busyAction === `remediation-apply-${entry.id}`
                          ? "Applying..."
                          : "Execute"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h2>Remediation Runs</h2>
            <div className="form-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadRemediationRuns()}
              >
                Refresh Runs
              </button>
            </div>
            {remediationRuns.length === 0 ? (
              <p className="muted">No remediation run history yet.</p>
            ) : (
              <ul>
                {remediationRuns.slice(0, 25).map((run) => (
                  <li key={`run-${run.id}`}>
                    {toIso(run.created_at)} | {run.platform || "all"} |{" "}
                    {formatRemediationAction(run.action)} |{" "}
                    {run.dry_run ? "dry-run" : "apply"} | est{" "}
                    {Number(run.result_json?.estimatedAffectedCount || 0)} | affected{" "}
                    {Number(run.result_json?.affectedCount || 0)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h2>Operational Summary</h2>
            {!summary ? (
              <p className="muted">Summary not loaded yet.</p>
            ) : (
              <ul>
                <li>Total jobs: {summary.totals.total_jobs}</li>
                <li>Queued: {summary.totals.queued}</li>
                <li>Running: {summary.totals.running}</li>
                <li>Succeeded: {summary.totals.succeeded}</li>
                <li>Failed: {summary.totals.failed}</li>
                <li>Dead-letter: {summary.totals.dead_letter}</li>
                <li>Canceled: {summary.totals.canceled}</li>
              </ul>
            )}
            <div className="form-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadSummary()}
              >
                Refresh Summary
              </button>
            </div>
          </div>
          <div className="card">
            <h2>Summary by Platform</h2>
            {!summary || summary.byPlatformStatus.length === 0 ? (
              <p className="muted">No platform status data available.</p>
            ) : (
              <div className="card-grid">
                {ALL_PLATFORMS.map((platform) => {
                  const rows = summary.byPlatformStatus.filter(
                    (entry) => entry.platform === platform
                  );
                  const postsCount =
                    summary.postCountsByPlatform.find(
                      (entry) => entry.platform === platform
                    )?.count || 0;
                  return (
                    <article className="card" key={platform}>
                      <h3>{platform}</h3>
                      <p className="muted">posted records: {postsCount}</p>
                      {rows.length === 0 ? (
                        <p className="muted">no jobs tracked</p>
                      ) : (
                        <ul>
                          {rows.map((row) => (
                            <li key={`${platform}-${row.status}`}>
                              {row.status}: {row.count}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <div className="card">
            <h2>Rate-Limit Cooldowns</h2>
            <label>
              Signal window (hours)
              <input
                type="number"
                min={1}
                max={168}
                value={rateLimitWindowHours}
                onChange={(event) =>
                  setRateLimitWindowHours(
                    Math.max(1, Math.min(168, Number(event.target.value) || 24))
                  )
                }
              />
            </label>
            <div className="form-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadRateLimitSignals()}
              >
                Refresh Cooldown Signals
              </button>
            </div>
            {rateLimitSignals.length === 0 ? (
              <p className="muted">No recent rate-limit signals detected.</p>
            ) : (
              <ul>
                {rateLimitSignals.map((signal) => (
                  <li key={`${signal.platform}-${signal.jobId}`}>
                    {signal.platform}:{" "}
                    {signal.cooldownActive
                      ? `cooldown active (${formatDurationShort(
                          signal.cooldownSecondsRemaining
                        )} remaining)`
                      : "no active cooldown"}
                    {signal.lastRateLimitedAt
                      ? ` | last: ${toIso(signal.lastRateLimitedAt)}`
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Save Social Account</h2>
            <form className="form" onSubmit={handleAccountUpsert}>
              <label>
                Platform
                <select
                  value={accountForm.platform}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      platform: event.target.value as SocialPlatform,
                    }))
                  }
                >
                  {ALL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Account label
                <input
                  type="text"
                  value={accountForm.accountLabel}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      accountLabel: event.target.value,
                    }))
                  }
                  placeholder="default"
                />
              </label>
              <label>
                Access token
                <input
                  type="password"
                  value={accountForm.accessToken}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      accessToken: event.target.value,
                    }))
                  }
                  placeholder="Provider access token"
                />
              </label>
              <label>
                Refresh token (optional)
                <input
                  type="password"
                  value={accountForm.refreshToken}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      refreshToken: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Token expires at (optional, ISO)
                <input
                  type="text"
                  value={accountForm.tokenExpiresAt}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      tokenExpiresAt: event.target.value,
                    }))
                  }
                  placeholder="2026-03-30T12:00:00.000Z"
                />
              </label>
              <label>
                Scopes CSV (optional)
                <input
                  type="text"
                  value={accountForm.scopesCsv}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      scopesCsv: event.target.value,
                    }))
                  }
                  placeholder="tweet.read,tweet.write"
                />
              </label>
              <label>
                Config JSON
                <textarea
                  value={accountForm.configJson}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      configJson: event.target.value,
                    }))
                  }
                  placeholder='{"actorUrn":"urn:li:person:..."}'
                />
                <span className="muted">
                  Template keys for {accountForm.platform}:{" "}
                  {Object.keys(ACCOUNT_CONFIG_TEMPLATES[accountForm.platform]).length
                    ? Object.keys(ACCOUNT_CONFIG_TEMPLATES[accountForm.platform]).join(", ")
                    : "none"}
                </span>
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    setAccountForm((previous) => ({
                      ...previous,
                      configJson: JSON.stringify(
                        ACCOUNT_CONFIG_TEMPLATES[previous.platform],
                        null,
                        2
                      ),
                    }))
                  }
                >
                  Use Config Template
                </button>
              </div>
              {currentConfigWarnings.length > 0 && (
                <p className="muted">
                  {currentConfigWarnings.includes("config_json_invalid")
                    ? "Config JSON is currently invalid."
                    : `Missing recommended config keys: ${currentConfigWarnings.join(", ")}`}
                </p>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={accountForm.active}
                  onChange={(event) =>
                    setAccountForm((previous) => ({
                      ...previous,
                      active: event.target.checked,
                    }))
                  }
                />
                &nbsp;Active account
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="submit"
                  disabled={busyAction === "account-upsert"}
                >
                  {busyAction === "account-upsert" ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2>OAuth Connect</h2>
            <form className="form" onSubmit={handleStartOauth}>
              <label>
                Platform
                <select
                  value={oauthForm.platform}
                  onChange={(event) =>
                    setOauthForm((previous) => {
                      const nextPlatform = event.target.value as SocialPlatform;
                      return {
                        ...previous,
                        platform: nextPlatform,
                        redirectUri: defaultFrontendOauthCallback(nextPlatform),
                      };
                    })
                  }
                >
                  {ALL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Account label
                <input
                  type="text"
                  value={oauthForm.accountLabel}
                  onChange={(event) =>
                    setOauthForm((previous) => ({
                      ...previous,
                      accountLabel: event.target.value,
                    }))
                  }
                  placeholder="default"
                />
              </label>
              <label>
                Redirect URI override (optional)
                <input
                  type="text"
                  value={oauthForm.redirectUri}
                  onChange={(event) =>
                    setOauthForm((previous) => ({
                      ...previous,
                      redirectUri: event.target.value,
                    }))
                  }
                  placeholder={frontendCallbackUrl}
                />
                <span className="muted">
                  Frontend callback suggestion: {frontendCallbackUrl}
                </span>
                {oauthMeta?.configuredRedirectUri && (
                  <span className="muted">
                    Env redirect ({oauthMeta.redirectUriEnv}):{" "}
                    {oauthMeta.configuredRedirectUri}
                  </span>
                )}
              </label>
              <label>
                Scopes CSV (optional override)
                <input
                  type="text"
                  value={oauthForm.scopesCsv}
                  onChange={(event) =>
                    setOauthForm((previous) => ({
                      ...previous,
                      scopesCsv: event.target.value,
                    }))
                  }
                  placeholder="tweet.read,tweet.write,offline.access"
                />
                {oauthMeta?.defaultScopes?.length ? (
                  <span className="muted">
                    Default scopes: {oauthMeta.defaultScopes.join(", ")}
                  </span>
                ) : null}
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    setOauthForm((previous) => ({
                      ...previous,
                      redirectUri: frontendCallbackUrl,
                    }))
                  }
                >
                  Use Frontend Callback
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    void copyToClipboard(
                      frontendCallbackUrl,
                      "Frontend callback URL copied."
                    )
                  }
                >
                  Copy Callback URL
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    setOauthForm((previous) => ({
                      ...previous,
                      scopesCsv: oauthMeta?.defaultScopes?.join(",") || "",
                    }))
                  }
                >
                  Use Default Scopes
                </button>
                <button
                  className="button ghost"
                  type="submit"
                  disabled={busyAction === "oauth-start"}
                >
                  {busyAction === "oauth-start"
                    ? "Opening..."
                    : "Start OAuth Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Enqueue Blog Post</h2>
            <form className="form" onSubmit={handleEnqueue}>
              <label>
                Slug
                <input
                  type="text"
                  value={enqueueForm.slug}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="alien-echoes-consolidated-overview"
                />
              </label>
              <label>
                Title
                <input
                  type="text"
                  value={enqueueForm.title}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                URL
                <input
                  type="text"
                  value={enqueueForm.url}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      url: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Summary
                <textarea
                  value={enqueueForm.summary}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      summary: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Tags CSV
                <input
                  type="text"
                  value={enqueueForm.tagsCsv}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      tagsCsv: event.target.value,
                    }))
                  }
                  placeholder="philosophy,consciousness"
                />
              </label>
              <label>
                Image/media URL (required for Instagram/TikTok)
                <input
                  type="text"
                  value={enqueueForm.imageUrl}
                  onChange={(event) =>
                    setEnqueueForm((previous) => ({
                      ...previous,
                      imageUrl: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Platforms
                <select
                  multiple
                  value={enqueueForm.platforms}
                  onChange={(event) => {
                    const next = Array.from(event.target.selectedOptions).map(
                      (option) => option.value as SocialPlatform
                    );
                    setEnqueueForm((previous) => ({
                      ...previous,
                      platforms: next,
                    }));
                  }}
                >
                  {ALL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void handlePreviewEnqueuePayload()}
                  disabled={busyAction === "enqueue-preview"}
                >
                  {busyAction === "enqueue-preview"
                    ? "Previewing..."
                    : "Preview Payload"}
                </button>
                <button
                  className="button ghost"
                  type="submit"
                  disabled={busyAction === "enqueue"}
                >
                  {busyAction === "enqueue" ? "Enqueueing..." : "Enqueue Jobs"}
                </button>
              </div>
              {enqueuePreview.length > 0 && (
                <>
                  <p className="muted">Platform payload preview:</p>
                  <ul>
                    {enqueuePreview.map((entry) => (
                      <li key={`enqueue-preview-${entry.platform}`}>
                        <strong>{entry.platform}</strong>:{" "}
                        {entry.ok
                          ? `valid ${
                              entry.transformed
                                ? `| ${JSON.stringify(entry.transformed)}`
                                : ""
                            }`
                          : `invalid | ${entry.errorCode || "PREVIEW_FAILED"} | ${entry.message || "-"}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </form>
          </div>

          <div className="card">
            <h2>Social Accounts</h2>
            {accounts.length === 0 ? (
              <p className="muted">No social accounts saved yet.</p>
            ) : (
              <div className="card-grid">
                {accounts.map((account) => (
                  <article className="card" key={account.id}>
                    <h3>
                      {account.platform} / {account.account_label}
                    </h3>
                    <p className="muted">
                      active: {account.active ? "true" : "false"}
                    </p>
                    <p className="muted">
                      token expires:{" "}
                      {account.token_expires_at ? toIso(account.token_expires_at) : "-"}
                    </p>
                    <p className="muted">
                      scopes: {account.scopes?.length ? account.scopes.join(", ") : "-"}
                    </p>
                    <p className="muted">
                      config: {JSON.stringify(account.config_json || {})}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Bulk Planner (Date Range)</h2>
            <form className="form" onSubmit={(event) => event.preventDefault()}>
              <label>
                From date (publishedAt)
                <input
                  type="date"
                  value={bulkForm.fromDate}
                  onChange={(event) =>
                    setBulkForm((previous) => ({
                      ...previous,
                      fromDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                To date (publishedAt)
                <input
                  type="date"
                  value={bulkForm.toDate}
                  onChange={(event) =>
                    setBulkForm((previous) => ({
                      ...previous,
                      toDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Max posts from source
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={bulkForm.limitPosts}
                  onChange={(event) =>
                    setBulkForm((previous) => ({
                      ...previous,
                      limitPosts: Number(event.target.value) || 100,
                    }))
                  }
                />
              </label>
              <label>
                Platforms
                <select
                  multiple
                  value={bulkForm.platforms}
                  onChange={(event) => {
                    const next = Array.from(event.target.selectedOptions).map(
                      (option) => option.value as SocialPlatform
                    );
                    setBulkForm((previous) => ({
                      ...previous,
                      platforms: next,
                    }));
                  }}
                >
                  {ALL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={bulkForm.includeImageUrl}
                  onChange={(event) =>
                    setBulkForm((previous) => ({
                      ...previous,
                      includeImageUrl: event.target.checked,
                    }))
                  }
                />
                &nbsp;Inject fallback image/media URL for all items
              </label>
              {bulkForm.includeImageUrl && (
                <label>
                  Fallback image/media URL
                  <input
                    type="text"
                    value={bulkForm.imageUrlFallback}
                    onChange={(event) =>
                      setBulkForm((previous) => ({
                        ...previous,
                        imageUrlFallback: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </label>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={bulkForm.onlyPreviewEligible}
                  onChange={(event) =>
                    setBulkForm((previous) => ({
                      ...previous,
                      onlyPreviewEligible: event.target.checked,
                    }))
                  }
                />
                &nbsp;Only enqueue preview-eligible targets
              </label>
              <p className="muted">
                Source selection currently yields {bulkSelectedPosts.length} posts.
              </p>
              {bulkForm.onlyPreviewEligible && (
                <p className="muted">
                  Preview-eligible targets currently loaded:{" "}
                  {bulkEnqueueableTargets.length}
                </p>
              )}
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void handleBulkPreview()}
                  disabled={busyAction === "bulk-preview"}
                >
                  {busyAction === "bulk-preview"
                    ? "Previewing..."
                    : "Preview Dedupe"}
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void handleBulkEnqueue()}
                  disabled={busyAction === "bulk-enqueue"}
                >
                  {busyAction === "bulk-enqueue"
                    ? "Enqueueing..."
                    : "Run Bulk Enqueue"}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2>Bulk Preview Summary</h2>
            {!bulkPreviewSummary ? (
              <p className="muted">Run preview to generate dedupe summary.</p>
            ) : (
              <>
                <ul>
                  <li>Total input items: {bulkPreviewSummary.totalInputItems}</li>
                  <li>Valid items: {bulkPreviewSummary.validItems}</li>
                  <li>Selected platforms: {bulkPreviewSummary.selectedPlatforms}</li>
                  <li>
                    Platform candidates: {bulkPreviewSummary.totalPlatformCandidates}
                  </li>
                  <li>Enqueueable: {bulkPreviewSummary.enqueueableCount}</li>
                  <li>Skipped posted: {bulkPreviewSummary.skippedPostedCount}</li>
                  <li>
                    Skipped existing job: {bulkPreviewSummary.skippedExistingJobCount}
                  </li>
                  <li>Skipped invalid: {bulkPreviewSummary.skippedInvalidCount}</li>
                  <li>
                    Skipped invalid payload:{" "}
                    {Number(bulkPreviewSummary.skippedInvalidPayloadCount || 0)}
                  </li>
                </ul>
                {bulkInvalidItems.length > 0 && (
                  <p className="muted">
                    Invalid slugs (sample):{" "}
                    {bulkInvalidItems
                      .slice(0, 10)
                      .map((item) => item.slug || "(empty)")
                      .join(", ")}
                  </p>
                )}
                {bulkPreviewRows.length > 0 && (
                  <p className="muted">
                    Preview sample:{" "}
                    {bulkPreviewRows
                      .slice(0, 12)
                      .map((row) => `${row.platform}:${row.slug}:${row.status}`)
                      .join(" | ")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Dead-Letter Quick Actions</h2>
            <form className="form" onSubmit={(event) => event.preventDefault()}>
              <label>
                Platform filter (optional)
                <select
                  value={deadLetterForm.platform}
                  onChange={(event) =>
                    setDeadLetterForm((previous) => ({
                      ...previous,
                      platform: event.target.value,
                    }))
                  }
                >
                  <option value="">all platforms</option>
                  {ALL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Retry limit
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={deadLetterForm.limit}
                  onChange={(event) =>
                    setDeadLetterForm((previous) => ({
                      ...previous,
                      limit: Number(event.target.value) || 100,
                    }))
                  }
                />
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void handleRetryDeadLetter()}
                  disabled={busyAction === "dead-letter-retry"}
                >
                  {busyAction === "dead-letter-retry"
                    ? "Retrying..."
                    : "Retry Dead-Letter Jobs"}
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() =>
                    setJobsFilter((previous) => ({
                      ...previous,
                      status: "dead_letter",
                    }))
                  }
                >
                  Show Dead-Letter in Jobs
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Queue Jobs ({jobsTotal})</h2>
          </div>
          <div className="filter-row">
            <select
              value={jobsFilter.status}
              onChange={(event) =>
                setJobsFilter((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
            >
              <option value="">all status</option>
              <option value="queued">queued</option>
              <option value="running">running</option>
              <option value="succeeded">succeeded</option>
              <option value="failed">failed</option>
              <option value="dead_letter">dead_letter</option>
              <option value="canceled">canceled</option>
            </select>
            <select
              value={jobsFilter.platform}
              onChange={(event) =>
                setJobsFilter((previous) => ({
                  ...previous,
                  platform: event.target.value,
                }))
              }
            >
              <option value="">all platform</option>
              {ALL_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          {jobs.length === 0 ? (
            <div className="card">
              <p className="muted">No jobs for current filter.</p>
            </div>
          ) : (
            <div className="card-grid">
              {jobs.map((job) => (
                <article className="card" key={job.id}>
                  <h3>
                    #{job.id} {job.platform} / {job.blog_slug}
                  </h3>
                  <p className="muted">status: {job.status}</p>
                  <p className="muted">
                    attempts: {job.attempt_count}/{job.max_attempts}
                  </p>
                  <p className="muted">
                    scheduled: {toIso(job.scheduled_at)}
                  </p>
                  <p className="muted">
                    next retry: {job.next_retry_at ? toIso(job.next_retry_at) : "-"}
                  </p>
                  <p className="muted">
                    last error: {job.last_error || "-"}
                  </p>
                  <div className="button-row catalog-actions">
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => void handleViewJobAttempts(job.id)}
                      disabled={busyAction === `job-attempts-${job.id}`}
                    >
                      {busyAction === `job-attempts-${job.id}`
                        ? "Loading..."
                        : "View Attempts"}
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => void handleJobAction(job.id, "retry")}
                      disabled={busyAction === `retry-${job.id}`}
                    >
                      Retry
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => void handleJobAction(job.id, "cancel")}
                      disabled={busyAction === `cancel-${job.id}`}
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {jobAttemptsJobId && (
            <div className="card">
              <h3>Job Attempt Diagnostics (#{jobAttemptsJobId})</h3>
              <p className="muted">Attempts loaded: {jobAttemptsTotal}</p>
              {jobAttempts.length === 0 ? (
                <p className="muted">No attempt records for this job yet.</p>
              ) : (
                <ul>
                  {jobAttempts.map((attempt) => (
                    <li key={`attempt-${attempt.id}`}>
                      #{attempt.attempt_number} | {attempt.outcome} |{" "}
                      {attempt.finished_at ? toIso(attempt.finished_at) : "-"}
                      {attempt.http_status
                        ? ` | http ${attempt.http_status}`
                        : ""}
                      {attempt.error_code ? ` | ${attempt.error_code}` : ""}
                      {attempt.error_message ? ` | ${attempt.error_message}` : ""}
                      {attempt.response_excerpt
                        ? ` | excerpt: ${attempt.response_excerpt.slice(0, 200)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Published Posts</h2>
          </div>
          <div className="filter-row">
            <input
              type="text"
              value={postsFilter.slug}
              onChange={(event) =>
                setPostsFilter((previous) => ({
                  ...previous,
                  slug: event.target.value,
                }))
              }
              placeholder="filter by slug"
            />
            <select
              value={postsFilter.platform}
              onChange={(event) =>
                setPostsFilter((previous) => ({
                  ...previous,
                  platform: event.target.value,
                }))
              }
            >
              <option value="">all platform</option>
              {ALL_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          {posts.length === 0 ? (
            <div className="card">
              <p className="muted">No published post records for current filter.</p>
            </div>
          ) : (
            <div className="card-grid">
              {posts.map((post) => (
                <article className="card" key={post.id}>
                  <h3>
                    {post.platform} / {post.blog_slug}
                  </h3>
                  <p className="muted">post id: {post.platform_post_id}</p>
                  <p className="muted">posted at: {toIso(post.posted_at)}</p>
                  {post.platform_post_url ? (
                    <a
                      className="button ghost"
                      href={post.platform_post_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Platform Post
                    </a>
                  ) : (
                    <p className="muted">No public URL returned.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
