import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlogPostBySlug } from "../data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const [shareStatus, setShareStatus] = useState("");

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

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://verticaltension.com/blog/${post.slug}`;

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: shareUrl,
        });
        setShareStatus("");
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("Link copied to clipboard.");
        return;
      }

      setShareStatus("Sharing is not supported on this device.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("");
        return;
      }

      setShareStatus("Unable to share this post right now.");
    }
  };

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
            <div className="button-row blog-share-row">
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  void handleShare();
                }}
              >
                Share Post
              </button>
              <Link className="button ghost" to="/blog">
                Back to Blog
              </Link>
            </div>
            {shareStatus && (
              <p className="muted blog-share-status" role="status" aria-live="polite">
                {shareStatus}
              </p>
            )}
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
    </div>
  );
}
