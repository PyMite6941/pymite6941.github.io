(function () {
	// Content stamp for the scripts injected below. Maintained by
	// tools/stamp-assets.py — do not edit by hand; run that script instead.
	var ASSET_V = 'c1644a9e93';
	const depth = parseInt(document.documentElement.dataset.depth || '0', 10);
	const PATHS = [
		{
			// depth 0 — root (index.html)
			home: 'index.html',
			about: 'pages/about-me.html',
			academics: 'pages/academics.html',
			projects: 'pages/projects.html',
			hackathons: 'pages/hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: 'pages/client-work.html',
			dreamprojects: 'pages/dream-projects.html',
			educational: 'pages/educational-tools.html',
			contact: 'pages/contact-me.html',
			resume: 'assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
			ctf: 'https://pymite6941.is-a.dev/ctf-writeups/',
			bait: 'https://pymite6941.is-a.dev/dont-take-the-bait/',
		},
		{
			// depth 1 — pages/*.html
			home: '../index.html',
			about: 'about-me.html',
			academics: 'academics.html',
			projects: 'projects.html',
			hackathons: 'hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: 'client-work.html',
			dreamprojects: 'dream-projects.html',
			educational: 'educational-tools.html',
			contact: 'contact-me.html',
			resume: '../assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
			ctf: 'https://pymite6941.is-a.dev/ctf-writeups/',
			bait: 'https://pymite6941.is-a.dev/dont-take-the-bait/',
		},
		{
			// depth 2 — pages/*/*.html
			home: '../../index.html',
			about: '../about-me.html',
			academics: '../academics.html',
			projects: '../projects.html',
			hackathons: '../hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: '../client-work.html',
			dreamprojects: '../dream-projects.html',
			educational: '../educational-tools.html',
			contact: '../contact-me.html',
			resume: '../../assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
			ctf: 'https://pymite6941.is-a.dev/ctf-writeups/',
			bait: 'https://pymite6941.is-a.dev/dont-take-the-bait/',
		},
	];
	const p = PATHS[Math.min(depth, 2)];

	function inject(id, html) {
		const el = document.getElementById(id);
		if (el) el.outerHTML = html;
	}

	inject(
		'site-nav',
		`<div class="nav">
            <ul class="nav-list" id="nav-list">
                <li class="nav-item"><a class="nav-link" href="${p.home}">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.projects}">Projects</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.about}">About Me</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.academics}">Academics</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.forothers}">Built for Others</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.hackathons}">Hackathons</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.ailab}">AI Lab</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.educational}">Learn</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.resume}">Résumé</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.dreamprojects}">Dream Projects</a></li>
				<li class="nav-item"><a class="nav-link" href="${p.store}">My Store</a></li>
                <li class="nav-item nav-item--mobile-only"><a class="nav-link" href="${p.contact}">Contact me</a></li>
            </ul>
            <div style="display:flex;gap:8px;align-items:center;padding-right:12px">
                <a class="nav-btn" href="${p.contact}">Contact me</a>
                <button class="hamburger" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>`,
	);

	var hamburger = document.getElementById('nav-hamburger');
	var navList = document.getElementById('nav-list');
	if (hamburger && navList) {
		hamburger.addEventListener('click', function () {
			var open = navList.classList.toggle('nav-open');
			hamburger.classList.toggle('nav-open', open);
			hamburger.setAttribute('aria-expanded', open);
		});
		document.addEventListener('click', function (e) {
			if (!hamburger.contains(e.target) && !navList.contains(e.target)) {
				navList.classList.remove('nav-open');
				hamburger.classList.remove('nav-open');
				hamburger.setAttribute('aria-expanded', 'false');
			}
		});
	}

	inject(
		'site-footer',
		`<footer class="foot">
            <div class="foot-cols">
                <div class="foot-col">
                    <h4>Explore</h4>
                    <a href="${p.home}">Home</a>
                    <a href="${p.projects}">Projects</a>
                    <a href="${p.forothers}">Built for Others</a>
                    <a href="${p.hackathons}">Hackathons</a>
                    <a href="${p.ailab}">AI Lab</a>
                    <a href="${p.educational}">Educational Tools</a>
                    <a href="${p.ctf}">CTF Writeups</a>
                    <a href="${p.bait}">Phishing Guide</a>
                </div>
                <div class="foot-col">
                    <h4>Profiles</h4>
                    <a href="https://github.com/PyMite6941" target="_blank" rel="noreferrer">GitHub</a>
                    <a href="https://devpost.com/PyMite6941" target="_blank" rel="noreferrer">Devpost</a>
                    <a href="https://www.youtube.com/@MattGresham-e9z" target="_blank" rel="noreferrer">YouTube</a>
                </div>
                <div class="foot-col">
                    <h4>More</h4>
                    <a href="${p.about}">About Me</a>
                    <a href="${p.academics}">Academics</a>
                    <a href="${p.resume}">Résumé</a>
                    <a href="${p.store}">My Store</a>
                    <a href="${p.contact}">Contact me</a>
                </div>
            </div>
            <p class="foot-copy">&copy; 2026 Matt Gresham. All rights reserved.</p>
        </footer>`,
	);

	var base = depth === 0 ? '' : depth === 1 ? '../' : '../../';
	// same content stamp the HTML uses, so an injected script can never be
	// served from cache while the page around it is new
	var v = ASSET_V ? '?v=' + ASSET_V : '';
	var ee = document.createElement('script');
	ee.src = base + 'assets/js/easter-eggs.js' + v;
	document.head.appendChild(ee);

	var chat = document.createElement('script');
	chat.src = base + 'assets/js/chatbot.js' + v;
	chat.defer = true;
	document.head.appendChild(chat);

	// Self-updating GitHub links. No-ops on pages with no [data-repo], and
	// shares github-activity.js's repo cache so both together cost one request.
	var repoLinks = document.createElement('script');
	repoLinks.src = base + 'assets/js/repo-links.js' + v;
	repoLinks.defer = true;
	document.head.appendChild(repoLinks);

	var seo = document.createElement('script');
	seo.src = base + 'assets/js/seo-schema.js' + v;
	seo.defer = true;
	document.head.appendChild(seo);

	// analytics.js (provider bootstrap) must load before metrics.js (event layer)
	// so window.gtag exists when the first page_view fires. Deferred scripts run
	// in insertion order, so appending analytics first guarantees that.
	var analytics = document.createElement('script');
	analytics.src = base + 'assets/js/analytics.js' + v;
	analytics.defer = true;
	document.head.appendChild(analytics);

	var metrics = document.createElement('script');
	metrics.src = base + 'assets/js/metrics.js' + v;
	metrics.defer = true;
	document.head.appendChild(metrics);

	document.querySelectorAll('.code-segment pre code').forEach(function (block) {
		var lines = block.innerHTML.split('\n');
		if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
		block.innerHTML = lines
			.map(function (line) {
				return '<span class="line">' + line + '</span>';
			})
			.join('');
	});
})();
