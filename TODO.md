# TODO

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
