/*
 * Projects page "Skills, backed by proof" panel.
 *
 * A skills list on its own is just a claim. This panel is built from the
 * project cards themselves, so every number is a count of real projects a
 * reader can click through to. Nothing is typed in by hand: add, remove, or
 * re-tag a card in pages/projects.html and the panel follows on its own.
 *
 * What it reads from each .card-container[data-tags]:
 *   - the .boxes tech pills and the .tag labels  -> which skills it shows
 *   - its links and tags                          -> live demo / in progress
 *
 * Clicking a skill filters the cards below it. Skills that have a checkbox in
 * the filter panel (Python, Go, Rust, ...) tick that box; everything else uses
 * filterBySkill(), an exact match on the card's tech pills. Either way, the
 * count on the chip is worked out the same way the filter works, so a chip
 * reading "Ollama 4" always shows exactly 4 cards.
 *
 * Depends on filter-mechanics.js for the actual filtering.
 */
(function () {
	'use strict';

	// Labels on cards that describe a card's state, not a skill.
	var STATUS_LABELS = ['live demo', 'in progress', 'interactive', 'offline'];

	// Which group a skill lands in. Anything not listed is a framework/tool.
	var LANGUAGES = [
		'Python', 'Go', 'Rust', 'JavaScript', 'TypeScript',
		'C/C++', 'Bash', 'Shell',
	];
	var AREAS = [
		'AI', 'Cybersecurity', 'Full Stack Development', 'Web Development',
		'Finance', 'Hardware', 'Math', 'Physics', 'Algorithms', '3D',
	];

	// A tool has to appear in at least this many projects to get a chip.
	// One-off tools still count toward the "and N more" line.
	var MIN_TOOL_COUNT = 2;

	function text(el) {
		return (el.textContent || '').replace(/\s+/g, ' ').trim();
	}

	function readCards() {
		return Array.prototype.map.call(
			document.querySelectorAll('.card-container[data-tags]'),
			function (card) {
				var skills = {};
				card.querySelectorAll('.boxes, .card-header .tag').forEach(function (el) {
					var name = text(el);
					if (name && STATUS_LABELS.indexOf(name.toLowerCase()) === -1) {
						skills[name.toLowerCase()] = name;
					}
				});
				var links = Array.prototype.map.call(card.querySelectorAll('a'), text).join(' ');
				var tagText = text(card.querySelector('.card-header') || card);
				return {
					tags: (card.dataset.tags || '').split('|'),
					skills: skills,
					live: /live demo|live site/i.test(links) || /live demo/i.test(tagText),
					inProgress: /in progress/i.test(tagText),
				};
			}
		);
	}

	// The filter checkboxes, keyed by lower-cased name.
	function readCheckboxes() {
		var boxes = {};
		document.querySelectorAll('#filter-panel .checkbox').forEach(function (cb) {
			boxes[cb.dataset.filter.toLowerCase()] = cb;
		});
		return boxes;
	}

	function countSkills(cards, checkboxes) {
		var names = {};
		cards.forEach(function (c) {
			Object.keys(c.skills).forEach(function (key) {
				if (!names[key]) names[key] = c.skills[key];
			});
		});

		return Object.keys(names).map(function (key) {
			var byCheckbox = !!checkboxes[key];
			var count = cards.filter(function (c) {
				return byCheckbox
					? c.tags.indexOf(checkboxes[key].dataset.filter) !== -1
					: Object.prototype.hasOwnProperty.call(c.skills, key);
			}).length;
			return { key: key, name: names[key], count: count, byCheckbox: byCheckbox };
		});
	}

	function groupOf(skill) {
		var inList = function (list) {
			return list.some(function (n) { return n.toLowerCase() === skill.key; });
		};
		if (inList(LANGUAGES)) return 'languages';
		if (inList(AREAS)) return 'areas';
		return 'tools';
	}

	function byCountThenName(a, b) {
		return b.count - a.count || a.name.localeCompare(b.name);
	}

	function applyFilter(skill, checkboxes, chip) {
		if (typeof window.filterBySkill !== 'function') return;
		// Pressing the chip that's already on turns it off again.
		if (chip.getAttribute('aria-pressed') === 'true') {
			window.filterBySkill('');
			return;
		}
		if (skill.byCheckbox) {
			window.filterBySkill('');                // clears everything, no skill set
			checkboxes[skill.key].checked = true;
			window.filterProjects();
		} else {
			window.filterBySkill(skill.name);
		}

		var target = document.getElementById('filter-results') ||
			document.querySelector('.projects-content .card-grid');
		var calm = window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (target) target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
	}

	function el(tag, className, content) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (content != null) node.textContent = content;
		return node;
	}

	function statTile(value, label) {
		var tile = el('div', 'skill-stat');
		tile.appendChild(el('span', 'skill-stat-value', String(value)));
		tile.appendChild(el('span', 'skill-stat-label', label));
		return tile;
	}

	function chipRow(title, skills, checkboxes) {
		var row = el('div', 'skill-group');
		row.appendChild(el('h3', 'skill-group-title', title));
		var list = el('div', 'skill-chips');
		skills.forEach(function (s) {
			var chip = el('button', 'skill-chip');
			chip.type = 'button';
			chip.setAttribute(
				'aria-label',
				'Show the ' + s.count + ' project' + (s.count === 1 ? '' : 's') + ' using ' + s.name
			);
			chip.setAttribute('aria-pressed', 'false');
			chip.dataset.skill = s.name;
			chip.dataset.byCheckbox = s.byCheckbox ? '1' : '';
			chip.appendChild(el('span', 'skill-chip-name', s.name));
			chip.appendChild(el('span', 'skill-chip-count', String(s.count)));
			chip.addEventListener('click', function () { applyFilter(s, checkboxes, chip); });
			list.appendChild(chip);
		});
		row.appendChild(list);
		return row;
	}

	function render() {
		var mount = document.getElementById('skill-map');
		if (!mount) return;                       // no-op off the projects page

		var cards = readCards();
		if (!cards.length) return;
		var checkboxes = readCheckboxes();
		var skills = countSkills(cards, checkboxes).filter(function (s) { return s.count > 0; });

		var languages = skills.filter(function (s) { return groupOf(s) === 'languages'; }).sort(byCountThenName);
		var areas = skills.filter(function (s) { return groupOf(s) === 'areas'; }).sort(byCountThenName);
		var allTools = skills.filter(function (s) { return groupOf(s) === 'tools'; }).sort(byCountThenName);
		var tools = allTools.filter(function (s) { return s.count >= MIN_TOOL_COUNT; });

		var stats = el('div', 'skill-stats');
		stats.appendChild(statTile(cards.length, 'projects'));
		stats.appendChild(statTile(cards.filter(function (c) { return c.live; }).length, 'you can try live'));
		stats.appendChild(statTile(languages.length, 'languages'));
		stats.appendChild(statTile(allTools.length, 'frameworks & tools'));

		var body = mount.querySelector('.skill-map-body');
		body.appendChild(stats);
		body.appendChild(chipRow('Languages', languages, checkboxes));
		body.appendChild(chipRow('Areas', areas, checkboxes));
		body.appendChild(chipRow('Frameworks & tools', tools, checkboxes));

		var oneOffs = allTools.length - tools.length;
		if (oneOffs > 0) {
			body.appendChild(el(
				'p',
				'skill-map-note',
				'Plus ' + oneOffs + ' more tools used in a single project each. ' +
				'Search for any of them above.'
			));
		}

		mount.hidden = false;
	}

	// Highlight the chip whose filter is the only one on, so the reader can
	// see what they pressed (and press something else to switch).
	function markActive(e) {
		var d = e.detail || {};
		var onlyTag = d.tags && d.tags.length === 1 && !d.search && !d.skill ? d.tags[0] : '';
		document.querySelectorAll('#skill-map .skill-chip').forEach(function (chip) {
			var on = chip.dataset.byCheckbox
				? chip.dataset.skill === onlyTag
				: !!d.skill && chip.dataset.skill === d.skill && !(d.tags || []).length && !d.search;
			chip.setAttribute('aria-pressed', on ? 'true' : 'false');
		});
	}
	document.addEventListener('projectfilterchange', markActive);

	// Run after filter-mechanics.js has wired up the search box and checkboxes.
	// Both are deferred, so their DOMContentLoaded handlers run in script order.
	document.addEventListener('DOMContentLoaded', render);
})();
