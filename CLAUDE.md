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
  dev-docs/
    learn-programming2026.html                    ← depth 2
  project-pages/
    finance_kit.html                              ← depth 2
    connect4.html                                 ← depth 2
    study_stuff.html                              ← depth 2
    mdToHTMLConverter.html                        ← depth 2
  100DaysOfAIProgrammingPrompts/
    Day1.html                                     ← depth 2
assets/
  documents/                                      ← resume PDF lives here
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

## Nav & Footer Template

Every page uses the same nav and footer. Copy exactly — do not omit "The Dev Docs" from the nav. Adjust `href` paths for the file's depth.

**Depth 1 nav** (`pages/*.html`):
```html
<div class="nav">
    <ul class="nav-list">
        <li class="nav-item"><a class="nav-link" href="../index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="about-me.html">About Me</a></li>
        <li class="nav-item"><a class="nav-link" href="projects.html">Projects</a></li>
        <li class="nav-item"><a class="nav-link" href="the-dev-docs.html">The Dev Docs</a></li>
    </ul>
    <a class="nav-btn" href="mailto:greshamd27@gmail.com">Contact me</a>
</div>
```

**Depth 2 nav** (`pages/*/*.html`):
```html
<div class="nav">
    <ul class="nav-list">
        <li class="nav-item"><a class="nav-link" href="../../index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="../about-me.html">About Me</a></li>
        <li class="nav-item"><a class="nav-link" href="../projects.html">Projects</a></li>
        <li class="nav-item"><a class="nav-link" href="../the-dev-docs.html">The Dev Docs</a></li>
    </ul>
    <a class="nav-btn" href="mailto:greshamd27@gmail.com">Contact me</a>
</div>
```

**Footer** (same pattern, adjust resume path for depth):
```html
<footer class="foot">
    <p>
        <a class="text-link" href="https://github.com/PyMite6941">My GitHub</a><br><br>
        <a class="text-link" href="[the-dev-docs path]">The Dev Docs</a><br><br>
        <a class="text-link" href="[resume path]">View my resume</a>
    </p>
    <p style="text-align: center; font-size: 14px">&copy; 2026 Matt Gresham. All rights reserved.</p>
</footer>
```

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

Key classes: `.card-grid` / `.card-container` (project cards), `.tag` (language labels on cards), `.boxes` (tech stack pills), `.article` (body text), `.code-segment` (inline code display), `.hero-section`, `.nav`, `.foot`.

## Page Types

**Project index card** (`pages/projects.html`) → links to `./project-pages/<name>.html`

**Project detail page** (`pages/project-pages/<name>.html`) → has "Try it!" section, GitHub link, description

**Dev Docs article** (`pages/dev-docs/<name>.html`) → has table of contents with anchor links, published date in `.article-stuff`

**100 Days challenge day** (`pages/100DaysOfAIProgrammingPrompts/<DayN>.html`) → has PyScript terminal demo + source code display in `.code-segment`

## Known Issues / Watch Out For

- `font-weight` in `.article` and `.article-stuff` uses invalid `px` values — should be unitless (e.g. `400`)
- Card hover `transition` is missing the `s` unit (`0.2` → `0.2s`)
- The `pyscript.toml` at the root is an old-style config file; current pages use inline PyScript config instead
