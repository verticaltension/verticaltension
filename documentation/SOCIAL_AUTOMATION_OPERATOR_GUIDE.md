# Social Automation Operator Guide

Last updated: 2026-03-02
Project: Vertical Tension

## 1) Purpose

This guide explains how to operate the Vertical Tension social automation control plane in `SocialOps`, including account connection, payload validation, enqueueing, worker operations, and remediation.

## 2) Preconditions

- Backend running with valid `.env`.
- `SOCIAL_ENCRYPTION_KEY` set.
- At least one platform OAuth app configured.
- Signed in to admin UI.
- Recommended domains active:
  - `app.verticaltension.com`
  - `api.verticaltension.com`

## 3) Open the Control Plane

Navigate to:
- `https://app.verticaltension.com/social-ops`

Main panels include:
- Provider Status
- Provider Health Diagnostics
- Social Worker
- Account Save/Upsert
- OAuth Connect
- Single Enqueue + Payload Preview
- Bulk Planner
- Jobs / Attempts / Posts
- Remediation policy/actions

## 4) Connect an Account (OAuth)

1. In SocialOps OAuth panel choose platform + account label.
2. Confirm callback URI is correct for that platform.
3. Click start/connect and authorize on provider side.
4. On callback completion, verify account appears as active in Social Accounts panel.

## 5) Configure Platform-Specific Account Metadata

Some platforms require `config_json` values:
- LinkedIn: `actorUrn`
- Reddit: `defaultSubreddit` (or set in payload)
- Instagram: `igUserId`
- TikTok: `openId`

Save config through account form in SocialOps.

## 6) Single Post Flow

1. Fill slug, title, URL, summary, tags, optional image URL.
2. Choose platforms.
3. Click `Preview Payload` first.
   - Fix invalid payload errors before enqueue.
4. Click `Enqueue Jobs`.

Result:
- Enqueued jobs + explicit skipped reasons are returned.

## 7) Bulk Flow

1. Set date range and platform filters.
2. Run bulk preview.
3. Review:
   - enqueueable
   - skipped_posted
   - skipped_existing_job
   - skipped_invalid_payload
4. Optionally use `only preview-eligible targets`.
5. Execute bulk enqueue.

## 8) Worker Operations

Panel: `Social Worker`

Use:
- Refresh status
- Run now
- Run now (force when disabled)

Track:
- in-flight state
- ticks/success/failure counts
- processed totals
- stale lock recoveries
- last run summary/outcomes

## 9) Monitoring + Recovery

Use these sections:
- Jobs list for status filtering
- Attempt diagnostics (`View Attempts`)
- Posts log
- Provider health (token/config/queue risk)
- Rate-limit signals

Recovery actions:
- Retry dead-letter (bulk or per platform)
- Retry failed (with optional dead-letter)
- Cancel queued / queued+running (emergency drain)
- Remediation plan + execute/dry-run

## 10) Safe Production Operation

- Keep `SOCIAL_PUBLISH_MODE=stub` until credential + policy checks pass.
- Enable `live` only after end-to-end smoke test per active platform.
- Keep worker batch low initially.
- Always preview payloads for new content templates.
- Treat recurring auth errors as reconnect/credential-rotation events.

## 11) Current Platform Enablement Notes

- X: active target platform.
- LinkedIn: disabled pending company-page/app prerequisites.
- Reddit: disabled pending API approval.
- Instagram: disabled pending Facebook/Meta prerequisite recovery.
- TikTok: onboarding in progress; review assets (video) may be required.
