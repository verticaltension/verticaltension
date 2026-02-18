import { Link } from "react-router-dom";
import { getBlogPosts } from "../data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Blog() {
  const posts = getBlogPosts();

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
            <p>
              Each post has a dedicated permalink and archival metadata.
            </p>
          </div>
          <div className="blog-grid">
            {posts.map((post) => (
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
        </div>
      </section>
    </div>
  );
}
