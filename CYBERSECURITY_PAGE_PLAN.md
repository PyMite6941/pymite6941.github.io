# Cybersecurity Lab Page — Plan & TODO

A plan for a new `pages/project-pages/cybersecurity-lab.html` (depth-2) page that showcases
Matt's hands-on security work. This is the highest-leverage page to add for the college
narrative (cybersecurity + federal cyber pipeline / NSA Stokes; schools: UMBC, GMU, Virginia
Tech, RIT, UMD/ACES). It turns "interested in cybersecurity" into demonstrable proof.

Built as a static page on **GitHub Pages** — no backend, nothing abusable. Interactive demos
run client-side (PyScript / JS). Anything that can't run safely client-side is shown via
screenshots / write-ups, and the one live web app (LLM Protector) is linked out to its Vercel
demo.

---

## What goes on the page (sections, in order)

1. **Hero / intro** — "Cybersecurity Lab". One paragraph: hands-on offensive + defensive
   security in a self-built home lab; US citizen targeting the federal cyber field. Set the
   tone that everything below is real, inspectable work.

2. **Home Lab Setup** — the Raspberry Pi DVWA server + network. Use the existing
   `.ascii-diagram` CSS class for a network topology diagram (attacker box → Pi running
   DVWA → router). List what runs on it. Screenshot of the running lab.

3. **Web App Exploitation (offensive)** — DVWA walkthroughs: SQL injection, XSS (stored +
   reflected), command injection, CSRF, file upload. Each = a short write-up + annotated
   screenshot of the exploit and the result. Mention Burp Suite for intercepting/modifying
   requests. **Screenshots/write-ups only — never host DVWA live.**

4. **OSINT** — methodology + tools used (recon, footprinting). Keep it about technique, not
   targeting real people. Screenshots of tooling output (redacted).

5. **Defensive / Blue Team** — the `Windows Security` USB watchdog project (link to its repo)
   + log analysis. Frame as the defensive counterpart to the offensive work.

6. **LLM Security (the standout)** — LLM Protector. Short description + **link to the live
   Vercel demo** (see DEPLOY in the LLM Protector README). This is the differentiator: AI ×
   security, with real benchmark data. Tag it with the `.ai-badge` if appropriate.

7. **CTF & Competitions** — any picoCTF / National Cyber League / CTF results, with 1–2
   short write-ups of solved challenges (markdown-style, like the dev-docs pages).

8. **Interactive client-side demos** (all GitHub-Pages-safe — see "Demos to build" below).

9. **Tools & skills** — a row of `.boxes` pills: Burp Suite, Wireshark, nmap, Metasploit,
   Linux, Bash, Python, DVWA, Raspberry Pi, cryptography, etc.

---

## Demos to build (client-side, GitHub Pages — no backend)

Pick 2–3 to start. Ranked by impact:

1. **Hash + dictionary "cracker"** (PyScript) — user types a password, page shows its MD5/
   SHA-256, then "cracks" it against a small bundled wordlist to viscerally show why weak
   passwords fail. Pure Python (`hashlib`), runs in-browser. **Most memorable.**
2. **Mini-CTF challenge** (plain JS/HTML) — hide a flag in an HTML comment, a base64 string,
   and a JS variable; give 3 escalating hints; visitors use DevTools to find it. 100% static,
   extremely on-brand for a security page.
3. **JWT decoder** (JS) — paste a token, decode header/payload client-side, and explain the
   `alg:none` vulnerability. Teaches a real concept.
4. **Cipher / crypto playground** (PyScript) — Caesar/Vigenère/XOR + AES demo.
5. **Log analyzer** (PyScript) — paste `auth.log` lines; regex flags brute-force / failed-login
   patterns.

PyScript constraints (from the project CLAUDE.md): no `requests`, `subprocess`, file I/O, or
network. Demos must be pure computation on pasted/typed input. Use `<py-terminal>` +
`<!-- prettier-ignore -->` if `input()` is needed (see portfolio CLAUDE.md).

---

## TODO — build steps (thorough enough for a person or an LLM to finish)

> Read `portfolio/portfolio-website/CLAUDE.md` FIRST — it has hard rules on path depth, the
> nav/footer JS-injection placeholders, and PyScript usage. Follow them exactly.

- [ ] **1. Create the page file** `pages/project-pages/cybersecurity-lab.html` (depth-2).
  - Copy the structure of an existing project-page (e.g. `pages/project-pages/cyberdeck.html`)
    so the `<head>`, `data-depth="2"`, stylesheet path `../../index.css`, the
    `<script src="../../assets/js/site-style.js" defer>` line, and the `<div id="site-nav">` /
    `<div id="site-footer">` placeholders are all correct. NEVER hardcode nav/footer.
  - Use depth-2 relative paths: `../../index.css`, `../../assets/...`, links back to depth-1
    pages as `../projects.html`.

- [ ] **2. Write the section content** (sections 1–9 above). Use existing CSS classes:
  `.card` / `.dev-notes` / `.dev-note` for write-up blocks, `.ascii-diagram` for the network
  diagram, `.screenshot-grid` / `.screenshot` for image galleries, `.boxes` for the tool pills,
  `.code-segment` for inline code. (Class list is in the portfolio CLAUDE.md.)

- [ ] **3. Add screenshots** to `assets/img/` (create a `cyber/` subfolder). Needed: DVWA
  exploit screenshots (SQLi/XSS/etc.), the Pi lab photo, Burp Suite, any CTF flag captures.
  Redact anything sensitive. Reference them with `../../assets/img/cyber/<file>`.

- [ ] **4. Build 2–3 client-side demos** (start with the hash-cracker + mini-CTF). For
  PyScript, load the 2026.3.1 core CSS+JS in `<head>` (see portfolio CLAUDE.md), put the
  `<py-terminal>` before the `<script type="py">`, and start Python at column 0 with a
  `<!-- prettier-ignore -->` immediately above it (or Prettier will break the indentation).

- [ ] **5. Add the card to the projects grid** in `pages/projects.html`:
  - Add a new `.card-container` with `data-tags="Cybersecurity|Python"` (so the existing
    Cybersecurity filter checkbox catches it).
  - Card header `.tag` spans (Cybersecurity, Python), an `<h3>Cybersecurity Lab</h3>`, a
    description, `.boxes` for the stack, and a `<a class="text-link"
    href="./project-pages/cybersecurity-lab.html">View the lab</a>`.

- [ ] **6. Link LLM Protector's live demo** from section 6 once it's deployed (URL is in the
  LLM Protector README DEPLOY/TODO section).

- [ ] **7. (Optional) Add a nav link.** If it should appear in the top nav, edit
  `assets/js/site-style.js` (do NOT hardcode nav in the page).

- [ ] **8. Test locally** — open `index.html` in a browser, navigate to the new page, confirm:
  nav/footer inject, all images load (no broken paths), PyScript demos run, the projects-grid
  filter still works. A broken demo is worse than no demo — verify before publishing.

- [ ] **9. Commit + push** to `main` (repo `PyMite6941/pymite6941.github.io`); GitHub Pages
  auto-deploys to `pymite6941.is-a.dev`. Confirm the live page renders.

### Safety rules (do not violate)
- ❌ Never host DVWA, scanners, or exploit tools live anywhere.
- ❌ Demos must not make real network requests or target real systems.
- ✅ Offensive work = screenshots/write-ups only; interactive demos = self-contained client-side.

---

*Created 2026-06-24. Companion to the LLM Protector live demo (see that project's README).*
