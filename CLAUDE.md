# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pure static site — no build step, no bundler, no package manager. Open `index.html` directly in a browser to run. All styling lives in a single `index.css` at the root.

## RULE: Ask Matt before adding or updating pages (this repo AND the AI Lab)

**Matt's standing rule:** Never create, add, or materially update a project page, hackathon page, or project/hackathon card — in **this repo** or in the **AI Lab** (`../ai-lab/`) — without first checking with Matt and getting his explicit go-ahead. This applies even when a new project or a completed hackathon is clearly "ready" to add.

- Before adding anything: survey what exists (Devpost, the workspace projects, the AI Lab), then **present the candidates and ask Matt which to add/update**. Wait for his answer before writing pages.
- This covers new project pages, new hackathon pages, new cards on `projects.html` / `hackathons.html`, and AI Lab project pages under `ai-lab/app/projects/`.
- Small, non-content fixes Matt has already asked for (broken-link fixes, path/SEO corrections, typo fixes) do not need a fresh ask — but anything that adds or reframes a project/hackathon does.
- Respect the exclusions in `HIDDEN_PROJECTS.md` regardless of any request to "add everything."

## File Structure & Path Depth Rules

This is the most important thing to get right. Relative paths must match the file's depth:

```
index.html                                        ← depth 0 (root)
index.css                                         ← shared stylesheet
pages/
  about-me.html                                   ← depth 1
  projects.html                                   ← depth 1
  the-dev-docs.html                               ← depth 1
  100DaysOfAIProgrammingPrompts.html              ← depth 1
  hackathons.html                                 ← depth 1
  dev-docs/
    learn-programming2026.html                    ← depth 2
  project-pages/
    finance_kit.html                              ← depth 2
    connect4.html                                 ← depth 2
    study_stuff.html                              ← depth 2
    mdToHTMLConverter.html                        ← depth 2
  hackathons/
    usaii-2026.html                               ← depth 2
    hack-america-2026.html                        ← depth 2
 100DaysOfAIProgrammingPrompts/
    Day1.html                                     ← depth 2
assets/
  documents/                                      ← resume PDF lives here
  js/                                             ← JS injection scripts
```

**Correct relative paths by depth:**

| Resource | From depth 1 (`pages/`) | From depth 2 (`pages/*/`) |
|---|---|---|
| `index.css` | `../index.css` | `../../index.css` |
| `index.html` | `../index.html` | `../../index.html` |
| `pages/about-me.html` | `about-me.html` | `../about-me.html` |
| `pages/projects.html` | `projects.html` | `../projects.html` |
| `pages/the-dev-docs.html` | `the-dev-docs.html` | `../the-dev-docs.html` |
| `assets/documents/resume.pdf` | `../assets/documents/...` | `../../assets/documents/...` |

**Never use absolute paths** like `/pages/...` or `/assets/...` — the site is not served from a root domain in all environments.

## Nav & Footer — JS Injection Only

**RULE: Never write a hardcoded `<nav>`, `<div class="nav">`, or `<footer>` on any page. Both are injected by `assets/js/site-style.js` via placeholder divs. Always use the placeholders below — nothing else.**

Every page must have:
```html
<div id="site-nav"></div>
```
at the top of `<body>`, and:
```html
<div id="site-footer"></div>
```
at the bottom of `<body>`, and must load `site-style.js` in `<head>`:

```html
<!-- depth 1 (pages/*.html) -->
<script src="../assets/js/site-style.js" defer></script>

<!-- depth 2 (pages/*/*.html) -->
<script src="../../assets/js/site-style.js" defer></script>
```

`site-style.js` reads `data-depth` from `<html>` and resolves all paths automatically. Do not duplicate nav or footer links manually — edit `site-style.js` if the nav or footer content needs to change.

### Scripts injected by `site-style.js`

Pages only ever load `site-style.js`. It injects the rest at runtime (path-depth resolved), so do **not** add these to page `<head>`s individually:

| Script | Purpose |
|---|---|
| `easter-eggs.js` | Misc easter eggs |
| `chatbot.js` | Floating portfolio chatbot (calls the Cloudflare worker) |
| `seo-schema.js` | Injects the canonical link + JSON-LD structured data (see SEO section) |
| `analytics.js` | GA4 provider bootstrap — **injected before `metrics.js` on purpose** so `window.gtag` exists first |
| `metrics.js` | Event layer — forwards `page_view` / click events to whatever provider is present |

