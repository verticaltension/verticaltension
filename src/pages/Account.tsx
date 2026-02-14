import { type ChangeEvent } from "react";
import CurrencyConverter from "../components/CurrencyConverter";
import {
  CURRENCIES,
  type CurrencyCode,
  useStorefront,
} from "../context/StorefrontContext";
import { getPayhipHref, PAYHIP_STORE_URL } from "../lib/payhip";

export default function Account() {
  const {
    account,
    updateAccount,
    wishlist,
    removeWishlistItem,
    wishlistCount,
  } = useStorefront();

  const handleProfileChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "preferredCurrency") {
      updateAccount({ preferredCurrency: value as CurrencyCode });
      return;
    }

    if (name === "name") {
      updateAccount({ name: value });
      return;
    }

    if (name === "email") {
      updateAccount({ email: value });
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Account</span>
            <h1>Wishlist, Profile, and Currency</h1>
            <p>
              Manage your local account profile and wishlist. Payhip remains the
              payment and checkout provider.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Storefront Status</h2>
            <ul>
              <li>{wishlistCount} items in wishlist</li>
              <li>Preferred currency: {account.preferredCurrency}</li>
              <li>Checkout provider: Payhip</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Profile</h2>
            <p className="muted">
              Profile preferences are stored on this device for quick access.
            </p>
            <form className="form">
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={account.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={account.email}
                  onChange={handleProfileChange}
                  placeholder="Your email"
                />
              </label>
              <label>
                Preferred currency
                <select
                  name="preferredCurrency"
                  value={account.preferredCurrency}
                  onChange={handleProfileChange}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.label}
                    </option>
                  ))}
                </select>
              </label>
            </form>
            <div className="button-row">
              <a
                className="button ghost"
                href={PAYHIP_STORE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open Payhip Store
              </a>
            </div>
          </div>
          <CurrencyConverter />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Wishlist</h2>
            <p>
              Saved titles are local to this browser. Use Add to Cart to proceed
              with Payhip checkout.
            </p>
          </div>
          {wishlist.length === 0 ? (
            <div className="card">
              <p className="muted">
                Wishlist is empty. Add titles from the Shop page.
              </p>
            </div>
          ) : (
            <div className="card-grid">
              {wishlist.map((item) => (
                <article className="card" key={item.id}>
                  <h3>{item.title}</h3>
                  <div className="meta">
                    <span>{item.category}</span>
                    <span>{item.status}</span>
                    <span>{item.format}</span>
                  </div>
                  <div className="button-row">
                    <a
                      className={`button ghost ${item.payhipProductKey ? "payhip-buy-button" : ""}`}
                      href={getPayhipHref(item.payhipProductKey)}
                      {...(item.payhipProductKey
                        ? {
                            "data-product": item.payhipProductKey,
                            "data-theme": "none",
                          }
                        : {})}
                    >
                      Add to Cart
                    </a>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => removeWishlistItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
