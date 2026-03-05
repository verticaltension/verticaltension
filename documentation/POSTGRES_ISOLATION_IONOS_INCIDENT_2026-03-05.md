# Vertical Tension Postgres Isolation Incident and Resolution (2026-03-05)

## Executive Summary
- Symptom: Vertical Tension login/auth routes failed even though `api.verticaltension.com` returned healthy base responses.
- Root cause: VPS API was running a bootstrap stub service, not the real Vertical Tension backend.
- Secondary risk discovered: Vertical Tension database was colocated in the same Postgres instance/container as Forgejo (`forgejo-postgres`), which is not acceptable for operational isolation.
- Resolution: Real backend deployed to VPS, then Vertical Tension was migrated to a dedicated Postgres container and dedicated database credentials/network.

## What Happened
1. Public API checks showed:
- `/` returned a basic health payload.
- Auth routes like `/api/auth/login` and `/api/auth/me` returned `404` earlier (before backend replacement), indicating missing routes.
2. VPS inspection confirmed `/srv/verticaltension-api` contained a minimal `server.js` stub and no real application backend.
3. Real backend (`server/index.js`, `server/db.js`, social/auth modules) was deployed to VPS and auth routes started working.
4. After recovery, a structural issue remained: Vertical Tension data lived in `forgejo-postgres` (shared with Forgejo/Git/CI).

## Isolation Work Performed
### 1) Safety backup
- Full DB dump created before split:
- `/srv/backups/vertical_tension-before-split-20260305-155857.sql.gz`

### 2) Dedicated Postgres stack created
- New stack path: `/srv/verticaltension-postgres`
- New compose file: `/srv/verticaltension-postgres/docker-compose.yml`
- New env file: `/srv/verticaltension-postgres/.env`
- New container name: `verticaltension-postgres`
- New network: `verticaltension-net` (external docker network)

### 3) Data migrated
- Dump restored into dedicated DB in `verticaltension-postgres`.
- Ownership/grants normalized to the dedicated DB role after restore.

### 4) API repointed
- API stack path: `/srv/verticaltension-api`
- `.env` cleaned from duplicate/stale DB keys.
- API now points to:
- `PGHOST=verticaltension-postgres`
- `PGPORT=5432`
- Dedicated user/password from `/srv/verticaltension-postgres/.env`
- API compose network changed to `verticaltension-net`.

### 5) Legacy DB removed from Forgejo Postgres
- Dropped old `vertical_tension` database from `forgejo-postgres`.
- Verification: `LEGACY_DB_COUNT=0`.

## Final Architecture (Current)
- Forgejo/CI database:
- Container: `forgejo-postgres`
- Purpose: Forgejo + Woodpecker related data only.
- Vertical Tension database:
- Container: `verticaltension-postgres`
- Purpose: Vertical Tension application data only.
- Vertical Tension API:
- Container: `verticaltension-api`
- Connects only to `verticaltension-postgres` via `verticaltension-net`.

## Validation Results
- API route-level checks after cutover:
- `/api/auth/me` -> `401` (expected without session, confirms route exists)
- End-to-end auth smoke test:
- Register -> `201`
- Login -> `200`
- Me -> `200`

## IONOS Clarification: Where Postgres Appears
- This deployment uses self-hosted Postgres in Docker on the VPS.
- In IONOS, this does **not** appear as a separate managed "PostgreSQL product" resource.
- You find it under your VPS workload (SSH + Docker), not under a managed DB service label.

## Operational Paths and Keywords
- Vertical Tension Postgres stack:
- `/srv/verticaltension-postgres`
- Vertical Tension API stack:
- `/srv/verticaltension-api`
- Forgejo stack:
- `/srv/scriptorium-stack`
- Backups:
- `/srv/backups`

## Notes
- This split reduces blast radius, simplifies incident response, and prevents cross-project data coupling.
- If required, add scheduled logical backups for `/srv/verticaltension-postgres` separate from Forgejo backups.
