# Social Posting Limits + Operations Reference

Last verified: 2026-03-01
Scope: Vertical Tension social posting pipeline (`/api/social/*`, worker, adapters, SocialOps UI)

Related docs:
- `documentation/SOCIAL_PLATFORM_ONBOARDING_GUIDE.md`
- `documentation/SOCIAL_AUTOMATION_OPERATOR_GUIDE.md`
- `documentation/SOCIAL_PLATFORM_APPLICATION_TEXTS.md`

## 1) Implementation Progress Snapshot

Current status: core feature set is implemented and operational in `stub`/`live` modes.

Implemented:
- OAuth start/callback/finalize flow for X, LinkedIn, Reddit, Instagram, TikTok
- encrypted social account storage
- enqueue (single + bulk), preflight validation, idempotency, dead-letter handling
- worker loop with retry/backoff, stale lock recovery, manual run-now
- attempt diagnostics endpoints + UI panel
- remediation planning/policy/run history
- UTM tracking generation across preview/enqueue/bulk/worker publish

Remaining for production hardening:
- complete provider app approvals/credentials for all live platforms
- run live smoke tests per platform/account (one post each + retry path)
- tune per-platform pacing from real 429 feedback in production
- set alerting thresholds for dead-letter growth and auth failures

## 2) Verified Rate Limits and Caps (by provider)

Only values from official provider docs are marked as hard limits. If a provider does not publish exact numeric limits, this file records that explicitly.

### X API (official docs.x.com tables)

Endpoints used by this project:
- `POST /2/tweets`: `100/15min` per user, `10,000/24hrs` per app
- `POST /2/media/upload`: `500/15min` per user, `50,000/24hrs` per app
- `POST /2/media/upload/initialize`: `1,875/15min` per user, `180,000/24hrs` per app
- `POST /2/media/upload/:id/append`: `1,875/15min` per user, `180,000/24hrs` per app
- `POST /2/media/upload/:id/finalize`: `1,875/15min` per user, `180,000/24hrs` per app
- `POST /2/media/metadata`: `500/15min` per user, `50,000/24hrs` per app

Headers to monitor:
- `x-rate-limit-limit`
- `x-rate-limit-remaining`
- `x-rate-limit-reset`

### LinkedIn API (official Microsoft Learn / LinkedIn doc)

Provider policy:
- limits are enforced in `24h` windows (reset at midnight UTC)
- two buckets apply: `Application` and `Member`
- endpoint-specific standard limits are **not publicly listed**
- exact limits are shown in LinkedIn Developer Portal Analytics after endpoint usage

Operational implication:
- do not hardcode numeric assumptions for LinkedIn
- derive effective limits from runtime telemetry + portal analytics

### Reddit Data API (official Reddit Data API wiki)

For free tier OAuth usage:
- `100 queries per minute` per OAuth client ID
- enforced as an average across a time window (documented by Reddit)

Headers to monitor:
- `X-Ratelimit-Used`
- `X-Ratelimit-Remaining`
- `X-Ratelimit-Reset`

Important:
- OAuth is required for reliable production access; unauthenticated traffic is restricted.

### Instagram Graph API (official Meta page snapshot, archived source)

Verified on official Meta page snapshot:
- `POST /<IG_ID>/media` container workflow
- containers expire after `24h`
- account can create up to `400 containers` in a rolling `24h` period

Important note:
- the exact `media_publish` posting cap value is not clearly exposed in the fetched official snapshot used here.
- enforce app-side pacing and track provider responses in production.

### TikTok for Developers (official docs)

Verified caps/guidelines:
- Direct Post API has a creator posting cap in 24h window; docs indicate it varies by creator and is typically around `15 posts/day/creator`
- cap is shared across API clients using Direct Post
- pending share cap: at most `5 pending shares` per `24h` (error `spam_risk_too_many_pending_share`)
- generic TikTok API v2 default limits include:
  - `/v2/user/info/`: `600` (1-minute window)
  - `/v2/video/query/`: `600` (1-minute window)
  - `/v2/video/list/`: `600` (1-minute window)

Operational implication:
- enforce conservative per-creator daily quotas in app logic
- treat `429 rate_limit_exceeded` and spam-risk errors as first-class backoff signals

## 3) Operational Guardrails for Vertical Tension

These are project-level rules for reliable posting throughput.

- Keep `SOCIAL_WORKER_BATCH_SIZE` low initially (3 is fine for launch).
- Use adapter preflight validation before enqueue (already implemented).
- Keep retries only for transient classes (`rate_limited`, `network_error`).
- Promote auth failures to refresh-token attempt once, then fail deterministically.
- Keep dead-letter as explicit operator queue, not hidden auto-retry loops.
- Run periodic worker status checks from `/api/social/worker/status`.

## 4) Recommended Launch Pacing (initial safe defaults)

Start conservative, then raise by observed headroom:

- X: max 1 publish per account every 30-60 seconds
- LinkedIn: max 1 publish per account every 2-5 minutes
- Reddit: keep app aggregate below 60 QPM until stable (under the 100 QPM ceiling)
- Instagram: keep daily publish plan well below uncertain hard cap; prioritize quality cadence
- TikTok: plan around <=10 direct posts/day/creator until live telemetry confirms higher safe throughput

## 5) Where This Connects in Code

- API + worker orchestration: `server/index.js`
- DB persistence + attempts/jobs: `server/db.js`
- adapters: `server/social/*.js`
- operator control plane UI: `src/pages/SocialOps.tsx`

## 6) Sources (official references)

- X API rate limits: https://docs.x.com/x-api/fundamentals/rate-limits
- LinkedIn rate limits: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits
- Reddit Data API wiki: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- TikTok API v2 rate limits: https://developers.tiktok.com/doc/tiktok-api-v2-rate-limit/
- TikTok content sharing guidelines (Direct Post caps): https://developers.tiktok.com/doc/content-sharing-guidelines/
- TikTok upload-video reference (pending-share cap): https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
- Instagram Graph API media reference (archived official Meta page snapshot): https://archive.ph/2025.12.31-074218/https%3A/developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
