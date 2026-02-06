import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-bar">
        <NavLink className="brand" to="/">
          <img
            src="/publisher_logo/Vertical%20Tension%20Press%20Logo%201024x1024%20Trans%20Fin.png"
            alt="Vertical Tension Press logo"
          />
          <span>Vertical Tension Press</span>
        </NavLink>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          Menu
        </button>
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
      </div>
    </header>
  );
}
