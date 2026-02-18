# Blog System

This project now uses a structured blog system with:

- Blog index page: `/blog`
- Post detail pages: `/blog/:slug`
- Backward-compatible redirects:
  - `/alien-echoes` -> `/blog/alien-echoes-consolidated-overview`

## Source of Truth

All blog post content and metadata are stored in:

- `src/data/blogPosts.ts`

Each post defines:

- `slug`
- `title`
- `summary`
- `author`
- `publishedAt`
- `readingTime`
- `tags`
- Structured `content` blocks (paragraphs, subheadings, lists, quotes)
- Optional actions (`draftHref`, `reviewCopyEmail`, `cartItem`)

## Rendering

- `src/pages/Blog.tsx` renders the post listing and metadata cards.
- `src/pages/BlogPost.tsx` renders individual posts from slug lookup.

## Add a New Post

1. Open `src/data/blogPosts.ts`.
2. Add a new object to `BLOG_POSTS` with a unique `slug`.
3. Fill metadata and content blocks.
4. Add optional CTA fields if the post should expose draft download, review copy email, or cart action.
5. Build and deploy.
