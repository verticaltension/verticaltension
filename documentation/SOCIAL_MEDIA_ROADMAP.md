# Social Media Auto-Posting Roadmap

Companion reference:
- `documentation/SOCIAL_POSTING_LIMITS_AND_OPERATIONS.md` (provider limits, launch pacing, and operator runbook)
- `documentation/SOCIAL_PLATFORM_ONBOARDING_GUIDE.md` (credential/token setup + platform activation matrix)
- `documentation/SOCIAL_AUTOMATION_OPERATOR_GUIDE.md` (daily operator workflow)
- `documentation/SOCIAL_PLATFORM_APPLICATION_TEXTS.md` (platform application/review text templates)

## Current Delivery Status (2026-03-02)

Delivered:
- Core social automation architecture and operator control plane are implemented.
- OAuth workflow, queueing, worker, retries, diagnostics, remediation, and UTM tracking are implemented.

Still open before full multi-platform production:
- TikTok review completion (video/demo asset requirement).
- Reddit API approval completion and credential activation.
- LinkedIn prerequisite completion (company/app path).
- Instagram prerequisite completion (Meta/Facebook dependency recovery).
- Live smoke tests and production pacing calibration on enabled platforms.

## Scope + Reality Check

This roadmap targets the **current Vertical Tension stack**:
- Backend: `server/index.js` (Express)
- Data layer: `server/db.js` (`pg`, SQL-first init)
- Frontend: React/Vite (`src/`)

### Honest Build Estimate
- **Core implementation (coding only): 14-18 hours**
- **OAuth/app setup and platform verification: 3-6 hours**
- **Staging burn-in + first production tuning: 3-5 hours**

Total realistic delivery: **4-6 focused days**.

---

## Strategic Platform Set

### In Scope (Phase 1)
- X/Twitter
- LinkedIn
- Reddit
- Instagram
- TikTok

### Why Reddit over Facebook (for this phase)
- Faster app setup and lower integration overhead
- Better content-community fit for long-form philosophical writing
- Cleaner first automation surface for queue/retry tuning

---

## Target Architecture

```text
Blog publish event
  -> social enqueue API
  -> social_jobs table (queued)
  -> worker loop (in-process interval for V1)
  -> platform adapter (x/linkedin/reddit/instagram/tiktok)
  -> social_posts + social_job_attempts persisted
  -> metrics + admin status endpoints
```

### Design Principles
- Idempotent posting per `(platform, blog_slug)`
- Retries with exponential backoff + jitter
- Per-platform rate limits and cooldown windows
- Never drop failed jobs silently
- Store sufficient metadata for manual replay and audits
- Attempt OAuth refresh-token recovery on auth failures before final job failure/dead-letter (provider-dependent)

---

## Data Model (to add in `server/db.js`)

Add these tables in `initDb()` (same style as existing tables):

1. `social_accounts`
- `id BIGSERIAL PK`
- `platform TEXT NOT NULL` (`twitter|linkedin|reddit|instagram|tiktok`)
- `account_label TEXT NOT NULL`
- `access_token_encrypted TEXT NOT NULL`
- `refresh_token_encrypted TEXT`
- `token_expires_at TIMESTAMPTZ`
- `scopes TEXT[] NOT NULL DEFAULT '{}'`
- `config_json JSONB NOT NULL DEFAULT '{}'::jsonb` (platform-specific metadata: e.g. LinkedIn actor URN)
- `active BOOLEAN NOT NULL DEFAULT true`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Unique index: `(platform, account_label)`

2. `social_jobs`
- `id BIGSERIAL PK`
- `blog_slug TEXT NOT NULL`
- `blog_title TEXT NOT NULL`
- `canonical_url TEXT NOT NULL`
- `platform TEXT NOT NULL`
- `status TEXT NOT NULL` (`queued|running|succeeded|failed|dead_letter|canceled`)
- `scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `attempt_count INTEGER NOT NULL DEFAULT 0`
- `max_attempts INTEGER NOT NULL DEFAULT 6`
- `next_retry_at TIMESTAMPTZ`
- `last_error TEXT`
- `idempotency_key TEXT NOT NULL`
- `payload JSONB NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Unique index: `(idempotency_key)`
- Indexes: `(status, scheduled_at)`, `(platform, status)`

