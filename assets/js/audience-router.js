/*
 * Homepage audience router.
 *
 * Two "press me" buttons in the hero open a modal tailored to the visitor:
 * one for college counselors / admissions readers, one for recruiters and
 * employers. Each modal is a short brief plus direct links, and can hand off
 * to the site chatbot via window.portfolioChat (exposed by chatbot.js).
 *
 * Homepage only — index.html loads this directly. Every fact here must match
 * pages/academics.html and pages/about-me.html; if you change one, change both.
 */
(function () {
	var AUDIENCES = {
		counselor: {
			title: 'For College Counselors',
			lede: "Matt Gresham — Class of 2027, International Community School Bangkok. U.S. citizen studying abroad, so he applies as a domestic student. Targeting a BS in Computer Science with AI/ML and Cybersecurity.",
			sections: [
				{
					heading: 'Academic snapshot',
					items: [
						'GPA 3.88 / 4.0 · SAT 1240 · Expected graduation May 2027',
						'AP Computer Science Principles (A+), AP English Language &amp; Composition',
						'AP Computer Science A and AP Cybersecurity currently in progress',
						'Honors: HS Band, Tech Theatre · Also Pre-Calculus, Physics, Philosophy &amp; Worldview',
					],
				},
				{
					heading: 'Honors &amp; awards',
					items: [
						'NOAI — competed in the National Olympiad in Artificial Intelligence',
						'VEX Robotics — qualified for nationals (team) and to States (individual)',
						'Global Citizen Award (2024) for Theatre Tech contribution and service',
						'Boy Scouts of America — Life rank, completing his Eagle Scout service project',
					],
				},
				{
					heading: 'Leadership &amp; service',
					items: [
						'STEAMXchange — Tech Lead, teaching STEAM subjects to children',
						'Head of Testing at Polaris Student, leading a three-person QA team',
						'House of Blessings — taught Scratch and Canva to underserved students',
						'Saphan Siam Foundation — built a non-profit&rsquo;s social presence from zero',
					],
				},
			],
			links: [
				{ href: 'pages/academics.html', label: 'Full academic record', primary: true },
				{ href: 'pages/college-essay.html', label: 'Common App essay' },
				{ href: 'assets/documents/matt_gresham_resume.html', label: 'R&eacute;sum&eacute;', blank: true },
				{ href: 'pages/contact-me.html', label: 'Contact' },
			],
			questions: [
				'What is Matt planning to study in college?',
				'What has Matt built that shows real technical depth?',
			],
		},
		recruiter: {
			title: 'For Recruiters &amp; Employers',
			lede: 'Self-taught developer working across AI/ML, cybersecurity, and full-stack engineering. Python for logic-heavy work, Go for performance-critical tools, React when it needs a frontend. Everything below is deployed and inspectable.',
			sections: [
				{
					heading: 'Current roles',
					items: [
						'<strong>Polaris Student — Head of Testing.</strong> Leads a three-person QA team; owns testing end to end, files and triages bugs pre-release, writes automated regression checks.',
						'<strong>Neurole — Web Developer.</strong> Maintains and modernises the front end of a neuroscience education site.',
						'<strong>Freelance / client work.</strong> Automation, dashboards, web apps, AI integrations, security and QA.',
					],
				},
				{
					heading: 'Strongest proof',
					items: [
						'<strong>LLM Protector</strong> — security scanner that probes a local LLM for prompt-injection and jailbreak vulnerabilities, grading models with a severity-weighted risk score. Live demo.',
						'<strong>Magellan</strong> — search engine pairing a Go web spider with a React frontend, indexing into SQLite.',
						'<strong>The Finance Kit</strong> — deployed full-stack finance tracker in Python and Streamlit.',
						'<strong>Villages</strong> — full-stack AI learning platform, React + FastAPI, both live on Vercel.',
					],
				},
				{
					heading: 'Stack',
					items: [
						'<strong>Languages:</strong> Python, Go, JavaScript / React, Bash, Java and Rust (learning)',
						'<strong>Security:</strong> prompt-injection &amp; LLM red-teaming, OWASP, SQLi, XSS, Kali, DVWA',
						'<strong>AI/ML:</strong> RAG pipelines, ChromaDB, PyTorch, minimax &amp; alpha-beta, Q-learning',
						'<strong>Infra:</strong> FastAPI, Vercel, Cloudflare Workers, Supabase, SQLite',
					],
				},
			],
			links: [
				{ href: 'pages/projects.html', label: 'All projects', primary: true },
				{ href: 'pages/about-me.html', label: 'Experience &amp; skills' },
				{ href: 'assets/documents/matt_gresham_resume.html', label: 'R&eacute;sum&eacute;', blank: true },
				{ href: 'pages/client-work.html', label: 'Built for others' },
				{ href: 'https://github.com/PyMite6941', label: 'GitHub', blank: true },
				{ href: 'pages/contact-me.html', label: 'Contact' },
			],
			questions: [
				"What is Matt's strongest project and what did he build?",
				"What is Matt's work experience?",
			],
		},
	};

	var overlay, dialog, lastFocused;

	function buildModal() {
		overlay = document.createElement('div');
		overlay.className = 'audience-overlay';
		overlay.setAttribute('hidden', '');
		overlay.innerHTML =
			'<div class="audience-modal" role="dialog" aria-modal="true" aria-labelledby="audience-modal-title">' +
			'<button type="button" class="audience-close" aria-label="Close">&#10005;</button>' +
			'<div class="audience-modal-body"></div>' +
			'</div>';
		document.body.appendChild(overlay);
		dialog = overlay.querySelector('.audience-modal');

		overlay.addEventListener('click', function (e) {
			if (e.target === overlay) close();
		});
		overlay.querySelector('.audience-close').addEventListener('click', close);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) close();
			if (e.key === 'Tab' && !overlay.hasAttribute('hidden')) trapFocus(e);
		});
	}

	function trapFocus(e) {
		var f = dialog.querySelectorAll('a[href], button:not([disabled])');
		if (!f.length) return;
		var first = f[0];
		var last = f[f.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function render(key) {
		var a = AUDIENCES[key];
		var html = '<h2 id="audience-modal-title">' + a.title + '</h2>';
		html += '<p class="audience-lede">' + a.lede + '</p>';

		a.sections.forEach(function (s) {
			html += '<h3>' + s.heading + '</h3><ul class="audience-list">';
			s.items.forEach(function (i) {
				html += '<li>' + i + '</li>';
			});
			html += '</ul>';
		});

		html += '<div class="audience-links">';
		a.links.forEach(function (l) {
			html +=
				'<a class="audience-link' +
				(l.primary ? ' audience-link--primary' : '') +
				'" href="' +
				l.href +
				'"' +
				(l.blank ? ' target="_blank" rel="noreferrer"' : '') +
				'>' +
				l.label +
				'</a>';
		});
		html += '</div>';

		html +=
			'<div class="audience-ask">' +
			'<p class="audience-ask-label">Or just ask — the site assistant knows his work:</p>';
		a.questions.forEach(function (q) {
			html += '<button type="button" class="audience-ask-btn" data-q="' + q.replace(/"/g, '&quot;') + '">' + q + '</button>';
		});
		html += '</div>';

		dialog.querySelector('.audience-modal-body').innerHTML = html;

		dialog.querySelectorAll('.audience-ask-btn').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var q = btn.getAttribute('data-q');
				close();
				if (window.portfolioChat && window.portfolioChat.ask) {
					window.portfolioChat.ask(q);
				} else {
					// chatbot.js not loaded (or blocked) — fall back to the contact page
					window.location.href = 'pages/contact-me.html';
				}
			});
		});
	}

	function open(key) {
		lastFocused = document.activeElement;
		render(key);
		overlay.removeAttribute('hidden');
		document.body.style.overflow = 'hidden';
		dialog.scrollTop = 0;
		var f = dialog.querySelector('a[href], button');
		if (f) f.focus();
		if (window.siteMetrics && window.siteMetrics.track) {
			window.siteMetrics.track('audience_router_open', { audience: key });
		}
	}

	function close() {
		overlay.setAttribute('hidden', '');
		document.body.style.overflow = '';
		if (lastFocused && lastFocused.focus) lastFocused.focus();
	}

	function init() {
		var buttons = document.querySelectorAll('.audience-btn');
		if (!buttons.length) return;
		buildModal();
		buttons.forEach(function (b) {
			b.addEventListener('click', function () {
				open(b.getAttribute('data-audience'));
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
