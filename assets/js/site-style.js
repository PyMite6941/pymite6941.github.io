(function () {
	const s = document.currentScript;
	const depth = parseInt(s.dataset.depth || '0', 10);
	const PATHS = [
		{
			home: 'index.html',
			about: 'pages/about-me.html',
			projects: 'pages/projects.html',
			devdocs: 'pages/the-dev-docs.html',
			contact: 'pages/contact-me.html',
			resume: 'assets/documents/matt_gresham_resume.pdf',
		},
		{
			home: '../index.html',
			about: 'about-me.html',
			projects: 'projects.html',
			devdocs: 'the-dev-docs.html',
			contact: 'contact-me.html',
			resume: '../assets/documents/matt_gresham_resume.pdf',
		},
		{
			home: '../../index.html',
			about: '../about-me.html',
			projects: '../projects.html',
			devdocs: '../the-dev-docs.html',
			contact: '../contact-me.html',
			resume: '../../assets/documents/matt_gresham_resume.pdf',
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
			<ul class="nav-list">
				<li class="nav-item"><a class="nav-link" href="${p.home}">Home</a></li>
				<li class="nav-item"><a class="nav-link" href="${p.about}">About Me</a></li>
				<li class="nav-item"><a class="nav-link" href="${p.projects}">Projects</a></li>
				<li class="nav-item"><a class="nav-link" href="${p.devdocs}">The Dev Docs</a></li>
			</ul>
			<a class="nav-btn" href="${p.contact}">Contact me</a>
		</div>`,
	);

	inject(
		'site-footer',
		`<footer class="foot">
			<p>
				<a class="text-link" href="https://github.com/PyMite6941">My GitHub</a>
				<br /><br />
				<a class="text-link" href="${p.devdocs}">The Dev Docs</a>
				<br /><br />
				<a class="text-link" href="${p.resume}">View my resume</a>
			</p>
			<p style="text-align: center; font-size: 14px">&copy; 2026 Matt Gresham. All rights reserved.</p>
		</footer>`,
	);
})();