3. `social_posts`
- `id BIGSERIAL PK`
- `job_id BIGINT REFERENCES social_jobs(id) ON DELETE SET NULL`
- `platform TEXT NOT NULL`
- `blog_slug TEXT NOT NULL`
- `platform_post_id TEXT NOT NULL`
- `platform_post_url TEXT`
- `posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `raw_response JSONB`
- Unique index: `(platform, blog_slug)`

4. `social_job_attempts`
- `id BIGSERIAL PK`
- `job_id BIGINT NOT NULL REFERENCES social_jobs(id) ON DELETE CASCADE`
- `attempt_number INTEGER NOT NULL`
- `started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `finished_at TIMESTAMPTZ`
- `outcome TEXT NOT NULL` (`success|error|rate_limited|auth_error|network_error`)
- `http_status INTEGER`
- `error_code TEXT`
- `error_message TEXT`
- `response_excerpt TEXT`
- Index: `(job_id, attempt_number)`

---

## API Surface (Express)

Implement server routes under `/api/social`:

0. `POST /api/social/oauth/:platform/start`
- Input: `{ accountLabel?, redirectUri?, scopes? }`
- Behavior: creates short-lived OAuth state row and returns provider `authUrl`

0b. `GET /api/social/oauth/:platform/callback`
- Input: provider query params (`state`, `code`)
- Behavior: consumes OAuth state, exchanges code for tokens, upserts `social_accounts`

0c. `POST /api/social/oauth/:platform/finalize`
- Input: `{ state, code }` (or provider error payload)
- Behavior: same completion logic as 0b, intended for frontend callback pages

0d. `POST /api/social/preview`
- Input: `{ slug, title, url|canonicalUrl, summary?, tags?, imageUrl?, platforms? }`
- Behavior: adapter-level preflight + transform preview per platform without queue insertion

1. `POST /api/social/enqueue`
- Input: `{ slug, title, url, summary?, tags?, imageUrl?, platforms? }`
- Behavior: creates one job per platform (unless already posted/idempotent)
- Includes adapter preflight validation before enqueue; invalid payloads are skipped early (e.g. missing media for Instagram/TikTok)
- Output: `{ enqueued: [...], skipped: [...] }`

2. `POST /api/social/enqueue-bulk`
- Input: `{ slugs?: string[], fromDate?: string, toDate?: string, platforms?: string[] }`
- Behavior: scans blog catalog/source, creates missing jobs only
- Output: `{ totalCandidates, enqueuedCount, skippedCount }`
 - Optional: `targets: [{ platform, slug }]` for enqueue-only target execution from preview

2b. `POST /api/social/enqueue-bulk/preview`
- Input: `{ items: [...], platforms: [...] }`
- Behavior: server-side dedupe preview across existing `social_posts` + `social_jobs` idempotency
- Includes adapter payload preflight checks per platform (`skipped_invalid_payload`)
- Output: summary counters + sample preview rows (`enqueueable`, `skipped_posted`, `skipped_existing_job`, `skipped_invalid_payload`)

3. `GET /api/social/jobs`
- Query: `status`, `platform`, `limit`, `offset`
- Output: paginated job list for monitoring

4. `POST /api/social/jobs/:id/retry`
- Behavior: resets failed/dead-letter job back to `queued`

5. `POST /api/social/jobs/:id/cancel`
- Behavior: marks queued/running jobs as `canceled`

5b. `POST /api/social/jobs/retry-dead-letter`
- Input: `{ platform?, limit? }`
- Behavior: bulk reset dead-letter jobs back to queued for rapid recovery

5c. `POST /api/social/jobs/retry-failed`
- Input: `{ platform?, limit?, includeDeadLetter? }`
- Behavior: bulk reset failed jobs (optionally including dead-letter) back to queued

5d. `POST /api/social/jobs/cancel-queued`
- Input: `{ platform?, limit?, includeRunning? }`
- Behavior: bulk cancel queued jobs (optionally include running jobs for emergency queue drain)

5e. `GET /api/social/jobs/:id/attempts`
- Query: `limit`, `offset`
- Output: per-attempt diagnostics for one job (`outcome`, `http_status`, `error_code`, `error_message`, `response_excerpt`)

6. `GET /api/social/posts`
- Query by `slug`, `platform`
- Output: posted records and external URLs

7. `GET /api/social/summary`
- Query: `fromDate?`, `toDate?`
- Output: totals by status + platform/status breakdown + posted counts by platform

8. `GET /api/social/rate-limit-signals`
- Query: `windowHours?` (default 24, max 168)
- Output: latest per-platform rate-limited signal + cooldown active/remaining seconds

