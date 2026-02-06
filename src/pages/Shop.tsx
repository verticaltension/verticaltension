import { useEffect, useMemo, useState } from "react";
import { catalog as fallbackCatalog, CatalogItem } from "../data/catalog";

export default function Shop() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<CatalogItem[]>(fallbackCatalog);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );

  useEffect(() => {
    const loadCatalog = async () => {
      setStatus("loading");
      try {
        const response = await fetch("/api/catalog");
        if (!response.ok) {
          throw new Error("Catalog request failed");
        }
        const data = (await response.json()) as { items: CatalogItem[] };
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    };

    loadCatalog();
  }, []);
  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items]
  );

  const visible = items.filter((item) =>
    filter === "All" ? true : item.category === filter
  );

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Catalog</span>
            <h1>Shop the archive in motion.</h1>
            <p>
              Limited runs, preorder drops, and direct editions. Each title is
              released with supporting research notes.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Release cadence</h2>
            <ul>
              <li>Quarterly drops with early access bundles</li>
              <li>Collector printings for flagship volumes</li>
              <li>Digital and physical launch sequences</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured titles</h2>
            <p>
              Filter by series or discipline. The catalog is structured to scale
              as new volumes are published.
            </p>
            {status === "loading" && (
              <p className="muted">Syncing the live catalog.</p>
            )}
            {status === "error" && (
              <p className="muted">Showing the cached catalog.</p>
            )}
          </div>
          <div className="filter-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`pill ${filter === category ? "active" : ""}`}
                type="button"
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="card-grid">
            {visible.map((item) => (
              <article className="card" key={item.id}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
                <div className="meta">
                  <span>{item.status}</span>
                  <span>{item.format}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
