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
  about-me.html                                   ← depth 1 — recruiter-facing
  academics.html                                  ← depth 1 — counselor-facing
  projects.html                                   ← depth 1
  100DaysOfAIProgrammingPrompts.html              ← depth 1
  hackathons.html                                 ← depth 1
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
  documents/                                      ← matt_gresham_resume.html lives here
  js/                                             ← JS injection scripts
```

## Asset cache stamping — run this after ANY css/js edit

Every reference to `index.css` and to anything in `assets/js/` carries a `?v=<hash>` content
stamp. **After editing any CSS or JS file, run:**

```bash
python3 tools/stamp-assets.py
```

Then commit the re-stamped files along with your change. CI runs `--check` and **fails the
build** if you forget, so a stale stamp can never reach production.

Why it exists: GitHub Pages serves everything `Cache-Control: max-age=600`, and HTML and assets
expire *independently*. Without stamping, for up to 10 minutes after a deploy a visitor can hold
new HTML alongside a cached old `index.css` — the page renders half-broken. The stamp makes the
pair atomic: new HTML requests a URL the browser has never seen.

- The hash covers `index.css` plus every `assets/js/*.js`, so any edit changes it everywhere.
- `site-style.js` holds `var ASSET_V = '<hash>'` and appends the same stamp to the five scripts
  it injects. **Do not hand-edit that line** — the script maintains it.
- This is not a build step: the stamped files are the files that ship, and `?v=` is inert when
  opening `index.html` straight off disk.

**This does not fix your own browser during testing.** Editing CSS locally without re-stamping
means your browser keeps the cached copy — that is what made a fixed mobile layout still read
260px, and made `window.portfolioChat` look undefined. Hard-refresh, or re-stamp.

## Audience split: About vs Academics

Two audiences read this site and they want different things. Keep them separated:

- **`pages/about-me.html` — recruiters.** Bio, then **Work Experience first**, then proof
  projects, skills, hackathons, current work. No college/admissions content beyond a pointer.
- **`pages/academics.html` — college counselors and admissions readers.** Education and
  coursework, honors/awards, competitions, leadership, community service, college plans,
  career goals. Links out to About for work-experience detail.

Do not merge these back into one page, and do not re-add a target/reach/dream **school list**
to either — Matt had it public and it told each named school exactly how he ranked them.

## Homepage audience router

`assets/js/audience-router.js` powers the two raised "press me" buttons in the homepage hero —
**I'm a College Counselor** and **I'm a Recruiter or Employer**. Each opens a modal with a
tailored brief, direct links, and buttons that hand off to the site chatbot.

- **Homepage only.** `index.html` loads it directly (same precedent as `filter-mechanics.js`
  on `projects.html`). It no-ops on any page without `.audience-btn`, so it is safe if copied.
- **Link paths inside it are depth-0 relative** (`pages/academics.html`). If this is ever
  reused on a deeper page, those paths must change.
- **The content is duplicated prose.** Every fact in the `AUDIENCES` object must match
  `pages/academics.html` and `pages/about-me.html`. Change one, change the other — a stale
  GPA or job title in the modal is worse than not having the modal.
- Styles live at the bottom of `index.css` under the audience-router comment banner.

**Chatbot handoff:** `chatbot.js` exposes `window.portfolioChat` (`.open(prefill)` and
`.ask(question)`) from inside `wireEvents()`. That is the only public surface of an otherwise
fully IIFE-scoped file — don't remove it. The router degrades to the contact page if the
chatbot is absent or blocked.

## Résumé: one file, hand-maintained

`assets/documents/matt_gresham_resume.html` is the **single** résumé and it is **Matt's own
file** — he keeps it current by hand. There is no PDF (deleted 2026-07-31; it had gone stale
against the HTML) and no separate NSA Stokes variant (merged in 2026-07-31 — it was a superset,
not a filtered version). Visitors save a copy with the browser's Print to PDF.

Two things that were live on the public Stokes résumé before the merge — **never reintroduce
either**:
- Matt's **home street address and phone number**. He is a high-school student and these pages
  are publicly crawlable. City/country only.
- Unfilled `.todo` placeholders (`[add: number of labs completed…]`) rendering in yellow
  highlight. If a stat isn't known, **write the claim without the number** — do not invent one.

**Correct relative paths by depth:**

| Resource | From depth 1 (`pages/`) | From depth 2 (`pages/*/`) |
|---|---|---|
| `index.css` | `../index.css` | `../../index.css` |
| `index.html` | `../index.html` | `../../index.html` |
| `pages/about-me.html` | `about-me.html` | `../about-me.html` |
| `pages/projects.html` | `projects.html` | `../projects.html` |
| `pages/academics.html` | `academics.html` | `../academics.html` |
| `assets/documents/matt_gresham_resume.html` | `../assets/documents/...` | `../../assets/documents/...` |

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

## Chatbot Worker — a Discovery Surface

The floating chatbot is a Cloudflare Worker: source `worker/worker.js`, deployed as
`portfolio-chat` to `https://portfolio-chat.greshamd27.workers.dev`, called by
`assets/js/chatbot.js` (`WORKER_URL`). The `OPENROUTER_API_KEY` secret is already set on the
worker; `wrangler deploy` does not disturb it.

