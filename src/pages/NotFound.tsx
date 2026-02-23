import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">404</span>
            <h1>Page not found</h1>
            <p>
              The page you requested does not exist or has moved. Continue to the
              catalog or return to the homepage.
            </p>
            <div className="button-row">
              <Link className="button primary" to="/">
                Back to Home
              </Link>
              <Link className="button ghost" to="/shop">
                Open Shop
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Need Help?</h2>
            <p className="muted">
              Use the contact page for support regarding broken links or order
              navigation.
            </p>
            <Link className="button ghost" to="/contact">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
