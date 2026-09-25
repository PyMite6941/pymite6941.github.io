/*
 * motion.js — small, optional animations for every page.
 *
 * Injected by site-style.js. Two effects:
 *
 *   1. Scroll reveal: cards, section headings and articles fade and slide up
 *      the first time they scroll into view. An IntersectionObserver is the
 *      browser telling us "this element is now on screen", so no scroll
 *      listener runs on every pixel of scrolling.
 *   2. Hero typing: on the homepage, the "Software Developer · AI/ML ·
 *      Cybersecurity" line types itself out once.
 *
 * Content is never hidden unless this script runs: the CSS only hides
 * .reveal elements while <html> has the "motion-ready" class, which is added
 * here. If JavaScript is off or this file fails to load, everything shows.
 *
 * Visitors who turned on "reduce motion" in their device settings get no
 * animation at all.
 */
(function () {
	'use strict';

	var reduceMotion =
		window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion || !('IntersectionObserver' in window)) return;

	// ── 1. Scroll reveal ────────────────────────────────────────────────────
	var targets = document.querySelectorAll(
		'main .card-container, main > h2, main article, main .dev-note, main .proof-panel'
	);
	if (targets.length) {
		document.documentElement.classList.add('motion-ready');

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					var el = entry.target;
					el.classList.add('is-visible');
					// Each element animates once, then we stop watching it.
					observer.unobserve(el);
					// Drop the stagger delay afterwards so hover feels instant.
					setTimeout(function () {
						el.style.transitionDelay = '';
					}, 800);
				});
			},
			// Start the animation a little before the element is fully on screen.
			{ rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
		);

		var fold = window.innerHeight;
		targets.forEach(function (el) {
			// Anything already on screen when the page opens stays put. Hiding
			// it now would make it blink out and back in, and would slow the
			// moment the page looks "loaded".
			if (el.getBoundingClientRect().top < fold) return;
			el.classList.add('reveal');
			// Cards in the same grid come in one after another, not all at once.
			var grid = el.parentElement;
			if (el.classList.contains('card-container') && grid) {
				var index = Array.prototype.indexOf.call(grid.children, el) % 3;
				el.style.transitionDelay = index * 80 + 'ms';
			}
			observer.observe(el);
		});
	}

	// ── 2. Hero typing effect ───────────────────────────────────────────────
	var roles = document.querySelector('.hero-roles');
	if (roles) {
		var fullText = roles.textContent.trim();
		// Screen readers get the whole line at once instead of letter by letter.
		roles.setAttribute('aria-label', fullText);
		var typed = document.createElement('span');
		typed.setAttribute('aria-hidden', 'true');
		var caret = document.createElement('span');
		caret.className = 'typing-caret';
		caret.setAttribute('aria-hidden', 'true');
		// Keep the line's height reserved so nothing below it jumps.
		roles.style.minHeight = roles.offsetHeight + 'px';
		roles.textContent = '';
		roles.appendChild(typed);
		roles.appendChild(caret);

		var i = 0;
		var step = function () {
			i += 1;
			typed.textContent = fullText.slice(0, i);
			if (i < fullText.length) {
				setTimeout(step, 45);
			} else {
				// Blink a few times, then hide the caret.
				setTimeout(function () {
					caret.classList.add('typing-caret--done');
				}, 2400);
			}
		};
		setTimeout(step, 300);
	}
})();
