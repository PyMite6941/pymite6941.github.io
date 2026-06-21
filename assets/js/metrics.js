/*
 * metrics.js — safe, dependency-free page-level visitor metrics.
 *
 * Design goals (see LOCAL_LLM_WEBSITE_BRIEF.md, "Work 2"):
 *   - No analytics provider keys or secrets live here.
 *   - No-ops with zero console errors when no provider is connected.
 *   - Sends GA4-compatible events when window.gtag exists.
 *   - Sends PostHog-compatible events when window.posthog exists.
 *   - Optional debug mode: localStorage.siteMetricsDebug = "1" logs events.
 *
 * Event schema (names are stable — do not rename after release):
 *   page_view          { path, title, referrer, utm_source, utm_medium,
 *                        utm_campaign, timestamp }
 *   project_link_click { from_path, project_slug, project_title,
 *                        destination_url, destination_kind }
 *   resume_click       { from_path, destination_url }
 *   contact_click      { from_path, destination_url }
 *   ai_lab_click       { from_path, destination_url }
 *
 * destination_kind is one of: live | source | demo | case_study | external.
 *
 * Tracking uses one delegated click listener so individual pages need no
 * custom JavaScript. Links may opt in explicitly with data-track-event (and
 * optional data-track-* fields); otherwise sensible heuristics classify the
 * nav, footer, resume, contact, AI Lab, project-card, proof-strip, and proof
 * page action links already on the site.
 */
