import { siteIdentity, siteIdentityText } from "../config/siteIdentity";

export default function Withdrawal() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Withdrawal</span>
            <h1>Right of Withdrawal / Widerrufsbelehrung</h1>
            <p>
              Information for consumers on withdrawal rights for distance
              contracts. A German version follows below.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Legal Bases / Rechtsgrundlagen</h2>
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
            <h2>Right of Withdrawal (English)</h2>
            <p>Applicable to consumer contracts concluded at a distance.</p>
          </div>
          <div className="card">
            <h3>1. Withdrawal Right</h3>
            <p>
              You have the right to withdraw from this contract within 14 days
              without giving any reason, unless a statutory exception applies.
            </p>

            <h3>2. Withdrawal Period</h3>
            <p>
              For physical goods, the withdrawal period is 14 days from the day
              on which you (or a third party named by you who is not the
              carrier) takes possession of the goods.
            </p>
            <p>
              For digital content not supplied on a physical medium, the
              withdrawal period is 14 days from the date of contract conclusion.
              The withdrawal right may expire early if performance has begun
              after explicit prior consent and acknowledgment that the right of
              withdrawal is lost once performance starts.
            </p>

            <h3>3. How to Exercise Withdrawal</h3>
            <p>
              To exercise your withdrawal right, send a clear statement (e.g.
              by email or post) to:
            </p>
            <p>
              {siteIdentity.brandName}
              <br />
              {siteIdentity.address.street}
              <br />
              {siteIdentity.address.postalCodeCity}, {siteIdentity.address.countryEN}
              <br />
              E-mail:{" "}
              <a href={siteIdentity.contact.emailHref}>{siteIdentity.contact.email}</a>
            </p>
            <p>
              You may use the model withdrawal form below, but this is not
              mandatory.
            </p>

            <h3>4. Effects of Withdrawal</h3>
            <p>
              If you withdraw, we reimburse all payments received from you,
              including standard delivery costs (if applicable), without undue
              delay and no later than 14 days from receiving your withdrawal
              notice.
            </p>
            <p>
              We may withhold reimbursement for physical goods until goods are
              returned or proof of return is provided, whichever is earlier.
            </p>

            <h3>5. Return of Goods</h3>
            <p>
              You must return physical goods without undue delay and in any
              event within 14 days from notifying us of withdrawal. You bear
              direct return shipping costs unless otherwise agreed.
            </p>

            <h3>6. Model Withdrawal Form</h3>
            <p>
              (Complete and return this form only if you wish to withdraw.)
            </p>
            <p>
              To: {siteIdentity.brandName}, {siteIdentityText.addressLineEN},{" "}
              {siteIdentity.contact.email}
            </p>
            <p>
              I/We (*) hereby give notice that I/We (*) withdraw from my/our (*)
              contract of sale of the following goods (*) / for the supply of
              the following service or digital content (*):
            </p>
            <p>
              Ordered on (*) / received on (*)<br />
              Name of consumer(s)<br />
              Address of consumer(s)<br />
              Signature of consumer(s) (only if this form is notified on paper)<br />
              Date
            </p>
            <p>(*) Delete as appropriate.</p>
            <p className="section-note">
              Note: This page provides consumer withdrawal information for
              storefront operation and should be reviewed periodically.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Widerrufsbelehrung (Deutsch)</h2>
            <p>Gilt für Verbraucherverträge im Fernabsatz.</p>
          </div>
          <div className="card">
            <h3>1. Widerrufsrecht</h3>
            <p>
              Sie haben das Recht, diesen Vertrag binnen 14 Tagen ohne Angabe
              von Gründen zu widerrufen, soweit keine gesetzliche Ausnahme
              greift.
            </p>

            <h3>2. Widerrufsfrist</h3>
            <p>
              Bei physischen Waren beträgt die Widerrufsfrist 14 Tage ab dem
              Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht
              Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
            </p>
            <p>
              Bei digitalen Inhalten, die nicht auf einem körperlichen
              Datenträger geliefert werden, beträgt die Widerrufsfrist 14 Tage
              ab Vertragsschluss. Das Widerrufsrecht kann vorzeitig erlöschen,
              wenn mit der Ausführung erst begonnen wurde, nachdem Sie
              ausdrücklich zugestimmt haben und bestätigt haben, dass Sie Ihr
              Widerrufsrecht mit Beginn der Ausführung verlieren.
            </p>

            <h3>3. Ausübung des Widerrufs</h3>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer
              eindeutigen Erklärung (z. B. per E-Mail oder Post) über Ihren
              Entschluss informieren:
            </p>
            <p>
              {siteIdentity.brandName}
              <br />
              {siteIdentity.address.street}
              <br />
              {siteIdentity.address.postalCodeCity}, {siteIdentity.address.countryDE}
              <br />
              E-Mail:{" "}
              <a href={siteIdentity.contact.emailHref}>{siteIdentity.contact.email}</a>
            </p>
            <p>
              Sie können dafür das unten stehende Muster-Widerrufsformular
              verwenden, das jedoch nicht vorgeschrieben ist.
            </p>

            <h3>4. Folgen des Widerrufs</h3>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
              die wir von Ihnen erhalten haben, einschließlich der
              Standard-Lieferkosten (soweit angefallen), unverzüglich und
              spätestens binnen 14 Tagen ab Eingang Ihres Widerrufs zu erstatten.
            </p>
            <p>
              Bei physischen Waren können wir die Rückzahlung verweigern, bis wir
              die Ware zurückerhalten haben oder bis Sie den Nachweis erbracht
              haben, dass Sie die Ware zurückgesandt haben, je nachdem, welches
              der frühere Zeitpunkt ist.
            </p>

            <h3>5. Rücksendung von Waren</h3>
            <p>
              Sie haben Waren unverzüglich und in jedem Fall spätestens binnen 14
              Tagen ab dem Tag, an dem Sie uns über den Widerruf unterrichten, an
              uns zurückzusenden oder zu übergeben. Die unmittelbaren Kosten der
              Rücksendung tragen Sie, soweit nichts anderes vereinbart wurde.
            </p>

            <h3>6. Muster-Widerrufsformular</h3>
            <p>
              (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte
              dieses Formular aus und senden Sie es zurück.)
            </p>
            <p>
              An: {siteIdentity.brandName}, {siteIdentityText.addressLineDE},{" "}
              {siteIdentity.contact.email}
            </p>
            <p>
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
              Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der
              folgenden Dienstleistung bzw. digitalen Inhalte (*):
            </p>
            <p>
              Bestellt am (*) / erhalten am (*)<br />
              Name des/der Verbraucher(s)<br />
              Anschrift des/der Verbraucher(s)<br />
              Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br />
              Datum
            </p>
            <p>(*) Unzutreffendes streichen.</p>
            <p className="section-note">
              Hinweis: Diese Seite enthält Widerrufsinformationen für den
              Storefront-Betrieb und sollte regelmäßig geprüft werden.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
