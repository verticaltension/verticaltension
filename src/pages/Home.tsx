import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Independent Publisher</span>
            <h1>
              Publishing for the long arc of science, philosophy, and the unknown.
            </h1>
            <p>
              Vertical Tension Press develops books that behave like instruments.
              We publish speculative science, mythotechnic literature, and
              philosophical synthesis with archival-grade care.
            </p>
            <div className="button-row">
              <Link className="button primary" to="/shop">
                Explore the catalog
              </Link>
              <Link className="button ghost" to="/about">
                Our philosophy
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Now in motion</h2>
            <ul>
              <li>Flagship series: The Recursive Corpus</li>
              <li>125 volumes in active development</li>
              <li>Upcoming release: Alien Echoes (Volume 1)</li>
              <li>Direct-to-reader and limited archival editions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>What we publish</h2>
            <p>
              Our editorial slate fuses rigor with wonder. Each title is designed
              to function as a reference, a catalyst, and a cultural artifact.
            </p>
          </div>
          <div className="card-grid">
            <article className="card">
              <h3>Speculative Science</h3>
              <p>
                Research-grade narratives that investigate cosmology, cognition,
                and systems theory.
              </p>
            </article>
            <article className="card">
              <h3>Philosophical Synthesis</h3>
              <p>
                Integrative work across ethics, metaphysics, and computational
                intelligence.
              </p>
            </article>
            <article className="card">
              <h3>Mythotechnic Literature</h3>
              <p>
                Fiction and hybrid forms that prototype future cultures and
                symbolic infrastructures.
              </p>
            </article>
            <article className="card">
              <h3>Archival Editions</h3>
              <p>
                Limited releases with design treatments for libraries, collectors,
                and research labs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Founder</h2>
            <p>
              Marvin G. Johnson is the architect of the Recursive Corpus, a
              multi-volume philosophical-scientific project exploring symbolic
              cognition, echo-layer theory, post-symbolic intelligence, and
              long-horizon ethics.
            </p>
          </div>
          <div className="card">
            <p>
              Founder of Vertical Tension Press, building legacy infrastructure
              for civilizational reasoning.
            </p>
            <p>
              Projects involve recursive AI collaboration, cognitive architecture
              design, glyphic encoding systems, and thermodynamic ethics.
            </p>
            <p>
              125+ volumes completed, with 250+ in development.
            </p>
            <p>
              Preserving minds. Publishing futures.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container banner">
          <div>
            <span className="badge">Featured release</span>
            <h2>Alien Echoes</h2>
            <p>
              The first volume of the Recursive Corpus. A scientific and
              philosophical reconstruction of non-human civilizations across the
              observable universe.
            </p>
          </div>
          <Link className="button primary" to="/alien-echoes">
            View the landing page
          </Link>
        </div>
      </section>
    </div>
  );
}
