/*
 * Commits & files panel for project cards.
 *
 * WHAT THIS IS FOR
 *   Lets a visitor look inside a project's public repo without leaving the
 *   card: the latest commits, and the full file tree, each linking out to
 *   GitHub. It is proof the project is real and moving, pulled live, so it can
 *   never go stale the way a hand-typed "Last Updated" line does.
 *
 * HOW TO USE IT
 *   Drop this into a card, naming the repo:
 *
 *     <details class="repo-explorer" data-repo-explore="petri">
 *       <summary>Commits &amp; files</summary>
 *     </details>
 *
 *   Optional `data-repo-path="watch"` scopes the tree (and the commit list) to
 *   one folder, for a project that lives inside a bigger repo.
 *
 *   Nothing is fetched until the panel is opened, so the projects page still
 *   costs no extra GitHub requests on load. Each opened repo costs two
 *   (commits + tree) and is cached for CACHE_TTL_MS, so reopening is free.
 *   Unauthenticated GitHub allows 60 requests/hour per IP; the shared repo
 *   list used by repo-links.js and github-activity.js is one of those.
 *
 * FAILURE BEHAVIOUR
 *   Rate limit, offline, private or renamed repo: the panel says so and links
 *   to the repo on GitHub instead. It never throws and never touches the rest
 *   of the card.
 *
 * SAFETY
 *   - Everything from the API is written with textContent, never innerHTML.
 *     Commit messages and file names are attacker-controlled text as far as
 *     this page is concerned.
 *   - HIDDEN_REPO_SUBSTRINGS is the same deny-list as repo-links.js and
 *     github-activity.js (from HIDDEN_PROJECTS.md). A hidden repo's panel is
 *     removed from the page without a single request. There are now THREE
 *     copies of this list; change all of them together.
 */
