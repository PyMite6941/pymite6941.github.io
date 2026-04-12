(function () {
	const s = document.currentScript;
	const depth = parseInt(s.dataset.depth || '0', 10);
	const PATHS = [
		{
			home: 'index.html',
			about: 'pages/about.html',
			project: 'pages/project.html',
			resume: 'assets/documents/matt_gresham_resume.pdf',
			contact: 'pages/contact.html',
			blog: 'pages/blog.html',
		},
		{
			home: '../index.html',
			about: '../pages/about.html',
			project: '../pages/project.html',
			resume: '../assets/documents/matt_gresham_resume.pdf',
			contact: '../pages/contact.html',
			blog: '../pages/blog.html',
		},
		{
			home: '../../index.html',
			about: '../../pages/about.html',
			project: '../../pages/project.html',
			resume: '../../assets/documents/matt_gresham_resume.pdf',
			contact: '../../pages/contact.html',
			blog: '../../pages/blog.html',
		},
	];
	const p = PATHS[Math.min(depth, 2)];
	const GH = 'https://github.com/PyMite6941';

	function inject(id, html) {
		const el = document.getElementById(id);
		if (el) el.outerHTML = html;
	}

	inject(
		'site-nav',
		`<div class="nav">
			<ul class="nav-list">
				<li class="nav-item"
					><a
						class="nav-link"
						href="../index.html"
						>Home</a
					></li
				>
				<li class="nav-item"
					><a
						class="nav-link"
						href="about-me.html"
						>About Me</a
					></li
				>
				<li class="nav-item"
					><a
						class="nav-link"
						href="projects.html"
						>Projects</a
					></li
				>
				<li class="nav-item"
					><a
						class="nav-link"
						href="the-dev-docs.html"
						>The Dev Docs</a
					></li
				>
			</ul>
			<a
				class="nav-btn"
				href="./contact-me.html"
				>Contact me</a
			>
		</div>`,
	);

	inject(
		'site-footer',
		`<footer class="foot">
			<p>
				<a
					class="text-link"
					href="https://github.com/PyMite6941"
					>My GitHub</a
				>
				<br />
				<br />
				<a
					class="text-link"
					href="the-dev-docs.html"
					>The Dev Docs</a
				>
				<br />
				<br />
				<a
					class="text-link"
					href="../assets/documents/matt_gresham_resume.pdf"
					>View my resume</a
				>
			</p>
			<p style="text-align: center; font-size: 14px">
				&copy; 2026 Matt Gresham. All rights reserved.
			</p>
		</footer>`,
	);
})();
