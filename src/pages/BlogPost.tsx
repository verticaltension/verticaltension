import { Link, useParams } from "react-router-dom";
import { getBlogPostBySlug } from "../data/blogPosts";
import { useStorefront } from "../context/StorefrontContext";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function BlogPost() {
  const { slug } = useParams();
  const { addToCart, isInCart } = useStorefront();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="page">
        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Post Not Found</h2>
              <p className="muted">
                The requested blog post could not be located.
              </p>
              <div className="button-row">
                <Link className="button primary" to="/blog">
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const cartItem = post.cartItem;
  const inCart = cartItem ? isInCart(cartItem.id) : false;

  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <div className="section-head blog-post-head">
            <span className="badge">Blog Post</span>
            <h1>{post.title}</h1>
            <p>{post.summary}</p>
            <p className="blog-meta">
              {dateFormatter.format(new Date(post.publishedAt))} · {post.author}{" "}
              · {post.readingTime}
            </p>
            <div className="blog-tag-row">
              {post.tags.map((tag) => (
                <span className="blog-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card blog-content">
            {post.content.map((block, index) => {
              if (block.type === "paragraph") {
                return <p key={index}>{block.text}</p>;
              }

              if (block.type === "subheading") {
                return <h2 key={index}>{block.text}</h2>;
              }

              if (block.type === "list") {
                return (
                  <ul key={index}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }

              return <blockquote key={index}>{block.text}</blockquote>;
            })}
          </article>
        </div>
      </section>

      {(post.draftHref || post.reviewCopyEmail || cartItem) && (
        <section className="section">
          <div className="container banner">
            <div>
              <span className="badge">Post Actions</span>
              <h2>Read, Request, or Collect</h2>
              <p>
                Access the draft edition, request a review copy, or add this
                volume to your on-site cart.
              </p>
            </div>
            <div className="button-row">
              {cartItem && (
                <button
                  className={`button ${inCart ? "primary" : "ghost"}`}
                  type="button"
                  onClick={() => addToCart(cartItem)}
                >
                  {inCart ? "In Cart" : "Add to Cart"}
                </button>
              )}
              {post.draftHref && (
                <a className="button primary" href={post.draftHref}>
                  Read Draft PDF
                </a>
              )}
              {post.reviewCopyEmail && (
                <a
                  className="button ghost"
                  href={`mailto:${post.reviewCopyEmail}`}
                >
                  Request Review Copy
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
