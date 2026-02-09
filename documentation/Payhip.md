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
