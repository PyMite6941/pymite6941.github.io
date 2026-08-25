/*
 * Projects page filtering: free-text search + the tech checkboxes.
 *
 * `filterProjects()` stays global because the checkboxes call it from inline
 * onclick handlers in pages/projects.html. Don't rename it without updating
 * every one of those.
 *
 * The two controls combine with AND: a card must match the search text AND at
 * least one ticked tech box. With nothing typed and nothing ticked, everything
 * shows. Searchable text is the card's title, its description, its `.boxes`
 * tech pills, and its data-tags, so "rust", "offline", "spaced repetition" and
 * "Cloudflare" all find something.
 *
 * Hidden-project note: this only ever hides cards that are already in the HTML.
 * It cannot reveal anything, so it is not a discovery surface.
 */
(function () {
	'use strict';

	var filterBaseLabel = 'Filter';
	var searchTerm = '';

	// Cache each card's searchable text once. Re-reading textContent for every
	// keystroke across 30+ cards is the kind of thing that makes typing feel laggy.
	var cards = [];
	function indexCards() {
		cards = Array.prototype.map.call(
			document.querySelectorAll('.card-container[data-tags]'),
			function (card) {
				var title = card.querySelector('h3');
				return {
					el: card,
					tags: (card.dataset.tags || '').split('|'),
					title: title ? title.textContent.trim() : '',
					haystack: (
						(card.textContent || '') + ' ' + (card.dataset.tags || '')
					)
						.replace(/\s+/g, ' ')
						.toLowerCase(),
				};
			}
		);
	}

	function activeTags() {
		return Array.prototype.map.call(
			document.querySelectorAll('#filter-panel .checkbox:checked'),
			function (cb) { return cb.dataset.filter; }
		);
	}

	function filterProjects() {
		var active = activeTags();
		// Every whitespace-separated word must appear somewhere in the card, so
		// "python offline" narrows rather than widening like an OR would.
		var words = searchTerm.split(/\s+/).filter(Boolean);
		var shown = 0;

		cards.forEach(function (c) {
			var tagOk = active.length === 0 || active.some(function (f) {
				return c.tags.indexOf(f) !== -1;
			});
			var textOk = words.every(function (w) { return c.haystack.indexOf(w) !== -1; });
			var show = tagOk && textOk;
			c.el.style.display = show ? '' : 'none';
			if (show) shown++;
		});

		updateFilterCount(active.length);
		updateStatus(shown, cards.length, active.length, words.length);
	}

	function updateFilterCount(n) {
		var label = document.getElementById('filter-toggle-label');
		if (label) label.textContent = n > 0 ? filterBaseLabel + ' (' + n + ')' : filterBaseLabel;
	}

	function updateStatus(shown, total, tagCount, wordCount) {
		var status = document.getElementById('filter-status');
		if (!status) return;
		var filtering = tagCount > 0 || wordCount > 0;
		if (!filtering) {
			status.textContent = total + ' projects';
		} else if (shown === 0) {
			status.textContent = 'No projects match. Try a different word, or clear the filters.';
		} else {
			status.textContent = 'Showing ' + shown + ' of ' + total + ' projects';
		}
		var empty = document.getElementById('filter-empty');
		if (empty) empty.hidden = shown !== 0;
	}

	function clearAll() {
		var box = document.getElementById('project-search');
		if (box) box.value = '';
		searchTerm = '';
		Array.prototype.forEach.call(
			document.querySelectorAll('#filter-panel .checkbox'),
			function (cb) { cb.checked = false; }
		);
		filterProjects();
		if (box) box.focus();
	}

	function init() {
		var panel = document.getElementById('filter-panel');
		if (!panel) return;                       // no-op off the projects page

		indexCards();

		var label = document.getElementById('filter-toggle-label');
		if (label) filterBaseLabel = label.textContent.trim();

		var toggle = document.getElementById('filter-toggle');
		if (toggle) {
			toggle.addEventListener('click', function () {
				var open = panel.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
		}

		var box = document.getElementById('project-search');
		if (box) {
			box.addEventListener('input', function () {
				searchTerm = box.value.trim().toLowerCase();
				filterProjects();
			});
			// Escape clears, which is what people expect from a search field.
			box.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && box.value) { e.preventDefault(); clearAll(); }
			});
		}

		var clear = document.getElementById('filter-clear');
		if (clear) clear.addEventListener('click', clearAll);

		filterProjects();
	}

	window.filterProjects = filterProjects;
	document.addEventListener('DOMContentLoaded', init);
})();
