/*
 * Self-updating GitHub links.
 *
 * WHAT THIS IS FOR
 *   So you can change something on GitHub — publish a demo, rename a repo, move
 *   it to a new host — and the link on this site follows, without anyone editing
 *   HTML and re-stamping assets. You update the repo; the page catches up.
 *
 * HOW TO USE IT
 *   Put the repo name on the anchor. The href you write stays in the HTML and is
 *   the fallback, so the link is never broken even if this script never runs:
 *
 *     <a class="text-link"
 *        href="https://github.com/PyMite6941/squint"
 *        data-repo="squint">View Source Code and Project</a>
 *
 *   Optional `data-repo-link` picks which URL wins:
 *     auto   (default) — the repo's Website/homepage field if it is set,
 *                        otherwise the repo URL. Set a Website on GitHub and
 *                        the card starts pointing at the live demo by itself.
 *     live            — homepage only; if unset, the written href is kept.
 *     source          — always the repo URL, even when a homepage exists.
 *
 *   Optional freshness stamp, filled in as "Updated 3 days ago":
 *
 *     <span data-repo-updated="squint"></span>
 *
 * WHY IT IS SAFE TO LEAVE ON EVERY PAGE
 *   - No-ops instantly when the page has no [data-repo] / [data-repo-updated].
 *   - Never clears or blanks an href. Every failure path — offline, rate limit,
 *     unknown repo, malformed URL — leaves the HTML exactly as authored.
 *   - Shares the `gh-repos-cache` entry that github-activity.js already writes,
 *     so having both on projects.html costs ONE request, not two. The
 *     unauthenticated GitHub API allows 60 requests/hour per IP; this script
 *     will not be what exhausts it.
 *   - No tokens. Nothing here needs auth, so nothing here can leak auth.
 *
 * HIDDEN-PROJECT SAFETY
 *   Resolution is refused for any repo matching HIDDEN_REPO_SUBSTRINGS, the same
 *   deny-list github-activity.js uses for HIDDEN_PROJECTS.md projects. A hidden
 *   repo's live URL must never be written into this site by an automated
 *   lookup, so those anchors keep whatever the HTML said. Do not gut this.
 */