(function () {
	'use strict';

	var panels = document.querySelectorAll('details[data-repo-explore]');
	if (!panels.length) return;

	var GH_USER = 'PyMite6941';
	var GH_ROOT = 'https://api.github.com';
	var CACHE_PREFIX = 'gh-explore:';
	var CACHE_TTL_MS = 30 * 60 * 1000;
	var MAX_COMMITS = 8;
	var MAX_TREE_ENTRIES = 1500;

	var HIDDEN_REPO_SUBSTRINGS = [
		'connect4', 'connect-4', 'vortex', 'forgeos', 'forge-os', 'anniversary',
		'reconkit', 'recon-kit',
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

	// ---------------- helpers ----------------
	function el(tag, cls, text) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (text != null) n.textContent = text;
		return n;
	}
	function link(href, text, cls) {
		var a = el('a', cls, text);
		a.href = href;
		a.target = '_blank';
		a.rel = 'noreferrer';
		return a;
	}
	function encPath(p) {
		return String(p).split('/').map(encodeURIComponent).join('/');
	}
	function relativeTime(iso) {
		var then = Date.parse(iso);
		if (!then) return '';
		var mins = Math.round((Date.now() - then) / 60000);
		if (mins < 60) return mins <= 1 ? 'just now' : mins + ' min ago';
		var hrs = Math.round(mins / 60);
		if (hrs < 24) return hrs + 'h ago';
		var days = Math.round(hrs / 24);
		if (days < 30) return days === 1 ? 'yesterday' : days + ' days ago';
		return new Date(then).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	// The shared repo list (written by repo-links.js / github-activity.js)
	// already knows each repo's default branch, which saves a request.
	function knownBranch(repo) {
		var c = lsGet('gh-repos-cache');
		var list = (c && c.repos) || [];
		for (var i = 0; i < list.length; i++) {
			if (list[i] && String(list[i].name).toLowerCase() === repo.toLowerCase()) {
				return list[i].default_branch || null;
			}
		}
		return null;
	}

	function ghGet(path) {
		return fetch(GH_ROOT + path, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) {
			if (r.ok) return r.json();
			var err = new Error('HTTP ' + r.status);
			err.status = r.status;
			err.rateLimited = r.status === 403 || r.status === 429;
			throw err;
		});
	}

	// ---------------- data ----------------
	function load(repo, scope) {
		var key = CACHE_PREFIX + repo.toLowerCase() + (scope ? ':' + scope : '');
		var hit = lsGet(key);
		if (hit && Date.now() - (hit.ts || 0) < CACHE_TTL_MS) return Promise.resolve(hit);

		var base = '/repos/' + GH_USER + '/' + encodeURIComponent(repo);
		var branch = knownBranch(repo);
		var branchP = branch
			? Promise.resolve(branch)
			: ghGet(base).then(function (r) { return r.default_branch || 'HEAD'; });

		return branchP.then(function (br) {
			var commitsQ = '/commits?per_page=' + MAX_COMMITS + (scope ? '&path=' + encodeURIComponent(scope) : '');
			return Promise.all([
				ghGet(base + commitsQ),
				ghGet(base + '/git/trees/' + encodeURIComponent(br) + '?recursive=1'),
			]).then(function (res) {
				var prefix = scope ? scope.replace(/\/+$/, '') + '/' : '';
				var commits = (res[0] || []).map(function (c) {
					return {
						sha: c.sha,
						msg: String((c.commit && c.commit.message) || '').split('\n')[0],
						date: c.commit && c.commit.author && c.commit.author.date,
					};
				});
				var tree = ((res[1] && res[1].tree) || [])
					.filter(function (t) { return !prefix || t.path.indexOf(prefix) === 0; })
					.map(function (t) { return { p: prefix ? t.path.slice(prefix.length) : t.path, d: t.type === 'tree' }; })
					.filter(function (t) { return t.p; });
				var data = {
					ts: Date.now(),
					branch: br,
					commits: commits,
					tree: tree.slice(0, MAX_TREE_ENTRIES),
					cut: tree.length > MAX_TREE_ENTRIES || !!(res[1] && res[1].truncated),
				};
				lsSet(key, data);
				return data;
			});
		});
	}

	// ---------------- render ----------------
	function renderCommits(box, repo, data) {
		var head = el('p', 'repo-explorer-head', 'Latest commits');
		box.appendChild(head);
		if (!data.commits.length) {
			box.appendChild(el('p', 'repo-explorer-note', 'No commits yet.'));
			return;
		}
		var ul = el('ul', 'repo-commits');
		data.commits.forEach(function (c) {
			var li = el('li');
			li.appendChild(link('https://github.com/' + GH_USER + '/' + repo + '/commit/' + c.sha, c.sha.slice(0, 7), 'repo-sha'));
			li.appendChild(el('span', 'repo-msg', c.msg));
			li.appendChild(el('span', 'repo-when', relativeTime(c.date)));
			ul.appendChild(li);
		});
		box.appendChild(ul);
	}

	// Turn the flat path list into nested <details> folders, folders first.
	function renderTree(box, repo, scope, data) {
		box.appendChild(el('p', 'repo-explorer-head', 'Files'));
		var root = { dirs: {}, files: [] };
		data.tree.forEach(function (t) {
			var parts = t.p.split('/');
			var node = root;
			var last = parts.length - 1;
			for (var i = 0; i < last; i++) {
				node = node.dirs[parts[i]] || (node.dirs[parts[i]] = { dirs: {}, files: [] });
			}
			if (t.d) node.dirs[parts[last]] = node.dirs[parts[last]] || { dirs: {}, files: [] };
			else node.files.push(parts[last]);
		});

		var blobBase = 'https://github.com/' + GH_USER + '/' + repo + '/blob/' + encodeURIComponent(data.branch) + '/';
		var prefix = scope ? scope.replace(/\/+$/, '') + '/' : '';

		function build(node, path) {
			var ul = el('ul', 'repo-tree');
			Object.keys(node.dirs).sort().forEach(function (name) {
				var li = el('li');
				var d = el('details');
				d.appendChild(el('summary', 'repo-dir', name + '/'));
				d.appendChild(build(node.dirs[name], path + name + '/'));
				li.appendChild(d);
				ul.appendChild(li);
			});
			node.files.sort().forEach(function (name) {
				var li = el('li');
				li.appendChild(link(blobBase + encPath(prefix + path + name), name, 'repo-file'));
				ul.appendChild(li);
			});
			return ul;
		}
		box.appendChild(build(root, ''));
		if (data.cut) box.appendChild(el('p', 'repo-explorer-note', 'Tree is too large to show in full here — the rest is on GitHub.'));
	}

	function renderError(box, repo, err) {
		var msg = err && err.rateLimited
			? 'GitHub’s hourly limit for this network has been reached. Try again later, or browse it on GitHub:'
			: err && err.status === 404
				? 'This repo isn’t public right now.'
				: 'Couldn’t reach GitHub. Browse it there instead:';
		box.appendChild(el('p', 'repo-explorer-note', msg));
		if (!(err && err.status === 404)) {
			box.appendChild(link('https://github.com/' + GH_USER + '/' + repo, 'github.com/' + GH_USER + '/' + repo, 'text-link'));
		}
	}

	function open(panel) {
		if (panel.getAttribute('data-loaded')) return;
		panel.setAttribute('data-loaded', '1');
		var repo = panel.getAttribute('data-repo-explore');
		var scope = panel.getAttribute('data-repo-path') || '';
		var box = el('div', 'repo-explorer-body');
		var status = el('p', 'repo-explorer-note', 'Loading from GitHub…');
		box.appendChild(status);
		panel.appendChild(box);

		load(repo, scope).then(function (data) {
			box.removeChild(status);
			renderCommits(box, repo, data);
			renderTree(box, repo, scope, data);
			var foot = el('p', 'repo-explorer-foot');
			foot.appendChild(link('https://github.com/' + GH_USER + '/' + repo + '/commits/' + encodeURIComponent(data.branch) + (scope ? '/' + encPath(scope) : ''), 'Full history on GitHub →', 'text-link'));
			box.appendChild(foot);
		}).catch(function (err) {
			box.removeChild(status);
			renderError(box, repo, err);
			panel.removeAttribute('data-loaded');       // allow a retry on reopen
			box.setAttribute('data-failed', '1');
		});
	}

	panels.forEach(function (panel) {
		var repo = panel.getAttribute('data-repo-explore');
		if (!repo || isHidden(repo)) { panel.parentNode.removeChild(panel); return; }
		panel.addEventListener('toggle', function () {
			if (!panel.open) return;
			var failed = panel.querySelector('.repo-explorer-body[data-failed]');
			if (failed) panel.removeChild(failed);
			open(panel);
		});
	});
})();
