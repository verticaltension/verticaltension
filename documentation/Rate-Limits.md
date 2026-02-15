# Rate Limits Evolution

This document tracks how backend rate limiting evolved and what is currently live.

## Timeline

### 1) Initial release (`a9bd422`)
- No custom rate limiting.
- CORS was open (`app.use(cors())`).
- No proxy trust configuration.

### 2) API hardening pass (`bcc7c71`)
- Added in-memory per-IP limiters with endpoint scopes.
- Added CORS allowlist handling.
- Added optional proxy trust, defaulting to enabled when `TRUST_PROXY` was unset.
- Fixed limits introduced in code:
  - Global: `60` per `15m`
  - Health: `20` per `1m`
  - Catalog: `20` per `1m`
  - Contact: `2` per `10m`

### 3) Storefront stabilization (`2e16281`)
- Kept same limiter architecture, made thresholds configurable via env vars.
- Changed proxy trust behavior to explicit opt-in only:
  - `TRUST_PROXY === "1"` enables `app.set("trust proxy", 1)`.
- Raised defaults to reduce false 429s under normal browsing and CDN/proxy paths:
  - `RATE_LIMIT_GLOBAL_MAX` default: `300` per `15m`
  - `RATE_LIMIT_HEALTH_MAX` default: `120` per `1m`
  - `RATE_LIMIT_CATALOG_MAX` default: `120` per `1m`
  - `RATE_LIMIT_CONTACT_MAX` default: `5` per `10m`

## Current Live Defaults

From `server/index.js`:
- Global: `300 / 15m`
- Health: `120 / 1m`
- Catalog: `120 / 1m`
- Contact: `5 / 10m`
- Proxy trust: disabled unless `TRUST_PROXY=1`

## Environment Variables

- `TRUST_PROXY`
- `RATE_LIMIT_GLOBAL_MAX`
- `RATE_LIMIT_HEALTH_MAX`
- `RATE_LIMIT_CATALOG_MAX`
- `RATE_LIMIT_CONTACT_MAX`
- `CORS_ORIGINS`

## Operational Note

If traffic passes through CDN/reverse proxy layers and `TRUST_PROXY` is not set correctly, per-IP limiting can be inaccurate (either too strict or too permissive depending on observed source IP). Use `TRUST_PROXY=1` only when deployment topology is verified.
