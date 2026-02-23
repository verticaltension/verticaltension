import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStorefront } from "../context/StorefrontContext";
import { consumeCheckoutPending, getCheckoutSuccessUrl } from "../lib/payhip";
import { siteIdentity } from "../config/siteIdentity";

export default function ThankYou() {
  const { clearCart } = useStorefront();

  useEffect(() => {
    if (consumeCheckoutPending()) {
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Order Confirmed</span>
            <h1>Thank you for your purchase.</h1>
            <p>
              Your checkout was completed on Payhip. A receipt and order details
              should be in your email.
            </p>
          </div>
          <div className="hero-panel">
            <h2>What Happens Next</h2>
            <ul>
              <li>Payhip sends confirmation and payment receipt by email</li>
              <li>Digital access and downloads follow your Payhip settings</li>
              <li>Physical orders proceed to shipping fulfillment</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container card-grid">
          <article className="card">
            <h3>Continue Browsing</h3>
            <p className="muted">
              Return to the catalog to explore more titles and add additional
              volumes to your next order.
            </p>
            <div className="button-row">
              <Link className="button primary" to="/shop">
                Continue Shopping
              </Link>
            </div>
          </article>

          <article className="card">
            <h3>Need Support?</h3>
            <p className="muted">
              For receipt, delivery, or product questions, contact us and include
              your Payhip order details.
            </p>
            <div className="button-row">
              <a className="button ghost" href={siteIdentity.contact.emailHref}>
                Contact Support
              </a>
            </div>
          </article>

          <article className="card">
            <h3>Checkout Redirect URL</h3>
            <p className="muted">
              Configure this URL in your Payhip checkout settings so customers
              return here after purchase:
            </p>
            <p>
              <code>{getCheckoutSuccessUrl()}</code>
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
