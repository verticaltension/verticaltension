export default function Privacy() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Datenschutz</span>
            <h1>Datenschutzerklärung</h1>
            <p>
              Diese Seite dient als Platzhalter für die DSGVO-konforme
              Datenschutzerklärung. Bitte ersetzen Sie den Inhalt durch eine
              individuelle Erklärung, die Ihre tatsächliche Datenverarbeitung
              abbildet.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Rechtsgrundlagen</h2>
            <ul>
              <li>DSGVO (Art. 13/14)</li>
              <li>TDDDG (Cookie- & Tracking-Regeln)</li>
              <li>Server-Logs, Kontaktformulare, Newsletter</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card">
            <p>
              Datenschutzerklärung – immer DSGVO-konform, sehr umfangreich. Nutzen
              Sie aktuelle Generatoren (z. B. eRecht24, Händlerbund, activeMind,
              Dr. Schwenke), da sich Tracking-Tools, US-Transfers (Schrems II) und
              TTDSG/TDDDG laufend ändern.
            </p>
            <p>
              Eine englische Version wird meist unter „Privacy Policy“
              bereitgestellt, insbesondere bei .com/.eu-Domains oder
              englischsprachigem Angebot.
            </p>
            <p className="section-note">
              Hinweis: Dies ist keine Rechtsberatung. Bitte lassen Sie die finale
              Datenschutzerklärung prüfen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
