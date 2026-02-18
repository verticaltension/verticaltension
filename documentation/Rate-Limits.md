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

### 4) Auth hardening pass
- Added endpoint-specific auth throttles:
  - Register: `RATE_LIMIT_AUTH_REGISTER_MAX` default `5` per `15m`
  - Login: `RATE_LIMIT_AUTH_LOGIN_MAX` default `10` per `15m`
  - Session endpoints (`/api/auth/me`, `/api/auth/logout`): `RATE_LIMIT_AUTH_SESSION_MAX` default `120` per `5m`
  - Account update (`/api/auth/account`): `RATE_LIMIT_AUTH_ACCOUNT_MAX` default `20` per `10m`
- Added server-side failed-login lockout controls:
  - `AUTH_MAX_FAILED_ATTEMPTS` default `5`
  - `AUTH_LOCK_MINUTES` default `15`
- Added secure auth session cookies with configurable session duration:
  - `AUTH_SESSION_DAYS` default `14`
  - `AUTH_SESSION_COOKIE_NAME` default `vtp_session`
- Added session hygiene controls:
  - `AUTH_MAX_SESSIONS_PER_USER` default `5` (older sessions pruned)
  - periodic expired-session cleanup (`AUTH_SESSION_CLEANUP_EVERY`)
- Added origin checks for state-changing requests to reject cross-origin POSTs not on the allowlist.

## Current Live Defaults

From `server/index.js`:
- Global: `300 / 15m`
- Health: `120 / 1m`
- Catalog: `120 / 1m`
- Contact: `5 / 10m`
- Auth register: `5 / 15m`
- Auth login: `10 / 15m`
- Auth session endpoints: `120 / 5m`
- Auth account update: `20 / 10m`
- Proxy trust: disabled unless `TRUST_PROXY=1`
- Failed-login lockout: `5` attempts, lock `15m`

## Current Limits Matrix

| Scope | Window | Default max | Env var |
|---|---:|---:|---|
| Global | 15m | 300 | `RATE_LIMIT_GLOBAL_MAX` |
| Health (`/api/health`) | 1m | 120 | `RATE_LIMIT_HEALTH_MAX` |
| Catalog (`/api/catalog`) | 1m | 120 | `RATE_LIMIT_CATALOG_MAX` |
| Contact (`/api/contact`) | 10m | 5 | `RATE_LIMIT_CONTACT_MAX` |
| Auth register (`/api/auth/register`) | 15m | 5 | `RATE_LIMIT_AUTH_REGISTER_MAX` |
| Auth login (`/api/auth/login`) | 15m | 10 | `RATE_LIMIT_AUTH_LOGIN_MAX` |
| Auth session (`/api/auth/me`, `/api/auth/logout`) | 5m | 120 | `RATE_LIMIT_AUTH_SESSION_MAX` |
| Auth account update (`/api/auth/account`) | 10m | 20 | `RATE_LIMIT_AUTH_ACCOUNT_MAX` |

## Auth Lockout Defaults

- Failed attempts before lock: `5` (`AUTH_MAX_FAILED_ATTEMPTS`)
- Lock duration: `15 minutes` (`AUTH_LOCK_MINUTES`)

## Example Production Overrides

```
RATE_LIMIT_GLOBAL_MAX=300
RATE_LIMIT_HEALTH_MAX=120
RATE_LIMIT_CATALOG_MAX=120
RATE_LIMIT_CONTACT_MAX=5
RATE_LIMIT_AUTH_REGISTER_MAX=5
RATE_LIMIT_AUTH_LOGIN_MAX=10
RATE_LIMIT_AUTH_SESSION_MAX=120
RATE_LIMIT_AUTH_ACCOUNT_MAX=20
AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCK_MINUTES=15
```

## Environment Variables

- `TRUST_PROXY`
- `RATE_LIMIT_GLOBAL_MAX`
- `RATE_LIMIT_HEALTH_MAX`
- `RATE_LIMIT_CATALOG_MAX`
- `RATE_LIMIT_CONTACT_MAX`
- `RATE_LIMIT_AUTH_REGISTER_MAX`
- `RATE_LIMIT_AUTH_LOGIN_MAX`
- `RATE_LIMIT_AUTH_SESSION_MAX`
- `RATE_LIMIT_AUTH_ACCOUNT_MAX`
- `AUTH_MAX_FAILED_ATTEMPTS`
- `AUTH_LOCK_MINUTES`
- `AUTH_SESSION_DAYS`
- `AUTH_SESSION_COOKIE_NAME`
- `AUTH_SESSION_COOKIE_DOMAIN`
- `AUTH_SESSION_CLEANUP_EVERY`
- `AUTH_MAX_SESSIONS_PER_USER`
- `CORS_ORIGINS`

## Operational Note

If traffic passes through CDN/reverse proxy layers and `TRUST_PROXY` is not set correctly, per-IP limiting can be inaccurate (either too strict or too permissive depending on observed source IP). Use `TRUST_PROXY=1` only when deployment topology is verified.
