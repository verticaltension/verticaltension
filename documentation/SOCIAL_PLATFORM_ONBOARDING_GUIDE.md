# Social Platform Onboarding Guide

Last updated: 2026-03-02
Project: Vertical Tension social automation

## Canonical Public Pages (for app review forms)

- Terms: https://verticaltension.com/terms
- Privacy: https://verticaltension.com/privacy

Use these links in platform trust/safety review forms where policy URLs are required.

## Shared Redirect URI Pattern

For the current frontend OAuth callback flow, use:

`https://app.verticaltension.com/social-ops/oauth/<platform>/callback`

Examples:
- X: `https://app.verticaltension.com/social-ops/oauth/twitter/callback`
- LinkedIn: `https://app.verticaltension.com/social-ops/oauth/linkedin/callback`
- Reddit: `https://app.verticaltension.com/social-ops/oauth/reddit/callback`
- Instagram: `https://app.verticaltension.com/social-ops/oauth/instagram/callback`
- TikTok: `https://app.verticaltension.com/social-ops/oauth/tiktok/callback`

## Required Server Environment Variables

General:
- `SOCIAL_ENCRYPTION_KEY`
- `SOCIAL_PUBLISH_MODE=stub|live`

X:
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `TWITTER_REDIRECT_URI`
- `TWITTER_SCOPES`

LinkedIn:
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- `LINKEDIN_SCOPES`

Reddit:
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_REDIRECT_URI`
- `REDDIT_SCOPES`
- `REDDIT_USER_AGENT`

Instagram:
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`
- `INSTAGRAM_REDIRECT_URI`
- `INSTAGRAM_SCOPES`

TikTok:
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI`
- `TIKTOK_SCOPES`

## Platform Setup Steps

### X (Twitter)

1. Create/choose app in X Developer Portal.
2. Enable OAuth 2.0 and set callback URI to:
   - `https://app.verticaltension.com/social-ops/oauth/twitter/callback`
3. Configure scopes to include at least:
   - `tweet.read tweet.write users.read offline.access`
4. Copy `Client ID`, `Client Secret` into server `.env`.
5. Restart backend.
6. In SocialOps, run OAuth connect for `twitter`.

### LinkedIn

Current blocker status:
- Disabled for now.
- Reason: insufficient connection/company-page prerequisites to create the required app/API.

When ready:
1. Create LinkedIn app.
2. Configure callback URI:
   - `https://app.verticaltension.com/social-ops/oauth/linkedin/callback`
3. Set required products/scopes.
4. Add env vars and restart backend.
5. Connect via SocialOps OAuth.

### Reddit

Current blocker status:
- Disabled until API access approval is granted.
- Request already sent.

After approval:
1. Create app at `https://old.reddit.com/prefs/apps`.
2. App type must be `web app`.
3. Redirect URI:
   - `https://app.verticaltension.com/social-ops/oauth/reddit/callback`
4. Set `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_REDIRECT_URI`, `REDDIT_USER_AGENT`.
5. Restart backend and complete OAuth via SocialOps.

### Instagram

Current blocker status:
- Disabled for now.
- Reason: cannot create required Facebook page / required credentials because Facebook account is banned.

When unblocked:
1. Create Meta app and Instagram Graph configuration.
2. Set callback URI:
   - `https://app.verticaltension.com/social-ops/oauth/instagram/callback`
3. Configure scopes:
   - `instagram_basic instagram_content_publish pages_show_list`
4. Add env vars and restart backend.
5. Connect via SocialOps OAuth.

### TikTok

1. Create TikTok developer app.
2. Set callback URI:
   - `https://app.verticaltension.com/social-ops/oauth/tiktok/callback`
3. Request scopes:
   - `user.info.basic video.publish video.list`
4. Add `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, scopes to `.env`.
5. Restart backend.
6. Complete OAuth via SocialOps.

Note:
- TikTok review may request a product demo video showing the integration flow.

## Token/Credential Handling Rules

- Keep raw secrets only in `.env` and private credential docs.
- Never place active secrets in public README/docs.
- Rotate immediately if any token/secret appears in shared channels.
- Restart backend after env changes.

## Current Activation Matrix

- X: enabled (credentials available)
- LinkedIn: disabled (company-page/app prerequisite blocker)
- Reddit: disabled (awaiting platform approval)
- Instagram: disabled (Facebook account/page blocker)
- TikTok: pending review assets (video likely required)
