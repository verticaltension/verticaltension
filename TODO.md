# TODO

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
