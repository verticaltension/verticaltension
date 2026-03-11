# TODO

## CI/CD (Completed 2026-03-11)
- Integrated Vertical Tension into Woodpecker CI/CD via `.woodpecker.yml`:
  - CI on push/PR/manual/tag (`npm ci`, server syntax check, frontend build).
  - CD on `main` (static deploy, API deploy, production smoke checks).
- Added deployment automation scripts:
  - `scripts/cicd/deploy-static.sh`
  - `scripts/cicd/deploy-api.sh`
- Added CI server syntax guard:
  - `scripts/ci/check-server-syntax.mjs`
  - `package.json` scripts: `ci:server:check`, `ci`
- Added operator documentation:
  - `documentation/CI_CD_CHAIN.md`
- Activated repository in Woodpecker (`repo_id=1`), installed Forgejo webhook, and configured required deployment secrets.
- Validation complete:
  - Push-triggered pipeline and manual-triggered pipeline both run end-to-end successfully.
  - Full chain verified: `ci_build` -> `deploy_static` -> `deploy_api` -> `smoke_production`.

## Social Automation Roadmap - Remaining Work (2026-03-02)
- Keep `SOCIAL_PUBLISH_MODE=stub` until each enabled platform passes live smoke test.
- Complete TikTok review package (record and upload required product demo video).
- Wait for Reddit API approval, then create `web app` credentials and run OAuth connect.
- LinkedIn remains blocked until company-page/app prerequisites are satisfied.
- Instagram remains blocked while Facebook account/page prerequisites are unavailable.
- Execute live smoke test matrix after approvals (per enabled platform):
  - OAuth connect success
  - preview payload success
  - enqueue and publish success
  - attempt log and post log verification
- Tune production worker pacing from observed rate-limit headers and 429 behavior.
- Configure dead-letter and auth-failure alert thresholds for ongoing operations.
- Rotate any credentials that were ever pasted in chat/messages.

## Localization
- Implement i18n across all pages once content stabilizes.
- Target languages (confirmed): English (default), Mandarin Chinese (Simplified), Hindi, Spanish, French, Standard Arabic, Bengali, Portuguese, Russian, Urdu, German, Italian, Japanese.
- Add a language selector in the header when translations are ready.

## Consent + Pixel Wiring
- Wire consent actions to tracking loaders before enabling ad pixels:
  - `Accept Essential`: keep Google Ads/Meta pixels disabled (non-essential off).
  - `Decline Non-Essential`: keep Google Ads/Meta pixels disabled and revoke any prior marketing consent state.
- Add a future `Accept Marketing`/`Accept All` path that explicitly enables Google Ads (`gtag`) and Meta Pixel (`fbq`) only after opt-in.
- Ensure consent withdrawal from footer settings immediately disables future pixel firing and updates stored consent state.
- Document final behavior in `documentation/Google-Pixel-Backup.md` and `src/pages/Privacy.tsx` when enabled.
