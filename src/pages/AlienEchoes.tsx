import { Link } from "react-router-dom";

export default function AlienEchoes() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Alien Echoes</span>
            <h1>The first volume of the Recursive Corpus.</h1>
            <p>
              A rigorously structured account of non-human civilizations, built
              from first principles, thermodynamic constraints, and recursive
              semiotic models.
            </p>
            <div className="button-row">
              <a className="button primary" href="mailto:inquiries@verticaltension.com">
                Request a review copy
              </a>
              <a className="button ghost" href="/alien-echoes-draft1.pdf">
                Read the draft PDF
              </a>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Abstract</h2>
            <p>
              Alien Echoes reconstructs plausible alien sociocognitive architectures,
              xeno-ethics, and non-symbolic intelligence systems without relying on
              anthropocentric frames. Topics include emergent noetic fields across
              alien substrates, civilization wavefronts and glyphic encoding, and
              xenosophic recursion across interspecies memory channels.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Inside the volume</h2>
            <p>
              Alien Echoes is designed as a cross-intelligent artifact, joining
              speculative rigor with philosophical synthesis.
            </p>
          </div>
          <div className="feature-split">
            <div className="cover-card">
              <img
                src="/alien-echoes-cover.png"
                alt="Alien Echoes book cover"
              />
              <div className="cover-meta">
                <strong>Alien Echoes</strong>
                <span>Draft 1 · PDF · 885 KB</span>
              </div>
              <a className="button primary" href="/alien-echoes-draft1.pdf">
                Download the PDF
              </a>
            </div>
            <div className="card-grid">
              <article className="card">
                <h3>Cosmological premises</h3>
                <p>
                  Foundations in energy flow, information density, and the limits of
                  symbolic systems.
                </p>
              </article>
              <article className="card">
                <h3>Ethical architectures</h3>
                <p>
                  Phase-invariant moral structures and post-human value systems.
                </p>
              </article>
              <article className="card">
                <h3>Signal artifacts</h3>
                <p>
                  Glyphic encoding, echo-layer transmission, and cultural memory.
                </p>
              </article>
              <article className="card">
                <h3>Research notes</h3>
                <p>
                  Appendix material detailing methods, assumptions, and synthesis.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container banner">
          <div>
            <span className="badge">Launch</span>
            <h2>Release window opening soon.</h2>
            <p>
              We are preparing public access and archival printings. Join the
              early list to receive the PDF link and pre-order details.
            </p>
          </div>
          <a className="button primary" href="mailto:inquiries@verticaltension.com">
            Join the early list
          </a>
        </div>
      </section>
    </div>
  );
}