**Deploy with `cd worker && npx wrangler deploy`. Git push does NOT deploy it.** Production
silently sat 3+ weeks behind HEAD because of this — handing out a stale contact email — while
the source looked perfectly fine. If you change `worker.js`, deploy it or the change is
fiction.

**RULE: keep `## His Public Projects` in the SYSTEM_PROMPT in sync with `pages/projects.html`.**
The bot knows projects from that block plus a live fetch of public GitHub repos. It has a guard
that refuses to discuss any project not in one of those two places, so:
- Add a project to `projects.html` but not the prompt → the bot **refuses** a real project.
- The guard is what keeps `HIDDEN_PROJECTS.md` projects out of the bot. **Never add a hidden
  project to the prompt**, and never weaken the guard.

The block includes site-name → repo-name mappings (e.g. "The Finance Kit" is the
`Expense-tracker` repo) because the site's display names differ from GitHub's. Keep those
mappings accurate or the bot won't resolve a project asked about by either name.

Two things that bit hard (2026-07-15) — don't undo them:
- The prompt originally had **no project list at all**, so the bot invented project
  descriptions to fill the gap. That is how it came to describe the hidden Connect 4 Bot. A
  "never invent" instruction alone did not stop it; only a real list plus the refusal guard did.
- The contact address is **pinned** ("never output any other email"), because the model
  improvises one whenever a line is unscripted.

**Current contact address: `greshamd27@gmail.com`** (changed 2026-08-01). The previous
`pymite6941@support.tin.computer` is dead — Matt lost that account. It was replaced in
`contact-me.html`, the `client-work.html` CTA, and six places in the worker prompt.

