export default function Withdrawal() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Widerruf</span>
            <h1>Widerrufsbelehrung</h1>
            <p>
              Diese Seite ist als Platzhalter für die gesetzlich vorgeschriebene
              Widerrufsbelehrung und das Muster-Widerrufsformular vorgesehen.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Rechtsgrundlagen</h2>
            <ul>
              <li>§§ 312d, 355–361 BGB</li>
              <li>§ 246a EGBGB (Informationspflichten)</li>
              <li>Ab 19. Juni 2026: Widerrufsbutton-Pflicht</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Widerrufsbelehrung (Deutsch)</h2>
            <p>Platzhaltertext für die Widerrufsbelehrung.</p>
          </div>
          <div className="card">
            <p>
              Widerrufsbelehrung und Muster-Widerrufsformular sind weitgehend
              gesetzlich vorgegeben. Wenn Sie Verbraucherverträge über die
              Website schließen, muss die Belehrung unmittelbar verfügbar sein.
            </p>
            <p>
              Ab 19. Juni 2026 ist ein klar gekennzeichneter Widerrufsbutton
              („Vertrag widerrufen“ / „Cancel Contract“) erforderlich, der gut
              sichtbar platziert ist (z. B. im Kundenkonto oder Checkout).
            </p>
            <p className="section-note">
              Hinweis: Dies ist keine Rechtsberatung. Bitte fügen Sie die finale
              Widerrufsbelehrung mit juristischer Prüfung ein.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Right of Withdrawal (English)</h2>
            <p>Placeholder for the English withdrawal policy.</p>
          </div>
          <div className="card">
            <p>
              Provide the statutory withdrawal information and model withdrawal
              form for consumer distance contracts. Ensure the content is easily
              accessible. From 19 June 2026, a visible withdrawal button is
              required for relevant consumer contracts.
            </p>
            <p className="section-note">
              Note: This is not legal advice. Please have the final withdrawal
              policy reviewed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
