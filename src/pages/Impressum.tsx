import { siteIdentity, siteIdentityText } from "../config/siteIdentity";

export default function Impressum() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Legal Notice</span>
            <h1>Legal Notice / Impressum</h1>
            <p>
              Information pursuant to § 5 Digitale-Dienste-Gesetz (DDG). This
              page provides provider identification for {siteIdentity.brandName}.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Contact / Kontakt</h2>
            <ul>
              <li>{siteIdentity.contact.email}</li>
              <li>{siteIdentity.contact.phoneDisplay}</li>
              <li>{siteIdentityText.addressLine}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Legal Notice / Imprint (English)</h2>
            <p>
              Note: This is a template based on the provided data and not
              individual legal advice.
            </p>
          </div>
          <div className="card">
            <p>Information pursuant to § 5 Digitale-Dienste-Gesetz (DDG)</p>
            <p>
              {siteIdentity.brandName}
              <br />
              {siteIdentity.address.street}
              <br />
              {siteIdentity.address.postalCodeCity}
              <br />
              {siteIdentity.address.countryEN}
            </p>
            <p>
              Represented by the Managing Director:
              <br />
              {siteIdentity.management.managingDirector}
            </p>
            <p>
              VAT identification number in accordance with § 27a UStG:
              <br />
              {siteIdentity.tax.vatId}
            </p>
            <p>
              Contact:
              <br />
              Phone:{" "}
              <a href={siteIdentity.contact.phoneHref}>
                {siteIdentity.contact.phoneDisplay}
              </a>
              <br />
              E-mail:{" "}
              <a href={siteIdentity.contact.emailHref}>
                {siteIdentity.contact.email}
              </a>
            </p>
            <p>
              Commercial register:
              <br />
              No entry in the commercial register.
              <br />
              Register court: Not applicable.
            </p>
            <p>
              Competent supervisory authority:
              <br />
              Not applicable.
            </p>
            <p>
              Person responsible for content pursuant to § 18 para. 2
              Medienstaatsvertrag (MStV):
              <br />
              {siteIdentity.management.managingDirector} (address and contact see above).
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Impressum (Deutsch)</h2>
            <p>
              Hinweis: Dies ist ein Mustertext auf Basis der bereitgestellten
              Daten und keine individuelle Rechtsberatung.
            </p>
          </div>
          <div className="card">
            <p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>
            <p>
              {siteIdentity.brandName}
              <br />
              {siteIdentity.address.street}
              <br />
              {siteIdentity.address.postalCodeCity}
              <br />
              {siteIdentity.address.countryDE}
            </p>
            <p>
              Vertreten durch den Geschäftsführer:
              <br />
              {siteIdentity.management.managingDirector}
            </p>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
              <br />
              {siteIdentity.tax.vatId}
            </p>
            <p>
              Kontakt:
              <br />
              Telefon:{" "}
              <a href={siteIdentity.contact.phoneHref}>
                {siteIdentity.contact.phoneDisplay}
              </a>
              <br />
              E-Mail:{" "}
              <a href={siteIdentity.contact.emailHref}>
                {siteIdentity.contact.email}
              </a>
            </p>
            <p>
              Handelsregister:
              <br />
              Kein Eintrag im Handelsregister.
              <br />
              Registergericht: Nicht anwendbar.
            </p>
            <p>
              Zuständige Aufsichtsbehörde:
              <br />
              Nicht anwendbar.
            </p>
            <p>
              Inhaltlich Verantwortlicher gemäß § 18 Abs. 2
              Medienstaatsvertrag (MStV):
              <br />
              {siteIdentity.management.managingDirector} (Anschrift und Kontakt siehe oben).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
