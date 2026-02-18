import { Link } from "react-router-dom";
import { useConsent } from "../context/ConsentContext";

export default function ConsentBanner() {
  const {
    bannerOpen,
    hasDecision,
    acceptEssential,
    declineNonEssential,
    closeConsentSettings,
  } = useConsent();

  if (!bannerOpen) {
    return null;
  }

  return (
    <aside className="consent-banner" aria-live="polite" aria-label="Privacy settings">
      <div className="consent-banner-inner">
        <div className="consent-copy">
          <h3>Privacy & Cookie Notice</h3>
          <p>
            We use essential browser storage for storefront functionality such as
            account preferences, cart, wishlist, theme, and currency settings.
          </p>
          <p>
            This notice is configured to support GDPR and German TDDDG privacy
            requirements.
          </p>
          <p className="consent-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/impressum">Legal Notice</Link>
          </p>
        </div>
        <div className="button-row consent-actions">
          <button className="button primary" type="button" onClick={acceptEssential}>
            Accept Essential
          </button>
          <button className="button ghost" type="button" onClick={declineNonEssential}>
            Decline Non-Essential
          </button>
          {hasDecision && (
            <button className="button ghost" type="button" onClick={closeConsentSettings}>
              Close
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
