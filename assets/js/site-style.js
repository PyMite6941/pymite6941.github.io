(function () {
	const depth = parseInt(document.documentElement.dataset.depth || '0', 10);
	const PATHS = [
		{
			// depth 0 — root (index.html)
			home: 'index.html',
			about: 'pages/about-me.html',
			projects: 'pages/projects.html',
			hackathons: 'pages/hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: 'pages/client-work.html',
			dreamprojects: 'pages/dream-projects.html',
			devdocs: 'pages/the-dev-docs.html',
			contact: 'pages/contact-me.html',
			resume: 'assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
		},
		{
			// depth 1 — pages/*.html
			home: '../index.html',
			about: 'about-me.html',
			projects: 'projects.html',
			hackathons: 'hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: 'client-work.html',
			dreamprojects: 'dream-projects.html',
			devdocs: 'the-dev-docs.html',
			contact: 'contact-me.html',
			resume: '../assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
		},
		{
			// depth 2 — pages/*/*.html
			home: '../../index.html',
			about: '../about-me.html',
			projects: '../projects.html',
			hackathons: '../hackathons.html',
			ailab: 'https://ai-lab-bice.vercel.app',
			forothers: '../client-work.html',
			dreamprojects: '../dream-projects.html',
			devdocs: '../the-dev-docs.html',
			contact: '../contact-me.html',
			resume: '../../assets/documents/matt_gresham_resume.html',
			store: 'https://grid-store.pages.dev',
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
                <li class="nav-item"><a class="nav-link" href="${p.about}">About Me</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.projects}">Projects</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.hackathons}">Hackathons</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.ailab}">AI Lab</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.forothers}">Built for Others</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.dreamprojects}">Dream Projects</a></li>
                <li class="nav-item"><a class="nav-link" href="${p.devdocs}">The Dev Docs</a></li>
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
            <p>
                <a class="text-link" href="https://github.com/PyMite6941">My GitHub</a>
                <br /><br />
                <a class="text-link" href="https://www.youtube.com/@MattGresham-e9z">My YouTube</a>
                <br /><br />
                <a class="text-link" href="${p.devdocs}">The Dev Docs</a>
                <br /><br />
                <a class="text-link" href="${p.resume}">View my resume</a>
				<br /><br />
				<a class="text-link" href="${p.store}">Visit my Store</a>
            </p>
            <p style="text-align: center; font-size: 14px">&copy; 2026 Matt Gresham. All rights reserved.</p>
        </footer>`,
	);

	var base = depth === 0 ? '' : depth === 1 ? '../' : '../../';
	var ee = document.createElement('script');
	ee.src = base + 'assets/js/easter-eggs.js';
	document.head.appendChild(ee);

	var chat = document.createElement('script');
	chat.src = base + 'assets/js/chatbot.js';
	chat.defer = true;
	document.head.appendChild(chat);

	var seo = document.createElement('script');
	seo.src = base + 'assets/js/seo-schema.js';
	seo.defer = true;
	document.head.appendChild(seo);

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
