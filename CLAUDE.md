# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pure static site — no build step, no bundler, no package manager. Open `index.html` directly in a browser to run. All styling lives in a single `index.css` at the root.

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

## AI Lab — External Next.js Project

The AI Lab lives at `../ai-lab/` (Next.js project) and deploys to `https://ai-lab-bice.vercel.app`.
- Project pages live at `ai-lab/app/projects/<name>/page.js`
- Components live at `ai-lab/app/components/`
- The nav bar in the portfolio links to the AI Lab via `site-style.js` (`ailab` path key)
- Do NOT create local project pages in `pages/project-pages/` for AI Lab projects — put them in the `ai-lab/` Next.js app instead
- AI Lab project pages should link back to the portfolio when referencing hackathons (use full URL: `https://pymite6941.is-a.dev/pages/...`)

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

## Current Website Improvement Brief

Read `LOCAL_LLM_WEBSITE_BRIEF.md` before improving the site. It is the current implementation brief for local coding models.

That brief covers three active improvements:
- Improve the existing About page at `pages/about-me.html`. Do not create a duplicate About page.
- Add safe page-level visitor metrics that no-op when GA4 or PostHog is absent.
- Improve the existing Finance Kit page at `pages/project-pages/finance_kit.html` so it reads like stronger project proof.

For the SEO crawl-signal scaffold, also read `todo.md`. It explains the sitemap, robots, canonical URL, structured data, and hosting follow-up work.

Keep those changes review-sized, use only facts already on the site or supplied by Matt, and preserve the static-site rules above.
