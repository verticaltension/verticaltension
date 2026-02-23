import { siteIdentity, siteIdentityText } from "../config/siteIdentity";

export default function Privacy() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Privacy</span>
            <h1>Privacy Policy / Datenschutzerklärung</h1>
            <p>
              This policy explains how {siteIdentity.brandName} processes personal
              data for website operation, account features, support handling, and
              Payhip checkout flow.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Legal Bases / Rechtsgrundlagen</h2>
            <ul>
              <li>GDPR Art. 6(1)(b), Art. 6(1)(f)</li>
              <li>GDPR Art. 13, 15-22</li>
              <li>TDDDG Section 25 (essential storage)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Privacy Policy (English)</h2>
            <p>Controller and data-protection information for this website.</p>
          </div>
          <div className="card">
            <h3>1. Controller</h3>
            <p>
              {siteIdentity.brandName}, {siteIdentityText.addressLineEN}. Contact:{" "}
              {siteIdentity.contact.email}.
            </p>

            <h3>2. Data Processed</h3>
            <p>
              We process data necessary for operation of this website and
              storefront, including account fields entered by you (name, email,
              preferred currency), secure authentication/session records,
              wishlist/cart states stored in your browser, support email
              correspondence, and technical server logs.
            </p>

            <h3>3. Purposes and Legal Bases</h3>
            <ul>
              <li>
                Site operation, security, and abuse prevention: GDPR Art. 6(1)(f).
              </li>
              <li>
                Contract and customer communication: GDPR Art. 6(1)(b).
              </li>
            </ul>

            <h3>4. Essential Storage Notice</h3>
            <p>
              The site displays a privacy/cookie notice for essential browser
              storage used by storefront functions (cart, wishlist, theme,
              currency) and essential authentication session cookies.
            </p>

            <h3>5. Checkout Provider (Payhip)</h3>
            <p>
              Final payment and checkout are processed on Payhip. When you leave
              this site for checkout, Payhip acts as an independent controller
              for checkout data processing under its own policies.
            </p>

            <h3>6. Storage Periods</h3>
            <p>
              Personal data is kept only as long as needed for stated purposes,
              legal obligations, and defense of legal claims.
            </p>

            <h3>7. Your Rights</h3>
            <p>
              You have rights of access, rectification, erasure, restriction,
              portability, and objection (Arts. 15-22 GDPR), and may lodge a
              complaint with a supervisory authority.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Datenschutzerklärung (Deutsch)</h2>
            <p>
              Verantwortliche Informationen zum Datenschutz fuer diese Website und
              den Storefront-Betrieb.
            </p>
          </div>
          <div className="card">
            <h3>1. Verantwortlicher</h3>
            <p>
              {siteIdentity.brandName}, {siteIdentityText.addressLineDE}. Kontakt:{" "}
              {siteIdentity.contact.email}.
            </p>

            <h3>2. Verarbeitete Daten</h3>
            <p>
              Verarbeitet werden insbesondere von Ihnen eingegebene
              Kontodaten (Name, E-Mail, bevorzugte Waehrung), sichere
              Authentifizierungs-/Sitzungsdaten, lokal gespeicherte Warenkorb-
              und Wunschlisteninformationen, Support-Kommunikation sowie
              technische Server-Logdaten.
            </p>

            <h3>3. Zwecke und Rechtsgrundlagen</h3>
            <ul>
              <li>
                Betrieb, Sicherheit und Missbrauchspraevention:
                Art. 6 Abs. 1 lit. f DSGVO.
              </li>
              <li>
                Vertragsdurchfuehrung und Kommunikation:
                Art. 6 Abs. 1 lit. b DSGVO.
              </li>
            </ul>

            <h3>4. Hinweis zu essenzieller Speicherung</h3>
            <p>
              Die Website zeigt einen Datenschutz-/Cookie-Hinweis fuer
              essenzielle Browser-Speicherungen (Warenkorb, Wunschliste, Theme
              und Waehrung) sowie essenzielle Authentifizierungs-Cookies.
            </p>

            <h3>5. Checkout-Anbieter (Payhip)</h3>
            <p>
              Der finale Bezahlvorgang erfolgt bei Payhip. Beim Wechsel zu
              Payhip verarbeitet Payhip die Checkout-Daten als eigenstaendig
              Verantwortlicher nach eigenen Datenschutzbedingungen.
            </p>

            <h3>6. Speicherdauer</h3>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es fuer
              die genannten Zwecke, gesetzliche Pflichten oder die Abwehr
              rechtlicher Ansprueche erforderlich ist.
            </p>

            <h3>7. Ihre Rechte</h3>
            <p>
              Sie haben Rechte auf Auskunft, Berichtigung, Loeschung,
              Einschraenkung, Datenuebertragbarkeit und Widerspruch
              (Art. 15-22 DSGVO) sowie ein Beschwerderecht bei einer
              Aufsichtsbehoerde.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
