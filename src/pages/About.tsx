export default function About() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Our origin</span>
            <h1>A press for unsimplified ideas.</h1>
            <p>
              Vertical Tension Press exists to publish work that resists reduction.
              We cultivate books that carry conceptual weight, aesthetic precision,
              and a clear orientation toward long-arc research.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Editorial stance</h2>
            <ul>
              <li>Publish ideas that challenge institutional gravity.</li>
              <li>Blend speculative research with poetic clarity.</li>
              <li>Preserve the identity of long-arc projects.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Principles</h2>
            <p>
              We operate like a studio rather than a factory. Each title is
              developed with a careful editorial arc and a commitment to longevity.
            </p>
          </div>
          <div className="card-grid">
            <article className="card">
              <h3>Depth over velocity</h3>
              <p>Coherence, polish, and evidence-based imagination over speed.</p>
            </article>
            <article className="card">
              <h3>Cross-domain literacy</h3>
              <p>Science, philosophy, and culture are treated as interlocking lenses.</p>
            </article>
            <article className="card">
              <h3>Archive-grade design</h3>
              <p>Print and digital releases are crafted for longevity and citation.</p>
            </article>
            <article className="card">
              <h3>Signal stewardship</h3>
              <p>We publish to safeguard emergent knowledge during volatile transitions.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
