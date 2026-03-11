import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts, getRelatedBlogPosts } from "../data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Blog() {
  const [query, setQuery] = useState("");
  const posts = getBlogPosts();
  const normalizedQuery = normalizeSearchText(query);

  const indexedPosts = useMemo(() => {
    return posts.map((post) => {
      const contentText = post.content
        .map((block) => (block.type === "list" ? block.items.join(" ") : block.text))
        .join(" ");

      const searchableText = normalizeSearchText(
        [
          post.title,
          post.summary,
          post.author,
          post.slug.replace(/-/g, " "),
          post.tags.join(" "),
          contentText,
        ].join(" "),
      );

      const tokenSet = new Set(searchableText.split(" ").filter(Boolean));

      return {
        post,
        searchableText,
        tokenSet,
      };
    });
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    const queryTokens = Array.from(new Set(normalizedQuery.split(" ").filter(Boolean)));
    return indexedPosts
      .filter(({ searchableText, tokenSet }) => {
        if (searchableText.includes(normalizedQuery)) {
          return true;
        }

        return queryTokens.every((token) => {
          if (searchableText.includes(token)) {
            return true;
          }
          for (const indexedToken of tokenSet) {
            if (indexedToken.startsWith(token) || token.startsWith(indexedToken)) {
              return true;
            }
          }
          return false;
        });
      })
      .map(({ post }) => post);
  }, [indexedPosts, normalizedQuery, posts]);

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
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, summary, content, tag, or slug"
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
              {visiblePosts.map((post) => {
                const related = getRelatedBlogPosts(post.slug, { limit: 3, minScore: 4 });

                return (
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

                    {related.length > 0 && (
                      <div className="blog-card-internal-links" aria-label="Related posts">
                        <p className="muted blog-card-internal-links-title">Linked reads</p>
                        <ul>
                          {related.map((entry) => (
                            <li key={entry.slug}>
                              <Link to={`/blog/${entry.slug}`}>{entry.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function normalizeSearchText(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
