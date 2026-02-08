export default function LegalOverview() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Rechtliches</span>
            <h1>Rechtlicher Überblick (Stand Februar 2026)</h1>
            <p>
              Eine Website mit Sitz in Deutschland oder mit klarer
              Marktausrichtung auf Deutschland unterliegt strengen Informations-
              und Transparenzpflichten. Diese Übersicht dient als Orientierung
              und ersetzt keine Rechtsberatung.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Relevante Gesetze</h2>
            <ul>
              <li>Digitale-Dienste-Gesetz (DDG)</li>
              <li>DSGVO + TDDDG (Datenschutz)</li>
              <li>BGB + Fernabsatzrecht (§§ 312j ff. BGB)</li>
              <li>PAngV (Preisangabenverordnung)</li>
              <li>Ab 19. Juni 2026: Widerrufsbutton-Pflicht</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Pflichtseiten (fast immer erforderlich)</h2>
            <p>
              Die folgenden Rechtstexte sind für geschäftsmäßige Websites in der
              Regel verpflichtend. Für internationale Zielgruppen ist eine
              englische Version empfehlenswert.
            </p>
          </div>
          <div className="card-grid">
            <article className="card">
              <h3>Impressum</h3>
              <p>
                Pflicht für praktisch alle geschäftsmäßigen Websites. Grundlage:
                § 5 DDG. Deutsch verpflichtend, Englisch optional.
              </p>
              <p className="muted">
                Typischer Link-Name: Impressum / Anbieterkennzeichnung / Legal
                Notice. Bußgeldrisiko bis 50.000 €.
              </p>
            </article>
            <article className="card">
              <h3>Datenschutzerklärung</h3>
              <p>
                Pflicht bei jeder Verarbeitung personenbezogener Daten (z. B.
                Kontaktformular, Analytics, Server-Logs). Grundlage: DSGVO +
                TDDDG.
              </p>
              <p className="muted">
                Deutsch verpflichtend, Englisch empfohlen. Hohes Abmahnrisiko bei
                Verstößen.
              </p>
            </article>
            <article className="card">
              <h3>AGB</h3>
              <p>
                Pflicht bei Vertragsschluss über die Website (Shop, Paid
                Downloads, Membership, SaaS). Grundlage: §§ 305 ff. BGB.
              </p>
              <p className="muted">
                Deutsch verpflichtend, Englisch empfohlen bei internationalem
                Publikum.
              </p>
            </article>
            <article className="card">
              <h3>Widerrufsbelehrung</h3>
              <p>
                Pflicht bei Fernabsatzverträgen mit Verbrauchern. Grundlage:
                §§ 312d, 355–361 BGB.
              </p>
              <p className="muted">
                Deutsch verpflichtend, Englisch empfohlen. Ab 19. Juni 2026
                Widerrufsbutton-Pflicht.
              </p>
            </article>
            <article className="card">
              <h3>Preisangaben</h3>
              <p>
                Pflicht bei Angeboten von Waren oder Dienstleistungen. Grundlage:
                PAngV.
              </p>
              <p className="muted">
                Preise inkl. MwSt. und Versandkosten klar ausweisen.
              </p>
            </article>
            <article className="card">
              <h3>Streitbeilegung</h3>
              <p>
                Pflicht für Unternehmen ab 11 Mitarbeitern oder bei
                freiwilliger Verpflichtung. Grundlage: § 36 VSBG.
              </p>
              <p className="muted">
                Seit Juli 2025 keine OS-Plattform-Pflicht mehr.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Zusätzlich Oft Sinnvoll</h2>
          </div>
          <div className="card">
            <ul>
              <li>Cookie-Consent-Banner + Cookie-Information (TDDDG + DSGVO)</li>
              <li>
                Barrierefreiheitserklärung (BITV 2.0 / EU-Richtlinie – für
                Behörden und große Unternehmen Pflicht)
              </li>
              <li>Haftungsausschluss / Disclaimer (häufig im Impressum)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Empfohlene Umsetzung (Deutsch & Englisch)</h2>
            <p>
              Viele internationale oder DACH-weit agierende Unternehmen bieten
              die wichtigsten Texte zweisprachig an.
            </p>
          </div>
          <div className="card">
            <p>Empfohlene Struktur im Footer:</p>
            <ul>
              <li>Impressum</li>
              <li>Datenschutz / Privacy Policy</li>
              <li>AGB / Terms & Conditions</li>
              <li>Widerruf / Right of Withdrawal</li>
              <li>(optional) Versand & Zahlung / Shipping & Payment</li>
            </ul>
            <p>
              Technisch am besten: separate Seiten pro Sprache, z. B.
              <br />
              /impressum/ (DE)
              <br />
              /en/legal-notice/ (EN)
            </p>
            <p>
              Alternativ Sprach-Tabs auf einer Seite (weniger empfohlen wegen
              SEO).
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Beispieltexte (Muster)</h2>
            <p>Keine individuelle Rechtsberatung.</p>
          </div>
          <div className="card">
            <p>
              1. Impressum (§ 5 DDG) – Deutsch + Englisch finden Sie auf der
              separaten Impressum-Seite dieser Website.
            </p>
            <p>
              2. Datenschutzerklärung – nutzen Sie aktuelle Generatoren (z. B.
              eRecht24, Händlerbund, activeMind, Dr. Schwenke), da sich
              Tracking-Tools, US-Transfers (Schrems II) und TDDDG laufend ändern.
            </p>
            <p>
              3. AGB + Widerrufsbelehrung – individuell je nach Branche,
              Angebotsform und Zielgruppe. Ab Juni 2026 ist ein deutlicher
              Widerrufsbutton erforderlich.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