9. `GET /api/social/providers/health`
- Query: `windowHours?` (default 24) and `expiringWithinHours?` (default 72)
- Output: per-platform diagnostics (`healthy|warning|critical`) with oauth-env readiness, active account counts, token expiry risk, required config gaps, queue failure/dead-letter pressure, and cooldown telemetry

9b. `GET /api/social/worker/status`
- Output: worker runtime config + last tick state/counters/errors

9c. `POST /api/social/worker/run-now`
- Input: `{ maxJobs?, allowWhenDisabled? }`
- Behavior: manual queue processing tick for operator intervention/testing

10. `GET /api/social/remediation/plan`
- Query: `windowHours?`, `expiringWithinHours?`, `limitPerAction?`
- Output: prioritized, deterministic remediation actions derived from provider health (dry-run first)

11. `POST /api/social/remediation/execute`
- Input: `{ action, platform, limit?, dryRun? }`
- Behavior: executes a single remediation action (or dry-run estimate) and stores an audit artifact

12. `GET /api/social/remediation/runs`
- Query: `platform?`, `limit`, `offset`
- Output: recent remediation execution/dry-run history for operator auditability

13. `GET /api/social/remediation/policy/status`
- Output: remediation policy runtime config + last cycle state counters/errors

14. `POST /api/social/remediation/policy/run-now`
- Input: `{ dryRunOnly?, forceApply? }`
- Behavior: manually trigger one policy cycle (dry-run or guarded apply)

15. `GET /api/social/remediation/policy/simulate`
- Query: `windowHours?`, `expiringWithinHours?`, `limitPerAction?`, `format=json|csv`
- Behavior: returns a deterministic simulation report (or CSV export) without applying changes
- Includes apply blockers for freeze windows + escalation thresholds (`action_escalation_disabled`, `below_min_estimated_threshold`, `requires_force_apply_threshold`)

16. `POST /api/social/remediation/policy/validate-config`
- Input: `{ freezeUtcHours?, platformOverridesJson?, actionEscalationJson? }`
- Behavior: validates + normalizes policy draft config and returns structured warnings/errors before rollout

### Security
- Keep all social admin endpoints authenticated (re-use current session model)
- Add per-route rate limit buckets (same limiter pattern already in `server/index.js`)

## UI Control Plane (implemented)

Route:
- `/social-ops` in frontend (`src/pages/SocialOps.tsx`)
- `/social-ops/oauth/:platform/callback` in frontend (`src/pages/SocialOAuthCallback.tsx`)

Capabilities:
- provider status panel (`/api/social/providers`)
- account save/upsert panel (`/api/social/accounts`)
- OAuth start launcher (`/api/social/oauth/:platform/start`)
- frontend OAuth callback finalize page (`/social-ops/oauth/:platform/callback` -> `/api/social/oauth/:platform/finalize`)
- one-click helper actions (recommended callback URL, default scopes, config templates, clipboard copy)
- pre-publish payload preview in enqueue form (per-platform adapter transform preview)
- bulk planner UI with date-range source selection, dedupe preview, and bulk enqueue execution
- preflight enqueue validation surfaced in single + bulk flows (invalid payload skip counts)
- dead-letter quick actions panel (bulk retry + one-click dead-letter filter)
- summary dashboard cards (totals + per-platform status counts)
- rate-limit cooldown dashboard (active cooldown windows by platform)
- provider health diagnostics panel (`/api/social/providers/health`) with issue list + severity per platform
- worker control panel (`/api/social/worker/status`, `/api/social/worker/run-now`)
- provider-level remediation quick actions (`retry failed`, `retry failed + dead-letter`)
- provider-level queue drain quick actions (`cancel queued`, optional `cancel queued + running`)
- remediation plan control panel (prioritized actions with dry-run + execute)
- remediation run history panel (audit log of executed/dry-run actions)
- remediation policy control panel (auto-policy status + manual run-now triggers)
- remediation policy simulation export controls (JSON/CSV report generation)
- remediation policy freeze/escalation telemetry (freeze active state, override counts, skip counters)
- remediation policy draft validator UI (freeze + platform/action JSON validation with normalized output)
- bulk enqueue safety mode: "only preview-eligible targets"
- single enqueue form (`/api/social/enqueue`)
- jobs monitor + retry/cancel controls (`/api/social/jobs`, `/api/social/jobs/:id/retry`, `/api/social/jobs/:id/cancel`)
- job attempt diagnostics panel (`/api/social/jobs/:id/attempts`)
- post log monitor (`/api/social/posts`)

