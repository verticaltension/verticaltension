# Payhip Integration (Vertical Tension Press)

## Current Setup
- Payhip script is loaded in `index.html`.
- "Add to Cart" buttons are rendered on:
  - **Shop** page (each catalog card)
  - **Alien Echoes** page (next to the PDF button)
- Store fallback URL: `https://payhip.com/verticaltensionpress`

## Files
- `index.html` (Payhip script tag)
- `src/lib/payhip.ts` (store URL + helper)
- `src/pages/Shop.tsx` (Add to Cart buttons)
- `src/pages/AlienEchoes.tsx` (Add to Cart button)
- `src/data/catalog.ts` (optional `payhipProductKey`)

## How Add-to-Cart Works
Payhip’s Add-to-Cart button requires a **product key**.
You will get it after creating a Payhip product.

### Where to find the product key
From the Payhip product URL:
```
https://payhip.com/b/XXXX
```
The `XXXX` part is the **product key**.

## How to activate buttons for each product
1. Create your product in Payhip.
2. Copy the product key (`XXXX`).
3. Add it to the catalog item:

```ts
// src/data/catalog.ts
{
  id: "alien-echoes",
  title: "Alien Echoes",
  // ...
  payhipProductKey: "XXXX"
}
```

When `payhipProductKey` exists, the button will act as **Add to Cart**.
If no key is present, it links to the store homepage.

## Notes
- This setup is **Add-to-Cart**, not direct checkout.
- If you later want direct checkout, swap the button to Payhip’s “Buy Now”
  embed code instead of the cart button.

## Cart Endpoint
- A dedicated cart link can be used via:
  - `https://payhip.com/verticaltensionpress/cart`
- This is now the preferred "View Cart" destination.

## Remaining Full Integration Items
To complete full Payhip product-level integration across the store, provide:

1. Product mapping list
- For each site catalog item, provide the Payhip product key from `/b/{KEY}`.
- Example:
  - `alien-echoes -> ABCD`
  - `echo-layer-atlas -> EFGH`

2. Product publication status
- Mark each mapped product as:
  - `live`
  - `draft`
  - `hidden/unlisted`

3. Product type and delivery mode
- For each product, confirm:
  - `digital` / `physical` / `bundle`
  - Shipping required: `yes/no`

4. Primary checkout currency in Payhip
- Confirm your store base currency (for UI consistency and conversion display alignment).

5. Tax / VAT handling in Payhip
- Confirm if taxes are configured and whether prices are tax-inclusive or tax-exclusive.

6. Coupon strategy (optional but recommended)
- Provide active coupon codes and title scope if you want them surfaced in-site.

7. License / fulfillment details (digital products)
- Confirm whether download limits or license keys are used per product.

8. Return/refund policy linkage
- Confirm which Payhip policy URLs should be referenced from the site legal pages.

9. Cart behavior confirmation
- Confirm whether to keep:
  - `Add to Cart` as primary CTA
  - `View Cart` as secondary CTA

10. Go-live verification set
- Provide one test product key and one live product key so checkout behavior can be validated end-to-end.
