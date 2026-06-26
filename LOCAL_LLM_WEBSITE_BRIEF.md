# Website improvement status and guardrails

This file is not public website content. It records the website improvement direction and the work that has already been implemented so future changes do not restart the same checklist.

Do the work directly in the repo. Do not leave website improvements as instructions for another local model to interpret.

## Repo rules

- This is a static site. There is no build step, package manager, or bundler.
- Shared styles live in `index.css`.
- Use the existing nav and footer injection system. Every page should keep `<div id="site-nav"></div>`, `<div id="site-footer"></div>`, and the correct `assets/js/site-style.js` script for its path depth.
- Use relative links by file depth. Do not use absolute paths like `/pages/about-me.html` or `/assets/documents/resume.pdf`.
- Do not create local project pages for AI Lab projects. Those live in the external AI Lab app.
- Do not invent proof. Only use facts already present in the site or supplied by Matt.

## Product direction

The website should read as Matt Gresham's personal product and project site. The goal is not to make a generic resume site. The goal is to help visitors quickly understand what Matt builds, why those projects exist, and where to inspect the live pages, source code, demos, or writeups.

The main growth goal is monthly organic visitors, 10x in 6 months. Website changes should make the site easier for people and search engines to understand.

## Work 1: Improve the existing About page

Status: Done.

Target file: `pages/about-me.html`

Do not create a new About page. `pages/about-me.html` is the canonical About Matt page.

### What to improve

- Tighten the top section so it answers three questions quickly: who Matt is, what he builds, and what proof a visitor should inspect first.
- Keep the page personal. Matt is a self-taught developer working across AI/ML, cybersecurity, software engineering, algorithms, and embedded systems.
- Use existing proof already on the page: Finance Kit, NOAI algorithm work, AI agents hackathon work, Study Assistant, cybersecurity tooling, and the PhysTech hardware watch project.
- Add clear top-section links to the projects page and resume.
- Preserve the existing personal context, certificates, school goals, learning goals, and community service unless reorganizing them makes the page clearer.
- Improve the meta description and title if they can be clearer without becoming keyword-stuffed.

### Suggested shape

1. Keep the hero simple: Matt Gresham, self-taught developer, AI/ML, cybersecurity, software engineering.
2. Add a short "what I build" paragraph near the top.
3. Add a compact proof list near the top with 3 to 5 bullets.
4. Add primary links near the top:
   - View projects
   - View resume
   - Contact, only if a contact destination already exists
5. Keep the deeper sections below for people who want detail.

### Do not

- Do not invent customers, users, revenue, internships, awards, rankings, or employment.
- Do not delete personal context just because it is not SEO content.
- Do not make the page sound corporate.
- Do not add a second About page.

### Done when

- The first screen makes "Matt Gresham" clear.
- The top copy explains who Matt is, what he builds, and the strongest proof points in about 150 words.
- A visitor can reach Projects and Resume from the top section.
- The page still uses the existing static-site structure and styles.
- All links work from a depth-1 page.

## Work 2: Add page-level visitor metrics

Status: Done.

Goal: make the monthly organic visitor goal measurable once an analytics provider is connected.

The site currently should not assume GA4, PostHog, or Search Console is connected. Add safe hooks that do nothing when no provider is available.

### Suggested implementation

- Add a small wrapper at `assets/js/metrics.js`.
- Load it on pages with the correct relative path for each page depth.
- Do not add analytics provider keys or secrets.
- The wrapper should no-op without console errors when analytics providers are absent.
- If `window.gtag` exists, send GA4-compatible events.
- If `window.posthog` exists, send PostHog-compatible events.
- Add optional local debug mode, for example `localStorage.siteMetricsDebug = "1"`, so local testing can log events to the console.

### Event schema

Use these names consistently:

- `page_view`
  - `path`
  - `title`
  - `referrer`
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `timestamp`
- `project_link_click`
  - `from_path`
  - `project_slug` or `project_title`
  - `destination_url`
  - `destination_kind`: `live`, `source`, `demo`, `case_study`, or `external`
- `resume_click`
  - `from_path`
  - `destination_url`
- `contact_click`
  - `from_path`
  - `destination_url`
- `ai_lab_click`
  - `from_path`
  - `destination_url`

### Tracking approach

- Prefer explicit `data-track-event` attributes for important links.
- Use delegated click handling so each page does not need custom JavaScript.
- Track project cards, resume links, contact links, and AI Lab links.
- Keep the implementation small and dependency-free.

### Do not

- Do not add provider secrets.
- Do not make analytics required for page load.
- Do not add a bundler, package manager, or external dependency.
- Do not rename events after choosing them.

### Done when

- Pages load without GA4 or PostHog and show no analytics-related console errors.
- `page_view` fires once per page load when a provider is present or debug mode is enabled.
- Project, resume, contact, and AI Lab clicks can be observed in debug mode.
- Event names and fields are documented either here or in a small repo doc.

## Work 3: Improve the Finance Kit proof page

Status: Done.

Target file: `pages/project-pages/finance_kit.html`

The Finance Kit page already exists. Improve that page or turn it into a clearer case-study style page. Do not create a duplicate Finance Kit page unless Matt explicitly asks for one.

### What to improve

- Explain the original problem.
- Explain what Finance Kit does.
- Explain how it is built.
- Explain what a visitor should inspect next.
- Link back to the projects page and About page.

### Do not

- Do not invent usage, users, customers, revenue, or production adoption.
- Do not overstate the school-submission origin. It can be honest and still valuable.
- Do not bury the live/demo/source links.

### Done when

- The page reads like proof of practical software ability, not just a project note.
- The build details are concrete enough for a technical visitor to trust.
- A non-technical visitor can still understand why the project matters.
- All links work from a depth-2 page.

## Current remaining manual step

Search Console still needs Matt's Google account:

1. Paste the Search Console verification token into the commented placeholder in `index.html`.
2. Verify `https://pymite6941.is-a.dev/` in Search Console.
3. Submit `https://pymite6941.is-a.dev/sitemap.xml`.

Do not invent or commit a fake verification token.

## Completed implementation order

1. Improve `pages/about-me.html`.
2. Add `assets/js/metrics.js` and wire it into the main pages.
3. Improve `pages/project-pages/finance_kit.html`.
4. Run basic checks:
   - `git diff --check`
   - Open changed pages locally in a browser.
   - Check the browser console for missing files or JavaScript errors.
   - Click Projects, Resume, AI Lab, and Finance Kit links.

## Quality bar

Keep changes small enough to review. Make the site clearer, not bigger for its own sake. If a fact is not already on the site or supplied by Matt, leave it out and add a comment for Matt to fill in later.
