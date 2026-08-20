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
		'/pages/academics.html': {
			name: 'Academics — Matt Gresham',
			description:
				'Academic profile for Matt Gresham, Class of 2027 at International Community School Bangkok — coursework, awards, competitions, leadership, community service, and college plans in computer science.',
			type: 'AboutPage',
		},
		'/pages/client-work.html': {
			name: 'Client work by Matt Gresham',
			description:
				'Freelance and client work by Matt Gresham, including a neuroscience education site, a Stripe and crypto subscription billing layer, and authorised web application security and QA testing.',
			type: 'CollectionPage',
		},
		'/pages/college-essay.html': {
			name: 'Common Application Essay',
			description:
				'The Common Application personal statement of Matt Gresham, Class of 2027, written for his US university applications in computer science.',
			type: 'CreativeWork',
		},
		'/pages/scholarships.html': {
			name: 'Federal Cybersecurity Scholarships',
			description:
				'Federal scholarship-for-service programs Matt Gresham is targeting as a Class of 2027 applicant — NSA Stokes, CIA Undergraduate Scholarship, DoD SMART, DoD CySP, and CyberCorps SFS — with eligibility, service commitments, and how his college list maps to them.',
			type: 'WebPage',
		},
		'/pages/project-pages/fitness-watch.html': {
			name: 'FitnessAI Watch',
			description:
				'An open-hardware ESP32-C3 smartwatch by Matt Gresham that tracks heart rate, steps, and GPS on-device and syncs workouts to the Fitness AI Agents platform.',
			type: 'CreativeWork',
			programmingLanguage: ['C++'],
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
				'Stock Analysis Engine is Matt Gresham\'s FastAPI and React stock analysis tool with computed metrics, technical indicators, AI chat, and an offline Streamlit mode.',
			type: 'SoftwareApplication',
			applicationCategory: 'FinanceApplication',
			programmingLanguage: ['Python', 'JavaScript'],
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
		'/pages/project-pages/cybersecurity-lab.html': {
			name: 'Cybersecurity Lab',
			description:
				"Matt Gresham's hands-on cybersecurity lab: DVWA web exploitation write-ups, OSINT methodology, a Raspberry Pi home lab, LLM security tooling, and interactive in-browser security demos.",
			type: 'CreativeWork',
		},
		'/pages/work-experience/polaris-student.html': {
			name: 'Polaris Student — Head of Testing',
			description:
				"Matt Gresham's Head of Testing work at Polaris Student — manual QA, bug tracking, and a running testing log across signup, the AI assistant, calculator tools, and account settings.",
			type: 'CreativeWork',
		},
		'/pages/project-pages/diverselearning.html': {
			name: 'DiverseLearning',
			description:
				'DiverseLearning by Matt Gresham is an AI tutor that turns any topic into an interactive 3D course you can rotate, explode, and take apart, built with Next.js and React Three Fiber for neurodiverse learners.',
			type: 'SoftwareApplication',
			applicationCategory: 'EducationalApplication',
			programmingLanguage: ['TypeScript', 'JavaScript'],
		},
		'/pages/project-pages/ctf-flashcards.html': {
			name: 'CTF Flashcards',
			description:
				'CTF Flashcards by Matt Gresham is a cybersecurity active-recall app where solving HackTheBox-style CTF puzzles unlocks FSRS spaced-repetition flashcards, built with React and a Cloudflare Worker on D1 with an AI Learn tutor.',
			type: 'SoftwareApplication',
			applicationCategory: 'EducationalApplication',
			programmingLanguage: ['JavaScript', 'Python'],
		},
		'/pages/project-pages/marketing-ai.html': {
			name: 'Marketing-AI',
			description:
				'Marketing-AI by Matt Gresham is a human-in-the-loop Reddit growth console that finds threads, scores them with an LLM, and drafts tone-matched replies for a human to approve, built with FastAPI and React.',
			type: 'SoftwareApplication',
			applicationCategory: 'BusinessApplication',
			programmingLanguage: ['Python', 'JavaScript'],
		},
		'/pages/project-pages/church-connect.html': {
			name: 'Church Connect',
			description:
				'Church Connect by Matt Gresham is an embeddable, multi-tenant church engagement tool built with React and Vite that serves any church from its own subdomain with per-tenant branding and features.',
			type: 'SoftwareApplication',
			applicationCategory: 'WebApplication',
			programmingLanguage: ['JavaScript'],
		},
		'/pages/project-pages/north-star.html': {
			name: 'North Star (Polaris)',
			description:
				'North Star by Matt Gresham is an offline-first suite of local-LLM study and fitness agents built on LangGraph and Ollama that run entirely on-device with no API keys, using Chroma for cited note retrieval.',
			type: 'SoftwareApplication',
			applicationCategory: 'EducationalApplication',
			programmingLanguage: ['Python'],
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
