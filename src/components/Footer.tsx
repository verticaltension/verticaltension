import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <img
              src="/publisher_logo/Vertical%20Tension%20Press%20Logo%201024x1024%20Trans%20Fin.png"
              alt="Vertical Tension Press logo"
            />
            <span>Vertical Tension Press</span>
          </div>
          <p className="muted">
            Independent publisher of speculative science, philosophical synthesis,
            and long-arc cultural intelligence.
          </p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>inquiries@verticaltension.com</p>
          <p>Berlin, DE</p>
        </div>
        <div>
          <strong>Follow</strong>
          <p>
            <a
              href="https://www.linkedin.com/in/marvin-g-johnson-246ba4226/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <p>
            <a
              href="https://x.com/verticaltension"
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>
          </p>
          <p>
            <a
              href="https://www.instagram.com/verticaltensionpress/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </p>
        </div>
        <div>
          <strong>Legal</strong>
          <p>
            <Link to="/impressum">Impressum</Link>
          </p>
          <p>
            <Link to="/privacy">Datenschutz</Link>
          </p>
          <p>
            <Link to="/terms">AGB</Link>
          </p>
          <p>
            <Link to="/withdrawal">Widerruf</Link>
          </p>
          <p>
            <Link to="/legal">Rechtlicher Überblick</Link>
          </p>
        </div>
      </div>
      <div className="container footer-note">
        This publication uses the Minion Pro font family: Regular, Italic,
        Semi-Bold, Bold, and Bold Italic, lawfully licensed under the Adobe
        Desktop EULA with extended rights for use in Electronic Documents and
        eBooks.
      </div>
    </footer>
  );
}
