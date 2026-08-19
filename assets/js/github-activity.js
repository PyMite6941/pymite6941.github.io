/*
 * GitHub activity for the projects page (pages/projects.html).
 *
 * Pulls the most recently updated *public* repos for @PyMite6941 from the
 * public GitHub API and renders them as a "recent updates" feed, each with an
 * optional expandable file tree (the git trees API, recursive).
 *
 * Renders instantly: a cached list is drawn synchronously from localStorage on
 * boot, then a background refresh swaps in fresh data. Everything degrades to
 * the cache, or a quiet note, when offline or rate-limited (unauthenticated
 * GitHub API: 60 requests/hour per IP).
 *
 * HIDDEN-PROJECT SAFETY:
 *   The feed is filtered through HIDDEN_REPO_SUBSTRINGS (a deny-list protecting
 *   HIDDEN_PROJECTS.md projects). Do not gut it. Repo display names come from
 *   REPO_ALIASES so site names match the chatbot's name mapping; repos not in
 *   the alias map fall back to their GitHub name.
 *
 * No API tokens, no build step, no own analytics.
 */
(function () {
	'use strict';

	var GH_USER = 'PyMite6941';
	var GH_ROOT = 'https://api.github.com';
	var MAX_REPOS = 8;
	var CACHE_TTL_MS = 10 * 60 * 1000;

	/*
	 * Deny-list pulled from HIDDEN_PROJECTS.md. These projects must never
	 * surface anywhere on the site, so their public repos are excluded from
	 * this feed too, even though their GitHub source is live. Substrings are
	 * matched against lowercase repo names. Do not remove entries.
	 */
	var HIDDEN_REPO_SUBSTRINGS = ['connect4', 'connect-4', 'vortex', 'forgeos', 'forge-os'];

	/*
	 * Curated display names: GitHub repo name -> site project name, kept in sync
	 * with the same mapping the chatbot uses (see CLAUDE.md). A repo not in this
	 * map renders under its GitHub name, which is fine — the deny-list above is
	 * the actual safety boundary.
	 */
	var REPO_ALIASES = {
		'expense-tracker': 'The Finance Kit',
		'stock-analysis-engine': 'Stock Analysis Engine',
		'magellan-search-engine': 'Magellan Search Engine',
		'markdown-previewer': 'Markdown Previewer',
		'md-to-html-converter': 'Markdown to HTML Converter',
		'30-days-of-ai': '30 Days of AI Programming Prompts',
	};

	var mount = document.getElementById('gh-activity');
	if (!mount) return;

	// ---------------- storage helpers ----------------
	function lsGet(key) {
		try { return JSON.parse(localStorage.getItem(key)); } catch (e) {}
		return null;
	}
	function lsSet(key, val) {
		try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
	}
	function getCache() {
		var c = lsGet('gh-repos-cache');
		if (c && Array.isArray(c.repos)) return c.repos;
		return null;
	}
	function setCache(repos) {
		lsSet('gh-repos-cache', { ts: Date.now(), repos: repos });
		lsSet('gh-last-sync', new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
	}

	// ---------------- filters & names ----------------
	function isHidden(name) {
		var low = String(name || '').toLowerCase();
		return HIDDEN_REPO_SUBSTRINGS.some(function (h) { return low.indexOf(h) !== -1; });
	}
	function alias(repo) {
		var key = String((repo && repo.name) || '').toLowerCase();
		return (key && REPO_ALIASES[key]) || ((repo && repo.name) || 'repo');
	}
	function relativeTime(iso) {
		if (!iso) return 'unknown';
		var then = new Date(iso);
		if (isNaN(then.getTime())) return 'unknown';
		var ms = Date.now() - then.getTime();
		var days = Math.floor(ms / 86400000);
		if (days < 0) return 'just now';
		if (days === 0) return 'today';
		if (days === 1) return 'yesterday';
		if (days < 30) return days + ' days ago';
		return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	// ---------------- API ----------------
	function ghFetch(path) {
		return fetch(GH_ROOT + path, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) {
			if (!r.ok) throw new Error('HTTP ' + r.status);
			return r.json();
		});
	}
	function loadRepos() {
		var cached = getCache();
		return ghFetch('/users/' + GH_USER + '/repos?per_page=100&sort=updated&type=public')
			.then(function (list) {
				if (!Array.isArray(list)) throw new Error('Bad payload');
				var visible = list
					.filter(function (r) { return !isHidden(r.name); })
					.sort(function (a, b) { return new Date(b.updated_at) - new Date(a.updated_at); })
					.slice(0, MAX_REPOS);
				setCache(visible);
				return visible;
			})
			.catch(function () { return cached || []; });
	}
	function loadTree(fullName, branch) {
		var cacheKey = 'gh-tree-' + fullName;
		var cached = lsGet(cacheKey);
		if (cached && cached.entries) return Promise.resolve(cached.entries);
		return ghFetch('/repos/' + fullName + '/git/trees/' + (branch || 'main') + '?recursive=1')
			.then(function (td) {
				var entries = ((td && td.tree) || []).slice(0, 300);
				lsSet(cacheKey, { entries: entries });
				return entries;
			})
			.catch(function () { return []; });
	}

	// ---------------- DOM ----------------
	function el(tag, cls, text) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		if (text !== undefined) e.textContent = text;
		return e;
	}
	function note(text) {
		return el('p', 'ct-muted', text);
	}

	function renderTree(list, slot) {
		if (!list || !list.length) {
			slot.innerHTML = '';
			slot.appendChild(note('No file tree available for this repo.'));
			return;
		}
		var pre = el('pre', 'code-segment gh-tree');
		var lines = list.map(function (e) {
			var path = e.path || '';
			var depth = path.split('/').length - 1;
			return new Array(depth + 1).join('    ') + (e.type === 'tree' ? '[dir] ' : '[file] ') + path;
		});
		pre.textContent = lines.join('\n');
		slot.innerHTML = '';
		slot.appendChild(pre);
	}

	function addTreeToggle(card, repo) {
		var slot = el('div', 'gh-tree-slot');
		card.appendChild(slot);
		var btn = el('button', 'nav-btn gh-tree-toggle', 'Browse tree');
		btn.type = 'button';
		btn.addEventListener('click', function () {
			if (slot.dataset.loaded === '1') {
				slot.style.display = slot.style.display === 'none' ? '' : 'none';
				return;
			}
			slot.style.display = '';
			slot.textContent = 'Loading tree…';
			loadTree(repo.full_name, repo.default_branch || 'main').then(function (entries) {
				renderTree(entries, slot);
				slot.dataset.loaded = '1';
			});
		});
		card.querySelector('.gh-repo-actions').appendChild(btn);
	}

	function repoCard(repo) {
		var card = el('div', 'gh-repo');
		var head = el('div', 'gh-repo-head');
		var a = el('a', 'gh-repo-name');
		a.href = (repo && repo.html_url) || GH_ROOT;
		a.target = '_blank';
		a.rel = 'noreferrer';
		a.textContent = alias(repo);
		head.appendChild(a);
		head.appendChild(el('span', 'gh-repo-meta', 'updated ' + relativeTime(repo.updated_at)));
		card.appendChild(head);

		if (repo.description) {
			card.appendChild(el('div', 'gh-repo-desc ct-muted', repo.description));
		}

		var actions = el('div', 'gh-repo-actions');
		card.appendChild(actions);
		if (repo.language) actions.appendChild(el('span', 'boxes', repo.language));
		addTreeToggle(card, repo);
		return card;
	}

	function renderList(repos, statusNote) {
		mount.innerHTML = '';
		if (statusNote) mount.appendChild(note(statusNote));
		if (!repos || !repos.length) {
			mount.appendChild(note('No public repositories to show yet.'));
			return;
		}
		var list = el('div', 'gh-list');
		repos.forEach(function (r) { list.appendChild(repoCard(r)); });
		mount.appendChild(list);
	}

	// ---------------- boot (instant, then refresh) ----------------
	var cached = getCache();
	if (cached && cached.length) {
		renderList(cached, 'Showing cached GitHub activity.');
	}
	loadRepos().then(function (repos) {
		var stamp = localStorage.getItem('gh-last-sync');
		renderList(repos, stamp ? 'Last refreshed ' + stamp + '.' : 'Live from the public GitHub API.');
	});
})();