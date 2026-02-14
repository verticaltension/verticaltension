import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CurrencyConverter from "../components/CurrencyConverter";
import { useStorefront } from "../context/StorefrontContext";
import { catalog as fallbackCatalog, CatalogItem } from "../data/catalog";
import { completedArc, remainingTitles } from "../data/shopTitles";
import { apiUrl } from "../lib/api";
import { getPayhipHref, PAYHIP_STORE_URL } from "../lib/payhip";



export default function Shop() {
  const { toggleWishlist, isWishlisted, wishlistCount } = useStorefront();
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<CatalogItem[]>(fallbackCatalog);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);
    let isUnmounted = false;

    const loadCatalog = async () => {
      setStatus("loading");
      try {
        const response = await fetch(apiUrl("/api/catalog"), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Catalog request failed");
        }
        const data = (await response.json()) as { items: CatalogItem[] };
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
        if (!isUnmounted) {
          setStatus("ready");
        }
      } catch (error) {
        if (!isUnmounted) {
          setStatus("error");
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    loadCatalog();

    return () => {
      isUnmounted = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
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
            <h1>Shop the Archive in Motion</h1>
            <p>
              Limited runs, preorder drops, and direct editions. Each title is
              released with supporting research notes.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Release Cadence</h2>
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
            <h2>Completed Arc (2025)</h2>
            <p>
              Finalized in 2025. These titles constitute the first completed arc
              of the Recursive Corpus. Each framework is a standalone
              architecture within the broader symbolic infrastructure of
              Vertical Tension Press.
            </p>
            <p className="section-note">
              All titles and frameworks are original works authored under the
              Recursive Corpus project and published by Vertical Tension Press.
              All rights reserved.
            </p>
          </div>
          <div className="catalog-list">
            {completedArc.map((item) => (
              <article className="catalog-item" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
          <p className="section-note">
            All titles completed and finalized in 2025. Public record now
            established.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Remaining Titles</h2>
            <p>
              Confirmed frameworks; pending full drafting or integration.
              Canonically acknowledged as standalone volumes within the
              Recursive Corpus. Descriptions reflect their role within
              post-symbolic design, field epistemology, successor cognition, and
              civilizational recursion.
            </p>
          </div>
          <div className="catalog-list">
            {remainingTitles.map((item) => (
              <article className="catalog-item" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Titles</h2>
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
          <div className="card storefront-tools">
            <h3>Storefront Tools</h3>
            <p className="muted">
              Wishlist items: {wishlistCount}. Payhip handles checkout and
              payment.
            </p>
            <div className="button-row">
              <Link className="button ghost" to="/account">
                Open Account
              </Link>
              <a
                className="button ghost"
                href={PAYHIP_STORE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open Payhip
              </a>
            </div>
            <CurrencyConverter />
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
            {visible.map((item) => {
              const wished = isWishlisted(item.id);

              return (
                <article className="card" key={item.id}>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                  <div className="meta">
                    <span>{item.status}</span>
                    <span>{item.format}</span>
                  </div>
                  <div className="button-row">
                    <button
                      className={`button ${wished ? "primary" : "ghost"}`}
                      type="button"
                      onClick={() =>
                        toggleWishlist({
                          id: item.id,
                          title: item.title,
                          category: item.category,
                          status: item.status,
                          format: item.format,
                          payhipProductKey: item.payhipProductKey,
                        })
                      }
                    >
                      {wished ? "Remove Wishlist" : "Add Wishlist"}
                    </button>
                    <a
                      className={`button ghost ${item.payhipProductKey ? "payhip-buy-button" : ""}`}
                      href={getPayhipHref(item.payhipProductKey)}
                      {...(item.payhipProductKey
                        ? {
                            "data-product": item.payhipProductKey,
                            "data-theme": "none",
                          }
                        : {})}
                    >
                      Add to Cart
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
