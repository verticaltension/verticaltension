import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
          <NavLink to="/shop" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/alien-echoes" onClick={() => setOpen(false)}>
            Alien Echoes
          </NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>
            Contact
          </NavLink>
        </nav>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
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
