# Blog System

This project now uses a structured blog system with:

- Blog index page: `/blog`
- Post detail pages: `/blog/:slug`
- Backward-compatible redirects:
  - `/alien-echoes` -> `/blog/alien-echoes-consolidated-overview`

## Source of Truth

All blog post content and metadata are stored in:

- `src/data/blogPosts.ts`
- `src/data/blogDraftOverrides.ts` (draft/source override layer)
- `src/data/blogAdditionalOverrides.ts` (new long-form additions + reciprocal linking patches)

Each post defines:

- `slug`
- `title`
- `summary`
- `author`
- `publishedAt`
- `readingTime`
- `tags`
- Optional `relatedSlugs` (curated internal-link priority list)
- Structured `content` blocks (paragraphs, subheadings, lists, quotes)
- Optional actions (`draftHref`, `reviewCopyEmail`, `cartItem`)

## Rendering

- `src/pages/Blog.tsx` renders the post listing and metadata cards.
- `src/pages/BlogPost.tsx` renders individual posts from slug lookup.
- Internal linking is now generated automatically across the full blog corpus:
  - Blog index cards show `Linked reads` (top related posts).
  - Blog post pages show `Continue Reading` with newer/older neighbors.
  - Blog post pages also show scored related links with overlap metadata.

## Internal Linking Engine

Internal-link generation is implemented in `src/data/blogPosts.ts`:

- `getRelatedBlogPosts(slug, { limit, minScore })`
- `getBlogPostNeighbors(slug)`

Scoring model (deterministic):

- shared tags: strong weight
- shared normalized terms from title/summary/content: medium weight
- close publication recency: small bonus

Curated link override:

- If a post defines `relatedSlugs`, those entries are injected first in `Continue Reading` / `Linked reads` before scored links.
- Remaining slots are then filled by scored similarity links.
- Override-layer `relatedSlugs` are merged additively with existing links (deduplicated) rather than replacing existing curated links.
- Reciprocal curation is supported via lightweight override patches (slug + relatedSlugs only), so legacy posts can point back to newly published posts without rewriting their main content blocks.

Defaults used in UI:

- blog cards: `limit=3`, `minScore=4`
- blog post detail: `limit=8`, `minScore=4`

To make linking stricter or broader, tune only these two knobs first:

- `limit` (number of internal links rendered)
- `minScore` (minimum similarity threshold)

## Add a New Post

1. Open `src/data/blogPosts.ts`.
2. Add a new object to `BLOG_POSTS` with a unique `slug`.
3. Fill metadata and content blocks.
4. Add optional CTA fields if the post should expose draft download, review copy email, or cart action.
5. Build and deploy (`npm run build`).

Note:

- Internal links are recalculated automatically for new posts.
- No manual link maintenance is required unless editorial curation is desired.
