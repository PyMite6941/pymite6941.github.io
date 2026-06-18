(function () {
	const SITE_ORIGIN = 'https://pymite6941.is-a.dev';
	const PERSON_ID = SITE_ORIGIN + '/#matt-gresham';
	const WEBSITE_ID = SITE_ORIGIN + '/#website';

	const PAGE_META = {
		'/': {
			name: 'Matt Gresham | Portfolio Website',
			description:
				'Portfolio of Matt Gresham, a self-taught developer building finance tools, AI agents, search projects, study tools, and browser demos.',
			type: 'WebPage',
		},
		'/pages/projects.html': {
			name: 'Products and projects by Matt Gresham',
			description:
				'Products and projects built by Matt Gresham, including finance tools, AI agents, search projects, study tools, and browser-playable demos.',
			type: 'CollectionPage',
		},
		'/pages/about-me.html': {
			name: 'About Matt Gresham',
			description:
				'About Matt Gresham, a self-taught developer building projects across AI/ML, cybersecurity, software engineering, algorithms, and embedded systems.',
			type: 'AboutPage',
		},
		'/pages/project-pages/finance_kit.html': {
			name: 'The Finance Kit',
			description:
				'The Finance Kit is a Python and Streamlit finance tracker by Matt Gresham for expenses, income, budgets, and tax estimates.',
			type: 'SoftwareApplication',
			applicationCategory: 'FinanceApplication',
			programmingLanguage: ['Python'],
		},
		'/pages/project-pages/study_stuff.html': {
			name: 'Study Tools',
			description:
				'Browser-playable study tools by Matt Gresham, including calculators, solvers, and flashcards built with Python and PyScript.',
			type: 'SoftwareApplication',
			applicationCategory: 'EducationalApplication',
			programmingLanguage: ['Python'],
		},
		'/pages/project-pages/mdToHTMLConverter.html': {
			name: 'Markdown to HTML Converter',
			description:
				'Go command-line tool by Matt Gresham that converts Markdown files into styled HTML pages.',
			type: 'SoftwareApplication',
			applicationCategory: 'DeveloperApplication',
			programmingLanguage: ['Go'],
		},
		'/pages/project-pages/stock-analysis-engine.html': {
			name: 'Stock Analysis Engine',
			description:
				'Full-stack stock analysis tool by Matt Gresham: live data, computed metrics and technical indicators, candlestick charts, and a data-grounded AI analyst, plus an offline Streamlit mode that uses no AI. Built with FastAPI and React.',
			type: 'SoftwareApplication',
			applicationCategory: 'FinanceApplication',
			programmingLanguage: ['Python', 'JavaScript'],
		},
		'/pages/project-pages/connect4.html': {
			name: 'Connect 4 Bot',
			description:
				'Connect 4 Bot by Matt Gresham is a Python game-playing AI built with minimax search, alpha-beta pruning, transposition tables, and pixel-based board detection.',
			type: 'SoftwareApplication',
			applicationCategory: 'GameApplication',
			programmingLanguage: ['Python'],
		},
		'/pages/project-pages/30DaysOfAIProgrammingPrompts.html': {
			name: '30 Days of AI-Generated Programming Prompts',
			description:
				'30 Days of AI-Generated Programming Prompts by Matt Gresham is a collection of daily programming prompt exercises and practice pages.',
			type: 'CreativeWork',
		},
		'/pages/project-pages/magellan.html': {
			name: 'Magellan',
			description:
				'Magellan by Matt Gresham is a search engine that pairs a Go web spider with a React frontend, deployed on Vercel.',
			type: 'SoftwareApplication',
			applicationCategory: 'WebApplication',
			programmingLanguage: ['Go', 'JavaScript'],
		},
		'/pages/project-pages/markdown-previewer.html': {
			name: 'Markdown Previewer',
			description:
				'Markdown Previewer by Matt Gresham is a React app that renders Markdown to HTML in real time with GitHub-flavored Markdown support.',
			type: 'SoftwareApplication',
			applicationCategory: 'DeveloperApplication',
			programmingLanguage: ['JavaScript'],
		},
		'/pages/project-pages/pixelcode.html': {
			name: 'PixelCode',
			description:
				'PixelCode by Matt Gresham is a self-hosted AI coding assistant built on FastAPI and Ollama, designed to run on your own infrastructure.',
			type: 'SoftwareApplication',
			applicationCategory: 'DeveloperApplication',
			programmingLanguage: ['Python'],
		},
		'/pages/project-pages/fitness-ai-agents.html': {
			name: 'Fitness AI Agents',
			description:
				'Fitness AI Agents by Matt Gresham is a multi-agent coaching system that reasons over your own Strava data using ChromaDB and local LLMs.',
			type: 'SoftwareApplication',
			applicationCategory: 'HealthApplication',
			programmingLanguage: ['Python'],
		},
		'/pages/project-pages/cyberdeck.html': {
			name: 'Cyberdeck',
			description:
				'A custom portable computer built by Matt Gresham — a modular Raspberry Pi cyberdeck with a sliding touchscreen, mechanical keyboard, trackball, and a custom OS layer.',
			type: 'CreativeWork',
		},
	};

	function normalizedPath() {
		let path = window.location.pathname || '/';
		if (path.endsWith('/index.html')) path = path.slice(0, -10) || '/';
		if (!path.startsWith('/')) path = '/' + path;
		return path;
	}

	function canonicalUrl(path) {
		if (path === '/') return SITE_ORIGIN + '/';
		return SITE_ORIGIN + path;
	}

	function metaDescription() {
		const tag = document.querySelector('meta[name="description"]');
		return tag ? tag.getAttribute('content') : '';
	}

	function upsertCanonical(url) {
		let link = document.querySelector('link[rel="canonical"]');
		if (!link) {
			link = document.createElement('link');
			link.rel = 'canonical';
			document.head.appendChild(link);
		}
		link.href = url;
	}

	function addJsonLd(data) {
		const script = document.createElement('script');
		script.type = 'application/ld+json';
		script.text = JSON.stringify(data);
		document.head.appendChild(script);
	}

	const path = normalizedPath();
	const canonical = canonicalUrl(path);
	const page = PAGE_META[path] || {
		name: document.title || 'Matt Gresham website',
		description: metaDescription(),
		type: 'WebPage',
	};

	upsertCanonical(canonical);

	const person = {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: 'Matt Gresham',
		alternateName: 'Matt G',
		url: SITE_ORIGIN + '/pages/about-me.html',
		sameAs: [
			'https://github.com/PyMite6941',
			'https://www.youtube.com/@MattGresham-e9z',
		],
		knowsAbout: [
			'Python',
			'Go',
			'Software engineering',
			'AI and machine learning',
			'Cybersecurity',
			'Algorithms',
			'Embedded systems',
		],
	};

	const website = {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: 'Matt Gresham portfolio',
		url: SITE_ORIGIN + '/',
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
	};

	const webpage = {
		'@type': page.type === 'SoftwareApplication' ? 'WebPage' : page.type,
		'@id': canonical + '#webpage',
		url: canonical,
		name: page.name,
		description: page.description || metaDescription(),
		isPartOf: { '@id': WEBSITE_ID },
		author: { '@id': PERSON_ID },
	};

	const graph = [person, website, webpage];

	if (page.type === 'SoftwareApplication') {
		graph.push({
			'@type': 'SoftwareApplication',
			'@id': canonical + '#software',
			name: page.name,
			description: page.description,
			url: canonical,
			applicationCategory: page.applicationCategory,
			programmingLanguage: page.programmingLanguage,
			author: { '@id': PERSON_ID },
		});
	}

	addJsonLd({
		'@context': 'https://schema.org',
		'@graph': graph,
	});
})();
