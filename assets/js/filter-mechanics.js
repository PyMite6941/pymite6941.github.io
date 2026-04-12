function filterMechanics() {
	const active = Array.from(
		document
			.querySelectorAll('#filter-panel .checkbox:checked')
			.map((cb) => cb.dataset.filter),
	);
	document.querySelectorAll('.card-container[data-tags]').forEach((card) => {
		if (active.length === 0) {
			card.style.display = '';
			return;
		}
		const tags = card.dataset.tags.split('|');
		card.style.display = active.some((f) => tags.includes(f)) ? '' : 'none';
	});
}
