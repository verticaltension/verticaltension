import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts } from "../data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Blog() {
  const [query, setQuery] = useState("");
  const posts = getBlogPosts();
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.summary,
        post.author,
        post.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, posts]);

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Blog</span>
            <h1>Field Notes from the Recursive Corpus.</h1>
            <p>
              Long-form posts, consolidated abstracts, and research dispatches
              from Vertical Tension Press.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Editorial Direction</h2>
            <ul>
              <li>Consolidated synthesis posts</li>
              <li>Release notes and corpus milestones</li>
              <li>Symbolic design and xeno-ethical frameworks</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Latest Posts</h2>
            <div className="blog-search-controls">
              <input
                className="blog-search-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, summary, or tag"
                aria-label="Search blog posts"
              />
              {query && (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setQuery("")}
                >
                  Clear
                </button>
              )}
            </div>
            <p className="muted blog-search-meta">
              {visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"}
              {normalizedQuery ? ` matching "${query.trim()}"` : ""}
            </p>
          </div>
          {visiblePosts.length === 0 ? (
            <div className="card">
              <h3>No posts found</h3>
              <p className="muted">
                Try a different keyword or clear the search to view all posts.
              </p>
            </div>
          ) : (
            <div className="blog-grid">
              {visiblePosts.map((post) => (
              <article className="card blog-card" key={post.slug}>
                <span className="badge">Post</span>
                <h3>{post.title}</h3>
                <p className="muted">{post.summary}</p>
                <p className="blog-meta">
                  {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
                  {post.readingTime}
                </p>
                <div className="blog-tag-row">
                  {post.tags.map((tag) => (
                    <span className="blog-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="button-row">
                  <Link className="button primary" to={`/blog/${post.slug}`}>
                    Read Post
                  </Link>
                </div>
              </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