The `analytics.js` → `metrics.js` order is load-bearing; keep `analytics` appended first in `site-style.js`.

## AI Lab — External Next.js Project

The AI Lab lives at `../ai-lab/` (Next.js project) and deploys to `https://ai-lab-bice.vercel.app`.
- Project pages live at `ai-lab/app/projects/<name>/page.js`
- Components live at `ai-lab/app/components/`
- The nav bar in the portfolio links to the AI Lab via `site-style.js` (`ailab` path key)
- Do NOT create local project pages in `pages/project-pages/` for AI Lab projects — put them in the `ai-lab/` Next.js app instead
- AI Lab project pages should link back to the portfolio when referencing hackathons (use full URL: `https://pymite6941.is-a.dev/pages/...`)

The `agents/` directory holds the markdown phase prompts for the multi-agent pipelines. The **Network Defense Agents** files are fetched live by the AI Lab's network-defense demo (`agents/Network%20Defense%20Agents/Phase%20N.md`), so each must keep its `## AGENT DIRECTIVE` header (the system prompt) and valid markdown. The **Cryptography Data Agents** files are standalone docs (not consumed by any demo). Keep code fences balanced and any embedded Python syntactically valid.

## SEO, Structured Data & Analytics

Crawl/entity scaffolding lives in a few coordinated places. GitHub Pages serves the root files automatically. Live domain is `https://pymite6941.is-a.dev` (see `CNAME`).

- **`sitemap.xml`** (root) — lists the main public pages, substantive project pages, hackathon pages, and useful dev-docs. Every `<loc>` must resolve to a real file on the live domain. Do **not** list thin/duplicate pages (e.g. daily-prompt pages) or private/hidden ones.
- **`robots.txt`** (root) — allows all, points to the sitemap URL.
- **`assets/js/seo-schema.js`** — on every page, upserts exactly one `<link rel="canonical">` and injects a JSON-LD `@graph` (`Person` + `WebSite` + `WebPage`, plus `SoftwareApplication`/`CreativeWork` for project pages). Per-page facts come from the `PAGE_META` map. **When you add a substantive project page, add a `PAGE_META` entry** (accurate name, description, type, and `programmingLanguage`/`applicationCategory` when it's software) — don't leave Finance Kit as the only enriched page.
- **Static canonical tags** — the highest-priority pages (`index.html`, `pages/projects.html`, `pages/about-me.html`, and strong project pages) also carry a static `<link rel="canonical">` in the HTML head as a safety net. `seo-schema.js` updates the same single tag, so there is never a duplicate. Use **one** canonical per page and **never** an absolute internal nav link.
- **Analytics + consent (live)** — `analytics.js` is consent-gated. It (1) sets Google **Consent Mode v2** defaults to *denied*, (2) loads the **Cookiebot** CMP (the consent banner, `data-cbid` in the `COOKIEBOT_CBID` constant), (3) bridges the user's Cookiebot choice to a `gtag('consent','update')` itself (so it does not depend on Cookiebot's dashboard consent-mode toggle), and (4) loads **GA4** (`GA4_MEASUREMENT_ID`, currently `G-WLJ6YMX87M`). GA4 runs cookieless until `analytics_storage` is granted. Both IDs are public, not secrets. Set either constant to `''` to disable that piece. `metrics.js` (the event layer) forwards `page_view`/click events to `window.gtag`; while consent is denied those are cookieless pings. It no-ops with zero console errors when no provider is present; set `localStorage.siteMetricsDebug = "1"` to log events locally. Event names are stable — see the schema doc at the top of `metrics.js`; do not rename them.
- **Search Console verification** — must be a **static** `<meta name="google-site-verification">` in `index.html` (Google reads raw HTML and does not run the JS-injected head). A commented placeholder slot is already in `index.html`.

**Hidden-project rule (important):** there is currently no `HIDDEN_PROJECTS.md` file in this repo. If Matt adds one later, projects listed there must stay out of every discovery surface: no card or link, no `sitemap.xml` entry, and no `seo-schema.js` `PAGE_META` entry. Until that file exists, treat the substantive project pages in `pages/project-pages/` as public proof pages.

## PyScript Usage

PyScript 2026.3.1 is used to run Python in the browser. Pages that use it must load both assets in `<head>`:

```html
<link rel="stylesheet" href="https://pyscript.net/releases/2026.3.1/core.css">
<script type="module" src="https://pyscript.net/releases/2026.3.1/core.js"></script>
```

