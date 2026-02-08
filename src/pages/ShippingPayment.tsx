export default function ShippingPayment() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Versand &amp; Zahlung</span>
            <h1>Versand &amp; Zahlung</h1>
            <p>
              Diese Seite enthält Informationen zu Versandarten, Lieferzeiten,
              Zahlungsmethoden und Preisangaben. Bitte ergänzen Sie die konkreten
              Konditionen Ihres Angebots.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Shipping &amp; Payment</h2>
            <ul>
              <li>Versandkosten &amp; Lieferzeiten</li>
              <li>Zahlungsarten &amp; Abwicklung</li>
              <li>Preisangaben inkl. MwSt.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Versand &amp; Zahlung (Deutsch)</h2>
            <p>
              Platzhaltertext. Bitte fügen Sie hier Ihre Versand- und
              Zahlungsbedingungen ein.
            </p>
          </div>
          <div className="card">
            <p>
              Geben Sie Ihre Versandarten, Regionen, Lieferzeiten und
              Versandkosten an. Nennen Sie zudem die akzeptierten Zahlungsarten
              und ggf. besondere Bedingungen (z. B. Vorkasse, digitale Inhalte,
              Abonnements).
            </p>
            <p className="section-note">
              Hinweis: Preisangaben müssen gemäß PAngV transparent ausgewiesen
              werden (inkl. MwSt. und ggf. Versandkosten).
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Shipping &amp; Payment (English)</h2>
            <p>Placeholder text for your English shipping and payment terms.</p>
          </div>
          <div className="card">
            <p>
              Describe shipping methods, delivery times, regions, and costs.
              List accepted payment methods and any special terms for digital
              products or subscriptions.
            </p>
            <p className="section-note">
              Note: Prices should be clearly stated, including VAT and shipping
              costs where applicable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
