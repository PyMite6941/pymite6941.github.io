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
 *   project_link_click { from_path, source_page, project, project_slug,
 *                        project_title, destination_url, clicked_url,
 *                        clicked_web_address, destination_kind,
 *                        destination_type }
 *   resume_click       { from_path, destination_url }
 *   contact_click      { from_path, destination_url }
 *   ai_lab_click       { from_path, destination_url }
 *
 * destination_kind is one of: live | source | demo | case_study | external.
 *
 * Tracking uses one delegated click listener so individual pages need no
 * custom JavaScript. Links may opt in explicitly with data-track-event (and
 * optional data-track-* fields); otherwise sensible heuristics classify the
 * nav, footer, resume, contact, AI Lab, and project-card links already on the
 * site.
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

	function sendToGtag(name, params) {
		try {
			if (typeof window.gtag === 'function') {
				window.gtag('event', name, params);
				return true;
			}
		} catch (e) {
			/* never let analytics break the page */
		}
		return false;
	}

	function sendToPostHog(name, params) {
		try {
			if (window.posthog && typeof window.posthog.capture === 'function') {
				window.posthog.capture(name, params);
				return true;
			}
		} catch (e) {
			/* no-op */
		}
		return false;
	}

	// Dispatch one event to every provider that happens to be present.
	function emit(name, params, options) {
		var providers = (options && options.providers) || {};
		var allowGtag = providers.gtag !== false;
		var allowPostHog = providers.posthog !== false;
		var sent = { gtag: false, posthog: false };
		if (debugOn()) {
			// eslint-disable-next-line no-console
			console.log('[site-metrics]', name, params);
		}
		if (allowGtag) sent.gtag = sendToGtag(name, params);
		if (allowPostHog) sent.posthog = sendToPostHog(name, params);
		return sent;
	}

	function pageView(options) {
		var qs;
		try {
			qs = new URLSearchParams(window.location.search);
		} catch (e) {
			qs = { get: function () { return null; } };
		}
		return emit('page_view', {
			path: currentPath(),
			title: document.title || '',
			referrer: document.referrer || '',
			utm_source: qs.get('utm_source') || '',
			utm_medium: qs.get('utm_medium') || '',
			utm_campaign: qs.get('utm_campaign') || '',
			timestamp: new Date().toISOString(),
		}, options);
	}

	// ── Link classification ─────────────────────────────────────────────────
	function isExternal(href) {
		return /^https?:\/\//i.test(href) && href.indexOf(window.location.host) === -1;
	}

	function destinationKind(href) {
		if (!href) return 'external';
		if (/github\.com/i.test(href)) return 'source';
		if (/devpost\.com/i.test(href)) return 'external';
		if (/project-pages\//i.test(href)) return 'case_study';
		if (/(vercel\.app|streamlit\.app|pages\.dev|onrender\.com|herokuapp\.com|hf\.space|huggingface\.co)/i.test(href)) {
			return 'live';
		}
		if (isExternal(href)) return 'external';
		return 'case_study';
	}

	function projectSlug(href) {
		var m = href && href.match(/project-pages\/([^/?#]+)\.html/i);
		if (m) return m[1];
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

	function projectClickParams(anchor, href) {
		var from = currentPath();
		var dest = anchor.href || href;
		var kind =
			anchor.getAttribute('data-track-kind') || destinationKind(href);
		var slug =
			anchor.getAttribute('data-track-slug') || projectSlug(href);
		var title =
			anchor.getAttribute('data-track-title') || cardTitle(anchor);
		var project = title || slug;

		return {
			from_path: from,
			source_page: from,
			project: project,
			project_slug: slug,
			project_title: title,
			destination_url: dest,
			clicked_url: dest,
			clicked_web_address: dest,
			destination_kind: kind,
			destination_type: kind,
		};
	}

	function classify(anchor) {
		// Explicit opt-in always wins.
		var explicit = anchor.getAttribute('data-track-event');
		var href = anchor.getAttribute('href') || '';

		if (explicit) {
			return {
				name: explicit,
				params: projectClickParams(anchor, href),
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
		// Project links — either an internal detail page or a card's outbound link
		if (/project-pages\//.test(lower) || cardTitle(anchor)) {
			return {
				name: 'project_link_click',
				params: projectClickParams(anchor, href),
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
		var sent = pageView();
		var postHogPageViewSent = !!sent.posthog;

		function sendPostHogPageViewOnce() {
			if (postHogPageViewSent) return;
			var result = pageView({
				providers: { gtag: false, posthog: true },
			});
			postHogPageViewSent = !!result.posthog;
		}

		if (window.siteAnalyticsPostHogReady) {
			sendPostHogPageViewOnce();
		}
		window.addEventListener(
			'siteAnalyticsPostHogReady',
			sendPostHogPageViewOnce
		);

		window.siteMetrics = window.siteMetrics || {};
		window.siteMetrics.track = emit;
		window.siteMetrics.pageView = pageView;

		document.addEventListener('click', onClick, true);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
