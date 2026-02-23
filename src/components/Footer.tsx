import { Link } from "react-router-dom";
import { useConsent } from "../context/ConsentContext";
import { siteIdentity } from "../config/siteIdentity";

export default function Footer() {
  const { openConsentSettings } = useConsent();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <img
              src="/publisher_logo/logo.png"
              alt={`${siteIdentity.brandName} logo`}
            />
            <span>{siteIdentity.brandName}</span>
          </div>
          <p className="muted">
            Independent publisher of speculative science, philosophical synthesis,
            and long-arc cultural intelligence.
          </p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>
            <a href={siteIdentity.contact.emailHref}>
              {siteIdentity.contact.email}
            </a>
          </p>
          <p>{siteIdentity.address.street}</p>
          <p>
            {siteIdentity.address.postalCodeCity}, {siteIdentity.address.countryCode}
          </p>
          <p>
            <Link to="/contact">Contact form</Link>
          </p>
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
              href="https://www.instagram.com/verticaltensionpress/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </p>
          <p>
            <a
              href="https://www.tiktok.com/@verticaltensionpress"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          </p>
          <p>
            <a
              href="https://www.reddit.com/user/verticaltensionpress/"
              target="_blank"
              rel="noreferrer"
            >
              Reddit
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
        </div>
        <div>
          <strong>Legal</strong>
          <p>
            <Link to="/impressum">Legal Notice / Impressum</Link>
          </p>
          <p>
            <Link to="/privacy">Privacy Policy / Datenschutz</Link>
          </p>
          <p>
            <Link to="/terms">Terms &amp; Conditions / AGB</Link>
          </p>
          <p>
            <Link to="/withdrawal">Right of Withdrawal / Widerruf</Link>
          </p>
          <p>
            <Link to="/shipping-payment">Shipping &amp; Payment / Versand &amp; Zahlung</Link>
          </p>
          <p>
            <button className="footer-link-button" type="button" onClick={openConsentSettings}>
              Cookie &amp; Privacy Settings / Einwilligung
            </button>
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
