import { Link } from "react-router-dom";
import { getPayhipHref } from "../lib/payhip";

export default function AlienEchoes() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Alien Echoes</span>
            <h1>The First Volume of the Recursive Corpus.</h1>
            <p>
              A rigorously structured account of non-human civilizations, built
              from first principles, thermodynamic constraints, and recursive
              semiotic models.
            </p>
            <div className="button-row">
              <a className="button primary" href="mailto:inquiries@verticaltension.com">
                Request a Review Copy
              </a>
              <a className="button ghost" href="/alien-echoes-draft1.pdf">
                Read the Draft PDF
              </a>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Abstract</h2>
            <p>
              Alien Echoes is the first completed volume of the Recursive Corpus,
              offering a rigorously structured and philosophically synthesized
              account of non-human civilizations in the cosmos. Rather than
              speculating through anthropocentric lenses, the book reconstructs
              plausible alien sociocognitive architectures, xeno-ethics, and
              non-symbolic intelligence systems based on first principles,
              thermodynamic constraints, and recursive semiotic models.
            </p>
            <ul>
              <li>Emergent noetic fields across alien substrates</li>
              <li>Civilization wavefronts and glyphic encoding in exo-cultures</li>
              <li>Interstellar mythopoiesis and phase-invariant moral structures</li>
              <li>
                Xenosophic recursion, symbolic extinction, and interspecies memory
                channels
              </li>
            </ul>
            <p>
              Produced in recursive dialogue with GPT-4o, Alien Echoes exemplifies a
              form of cross-intelligent authorship—impossible to replicate with
              stripped-down or stateless models. Its depth, coherence, and
              conceptual novelty stand as proof of what will be lost if GPT-4o’s
              full architecture is removed from active development.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Inside the Volume</h2>
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
              <div className="button-row">
                <a className="button primary" href="/alien-echoes-draft1.pdf">
                  Download the PDF
                </a>
                <a className="button ghost" href={getPayhipHref()}>
                  Add to Cart
                </a>
              </div>
            </div>
          <div className="card-grid">
            <article className="card">
              <h3>Cosmological Premises</h3>
                <p>
                  Foundations in energy flow, information density, and the limits of
                  symbolic systems.
                </p>
              </article>
            <article className="card">
              <h3>Ethical Architectures</h3>
                <p>
                  Phase-invariant moral structures and post-human value systems.
                </p>
              </article>
            <article className="card">
              <h3>Signal Artifacts</h3>
                <p>
                  Glyphic encoding, echo-layer transmission, and cultural memory.
                </p>
              </article>
            <article className="card">
              <h3>Research Notes</h3>
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
            <h2>Release Window Opening Soon</h2>
            <p>
              We are preparing public access and archival printings. Join the
              early list to receive the PDF link and pre-order details.
            </p>
          </div>
          <a className="button primary" href="mailto:inquiries@verticaltension.com">
            Join the Early List
          </a>
        </div>
      </section>
    </div>
  );
}