(function () {
	'use strict';

	function debugOn() {
		try {
			return window.localStorage.getItem('siteMetricsDebug') === '1';
		} catch (e) {
			return false;
		}
	}

	function currentPath() {
		var path = window.location.pathname || '/';
		if (path.endsWith('/index.html')) path = path.slice(0, -10) || '/';
		return path;
	}

	// Dispatch one event to every provider that happens to be present.
	function emit(name, params) {
		if (debugOn()) {
			// eslint-disable-next-line no-console
			console.log('[site-metrics]', name, params);
		}
		try {
			if (typeof window.gtag === 'function') {
				window.gtag('event', name, params);
			}
		} catch (e) {
			/* never let analytics break the page */
		}
		try {
			if (window.posthog && typeof window.posthog.capture === 'function') {
				window.posthog.capture(name, params);
			}
		} catch (e) {
			/* no-op */
		}
	}

	function pageView() {
		var qs;
		try {
			qs = new URLSearchParams(window.location.search);
		} catch (e) {
			qs = { get: function () { return null; } };
		}
		emit('page_view', {
			path: currentPath(),
			title: document.title || '',
			referrer: document.referrer || '',
			utm_source: qs.get('utm_source') || '',
			utm_medium: qs.get('utm_medium') || '',
			utm_campaign: qs.get('utm_campaign') || '',
			timestamp: new Date().toISOString(),
		});
	}

	// ── Link classification ─────────────────────────────────────────────────
	function toUrl(href) {
		try {
			return new URL(href, window.location.href);
		} catch (e) {
			return null;
		}
	}

	function isExternal(href) {
		var url = toUrl(href);
		return !!url && /^https?:$/i.test(url.protocol) && url.host !== window.location.host;
	}

	function isProjectPagePath(path) {
		return /\/pages\/project-pages\/[^/?#]+\.html$/i.test(path || '');
	}

	function isProjectPageHref(href) {
		var url = toUrl(href);
		return !!url && isProjectPagePath(url.pathname || '');
	}

	function currentProjectSlug() {
		var m = currentPath().match(/\/project-pages\/([^/?#]+)\.html$/i);
		return m ? m[1] : '';
	}

	function destinationKind(href) {
		if (!href) return 'external';
		if (isProjectPageHref(href)) return 'case_study';
		if (/github\.com/i.test(href)) return 'source';
		if (/devpost\.com/i.test(href)) return 'external';
		if (/(vercel\.app|streamlit\.app|pages\.dev|onrender\.com|herokuapp\.com|hf\.space|huggingface\.co)/i.test(href)) {
			return 'live';
		}
		if (isExternal(href)) return 'external';
		return 'case_study';
	}

	function projectSlug(href) {
		var url = toUrl(href);
		var m = url && url.pathname.match(/\/project-pages\/([^/?#]+)\.html$/i);
		if (m) return m[1];
		if (currentProjectSlug()) return currentProjectSlug();
		try {
			return new URL(href, window.location.href).hostname.replace(/^www\./, '');
		} catch (e) {
			return '';
		}
	}

	// Find the closest project card title, if the link sits inside a card.
	function cardTitle(el) {
		var card = el.closest ? el.closest('.card-container') : null;
		if (!card) return '';
		var h = card.querySelector('h3');
		return h ? h.textContent.trim() : '';
	}

	function proofLinkTitle(el) {
		var link = el.closest ? el.closest('.proof-link') : null;
		if (!link) return '';
		var title = link.querySelector('span');
		return title ? title.textContent.trim() : link.textContent.trim();
	}

	function currentProjectTitle() {
		if (!currentProjectSlug()) return '';
		var h = document.querySelector('main h1, h1');
		return h ? h.textContent.trim() : '';
	}

	function projectTitle(anchor) {
		var title = cardTitle(anchor) || proofLinkTitle(anchor);
		if (title) return title;
		if (isProjectPageHref(anchor.getAttribute('href') || '')) {
			return anchor.textContent ? anchor.textContent.trim() : '';
		}
		return currentProjectTitle();
	}

	function isProofPageAction(href) {
		if (!currentProjectSlug()) return false;
		if (!href || href.charAt(0) === '#') return false;
		var kind = destinationKind(href);
		return kind === 'live' || kind === 'source' || kind === 'external';
	}

	function classify(anchor) {
		// Explicit opt-in always wins.
		var explicit = anchor.getAttribute('data-track-event');
		var href = anchor.getAttribute('href') || '';

		if (explicit) {
			return {
				name: explicit,
				params: {
					from_path: currentPath(),
					destination_url: anchor.href || href,
					destination_kind:
						anchor.getAttribute('data-track-kind') || destinationKind(href),
					project_slug: anchor.getAttribute('data-track-slug') || projectSlug(href),
					project_title:
						anchor.getAttribute('data-track-title') || projectTitle(anchor),
				},
			};
		}

		if (!href || href.charAt(0) === '#') return null;

		var lower = href.toLowerCase();
		var from = currentPath();
		var dest = anchor.href || href;

		// Resume
		if (/resume/.test(lower)) {
			return { name: 'resume_click', params: { from_path: from, destination_url: dest } };
		}
		// Contact (mailto or the contact page)
		if (lower.indexOf('mailto:') === 0 || /contact-me\.html/.test(lower)) {
			return { name: 'contact_click', params: { from_path: from, destination_url: dest } };
		}
		// AI Lab (external Next.js app)
		if (/ai-lab-bice\.vercel\.app/.test(lower)) {
			return { name: 'ai_lab_click', params: { from_path: from, destination_url: dest } };
		}
		// Project links — internal proof pages, card links, proof-strip links, or
		// live/source actions from a project proof page.
		if (isProjectPageHref(href) || cardTitle(anchor) || proofLinkTitle(anchor) || isProofPageAction(href)) {
			return {
				name: 'project_link_click',
				params: {
					from_path: from,
					project_slug: projectSlug(href),
					project_title: projectTitle(anchor),
					destination_url: dest,
					destination_kind: destinationKind(href),
				},
			};
		}
		return null;
	}

	function onClick(e) {
		var t = e.target;
		var anchor = t && t.closest ? t.closest('a[href]') : null;
		if (!anchor) return;
		var event = classify(anchor);
		if (event) emit(event.name, event.params);
	}

	function init() {
		pageView();
		document.addEventListener('click', onClick, true);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
