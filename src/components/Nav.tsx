import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CURRENCIES,
  type CurrencyCode,
  useStorefront,
} from "../context/StorefrontContext";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const {
    wishlistCount,
    cartCount,
    account,
    updateAccount,
    isAuthenticated,
    logoutUser,
  } = useStorefront();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem("theme");
    const initial =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark.matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = initial;
    setTheme(initial);

    const handleChange = () => {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        return;
      }
      const next = prefersDark.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };

    prefersDark.addEventListener("change", handleChange);
    return () => prefersDark.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    document.documentElement.dataset.theme = next;
    setTheme(next);
  };

  const handleCurrencyChange = (value: string) => {
    updateAccount({ preferredCurrency: value as CurrencyCode });
  };

  return (
    <header className="site-header">
      <div className="container nav-bar">
        <NavLink className="brand" to="/">
          <img
            src="/publisher_logo/logo.png"
            alt="Vertical Tension Press logo"
          />
          <span>Vertical Tension Press</span>
        </NavLink>
        <nav className={`nav-links ${open ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            About
          </NavLink>
          <NavLink to="/alien-echoes" onClick={() => setOpen(false)}>
            Alien Echoes
          </NavLink>
          <NavLink to="/shop" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>
            Contact
          </NavLink>
          {isAuthenticated ? (
            <NavLink
              className="account-mobile-link"
              to="/account"
              onClick={() => setOpen(false)}
            >
              Account{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </NavLink>
          ) : (
            <>
              <NavLink
                className="account-mobile-link"
                to="/login"
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
              <NavLink
                className="account-mobile-link"
                to="/register"
                onClick={() => setOpen(false)}
              >
                Register
              </NavLink>
            </>
          )}
          <NavLink className="cart-mobile-link" to="/cart" onClick={() => setOpen(false)}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
          <div className="currency-mobile-wrap">
            <label className="currency-mobile-label" htmlFor="currency-mobile">
              Currency
            </label>
            <select
              id="currency-mobile"
              className="currency-select"
              value={account.preferredCurrency}
              onChange={(event) => handleCurrencyChange(event.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.country} - {currency.currency} (
                  {currency.code})
                </option>
              ))}
            </select>
          </div>
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <NavLink className="account-link account-link-main" to="/account">
              <span>Account</span>
              {wishlistCount > 0 && (
                <span className="account-count" aria-label={`${wishlistCount} items in wishlist`}>
                  {wishlistCount}
                </span>
              )}
            </NavLink>
          ) : (
            <>
              <NavLink className="account-link auth-link-main" to="/login">
                Login
              </NavLink>
              <NavLink className="account-link auth-link-main" to="/register">
                Register
              </NavLink>
            </>
          )}
          <NavLink className="account-link cart-link cart-link-main" to="/cart">
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="account-count" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            )}
          </NavLink>
          {isAuthenticated && (
            <button className="account-link nav-auth-button" type="button" onClick={logoutUser}>
              Logout
            </button>
          )}
          <select
            className="currency-select currency-desktop"
            value={account.preferredCurrency}
            onChange={(event) => handleCurrencyChange(event.target.value)}
            aria-label="Select currency"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.country} - {currency.currency} (
                {currency.code})
              </option>
            ))}
          </select>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