---

## Worker + Retry Policy (V1)

### Worker Model
- Start with **in-process worker loop** in server runtime (simple + sufficient initially)
- Poll every `SOCIAL_WORKER_POLL_MS` (default 3000)
- Concurrency by platform:
  - X: 1
  - LinkedIn: 1
  - Reddit: 1
  - Instagram: 1
  - TikTok: 1

### Retry Strategy
- Backoff: `baseMs * 2^(attempt-1) + jitter(0-1000)`
- Default `baseMs = 5000`, `maxAttempts = 6`
- Dead-letter when exhausted
- Do not retry for permanent 4xx validation errors
- For auth failures with refresh token available, attempt one token refresh + publish retry before applying normal retry/dead-letter policy

### Idempotency
- `idempotency_key = sha256(platform + ':' + blog_slug + ':' + canonical_url)`
- Prevent duplicate jobs and duplicate `social_posts`

---

## Platform Adapter Contract

Create `server/social/`:

- `baseAdapter.js` with standard interface:
  - `validatePayload(payload)`
  - `transform(payload)`
  - `publish(transformed, account)`
  - `classifyError(err)`

Adapters:
- `twitterAdapter.js`
- `linkedinAdapter.js`
- `redditAdapter.js`
- `instagramAdapter.js`
- `tiktokAdapter.js`

Each adapter returns normalized result:
```json
{
  "platformPostId": "...",
  "platformPostUrl": "...",
  "raw": {}
}
```

---

## Content Transformation Rules

Input source fields:
- title
- summary
- canonical URL
- tags
- optional lead image

Per-platform transform:
- X: concise teaser, max-safe char budget, 1-2 hashtags
- LinkedIn: professional paragraph + CTA + URL
- Reddit: subreddit-specific title/body templates; markdown-safe output
- Instagram: caption + hashtag block + media requirement check
- TikTok: caption + hashtag block + media URL check (video/image upload flow)

### UTM Policy
Automatic platform-specific tracking URLs are now generated in:
- single preview (`/api/social/preview`)
- single enqueue (`/api/social/enqueue`)
- bulk preview/enqueue (`/api/social/enqueue-bulk/*`)
- worker publish runtime (including previously queued jobs)

Policy fields:
- `utm_source=<platform>`
- `utm_medium=<SOCIAL_UTM_MEDIUM>` (default `social`)
- `utm_campaign=<SOCIAL_UTM_CAMPAIGN>` (default `blog_distribution`)
- `utm_content=<SOCIAL_UTM_CONTENT_PREFIX + slug>` (prefix optional)

Tracking config is exposed through social API diagnostics (`/api/social/providers`, `/api/social/providers/health`, `/api/social/worker/status`) for operator verification.

---

## Environment + Secrets

Add to `.env.example`:

- `SOCIAL_WORKER_ENABLED=0|1`
- `SOCIAL_WORKER_POLL_MS=3000`
- `SOCIAL_WORKER_BATCH_SIZE=3`
- `SOCIAL_WORKER_STALE_LOCK_MINUTES=30` (automatic stale `running` lock recovery threshold)
- `SOCIAL_MAX_ATTEMPTS=6`
- `SOCIAL_RETRY_BASE_MS=5000`
- `SOCIAL_PUBLISH_MODE=stub|live`
- `SOCIAL_UTM_ENABLED=1|0`
- `SOCIAL_UTM_MEDIUM=social`
- `SOCIAL_UTM_CAMPAIGN=blog_distribution`
- `SOCIAL_UTM_CONTENT_PREFIX=` (optional prefix prepended to slug in `utm_content`)
- `SOCIAL_ENCRYPTION_KEY=` (for token encryption)
- `SOCIAL_REMEDIATION_DEFAULT_LIMIT=100`
- `SOCIAL_REMEDIATION_AUTORUN_ENABLED=0|1`
- `SOCIAL_REMEDIATION_AUTORUN_POLL_MS=300000`
- `SOCIAL_REMEDIATION_AUTORUN_COOLDOWN_MINUTES=60`
- `SOCIAL_REMEDIATION_AUTORUN_MAX_ACTIONS_PER_CYCLE=3`
- `SOCIAL_REMEDIATION_AUTORUN_APPLY_ON_CRITICAL_ONLY=1|0`
- `SOCIAL_REMEDIATION_AUTORUN_LIMIT_PER_ACTION=100`
- `SOCIAL_REMEDIATION_AUTORUN_PLATFORM_OVERRIDES_JSON=` (per-platform policy overrides)
- `SOCIAL_REMEDIATION_AUTORUN_FREEZE_UTC_HOURS=` (`start-end` UTC ranges, comma-separated, e.g. `0-6,22-24`)
- `SOCIAL_REMEDIATION_ACTION_ESCALATION_JSON=` (per-action escalation thresholds + max apply limit)

