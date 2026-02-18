import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CURRENCIES,
  type CurrencyCode,
  useStorefront,
} from "../context/StorefrontContext";

export default function Account() {
  const {
    account,
    saveAccount,
    wishlist,
    removeWishlistItem,
    wishlistCount,
    addToCart,
    isInCart,
    isAuthenticated,
    isAuthLoading,
  } = useStorefront();

  const [draft, setDraft] = useState({
    name: account.name,
    email: account.email,
    preferredCurrency: account.preferredCurrency,
  });
  const [saveNotice, setSaveNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft({
      name: account.name,
      email: account.email,
      preferredCurrency: account.preferredCurrency,
    });
  }, [account.name, account.email, account.preferredCurrency]);

  const handleProfileChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDraft((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveNotice("");
    const result = await saveAccount({
      name: draft.name.trim(),
      email: draft.email.trim(),
      preferredCurrency: draft.preferredCurrency as CurrencyCode,
    });
    setIsSaving(false);

    if (!result.ok) {
      setSaveNotice(result.error);
      return;
    }

    setSaveNotice("Profile saved.");
  };

  const canSaveProfile = Boolean(draft.name.trim() && draft.email.trim());

  if (isAuthLoading) {
    return (
      <div className="page">
        <section className="section">
          <div className="container account-layout">
            <div className="card">
              <h2>Account Access</h2>
              <p className="muted">Checking your account session...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <section className="section">
          <div className="container account-layout">
            <div className="card">
              <h2>Account Access</h2>
              <p className="muted">
                Login or register to manage profile data, wishlist, and cart.
              </p>
              <div className="form-actions">
                <Link className="button ghost" to="/login">
                  Login
                </Link>
                <Link className="button ghost" to="/register">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Account</span>
            <h1>Wishlist, Profile, and Currency</h1>
            <p>
              Manage your account profile and wishlist. Payhip remains the
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
            <form className="form" onSubmit={handleProfileSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={draft.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={draft.email}
                  onChange={handleProfileChange}
                  placeholder="Your email"
                />
              </label>
              <label>
                Preferred currency
                <select
                  name="preferredCurrency"
                  value={draft.preferredCurrency}
                  onChange={handleProfileChange}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.country} - {currency.currency} (
                      {currency.code})
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button
                  className="button ghost"
                  type="submit"
                  disabled={!canSaveProfile || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
                {saveNotice && <span className="muted">{saveNotice}</span>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Wishlist</h2>
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
                  <div className="button-row catalog-actions">
                    <button
                      className={`button ${isInCart(item.id) ? "primary" : "ghost"}`}
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          title: item.title,
                          category: item.category,
                          status: item.status,
                          format: item.format,
                          payhipProductKey: item.payhipProductKey,
                        })
                      }
                    >
                      {isInCart(item.id) ? "In Cart" : "Add to Cart"}
                    </button>
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