For terminal-style programs with `input()`:
```html
<py-terminal></py-terminal>
<!-- prettier-ignore -->
<script type="py" terminal>
code must start at column zero — no leading whitespace
input() works here because of the terminal attribute
</script>
```

**Critical:** The `<!-- prettier-ignore -->` comment must appear immediately before the `<script type="py">` tag to prevent Prettier from indenting the Python code, which causes `IndentationError`. The `<py-terminal>` element must come before the script tag.

**What PyScript cannot do:** `requests`, `subprocess`, file I/O, desktop screen capture. Use Streamlit Cloud for apps that need these (see Finance Kit).

## CSS Architecture

All styles in `index.css`. Key CSS variables in `:root`:
- `--bg-color`: `#0d1117` (page background)
- `--text-color`: `#e6edf3`
- `--link-color`: `#61afef`
- `--card-bg`: `#161b22`
- `--button-color`: `#8957e5`

Key classes: `.card-grid` / `.card-container` (project cards), `.tag` (language labels on cards), `.boxes` (tech stack pills), `.article` (body text), `.code-segment` (inline code display), `.hero-section`, `.nav`, `.foot`, `.sidenav` (filter sidebar), `.dev-notes` / `.dev-note` (info cards), `.ascii-diagram` (architecture diagrams), `.screenshot-grid` / `.screenshot` (image galleries).

**Responsive breakpoints used in `index.css`:**
- `<=480px`: Single-column card grid, compact hero section
- `481px-1024px`: Multi-column card grid with larger min-width
- `<=1100px`: Hamburger nav replaces inline nav
- `>=1101px`: Desktop nav

## Known Issues / Watch Out For

- `font-weight` in `.article` and `.article-stuff` uses invalid `px` values — should be unitless (e.g. `400`)
- Card hover `transition` is missing the `s` unit (`0.2` → `0.2s`)
- The `pyscript.toml` at the root is an old-style config file; current pages use inline PyScript config instead
- `.sidenav` is not responsive — on mobile it takes fixed width and can overflow. Pages with sidebars should use `flex-direction: column` on mobile
- The hackathons page uses inline `style="margin-left: 240px"` on `.card-grid` to clear the sidebar — this breaks below 768px

## Current Website Improvement Status

`LOCAL_LLM_WEBSITE_BRIEF.md` and `todo.md` are status and guardrail documents, not a queue for another model. Do the work directly in the repo, then keep those files current when the guidance changes.

Current status:
- **Done** — About page (`pages/about-me.html`): top-section proof list + primary links (Projects / Resume / Contact). Do not create a duplicate About page.
- **Done** — page-level visitor metrics: `analytics.js` (GA4 `G-WLJ6YMX87M` + Cookiebot consent banner + Consent Mode v2) and `metrics.js` (event layer) are built and wired. See the SEO section above.
- **Done** — Finance Kit page (`pages/project-pages/finance_kit.html`): breadcrumb + "what to inspect next" with internal links back to Projects and About.
- **Done** — static crawl metadata for all substantive project pages, including canonical tags and conservative structured-data entries where the visible page supports them.
- **Done** — visible proof placeholders on public project pages have been replaced with factual proof panels instead of fake screenshots.
- **Done** — hero subtitles use paragraph text instead of skipped `h3` headings.
- **Still pending, needs Matt in Search Console after deploy** — paste the Search Console verification token into the placeholder in `index.html`, then verify the property and submit the sitemap. GA4 + the consent banner are already wired.

Treat the individual project pages under `pages/project-pages/` as first-class proof pages, just as important as `pages/about-me.html` for crawling, indexing, and AI answers. Do not make Finance Kit the only project page with strong metadata, internal links, or structured data. When improving crawl signals, cover all substantive project detail pages with accurate static canonical tags, unique page titles, concise meta descriptions, and conservative `SoftwareApplication` or `CreativeWork` JSON-LD when the page facts support it.

Before treating any public page as crawl-ready, check:
- It has exactly one static canonical URL.
- It has one unique, accurate `<title>` and one concise meta description.
- It has one clear `<h1>` that matches the page topic.
- It links back to Projects, About, or a closely related proof page.
- It belongs in `sitemap.xml` only if it is useful as a search landing page.
- It uses structured data only for claims the visible page actually supports.

Keep those changes review-sized, use only facts already on the site or supplied by Matt, and preserve the static-site rules above.
