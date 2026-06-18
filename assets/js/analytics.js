/*
 * analytics.js — consent-gated analytics bootstrap (provider layer).
 *
 * Injected on every page by site-style.js, before metrics.js. It wires up, in
 * the correct order:
 *
 *   1. Google Consent Mode v2 — defaults EVERYTHING to "denied" until the user
 *      opts in, so nothing personal is stored before consent (EU-safe default).
 *   2. Cookiebot CMP — renders the consent banner and stores the user's choice.
 *   3. A Cookiebot → gtag bridge — translates the user's Cookiebot categories
 *      into a gtag consent "update". This makes consent work WITHOUT depending
 *      on the "Google Consent Mode" toggle in the Cookiebot dashboard.
 *   4. The GA4 tag (gtag.js) + config. GA4 loads but runs in cookieless mode
 *      until analytics_storage is granted, so it is safe even pre-consent.
 *
 * metrics.js (the event layer) forwards page_view / click events to window.gtag;
 * while consent is denied those are consent-aware cookieless pings — no leakage.
 *
 * The IDs below are PUBLIC identifiers (a GA4 Measurement ID and a Cookiebot
 * domain-group ID), not secrets — safe to commit. Set GA4_MEASUREMENT_ID to ''
 * to disable GA4, or COOKIEBOT_CBID to '' to disable the banner.
 */
(function () {
	'use strict';

	// ── CONFIG ────────────────────────────────────────────────────────────────
	var GA4_MEASUREMENT_ID = 'G-WLJ6YMX87M';
	var COOKIEBOT_CBID = '1bd5c90b-8a8f-47e0-a9e4-803f7f8d229e';
	// ──────────────────────────────────────────────────────────────────────────

	// Always define the gtag stub + dataLayer so calls queue safely in order.
	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function () {
			window.dataLayer.push(arguments);
		};

	// 1. Consent Mode v2 defaults — denied until the CMP updates them. Queued
	//    BEFORE the GA4 config below so gtag.js reads it first.
	window.gtag('consent', 'default', {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: 'denied',
		functionality_storage: 'denied',
		personalization_storage: 'denied',
		security_storage: 'granted',
		wait_for_update: 500,
	});
	window.gtag('set', 'ads_data_redaction', true);
	window.gtag('set', 'url_passthrough', true);

	// 2. Cookiebot CMP — renders the consent banner.
	if (COOKIEBOT_CBID) {
		var cb = document.createElement('script');
		cb.id = 'Cookiebot';
		cb.src = 'https://consent.cookiebot.com/uc.js';
		cb.setAttribute('data-cbid', COOKIEBOT_CBID);
		cb.type = 'text/javascript';
		cb.async = true;
		document.head.appendChild(cb);

		// 3. Bridge: map the user's Cookiebot consent to a gtag consent update.
		var pushUpdate = function () {
			var c = (window.Cookiebot && window.Cookiebot.consent) || {};
			window.gtag('consent', 'update', {
				analytics_storage: c.statistics ? 'granted' : 'denied',
				ad_storage: c.marketing ? 'granted' : 'denied',
				ad_user_data: c.marketing ? 'granted' : 'denied',
				ad_personalization: c.marketing ? 'granted' : 'denied',
				functionality_storage: c.preferences ? 'granted' : 'denied',
				personalization_storage: c.preferences ? 'granted' : 'denied',
			});
		};
		window.addEventListener('CookiebotOnConsentReady', pushUpdate);
		window.addEventListener('CookiebotOnAccept', pushUpdate);
		window.addEventListener('CookiebotOnDecline', pushUpdate);
	}

	// 4. GA4 tag — loads but stays consent-gated by the defaults above.
	if (GA4_MEASUREMENT_ID) {
		var ga = document.createElement('script');
		ga.async = true;
		ga.src =
			'https://www.googletagmanager.com/gtag/js?id=' +
			encodeURIComponent(GA4_MEASUREMENT_ID);
		document.head.appendChild(ga);
		window.gtag('js', new Date());
		window.gtag('config', GA4_MEASUREMENT_ID);
	}
})();
