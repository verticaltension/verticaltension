import { siteIdentity } from "../config/siteIdentity";

export default function ShippingPayment() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Shipping &amp; Payment</span>
            <h1>Shipping &amp; Payment / Versand &amp; Zahlung</h1>
            <p>
              This page provides shipping, delivery, and payment information for
              storefront orders. A German version follows below.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Shipping &amp; Payment</h2>
            <ul>
              <li>Shipping costs &amp; delivery times</li>
              <li>Payment methods &amp; processing</li>
              <li>Transparent pricing incl. VAT</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Shipping &amp; Payment (English)</h2>
            <p>Operational terms for digital and physical storefront products.</p>
          </div>
          <div className="card">
            <h3>1. Digital Products</h3>
            <p>
              Digital products are delivered electronically after successful
              payment confirmation. Delivery is made via download or digital
              access according to product description.
            </p>

            <h3>2. Physical Products</h3>
            <p>
              If physical editions are offered, shipping region, dispatch
              estimate, and delivery estimate are shown in checkout and may vary
              by destination and carrier.
            </p>

            <h3>3. Shipping Costs</h3>
            <p>
              Shipping costs for physical deliveries are calculated and shown
              before order completion. No shipping costs apply to digital-only
              orders.
            </p>

            <h3>4. Payment Methods</h3>
            <p>
              Available payment methods are displayed in checkout. Payment
              processing is handled by the checkout provider used for order
              completion.
            </p>

            <h3>5. Pricing and Tax</h3>
            <p>
              Product prices are displayed transparently in the storefront.
              Applicable taxes are shown according to legal requirements and
              checkout configuration.
            </p>

            <h3>6. Order Confirmation</h3>
            <p>
              Customers receive confirmation after successful order placement.
              If confirmation is missing, contact:
              {" "}
              <a href={siteIdentity.contact.emailHref}>
                {siteIdentity.contact.email}
              </a>.
            </p>
            <p className="section-note">
              Note: Shipping and payment details should be reviewed whenever
              logistics partners, prices, or checkout flows change.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Versand &amp; Zahlung (Deutsch)</h2>
            <p>Betriebliche Bedingungen für digitale und physische Bestellungen.</p>
          </div>
          <div className="card">
            <h3>1. Digitale Produkte</h3>
            <p>
              Digitale Produkte werden nach erfolgreicher Zahlung elektronisch
              bereitgestellt. Die Bereitstellung erfolgt per Download oder
              digitalem Zugriff gemäß Produktbeschreibung.
            </p>

            <h3>2. Physische Produkte</h3>
            <p>
              Soweit physische Ausgaben angeboten werden, werden Versandgebiet,
              Versanddauer und voraussichtliche Lieferzeit im Checkout
              ausgewiesen. Die Lieferdauer kann je nach Region und
              Versanddienstleister abweichen.
            </p>

            <h3>3. Versandkosten</h3>
            <p>
              Versandkosten für physische Lieferungen werden vor Abschluss der
              Bestellung berechnet und angezeigt. Für rein digitale Bestellungen
              fallen keine Versandkosten an.
            </p>

            <h3>4. Zahlungsarten</h3>
            <p>
              Verfügbare Zahlungsarten werden im Checkout angezeigt. Die
              Zahlungsabwicklung erfolgt über den im Bestellprozess eingesetzten
              Checkout-Anbieter.
            </p>

            <h3>5. Preise und Steuern</h3>
            <p>
              Preise werden transparent in der Storefront dargestellt.
              Anfallende Steuern werden gemäß rechtlichen Vorgaben und
              Checkout-Konfiguration ausgewiesen.
            </p>

            <h3>6. Bestellbestätigung</h3>
            <p>
              Nach erfolgreicher Bestellung wird eine Bestätigung übermittelt.
              Falls keine Bestätigung eingeht, kontaktieren Sie bitte
              {" "}
              <a href={siteIdentity.contact.emailHref}>
                {siteIdentity.contact.email}
              </a>.
            </p>
            <p className="section-note">
              Hinweis: Versand- und Zahlungsbedingungen sollten bei Änderungen
              von Logistik, Preisen oder Checkout-Prozessen aktualisiert werden.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