(function () {
	'use strict';

	var nodes = document.querySelectorAll('[data-repo], [data-repo-updated]');
	if (!nodes.length) return;

	var GH_USER = 'PyMite6941';
	var GH_ROOT = 'https://api.github.com';
	var CACHE_KEY = 'gh-repos-cache';
	var CACHE_TTL_MS = 10 * 60 * 1000;

	/*
	 * Deny-list from HIDDEN_PROJECTS.md. Kept identical to the one in
	 * github-activity.js — if you add a project there, add it in both places.
	 * 'anniversary' is included because that repo is private *today*; the guard
	 * has to already be in place for the day it is not.
	 */
	var HIDDEN_REPO_SUBSTRINGS = [
		'connect4', 'connect-4', 'vortex', 'forgeos', 'forge-os', 'anniversary',
	];

	function isHidden(name) {
		var n = String(name || '').toLowerCase();
		for (var i = 0; i < HIDDEN_REPO_SUBSTRINGS.length; i++) {
			if (n.indexOf(HIDDEN_REPO_SUBSTRINGS[i]) !== -1) return true;
		}
		return false;
	}

	// ---------------- storage ----------------
	function lsGet(key) {
		try { return JSON.parse(localStorage.getItem(key)); } catch (e) {}
		return null;
	}
	function lsSet(key, val) {
		try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
	}

	// ---------------- url vetting ----------------
	/*
	 * Only ever write an absolute https URL. The GitHub `homepage` field is free
	 * text a repo owner types, so it can be blank, a bare domain, or junk; none
	 * of that should reach an href. Anything that does not parse as https is
	 * rejected and the authored href survives.
	 */
	function safeUrl(raw) {
		if (!raw) return null;
		var s = String(raw).trim();
		if (!s) return null;
		if (s.indexOf('http://') === 0) s = 'https://' + s.slice(7);
		if (s.indexOf('https://') !== 0) s = 'https://' + s;
		try {
			var u = new URL(s);
			return u.protocol === 'https:' && u.hostname.indexOf('.') !== -1 ? u.href : null;
		} catch (e) {
			return null;
		}
	}

	function relativeTime(iso) {
		var then = Date.parse(iso);
		if (!then) return null;
		var mins = Math.round((Date.now() - then) / 60000);
		if (mins < 60) return mins <= 1 ? 'just now' : mins + ' minutes ago';
		var hrs = Math.round(mins / 60);
		if (hrs < 24) return hrs === 1 ? 'an hour ago' : hrs + ' hours ago';
		var days = Math.round(hrs / 24);
		if (days < 30) return days === 1 ? 'yesterday' : days + ' days ago';
		var mons = Math.round(days / 30);
		if (mons < 12) return mons === 1 ? 'a month ago' : mons + ' months ago';
		var yrs = Math.round(mons / 12);
		return yrs === 1 ? 'a year ago' : yrs + ' years ago';
	}

	// ---------------- apply ----------------
	function index(repos) {
		var byName = {};
		(repos || []).forEach(function (r) {
			if (r && r.name && !isHidden(r.name)) byName[r.name.toLowerCase()] = r;
		});
		return byName;
	}

	function apply(repos) {
		var byName = index(repos);
		if (!Object.keys(byName).length) return;

		document.querySelectorAll('a[data-repo]').forEach(function (a) {
			var wanted = a.getAttribute('data-repo');
			if (!wanted || isHidden(wanted)) return;      // hidden: keep authored href
			var repo = byName[wanted.toLowerCase()];
			if (!repo) return;                            // unknown/private: keep authored href

			var mode = (a.getAttribute('data-repo-link') || 'auto').toLowerCase();
			var live = safeUrl(repo.homepage);
			var source = safeUrl(repo.html_url);
			var next = mode === 'source' ? source : mode === 'live' ? live : (live || source);
			if (!next || next === a.href) return;

			a.href = next;
			// Off-site links opened from cards behave like the hand-written ones.
			if (!a.target) { a.target = '_blank'; a.rel = 'noreferrer'; }
		});

		document.querySelectorAll('[data-repo-updated]').forEach(function (el) {
			var wanted = el.getAttribute('data-repo-updated');
			if (!wanted || isHidden(wanted)) return;
			var repo = byName[wanted.toLowerCase()];
			if (!repo || !repo.pushed_at) return;
			var rel = relativeTime(repo.pushed_at);
			if (rel) el.textContent = 'Updated ' + rel;
		});
	}

	// ---------------- boot ----------------
	// Paint from cache first so links settle without waiting on the network,
	// then refresh in the background only if the cache has gone stale.
	var cached = lsGet(CACHE_KEY);
	if (cached && cached.repos) apply(cached.repos);
	if (cached && cached.repos && Date.now() - (cached.ts || 0) < CACHE_TTL_MS) return;

	fetch(GH_ROOT + '/users/' + GH_USER + '/repos?per_page=100&sort=pushed', {
		headers: { Accept: 'application/vnd.github+json' },
	})
		.then(function (r) { return r.ok ? r.json() : null; })
		.then(function (repos) {
			if (!repos || !repos.length) return;          // rate-limited: cache stands
			// Strip hidden repos BEFORE caching. github-activity.js reads this same
			// entry and renders straight from it, so an unfiltered write here would
			// put a HIDDEN_PROJECTS.md repo on the page through the back door.
			var safe = repos.filter(function (r) { return r && !isHidden(r.name); });
			lsSet(CACHE_KEY, { ts: Date.now(), repos: safe });
			apply(safe);
		})
		.catch(function () { /* offline: authored hrefs stand */ });
})();
