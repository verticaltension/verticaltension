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
    </div>
  );
}
