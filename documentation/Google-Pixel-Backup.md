# Google Pixel Backup (Archive Only)

Status: **Not active in the current site build.**  
Purpose: safety copy of Google Ads pixel implementations for future re-enable.

## 1) Manual Global Site Tag (gtag.js)

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17961562388"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17961562388');
</script>
```

## 2) Conversion Event Snippet (Thank-You Page)

Replace `CONVERSION_LABEL` with your Google Ads conversion label:

```html
<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-17961562388/CONVERSION_LABEL'
  });
</script>
```

## 3) App-Based (SPA) Pattern Used Previously

- Load gtag script once.
- Initialize with `gtag('config', 'AW-17961562388')`.
- Track route changes as page views in React Router.
- Fire conversion on `/thank-you` after confirmed checkout return.

Suggested env vars (if re-enabled in app code):

```env
VITE_GOOGLE_ADS_ID=AW-17961562388
VITE_GOOGLE_ADS_CONVERSION_LABEL=your_conversion_label
VITE_GOOGLE_ADS_CONVERSION_CURRENCY=USD
```

## 4) Important Anti-Duplicate Note

Use **one** tracking method at a time:
- Either manual snippet in HTML/header
- Or app-based loader in React

Do not run both simultaneously, or events may double-count.
