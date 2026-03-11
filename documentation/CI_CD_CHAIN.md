# Vertical Tension CI/CD Chain

Last updated: 2026-03-11
Scope: Forgejo + Woodpecker pipeline for `verticaltension/verticaltension`

## 1. What is now integrated

The repository now includes a full Woodpecker CI/CD pipeline at `.woodpecker.yml`.

Execution flow:
1. `ci_build`
2. `deploy_static`
3. `deploy_api`
4. `smoke_production`

Pipeline behavior:
- Pull requests: CI only (`ci_build`).
- `main` branch pushes/manual/tag: CI + deploy + smoke.

## 1.1 Activation status (2026-03-11)

Woodpecker activation has been completed for `verticaltension/verticaltension` on `ci.scriptoriumai.io`:

- Repository is present and active in Woodpecker (`repo_id=1`).
- Forgejo webhook is installed on `verticaltension/verticaltension` and points to:
  - `https://ci.scriptoriumai.io/api/hook?access_token=...`
- Required repository secrets are configured:
  - `vtp_deploy_host`
  - `vtp_deploy_user`
  - `vtp_ssh_private_key`
  - `vtp_ssh_known_hosts`

Important current gating item:
- Resolved: `.woodpecker.yml` and CI/CD scripts were pushed to Forgejo `origin/main`.
- Manual trigger now works and produces full workflow execution.

Operational note:
- On this server build (`woodpecker-server 2.8.3`), the standard `POST /api/repos?forge_remote_id=<id>` activation path panicked for this org-owned repository.
- Activation was recovered through controlled DB seeding + `POST /api/repos/{repo_id}/repair` to reconcile forge metadata and webhook setup.

## 1.2 First-run verification results (2026-03-11)

Pipeline history after activation:

- `#1` (push) failed at `deploy_api`:
  - Cause: remote host lacked `npm`; deployment script attempted host npm install before compose path.
  - Fix: made `deploy_api` docker-first and only require npm in systemd fallback mode.
- `#2` (push) failed at `smoke_production`:
  - Cause: non-root `curlimages/curl` image could not write Woodpecker-injected `.netrc`.
  - Fix: switched smoke step to `alpine` + `curl`.
- `#3` (push) failed at `smoke_production`:
  - Cause: API probe targeted `/healthz` while service exposes `/api/health`.
  - Fix: updated smoke endpoint to `https://api.verticaltension.com/api/health`.

Successful runs:

- `#4` (push): **success** (`ci_build`, `deploy_static`, `deploy_api`, `smoke_production`)
- `#5` (manual): **success** (same full chain)

This confirms the Vertical Tension Forgejo -> Woodpecker CI/CD chain is now operational end-to-end.

## 2. Files added for CI/CD

- `.woodpecker.yml`
- `scripts/ci/check-server-syntax.mjs`
- `scripts/cicd/deploy-static.sh`
- `scripts/cicd/deploy-api.sh`

Also updated:
- `package.json` scripts:
  - `ci:server:check`
  - `ci`

## 3. CI stage details

### 3.1 `ci_build`

Image: `node:20-bookworm`

Commands:
- `npm ci`
- `npm run ci`

`npm run ci` currently performs:
1. server JavaScript syntax checks (`node --check` over all files in `server/`)
2. frontend TypeScript + Vite build (`npm run build`)

## 4. CD stage details

### 4.1 `deploy_static`

- Syncs `dist/` to VPS static root (default `/var/www/verticaltension`).
- Deletes stale files on target (`rsync --delete`).
- Applies owner (default `www-data:www-data`).
- Validates/reloads NGINX.

### 4.2 `deploy_api`

- Syncs `server/` plus runtime package manifests to API root (default `/srv/verticaltension-api`).
- Runs `npm ci --omit=dev` on VPS.
- Restarts API runtime via one of:
  - `docker compose up -d --build --remove-orphans` if `docker-compose.yml` exists in API root.
  - `systemctl restart <service>` fallback (default service name `verticaltension-api`).

### 4.3 `smoke_production`

Checks the public endpoints after deployment:
- `https://verticaltension.com/`
- `https://app.verticaltension.com/`
- `https://api.verticaltension.com/healthz`

## 5. Woodpecker secret setup (required)

Configure these repository secrets in Woodpecker:

- `vtp_deploy_host` (example: `212.227.22.66`)
- `vtp_deploy_user` (example: `root`)
- `vtp_ssh_private_key` (deployment SSH private key content)

The pipeline will fail if these are missing.

## 6. Optional deployment overrides

The deploy scripts support optional environment overrides.

You can set these as Woodpecker repo variables (or environment injection):

- `VTP_DEPLOY_PORT` (default `22`)
- `VTP_SSH_KNOWN_HOSTS` (optional pinned known_hosts content)
- `VTP_STATIC_ROOT` (default `/var/www/verticaltension`)
- `VTP_STATIC_OWNER` (default `www-data:www-data`)
- `VTP_DEPLOY_API` (`1` default; set `0` to skip API deployment)
- `VTP_API_ROOT` (default `/srv/verticaltension-api`)
- `VTP_API_SERVICE` (default `verticaltension-api`)

## 7. Expected VPS layout

Static site:
- `/var/www/verticaltension`

API stack root:
- `/srv/verticaltension-api`

If API deploy uses Docker Compose, `docker-compose.yml` should exist in `/srv/verticaltension-api`.

## 8. First-run checklist

1. Ensure repo is activated in Woodpecker.
2. Add required secrets.
3. Confirm VPS paths exist and are writable by deploy user.
4. Confirm API runtime strategy:
   - Compose file exists, or
   - systemd service exists with expected service name.
5. Run a manual Woodpecker build on `main`.
6. Verify smoke step passes.

## 9. Failure handling and rollback

If `deploy_static` fails:
- Check SSH/permissions/NGINX config.
- Re-run after fixing target host state.

If `deploy_api` fails:
- Check API root path, runtime strategy (Compose/systemd), and package install output.
- Validate runtime manually on VPS:
  - `cd /srv/verticaltension-api`
  - `npm ci --omit=dev`
  - `docker compose up -d --build --remove-orphans` OR `systemctl restart verticaltension-api`

If `smoke_production` fails:
- Inspect app/API logs and NGINX routing.
- Run endpoint checks manually from VPS and external network.

## 10. Security notes

- Keep deployment key scoped to CI usage only.
- Prefer host key pinning via `VTP_SSH_KNOWN_HOSTS` for stricter SSH trust.
- Do not commit runtime `.env` credentials.
- Continue rotating secrets if ever exposed outside the intended secret store.
