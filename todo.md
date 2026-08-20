# Website SEO scaffold status

This file records the SEO scaffold status. It is not a queue for local models. Make concrete repo changes directly, then update this file only when the status or guardrails change.

## Goal

Make the site easier for Google, AI answer systems, and technical visitors to understand. The immediate fix is crawl and entity scaffolding: sitemap, robots, canonical URLs, and structured data.

Current baseline from the growth scan:

- Organic visibility: 18/100.
- Missing organic pages: 24/100.
- AI answer citations: 0/6 model mentions.
- Monthly organic visitors: 0 measured visitors/month because analytics and Search Console are not connected yet.

This is not a content-spam task. Keep the site personal, accurate, and reviewable.

## What is already scaffolded

The first scaffold pass adds:

- `sitemap.xml` at the repo root.
- `robots.txt` at the repo root.
- `assets/js/seo-schema.js` as a shared starter for canonical links and JSON-LD.
- A loader for `assets/js/seo-schema.js` inside `assets/js/site-style.js`, so pages that already use the shared nav/footer script also get the SEO scaffold.

GitHub Pages will host the root files automatically after merge. No separate hosting provider is needed.

Expected live URLs after merge:

- `https://pymite6941.is-a.dev/sitemap.xml`
- `https://pymite6941.is-a.dev/robots.txt`

After Google Search Console is connected, submit the sitemap URL there.

## Phase 1: verify the scaffold

Status: Done.

Check these before adding more content:

- Open `sitemap.xml` and confirm the listed pages are real public pages.
- Open `robots.txt` and confirm it points to the live sitemap URL.
- Open a local page and check the console for errors from `seo-schema.js`.
- View page source or inspect the DOM and confirm a canonical link is present.
- Inspect the DOM and confirm a JSON-LD script appears with `Person`, `WebSite`, and `WebPage` data.

Acceptance:

- `git diff --check` passes.
- `sitemap.xml` parses as valid XML.
- `assets/js/seo-schema.js` passes a JavaScript syntax check.
- The site still works if JavaScript loads slowly or fails.

## Phase 2: make the important canonical tags static

Status: Done. The original four pages are covered, and the current PR also covers the substantive project pages.

The shared JS scaffold is useful because it gives every page a safety net. For the highest-priority pages, static canonical tags in the HTML head are better.

Add static canonical links to these pages first:

- `index.html`
- `pages/projects.html`
- `pages/about-me.html`
- `pages/project-pages/finance_kit.html`

Use these live URLs:

- `https://pymite6941.is-a.dev/`
- `https://pymite6941.is-a.dev/pages/projects.html`
- `https://pymite6941.is-a.dev/pages/about-me.html`
- `https://pymite6941.is-a.dev/pages/project-pages/finance_kit.html`

Acceptance:

- Each page has exactly one canonical link.
- Local relative links still work.
- No absolute internal navigation links are introduced.

## Crawl-ready checklist for every public page

Before treating any page as ready for Google or AI crawlers, make sure it has:

- Exactly one static canonical URL.
- One unique, accurate `<title>`.
- One concise meta description based on the visible page content.
- One clear `<h1>` that matches the page topic.
- At least one link back to Projects, About, or a closely related proof page.
- A sitemap entry only if the page is useful as a search landing page.
- Structured data only when the visible page supports the claim.

Do not mark a page crawl-ready if its metadata describes a stronger page than the one visitors can actually read.

## Phase 3: expand structured data carefully

Status: Done for the strongest current proof pages. Keep extending it only when a page has visible facts that support the schema.

Use only facts already present on the site or supplied by Matt.

Good structured data candidates:

- `Person` for Matt Gresham.
- `WebSite` for the website.
- `CollectionPage` for the projects page.
- `AboutPage` for `pages/about-me.html`.
- `SoftwareApplication` or `CreativeWork` for strong project pages like Finance Kit, Connect 4 Bot, Study Tools, and Markdown to HTML Converter.

Do not add:

- Customer claims.
- Revenue claims.
- Employment claims.
- Awards that are not already documented.
- Fake ratings, reviews, pricing, or usage counts.

Acceptance:

- The JSON-LD validates in a schema validator.
- The schema describes the page content accurately.
- The same `Person` identity is reused across pages with the same `@id`.

## Phase 4: decide what belongs in the sitemap

Status: Done for the current public sitemap. Daily prompt pages are still intentionally excluded unless a future pass makes them useful search landing pages.

The starter sitemap lists the main public pages, project pages, hackathon pages, and dev-doc pages. It does not list every daily prompt page yet.

Before adding all daily prompt pages, decide whether they are useful search landing pages. If they are thin, repetitive, or not meant to rank, keep them out until they are improved.

Good pages to include:

- Homepage.
- About page.
- Projects page.
- Contact page.
- Strong project pages.
- Hackathon pages with original descriptions.
- Dev-doc pages with useful writing.

Hold off on:

- Thin prompt pages.
- Pages with duplicate text.
- Pages that are only useful as internal navigation.

Acceptance:

- Every sitemap URL returns a 200 on the live domain after deploy.
- Important pages are no more than one or two clicks from the homepage or projects page.
- The sitemap does not include broken, duplicate, or private URLs.

## Phase 5: connect this to the traffic goal

Status: Repo-side work is done. Search Console setup still needs Matt's Google account.

This scaffold does not create traffic by itself. It makes the site easier to crawl and understand. Future repo changes should connect it to the other active work:

- About page: make Matt Gresham and his proof points clearer.
- Finance Kit page: make one strong case-study page.
- Page metrics: measure page views and proof clicks.
- Search Console: submit the sitemap and watch clicks, impressions, and indexed pages.

Acceptance:

- Once Search Console is connected, the sitemap is submitted.
- The first measurement target is not rankings. It is getting from 0 visible clicks and 0 visible impressions to a real baseline.
- No new page is added unless it has a clear purpose and a real proof point.

## Follow-up action items

- ~~Update `pages/hackathons/phystech-2026.html` with the final PhysTech 2026 placement.~~ Closed 2026-08-19: Matt confirmed the competition never announced results. All four "results pending" spots on the page now say so; there is nothing further to wait for.
- Revisit `pages/work-experience/polaris-student.html` once more Testing Lead metrics are available (dates/duration, team size, bug counts) and fold them into the About page Work Experience entry.

## Final check before opening a PR

Run:

```sh
git diff --check
node --check assets/js/seo-schema.js
python3 - <<'PY'
from xml.etree import ElementTree as ET
ET.parse("sitemap.xml")
print("sitemap.xml parses")
PY
```

Then open a reviewable PR. Keep the PR body plain:

- What changed.
- Why it helps traffic.
- What still needs Search Console or analytics.
- What you tested.