**Negation gotcha — cost a deploy cycle, don't repeat it.** The first rewrite pinned the new
address *by naming the old one to forbid it* ("the old pymite6941@… address is DEAD and must
never be given out"). Probing live, **2 of 5 replies handed out the dead address** — writing
the string into the prompt is what made it available to emit, forbidding frame and all. The
fix was to delete every occurrence of the dead address and pin only the correct one positively.
8/8 clean after that. **Never write an incorrect value into this prompt in order to ban it.**

**Testing it:** `POST` `{"message":"..."}` (not `{"messages":[...]}`, which returns "Missing
message"). Replies are **nondeterministic** — the free-model chain varies. One bad answer
proves nothing; run the same query ~5x before concluding there's a bug.

## SEO, Structured Data & Analytics

Crawl/entity scaffolding lives in a few coordinated places. GitHub Pages serves the root files automatically. Live domain is `https://pymite6941.is-a.dev` (see `CNAME`).

- **`sitemap.xml`** (root) — lists the main public pages, substantive project pages, hackathon pages, and work-experience pages. Every `<loc>` must resolve to a real file on the live domain. Do **not** list thin/duplicate pages (e.g. daily-prompt pages) or private/hidden ones.
- **`robots.txt`** (root) — allows all, points to the sitemap URL. **Exception:** 13 AI crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot, Bytespider, etc.) are disallowed from `/pages/college-essay.html` **only** — deliberately path-scoped, not site-wide, so project pages still get picked up by AI answer engines. Don't "simplify" these rules away.
- **`pages/college-essay.html`** (Matt's Common App essay) has a deliberate, unusual combination: **`index, follow, nosnippet, noarchive, noimageindex, max-snippet:0`**. Matt's requirement is that the page be *findable* but its text only readable by actually opening it — so it is indexed by title/URL while snippet and cache are suppressed. **Do not "fix" this to a plain `index, follow`,** and keep the `seo-schema.js` description naming the essay without quoting it. The essay text is Matt's own writing, reproduced verbatim — never edit or reword it. Note these are honor-system directives; the text is plain HTML and `curl` still returns it.
- **`assets/js/seo-schema.js`** — on every page, upserts exactly one `<link rel="canonical">` and injects a JSON-LD `@graph` (`Person` + `WebSite` + `WebPage`, plus `SoftwareApplication`/`CreativeWork` for project pages). Per-page facts come from the `PAGE_META` map. **When you add a substantive project page, add a `PAGE_META` entry** (accurate name, description, type, and `programmingLanguage`/`applicationCategory` when it's software) — don't leave Finance Kit as the only enriched page.
- **Static canonical tags** — the highest-priority pages (`index.html`, `pages/projects.html`, `pages/about-me.html`, and strong project pages) also carry a static `<link rel="canonical">` in the HTML head as a safety net. `seo-schema.js` updates the same single tag, so there is never a duplicate. Use **one** canonical per page and **never** an absolute internal nav link.
- **Analytics + consent (live)** — `analytics.js` is consent-gated. It (1) sets Google **Consent Mode v2** defaults to *denied*, (2) loads the **Cookiebot** CMP (the consent banner, `data-cbid` in the `COOKIEBOT_CBID` constant), (3) bridges the user's Cookiebot choice to a `gtag('consent','update')` itself (so it does not depend on Cookiebot's dashboard consent-mode toggle), and (4) loads **GA4** (`GA4_MEASUREMENT_ID`, currently `G-WLJ6YMX87M`). GA4 runs cookieless until `analytics_storage` is granted. Both IDs are public, not secrets. Set either constant to `''` to disable that piece. `metrics.js` (the event layer) forwards `page_view`/click events to `window.gtag`; while consent is denied those are cookieless pings. It no-ops with zero console errors when no provider is present; set `localStorage.siteMetricsDebug = "1"` to log events locally. Event names are stable — see the schema doc at the top of `metrics.js`; do not rename them.
- **Search Console verification** — must be a **static** `<meta name="google-site-verification">` in `index.html` (Google reads raw HTML and does not run the JS-injected head). A commented placeholder slot is already in `index.html`.

## CTF Writeups — separate site

Matt's capture-the-flag and security-lab writeups live in a **separate repo**, not this one:
`https://pymite6941.is-a.dev/ctf-writeups/` (a GitHub Pages project site, served under the
portfolio's custom domain because project sites inherit the user site's CNAME).

The portfolio only **links out** to it. Do not recreate the writeups, a solve log, or a
picoCTF page in this repo. Linked from:
- the footer Explore column (`ctf` key in `site-style.js`, absolute URL, same at all depths)
- the recruiter modal's link row in `audience-router.js`
- the "Proof to inspect first" list on `about-me.html`
- the CTF & Security Training section of the résumé

Always link it as **https://** — the site is served over HTTPS and linking `http://` from an
HTTPS page is a needless downgrade.

There is deliberately **no card on `projects.html`** — that needs Matt's explicit go-ahead per
the standing rule at the top of this file.

**The Dev Docs section was REMOVED (2026-08-02).** Matt moved this content to a separate
GitHub Pages project of his own. Deleted: `pages/the-dev-docs.html` and all of `pages/dev-docs/`
(four articles, an OpenCode draft, and the picoCTF evaluation + solve log), the `devdocs` path
key in `site-style.js`, the `dev_docs` easter-egg achievement, and the `.eval-*` / `.solve-*`
styles in `index.css`.

Everything is recoverable from git — the last commit containing it is `412d9b9`. Do **not**
recreate a Dev Docs section on this site; the CTF/tooling writeups live on the separate project
and the portfolio should link out to it.

Unrelated, do not "clean up": `dream-projects.html` and `project-pages/cyberdeck.html` mention
**DevDocs `.zim` files**, which is the offline-documentation archive format, nothing to do with
this section.

**Hidden-project rule (important):** `HIDDEN_PROJECTS.md` **exists** at the repo root — it is gitignored and local-only, so it will not show up in the committed tree. **Read it before touching any discovery surface.** It currently lists Connect 4 Bot, ForgeOS, and VORTEX.

Projects listed there must stay out of **every** discovery surface. That means all of:
- no card or link on `projects.html` (or any other page)
- no `sitemap.xml` entry
- no `seo-schema.js` `PAGE_META` entry
- no mention in `easter-eggs.js` (the terminal `projects` listing)
- no mention in the **chatbot worker** prompt — see the Chatbot Worker section above

An audit on 2026-07-15 found Connect 4 had crept back into the first four of those *and* was being described by the live chatbot, despite having been removed in June. Grep for a project's name across `--include=*.html --include=*.js --include=*.xml` before assuming it's gone; a card can be re-added by a later edit long after the removal.

Hidden pages that still exist on disk (e.g. `pages/project-pages/connect4.html`) carry `<meta name="robots" content="noindex, nofollow">`. Orphaning a page does **not** remove it from search — crawlers that already know the URL keep it indexed until told otherwise. Keep the tag.

Everything else in `pages/project-pages/` is a public proof page.

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

- `main` is `display:flex; flex-direction:column; align-items:flex-start`, so a child div with
  `justify-content:center` will **not** appear centred — it shrinks to its content and sits
  left. Give the row `width:100%` (this is why the About/Academics button rows have it)
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
