let filterBaseLabel = 'Filter';

function filterProjects() {
	const active = Array.from(
		document.querySelectorAll('#filter-panel .checkbox:checked'),
	).map((cb) => cb.dataset.filter);
	document.querySelectorAll('.card-container[data-tags]').forEach((card) => {
		if (active.length === 0) {
			card.style.display = '';
			return;
		}
		const tags = card.dataset.tags.split('|');
		card.style.display = active.some((f) => tags.includes(f)) ? '' : 'none';
	});
	updateFilterCount(active.length);
}

function updateFilterCount(n) {
	const label = document.getElementById('filter-toggle-label');
	if (label) label.textContent = n > 0 ? `${filterBaseLabel} (${n})` : filterBaseLabel;
}

function initFilterToggle() {
	const toggle = document.getElementById('filter-toggle');
	const panel = document.getElementById('filter-panel');
	const label = document.getElementById('filter-toggle-label');
	if (label) filterBaseLabel = label.textContent.trim();
	if (!toggle || !panel) return;
	toggle.addEventListener('click', () => {
		const open = panel.classList.toggle('is-open');
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
	});
}

document.addEventListener('DOMContentLoaded', initFilterToggle);
