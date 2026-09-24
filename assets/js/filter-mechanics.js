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
	// Set by the "Skills, backed by proof" panel (skill-map.js). An exact,
	// whole-name match on a card's tech pills, so "BLE" doesn't match "possible".
	var skillFilter = '';
	var skillLabel = '';

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
					skills: cardSkills(card),
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

	// Lower-cased names of a card's tech pills and header labels.
	function cardSkills(card) {
		return Array.prototype.map.call(
			card.querySelectorAll('.boxes, .card-header .tag'),
			function (el) { return el.textContent.replace(/\s+/g, ' ').trim().toLowerCase(); }
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
			var skillOk = !skillFilter || c.skills.indexOf(skillFilter) !== -1;
			var show = tagOk && textOk && skillOk;
			c.el.style.display = show ? '' : 'none';
			if (show) shown++;
		});

		updateFilterCount(active.length);
		updateStatus(shown, cards.length, active.length + (skillFilter ? 1 : 0), words.length);
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
			status.textContent = 'Showing ' + shown + ' of ' + total + ' projects' +
				(skillLabel ? ' using ' + skillLabel : '');
		}
		var empty = document.getElementById('filter-empty');
		if (empty) empty.hidden = shown !== 0;

		// The same message again, right above the cards. On phones the filter
		// panel sits far above the grid, so without this a reader who jumped
		// down from a skill chip can't see that a filter is on.
		var bar = document.getElementById('filter-results');
		var barText = document.getElementById('filter-results-text');
		if (bar && barText) {
			bar.hidden = !filtering || shown === 0;
			barText.textContent = status.textContent;
		}

		// Let other scripts (skill-map.js) show which filter is on.
		document.dispatchEvent(new CustomEvent('projectfilterchange', {
			detail: { skill: skillLabel, tags: activeTags(), search: searchTerm },
		}));
	}

	// `quiet` skips focusing the search box, for when a skill chip (not the
	// Clear button) triggered this — no need to pop up a phone keyboard.
	function clearAll(quiet) {
		var box = document.getElementById('project-search');
		if (box) box.value = '';
		searchTerm = '';
		skillFilter = '';
		skillLabel = '';
		Array.prototype.forEach.call(
			document.querySelectorAll('#filter-panel .checkbox'),
			function (cb) { cb.checked = false; }
		);
		filterProjects();
		if (box && quiet !== true) box.focus();
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
				dropSkillFilter();
				filterProjects();
			});
			// Escape clears, which is what people expect from a search field.
			box.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && box.value) { e.preventDefault(); clearAll(); }
			});
		}

		var clear = document.getElementById('filter-clear');
		if (clear) clear.addEventListener('click', clearAll);

		var barClear = document.getElementById('filter-results-clear');
		if (barClear) barClear.addEventListener('click', function () { clearAll(true); });

		// Ticking a box by hand means the reader has moved on from the skill
		// chip they pressed, so drop it rather than leave an invisible filter.
		// (The inline onclick already re-filtered; this runs just after it.)
		Array.prototype.forEach.call(
			panel.querySelectorAll('.checkbox'),
			function (cb) {
				cb.addEventListener('change', function () {
					if (dropSkillFilter()) filterProjects();
				});
			}
		);

		filterProjects();
	}

	// Returns true if a skill filter was on and has now been turned off.
	function dropSkillFilter() {
		if (!skillFilter) return false;
		skillFilter = '';
		skillLabel = '';
		return true;
	}

	// Show only cards that list this exact skill. Clears the other filters
	// first so the result is exactly the count the skill chip promised.
	function filterBySkill(name) {
		clearAll(true);
		skillFilter = String(name).toLowerCase();
		skillLabel = String(name);
		filterProjects();
	}

	window.filterProjects = filterProjects;
	window.filterBySkill = filterBySkill;
	document.addEventListener('DOMContentLoaded', init);
})();
