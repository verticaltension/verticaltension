export default function Privacy() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Privacy</span>
            <h1>Privacy Policy / Datenschutzerklärung</h1>
            <p>
              This page is a placeholder for your GDPR-compliant privacy policy.
              Replace the content with a policy that accurately reflects your
              data processing activities. A German version is provided below.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Legal Bases / Rechtsgrundlagen</h2>
            <ul>
              <li>GDPR (Art. 13/14)</li>
              <li>TDDDG (cookie and tracking rules)</li>
              <li>Server logs, contact forms, newsletters</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Privacy Policy (English)</h2>
            <p>
              Placeholder text. Please replace this section with your actual
              privacy policy tailored to your data processing activities.
            </p>
          </div>
          <div className="card">
            <p>
              A privacy policy should cover processing of personal data
              (analytics, contact forms, newsletters, server logs), legal bases,
              retention periods, and rights of data subjects. Requirements change
              frequently (e.g., Schrems II, tracking consent rules), so use a
              current generator or legal counsel.
            </p>
            <p className="section-note">
              Note: This is not legal advice. Please have the final privacy
              policy reviewed.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Datenschutzerklärung (Deutsch)</h2>
            <p>
              Platzhaltertext. Bitte ersetzen Sie den Inhalt durch eine
              individuelle, DSGVO-konforme Erklärung.
            </p>
          </div>
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
