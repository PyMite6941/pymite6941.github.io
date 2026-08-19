/*
 * College Application Tracker — pure vanilla single-page app.
 *
 * Views: Dashboard / This Week / Honors / Essays / Export.
 * Persistence: localStorage only (no API, fully offline). All user state is
 * keyed on school id; the underlying dataset is COLLEGE_TRACKER_DATA.
 *
 * Urgency colouring (spec): red = due <= 7 days, yellow = <= 30 days,
 * green = done. "TODO" values are rendered as grey unset chips.
 */
(function () {
	'use strict';

	var DATA = window.CollegeTrackerData || { schools: [] };
	var LS_KEY = 'college-tracker-state-v1';
	var EDIT_KEY = 'college-tracker-edit-v1';

	var state = loadState();
	var activeTab = 'dashboard';

	/*
	 * Read-only by default; editing unlocks with ?edit=1 and sticks in
	 * localStorage so Matt only types it once per browser. ?edit=0 locks again.
	 *
	 * This is a VIEW AFFORDANCE, NOT A SECURITY CONTROL — anyone reading this
	 * file can flip the flag. It does not need to be secure: there is no server
	 * and no shared state, so a visitor's edits write to their own browser only
	 * and can never reach Matt's data. The flag exists so visitors (counselors,
	 * recruiters) see a clean static artifact instead of live form controls
	 * that look like a document they are expected to fill in.
	 */
	var editMode = resolveEditMode();

	function resolveEditMode() {
		var q = '';
		try { q = window.location.search || ''; } catch (e) {}
		if (/[?&]edit=1(?:&|$)/.test(q)) {
			try { localStorage.setItem(EDIT_KEY, '1'); } catch (e) {}
			return true;
		}
		if (/[?&]edit=0(?:&|$)/.test(q)) {
			try { localStorage.removeItem(EDIT_KEY); } catch (e) {}
			return false;
		}
		try { return localStorage.getItem(EDIT_KEY) === '1'; } catch (e) {}
		return false;
	}

	// ---------- persistence ----------
	function loadState() {
		try {
			var raw = localStorage.getItem(LS_KEY);
			if (raw) {
				var parsed = JSON.parse(raw);
				if (parsed && parsed.version === DATA.version) return parsed;
			}
		} catch (e) {}
		return freshState();
	}

	function freshState() {
		var s = { version: DATA.version, schools: {}, essays: {} };
		DATA.schools.forEach(function (sc) {
			s.schools[sc.id] = {
				tier: sc.tier || 'TODO',
				status: 'Not started',
				deadlines: {
					application: sc.deadlines.application || '',
					finaid: sc.deadlines.finaid || '',
					scholarship: sc.deadlines.scholarship || '',
					deposit: sc.deadlines.deposit || '',
				},
				portal: {
					name: (sc.portal && sc.portal.name) || '',
					url: (sc.portal && sc.portal.url && sc.portal.url !== 'TODO') ? sc.portal.url : '',
					note: (sc.portal && sc.portal.note) || '',
				},
				materials: {},
				notes: sc.notes || '',
			};
			DATA.materialLabels.forEach(function (m) {
				s.schools[sc.id].materials[m.key] = false;
			});
			s.essays[sc.id] = (sc.essays || []).map(function (p) {
				return { prompt: p, words: '' };
			});
		});
		return s;
	}

	function save() {
		try {
			localStorage.setItem(LS_KEY, JSON.stringify(state));
		} catch (e) {}
	}

	// ---------- date helpers ----------
	function todayStr() {
		var d = new Date();
		var mm = String(d.getMonth() + 1).padStart(2, '0');
		var dd = String(d.getDate()).padStart(2, '0');
		return d.getFullYear() + '-' + mm + '-' + dd;
	}
	function addDays(dateStr, n) {
		var d = new Date(dateStr + 'T12:00:00');
		d.setDate(d.getDate() + n);
		var mm = String(d.getMonth() + 1).padStart(2, '0');
		var dd = String(d.getDate()).padStart(2, '0');
		return d.getFullYear() + '-' + mm + '-' + dd;
	}
	function daysUntil(dateStr) {
		if (!dateStr) return Infinity;
		var a = new Date(dateStr + 'T12:00:00');
		var b = new Date(todayStr() + 'T12:00:00');
		return Math.round((a - b) / 86400000);
	}
	function urgencyClass(dateStr) {
		if (!dateStr) return '';
		var days = daysUntil(dateStr);
		if (days < 0) return 'overdue';
		if (days <= 7) return 'urgent-red';
		if (days <= 30) return 'urgent-yellow';
		return 'urgent-cool';
	}
	function isTODO(val) {
		return !val || val === 'TODO';
	}
	function prettyDate(dateStr) {
		if (isTODO(dateStr)) return 'TODO';
		var d = new Date(dateStr + 'T12:00:00');
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	// ---------- DOM helpers ----------
	function el(tag, cls, html) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		if (html !== undefined) e.innerHTML = html;
		return e;
	}

	// ---------- tabs ----------
	function renderTabs() {
		var tabs = el('div', 'ct-tabs');
		[
			['dashboard', 'Dashboard'],
			['week', 'This Week'],
			['honors', 'Honors Colleges'],
			['essays', 'Essays'],
			['export', 'Export'],
		].forEach(function (t) {
			var b = el('button', 'ct-tab' + (activeTab === t[0] ? ' ct-tab-active' : ''), t[1]);
			b.type = 'button';
			b.addEventListener('click', function () {
				activeTab = t[0];
				render();
			});
			tabs.appendChild(b);
		});
		return tabs;
	}

	function renderView() {
		if (activeTab === 'week') return renderWeek();
		if (activeTab === 'honors') return renderHonors();
		if (activeTab === 'essays') return renderEssays();
		if (activeTab === 'export') return renderExport();
		return renderDashboard();
	}

	// ---------- Dashboard ----------
	function tierClass(tier) {
		var t = (tier || '').toLowerCase();
		if (t === 'safety' || t === 'target' || t === 'reach' || t === 'lottery') return 'ct-tier-' + t;
		return 'ct-tier-todo';
	}
	function tierBadge(tier) {
		var b = el('span', 'ct-tier ' + tierClass(tier));
		b.textContent = isTODO(tier) ? 'Tier: TODO' : 'Tier: ' + tier;
		return b;
	}

	function renderDashboard() {
		var wrap = el('div', 'ct-dash');
		var summary = el('div', 'ct-summary');
		var submitted = 0;
		var total = DATA.schools.length;
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			if (st && ['Submitted', 'Under review', 'Decision', 'Decided'].indexOf(st.status) !== -1) submitted++;
		});
		summary.innerHTML =
			'<div><strong>' + submitted + '/' + total + '</strong> applications submitted</div>' +
			'<div class="ct-muted">Portal check = the habit that prevents disasters</div>';
		wrap.appendChild(summary);

		DATA.schools.forEach(function (sc) {
			wrap.appendChild(renderSchoolCard(sc));
		});
		return wrap;
	}

	/*
	 * Read-only card body: same information, rendered as plain text instead of
	 * form controls. Empty fields are omitted rather than shown as blank inputs.
	 */
	function renderCardBodyReadOnly(sc, st, card) {
		var badgeRow = el('div', 'ct-tier-row');
		badgeRow.appendChild(tierBadge(st.tier));
		card.appendChild(badgeRow);

		var dl = el('div', 'ct-deadlines');
		[
			['application', 'Application'],
			['finaid', 'Financial aid'],
			['scholarship', 'Scholarship'],
			['deposit', 'Deposit'],
		].forEach(function (row) {
			var val = st.deadlines[row[0]] || '';
			var chip = el('span', 'ct-chip ' + urgencyClass(val) + (isTODO(val) ? ' ct-chip-todo' : ''));
			chip.innerHTML = '<span class="ct-chip-label">' + row[1] + ':</span> <span class="ct-chip-val">' + (isTODO(val) ? 'TODO' : prettyDate(val)) + '</span>';
			dl.appendChild(chip);
		});
		card.appendChild(dl);

		if (sc.hasCSS) {
			card.appendChild(el('div', 'ct-css-note', '<strong>CSS Profile required</strong> — due in the financial-aid deadline field.'));
		}

		var pr = st.portal;
		if (pr.name || pr.url || pr.note) {
			var portal = el('div', 'ct-portal-block');
			if (pr.name) {
				portal.appendChild(el('div', 'ct-portal-line', '<span class="ct-chip-label">Portal:</span> ' + (pr.url ? '<a class="text-link" href="' + pr.url + '" target="_blank" rel="noreferrer">' + pr.name + '</a>' : pr.name)));
			}
			if (pr.note) portal.appendChild(el('div', 'ct-muted', pr.note));
			card.appendChild(portal);
		}

		card.appendChild(el('div', 'ct-materials-head', 'Application materials'));
		var mat = el('ul', 'ct-materials');
		DATA.materialLabels.forEach(function (mItem) {
			var done = !!st.materials[mItem.key];
			var li = el('li', 'ct-material' + (done ? ' ct-material-done' : ''));
			li.innerHTML = '<span class="ct-mark">' + (done ? '&#10003;' : '&#9675;') + '</span> <span>' + mItem.label + '</span>';
			mat.appendChild(li);
		});
		card.appendChild(mat);

		if (sc.interview) {
			card.appendChild(el('div', 'ct-muted', '<span class="ct-chip-label">Interview:</span> offered — request/date TODO'));
		}
		if (st.notes) {
			card.appendChild(el('div', 'ct-muted ct-notes-static', st.notes));
		}
		return card;
	}

	function renderSchoolCard(sc) {
		var st = state.schools[sc.id];
		var card = el('article', 'ct-card');

		// header: name + tier select + status select
		var head = el('div', 'ct-card-head');
		var title = el('div', 'ct-card-title');
		title.appendChild(el('h3', '', sc.short));
		if (sc.name.indexOf(sc.short) === -1) {
			title.appendChild(el('div', 'ct-muted ct-card-fullname', sc.name));
		}
		head.appendChild(title);

		var controls = el('div', 'ct-card-controls');
		if (!editMode) {
			controls.appendChild(el('span', 'ct-chip ct-chip-static', '<span class="ct-chip-label">Status:</span> <span class="ct-chip-val">' + st.status + '</span>'));
			head.appendChild(controls);
			card.appendChild(head);
			return renderCardBodyReadOnly(sc, st, card);
		}
		var tierSel = el('select', 'ct-select');
		tierSel.innerHTML = ['TODO'].concat(DATA.tiers)
			.map(function (t) {
				return '<option value="' + t + '"' + (st.tier === t ? ' selected' : '') + '>' + t + '</option>';
			})
			.join('');
		tierSel.addEventListener('change', function () {
			st.tier = tierSel.value;
			save();
			render();
		});
		var statusSel = el('select', 'ct-select');
		statusSel.innerHTML = DATA.statuses
			.map(function (s) {
				return '<option value="' + s + '"' + (st.status === s ? ' selected' : '') + '>' + s + '</option>';
			})
			.join('');
		statusSel.addEventListener('change', function () {
			st.status = statusSel.value;
			save();
			updateProgressCount();
			render();
		});
		controls.appendChild(tierSel);
		controls.appendChild(statusSel);
		head.appendChild(controls);
		card.appendChild(head);

		// tier badge strip
		var badgeRow = el('div', 'ct-tier-row');
		badgeRow.appendChild(tierBadge(st.tier));
		card.appendChild(badgeRow);

		// deadlines
		var dl = el('div', 'ct-deadlines');
		[
			['application', 'Application'],
			['finaid', 'Financial aid'],
			['scholarship', 'Scholarship'],
			['deposit', 'Deposit'],
		].forEach(function (row) {
			var key = row[0];
			var label = row[1];
			var val = st.deadlines[key] || '';
			var chip = el('label', 'ct-chip ct-chip-datewrap ' + urgencyClass(val) + (isTODO(val) ? ' ct-chip-todo' : ''));
			chip.title = 'Edit ' + label + ' deadline';
			chip.innerHTML = '<span class="ct-chip-label">' + label + ':</span> <span class="ct-chip-val">' + (isTODO(val) ? 'TODO' : prettyDate(val)) + '</span>';

			var editable = el('input', 'ct-date-edit');
			editable.type = 'date';
			editable.value = val;
			editable.setAttribute('aria-label', label + ' deadline');
			editable.addEventListener('change', function () {
				st.deadlines[key] = editable.value;
				save();
				render();
			});
			chip.appendChild(editable);
			dl.appendChild(chip);
		});
		card.appendChild(dl);

		// ESS deadline note
		if (sc.hasCSS) {
			card.appendChild(el('div', 'ct-css-note', '<strong>CSS Profile required</strong> — due in the financial-aid deadline field.'));
		}

		// portal
		var pr = st.portal;
		var portal = el('div', 'ct-portal-block');
		if (pr.name) {
			portal.appendChild(el('div', 'ct-portal-line', '<span class="ct-chip-label">Portal:</span> ' + (pr.url ? '<a class="text-link" href="' + pr.url + '" target="_blank" rel="noreferrer">' + pr.name + '</a>' : pr.name)));
		}
		var urlIn = el('input', 'ct-input');
		urlIn.type = 'text';
		urlIn.placeholder = 'Portal URL';
		urlIn.value = pr.url || '';
		urlIn.addEventListener('input', function () {
			st.portal.url = urlIn.value;
			save();
		});
		var noteIn = el('input', 'ct-input');
		noteIn.type = 'text';
		noteIn.placeholder = 'Portal status note (e.g. 2-week lag)';
		noteIn.value = pr.note || '';
		noteIn.addEventListener('input', function () {
			st.portal.note = noteIn.value;
			save();
		});
		portal.appendChild(urlIn);
		portal.appendChild(noteIn);
		card.appendChild(portal);

		// materials checklist
		var matHeading = el('div', 'ct-materials-head', 'Application materials');
		card.appendChild(matHeading);
		var mat = el('ul', 'ct-materials');
		DATA.materialLabels.forEach(function (mItem) {
			var li = el('li', 'ct-material');
			var cb = el('input', 'ct-check');
			cb.type = 'checkbox';
			cb.checked = !!st.materials[mItem.key];
			cb.addEventListener('change', function () {
				st.materials[mItem.key] = cb.checked;
				save();
				render();
			});
			li.appendChild(cb);
			li.appendChild(el('span', '', mItem.label));
			mat.appendChild(li);
		});
		card.appendChild(mat);

		// interview flag
		if (sc.interview) {
			card.appendChild(el('div', 'ct-muted', '<span class="ct-chip-label">Interview:</span> offered — request/date TODO'));
		}

		// notes
		var notesIn = el('input', 'ct-input ct-notes-input');
		notesIn.type = 'text';
		notesIn.placeholder = 'Notes (saved locally)';
		notesIn.value = st.notes || '';
		notesIn.addEventListener('input', function () {
			st.notes = notesIn.value;
			save();
		});
		card.appendChild(notesIn);

		return card;
	}

	// live-count chip under nav (re-render lightweight)
	function updateProgressCount() {
		var badge = document.getElementById('ct-submit-count');
		if (!badge) return;
		var n = 0;
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			if (st && ['Submitted', 'Under review', 'Decision', 'Decided'].indexOf(st.status) !== -1) n++;
		});
		badge.textContent = n + '/' + DATA.schools.length;
	}

	// ---------- This Week ----------
	function renderWeek() {
		var wrap = el('div', 'ct-week');
		var today = todayStr();
		var days = [];
		for (var i = 0; i < 7; i++) {
			days.push({ date: addDays(today, i), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day ' + (i + 1) });
		}

		var items = {};
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			[['application', 'Application'], ['finaid', 'Financial aid'], ['scholarship', 'Scholarship'], ['deposit', 'Deposit']].forEach(function (row) {
				var d = st.deadlines[row[0]] || '';
				if (isTODO(d)) return;
				if (daysUntil(d) > 7 || daysUntil(d) < 0) return;
				(items[d] = items[d] || []).push({ school: sc.short, what: row[1] + ' deadline' });
			});
		});

		var header = el('div', 'ct-week-header', 'Next 7 days');
		wrap.appendChild(header);
		var list = el('div', 'ct-week-list');
		days.forEach(function (day) {
			var box = el('div', 'ct-day' + (day.date === today ? ' ct-day-today' : ''));
			box.appendChild(el('div', 'ct-day-head', day.label + ' — ' + prettyDate(day.date)));
			var dItems = items[day.date] || [];
			if (!dItems.length) {
				box.appendChild(el('div', 'ct-muted', 'No deadlines'));
			} else {
				dItems.forEach(function (it) {
					box.appendChild(el('div', 'ct-task', it.school + ' — ' + it.what));
				});
			}
			list.appendChild(box);
		});
		wrap.appendChild(list);

		// open checklist items across schools
		var pending = [];
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			DATA.materialLabels.forEach(function (m) {
				if (!st.materials[m.key]) pending.push({ school: sc.short, what: m.label });
			});
		});
		if (pending.length) {
			wrap.appendChild(el('div', 'ct-week-header', 'Open checklist items (all schools)'));
			var plist = el('div', 'ct-week-list');
			pending.forEach(function (it) {
				plist.appendChild(el('div', 'ct-task ct-task-pending', it.school + ' — ' + it.what));
			});
			wrap.appendChild(plist);
		}
		return wrap;
	}

	// ---------- Honors ----------
	function renderHonors() {
		var wrap = el('div', 'ct-honors');
		wrap.appendChild(el('h2', '', 'Honors Colleges'));
		var tbl = el('table', 'ct-table');
		var thead = el('thead');
		var trh = el('tr');
		['School', 'Honors program', 'Separate app?', 'Deadline', 'Portal note'].forEach(function (c) {
			trh.appendChild(el('th', '', c));
		});
		thead.appendChild(trh);
		tbl.appendChild(thead);
		var tbody = el('tbody');
		DATA.schools.forEach(function (sc) {
			if (!sc.honors) return;
			var tr = el('tr');
			tr.appendChild(el('td', '', sc.name));
			tr.appendChild(el('td', '', sc.honors.name || 'TODO'));
			tr.appendChild(el('td', '', sc.honors.separateApp === true ? 'Yes — separate app' : sc.honors.separateApp || 'TODO'));
			tr.appendChild(el('td', '', prettyDate(sc.honors.deadline || '')));
			tr.appendChild(el('td', '', (sc.portal && sc.portal.note) || ''));
			tbody.appendChild(tr);
		});
		tbl.appendChild(tbody);
		wrap.appendChild(tbl);
		return wrap;
	}

	// ---------- Essays ----------
	function countWords(s) {
		return (s.trim().match(/\S+/g) || []).length;
	}

	function renderEssays() {
		var wrap = el('div', 'ct-essays');
		wrap.appendChild(el('h2', '', 'Essay tracker'));
		wrap.appendChild(el('p', 'ct-muted', 'Word counts are computed from whatever you paste into the prompt box. If the same prompt text is reused across schools it is flagged below.'));
		var tbl = el('table', 'ct-table');
		var thead = el('thead');
		var trh = el('tr');
		['School', 'Prompt', 'Word count', 'Overlap'].forEach(function (c) { trh.appendChild(el('th', '', c)); });
		thead.appendChild(trh);
		tbl.appendChild(thead);
		var tbody = el('tbody');

		// build overlap index of normalized prompt -> schools
		var index = {};
		DATA.schools.forEach(function (sc) {
			(state.essays[sc.id] || []).forEach(function (row) {
				var key = (row.prompt || '').trim().toLowerCase();
				if (!key || key === 'todo') return;
				(index[key] = index[key] || []).push(sc.short);
			});
		});

		DATA.schools.forEach(function (sc) {
			(state.essays[sc.id] || []).forEach(function (row) {
				var tr = el('tr');
				tr.appendChild(el('td', '', sc.name));
				var promptTd = el('td', '');
				if (!editMode) {
					promptTd.textContent = row.prompt && row.prompt !== 'TODO' ? row.prompt : 'TODO';
					tr.appendChild(promptTd);
					var wTdRO = el('td', 'ct-wordcount');
					wTdRO.textContent = row.words ? row.words + ' words' : '—';
					tr.appendChild(wTdRO);
					var keyRO = (row.prompt || '').trim().toLowerCase();
					var usedRO = (keyRO && keyRO !== 'todo' && index[keyRO]) ? index[keyRO] : [];
					var ovRO = el('td', '');
					if (usedRO.length > 1) {
						ovRO.innerHTML = '<strong class="ct-overlap">Reused by: ' + usedRO.join(', ') + '</strong>';
					} else if (usedRO.length === 1) {
						ovRO.textContent = 'Unique';
					} else {
						ovRO.textContent = 'No';
					}
					tr.appendChild(ovRO);
					tbody.appendChild(tr);
					return;
				}
				var ta = el('textarea', 'ct-textarea ct-prompt-input');
				ta.rows = 2;
				ta.placeholder = 'Paste prompt or mark TODO';
				ta.value = row.prompt && row.prompt !== 'TODO' ? row.prompt : '';
				ta.addEventListener('input', function () {
					row.prompt = ta.value.trim();
					row.words = countWords(ta.value);
					save();
					renderEssaysWordUpdate(tr, row);
				});
				promptTd.appendChild(ta);
				tr.appendChild(promptTd);
				var wTd = el('td', '');
				wTd.className = 'ct-wordcount';
				wTd.textContent = row.words ? row.words + ' words' : '—';
				tr.appendChild(wTd);
				var key = (row.prompt || '').trim().toLowerCase();
				var used = (key && key !== 'todo' && index[key]) ? index[key] : [];
				var ov = el('td', '');
				if (used.length > 1) {
					ov.innerHTML = '<strong class="ct-overlap">Reused by: ' + used.join(', ') + '</strong>';
				} else if (used.length === 1) {
					ov.textContent = 'Unique';
				} else {
					ov.textContent = 'No';
				}
				tr.appendChild(ov);
				tbody.appendChild(tr);
			});
		});
		tbl.appendChild(tbody);
		wrap.appendChild(tbl);
		return wrap;
	}

	function renderEssaysWordUpdate(ta, row) {
		var tr = ta.closest('tr');
		if (!tr) return;
		var wtd = tr.querySelector('.ct-wordcount');
		if (wtd) wtd.textContent = row.words ? row.words + ' words' : '—';
	}

	// ---------- Export ----------
	function downloadCSV(rows, filename) {
		var csv = rows.map(function (r) {
			return r.map(function (c) {
				var s = String(c == null ? '' : c);
				return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
			}).join(',');
		}).join('\r\n');
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 100);
	}

	function exportCounselorCSV() {
		var rows = [['School', 'Application', 'Financial aid', 'Scholarship', 'Deposit', 'Transcript sent', 'Counselor rec sent', 'Status']];
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			rows.push([
				sc.name,
				isTODO(st.deadlines.application) ? 'TODO' : st.deadlines.application,
				isTODO(st.deadlines.finaid) ? 'TODO' : st.deadlines.finaid,
				isTODO(st.deadlines.scholarship) ? 'TODO' : st.deadlines.scholarship,
				isTODO(st.deadlines.deposit) ? 'TODO' : st.deadlines.deposit,
				st.materials.transcript ? 'Yes' : 'No',
				st.materials.counselor ? 'Yes' : 'No',
				st.status,
			]);
		});
		downloadCSV(rows, 'counselor-handoff.csv');
	}

	function exportScholarshipCSV() {
		var rows = [['School', 'Scholarship deadline', 'Honors app', 'Deposit']];
		DATA.schools.forEach(function (sc) {
			var st = state.schools[sc.id];
			var honors = sc.honors ? (sc.honors.separateApp === true || sc.honors.separateApp === 'Yes' ? 'Required' : 'TODO') : '—';
			rows.push([
				sc.name,
				isTODO(st.deadlines.scholarship) ? 'TODO' : st.deadlines.scholarship,
				honors,
				isTODO(st.deadlines.deposit) ? 'TODO' : st.deadlines.deposit,
			]);
		});
		downloadCSV(rows, 'scholarship-tracker.csv');
	}

	function renderExport() {
		var wrap = el('div', 'ct-export');
		wrap.appendChild(el('h2', '', 'Export &amp; reset'));
		wrap.appendChild(el('p', 'ct-muted', 'No API, no upload — CSV download is generated entirely in your browser from localStorage.'));
		var grid = el('div', 'ct-export-grid');

		var c1 = el('div', 'ct-export-card');
		c1.innerHTML = '<h3>Counselor handoff</h3><p>Transcript + rec request CSV to hand your school counselor.</p>';
		var b1 = el('button', 'ct-btn ct-btn-primary');
		b1.textContent = 'Download counselor CSV';
		b1.addEventListener('click', exportCounselorCSV);
		c1.appendChild(b1);
		grid.appendChild(c1);

		var c2 = el('div', 'ct-export-card');
		c2.innerHTML = '<h3>Scholarship tracker</h3><p>Scholarship / honors-app / deposit deadlines CSV.</p>';
		var b2 = el('button', 'ct-btn');
		b2.textContent = 'Download scholarship CSV';
		b2.addEventListener('click', exportScholarshipCSV);
		c2.appendChild(b2);
		grid.appendChild(c2);

		wrap.appendChild(grid);

		// Reset destroys local state, so it only appears once editing is unlocked.
		if (!editMode) return wrap;

		var reset = el('button', 'ct-btn ct-btn-danger');
		reset.textContent = 'Reset all data';
		reset.addEventListener('click', function () {
			if (confirm('Reset all tracker data to defaults? This clears every edit.')) {
				localStorage.removeItem(LS_KEY);
				state = freshState();
				save();
				render();
			}
		});
		wrap.appendChild(reset);
		return wrap;
	}

	// ---------- mode banner ----------
	function renderModeBanner() {
		var b = el('div', 'ct-mode' + (editMode ? ' ct-mode-edit' : ''));
		if (editMode) {
			b.innerHTML = '<strong>Edit mode.</strong> Changes save to this browser only — they are never uploaded and are not visible to anyone else. ' +
				'<a class="text-link" href="?edit=0">Leave edit mode</a>';
		} else {
			b.innerHTML = 'Read-only view of a personal planning tool. Nothing here can be changed from this page.';
		}
		return b;
	}

	// ---------- boot ----------
	var app = document.getElementById('college-tracker');
	if (!app) return;

	function render() {
		app.innerHTML = '';
		var meta = el('div', 'ct-meta');
		meta.innerHTML = 'Student: ' + DATA.student.name +
			' · ' + DATA.student.classYear +
			' · ' + DATA.student.school +
			' · GPA ' + DATA.student.gpa +
			' &nbsp;•&nbsp; <strong id="ct-submit-count" class="ct-submit-count">0/' + DATA.schools.length + '</strong> applications submitted';
		app.appendChild(meta);
		app.appendChild(renderModeBanner());
		app.appendChild(renderTabs());
		app.appendChild(renderView());
		updateProgressCount();
	}
	render();
})();