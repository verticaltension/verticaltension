# Social Platform Application Texts (Reusable)

Last updated: 2026-03-02
Project: Vertical Tension Press

## Policy Links

- Terms: https://verticaltension.com/terms
- Privacy: https://verticaltension.com/privacy

## Reddit - Long-Form Paragraph Answers

### Current Use of Reddit Data
At present, our use of Reddit data is limited and pre-production. We are not running large-scale collection, scraping, resale, or model-training pipelines on Reddit content. The intended API use is primarily OAuth-authenticated publishing of our own first-party editorial posts, plus minimal operational data needed to run the integration responsibly, such as post status responses, basic error handling, and rate-limit headers. In short, the goal is reliable publishing workflow management rather than broad data extraction.

### Company Description
Vertical Tension Press is a small independent publishing operation run by a single founder. We produce long-form written content in philosophy, culture, and social analysis, and we distribute this work through our own website and selected social channels. The company is editorially focused and quality-driven, with a simple objective: make serious written ideas more discoverable and accessible in a clear, structured format.

### Purpose of Product or Service
Our product is a lightweight publishing operations system that helps us manage distribution of our own content across platforms from one control plane. The purpose is to automate routine publishing steps, maintain compliance with platform policies, reduce manual errors, and improve consistency in posting cadence. For Reddit specifically, this means posting our own summaries and links in appropriate communities, while respecting subreddit norms, API limits, and user trust.

### What We Deliver to Customers
We deliver original editorial content: essays, analyses, and structured commentary published on our site and shared through social channels. Customers receive curated, readable, first-party material with clear attribution and canonical links to the source publication. We do not sell Reddit user data, build profile dossiers, or provide downstream data brokerage services; our value is the content itself and the clarity of its distribution.

### What We Plan to Distribute, Where, and to Which Audience
We plan to distribute short post summaries, contextual intros, and links to full articles, with occasional visual snippets where relevant. Distribution will occur on our owned web property and selected social platforms, including Reddit communities where the subject matter is a fit and participation rules permit. Our expected audience is a niche but growing group of readers interested in philosophy, ethics, culture, and long-form intellectual discussion; initial volume is modest and intentionally paced to remain compliant and non-disruptive.

## Reddit - API Budget Answer

Recommended initial value:
- Daily budget: `1,000 requests/day`
- Monthly budget: `30,000 requests/month` (if asked)

Justification text:
Bootstrap solo publisher, low-volume first-party content distribution, no scraping/resale, conservative initial API budget with monitored rate-limit compliance.

## TikTok - 120 Character App Description

Vertical Tension Press publishes philosophy essays; users browse articles and share selected posts across social platforms.

## TikTok - Scope Explanation (<=1000 chars)

Vertical Tension Press is a publishing website. Our TikTok integration is used only for first-party content distribution from our own account(s). `user.info.basic` is used to link the creator account and show basic profile details so we can verify the correct account is connected. `video.publish` is used to upload/publish short videos about our own editorial content, initiated by our authenticated admin workflow and handled with policy/rate-limit safeguards. `video.list` is used to read recent post IDs/status for delivery verification, duplicate prevention, and audit logs in our admin panel. We do not access DMs or unrelated user data, and we do not scrape or resell data. If this is a revision: we added stricter duplicate-post prevention, clearer consent/audit logging, and safer retry/rate-limit behavior.

## Notes

- Keep these texts versioned and update only when product behavior materially changes.
- If platform forms ask for a demo video, attach a short operator flow recording from SocialOps.