Platform creds placeholders:
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`

Provider runtime overrides:
- `TWITTER_API_BASE_URL`
- `LINKEDIN_API_BASE_URL`
- `REDDIT_API_BASE_URL`
- `INSTAGRAM_GRAPH_BASE_URL`
- `TIKTOK_API_BASE_URL`
- `TIKTOK_PUBLISH_INIT_PATH`

Required `social_accounts.config_json` values in live mode:
- LinkedIn: `{ "actorUrn": "urn:li:person:..." }`
- Reddit: `{ "defaultSubreddit": "verticaltensionpress" }` (or pass per payload)
- Instagram: `{ "igUserId": "..." }`
- TikTok: `{ "openId": "..." }`

OAuth tuning:
- `SOCIAL_OAUTH_STATE_TTL_MINUTES=20`
- Provider auth/token URL overrides are available for each platform

---

## Implementation Phases

### Phase 1: DB + Core Queue (3-4h)
- [ ] Add social tables in `initDb()`
- [ ] Add db helpers (`createJob`, `claimJobs`, `updateJob`, `insertPost`, `insertAttempt`)
- [ ] Add idempotency checks

### Phase 2: Social API + Worker Skeleton (3-4h)
- [ ] Add `/api/social/*` endpoints
- [ ] Add in-process worker loop
- [ ] Add retry scheduler + dead-letter behavior

### Phase 3: Platform Adapters (4-5h)
- [ ] Implement X adapter
- [ ] Implement Reddit adapter
- [ ] Implement LinkedIn adapter
- [ ] Implement Instagram adapter

### Phase 4: Bulk Backfill + Ops Controls (2-3h)
- [ ] `enqueue-bulk` with dedupe
- [ ] Resume-safe batch operation
- [ ] Admin retry/cancel endpoints

### Phase 5: Staging + Production Burn-in (3-4h)
- [ ] End-to-end staging run (all four platforms)
- [ ] Validate rate-limit handling and retries
- [ ] Production guarded rollout (single platform -> all)

---

## Testing Strategy

### Unit
- [ ] transform functions per platform
- [ ] retry/backoff calculations
- [ ] error classification mapping

### Integration
- [ ] enqueue -> worker -> status transitions
- [ ] idempotency skip path
- [ ] dead-letter path after max retries

### Staging Acceptance
- [ ] One post successfully distributed to each platform
- [ ] Duplicate enqueue does not double-post
- [ ] Failed OAuth token path produces actionable error in `social_jobs.last_error`

---

## Monitoring + Operational Runbook

Track minimum counters (log-based if no metrics stack yet):
- `social_jobs_enqueued_total`
- `social_jobs_succeeded_total`
- `social_jobs_failed_total`
- `social_jobs_dead_letter_total`
- `social_api_rate_limited_total`

Operational checks:
- [ ] Dead-letter queue > 0 triggers admin alert
- [ ] OAuth expiry check daily
- [ ] Weekly duplicate-post audit (`social_posts` uniqueness)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OAuth token expiry | Medium | High | refresh flow + early expiry checks |
| Platform rate-limit bursts | High | Medium | queue + backoff + per-platform concurrency |
| Duplicate posting | Medium | High | idempotency key + unique `(platform, blog_slug)` |
| API policy/contract drift | Medium | Medium | adapter abstraction + scoped integration tests |
| Invalid media payload (Instagram) | Medium | Medium | preflight validation before enqueue |

---

## Success Criteria

- [ ] New blog post reaches all configured platforms within 5 minutes (steady state)
- [ ] Duplicate enqueue requests do not create duplicate platform posts
- [ ] 99% of jobs resolve without manual intervention
- [ ] Dead-letter rate remains < 1% over first 500 jobs
- [ ] Full traceability from blog slug -> job -> attempt -> platform post URL

---

## Immediate Next Actions

1. Add social tables + helpers in `server/db.js`.
2. Implement `/api/social/enqueue` and `/api/social/jobs` first.
3. Ship X + Reddit adapters first for fastest feedback.
4. Run 1-day staging burn-in before enabling all platforms in production.
