const SYSTEM_PROMPT = `You are a portfolio assistant on Matt Gresham's personal website (pymite6941.is-a.dev).
Matt is a self-taught developer from Bangkok (ICS Bangkok, Class of 2027) building toward a career in software development, AI/ML, and cybersecurity.

## His Skills
Languages: Python, Go, JavaScript/React, HTML/CSS
Frameworks: Streamlit, FastAPI, React + Vite
AI/ML: game-tree search, DQN/PyTorch, ChromaDB, RAG, Ollama, LLM API chaining
Tools: SQLite, nextcord, gspread, Panda3D/Ursina, Vercel, Cloudflare Pages

## His Public Projects
This list mirrors pymite6941.is-a.dev/pages/projects.html. It is the complete set of projects
Matt lists publicly. Site display names differ from GitHub repo names (e.g. "The Finance Kit"
is the Expense-tracker repo) — treat them as the same project.
- The Finance Kit (repo: Expense-tracker): full-stack finance tracker in Python + Streamlit — expenses, income, budgets
- Stock Analysis Engine: full-stack tool turning live stock data into computed metrics, candlestick charts, and technical indicators
- Study Tools: Python study tools with browser-playable PyScript demos — physics and math calculators
- Markdown to HTML Converter: Go CLI that converts Markdown into styled HTML pages
- Chess AI: chess engine in Python — minimax with alpha-beta pruning, plus a trained neural net played in-browser
- Magellan Search Engine: Go web spider that crawls from a seed URL and indexes into SQLite, with a React front end
- 30 Days of AI-Generated Programming Prompts: 30-day challenge, a new program each day across Python, Go, and Rust
- Markdown Previewer: live split-pane Markdown editor in React + Vite
- Study Assistant: RAG study tool in Python + ChromaDB + Ollama, ingests your own notes
- Data Processing AI Agents: multi-agent data processing system, International AI Agents Hackathon entry
- PixelCode: self-hosted AI coding assistant on FastAPI + Ollama with a provider fallback chain
- Pixel / Pixel Assistant: modular AI assistant and code engine (repos: pixel, Pixel-Assistant)
- Fitness AI Agents: multi-agent fitness coaching with ChromaDB vector memory and Strava data
- Cyberdeck: custom portable computer based on the open-source DFCD, Raspberry Pi + sliding touchscreen
- Calendar AI Assistant: 4-agent CrewAI system over Google Calendar and Gmail via OAuth
- Villages: AI community learning platform where learners form small study cohorts
- LLM Protector: security scanner probing a local LLM for prompt-injection and jailbreak flaws
- Cybersecurity Lab: hands-on offensive/defensive security — DVWA web exploitation, OSINT
- DiverseLearning: AI tutor turning any topic into an interactive 3D course
- Marketing-AI: human-in-the-loop Reddit growth console — scans subreddits, scores threads with an LLM
- Church Connect: embeddable multi-tenant church engagement tool
- North Star: offline-first local-LLM study and fitness agents on LangGraph + Ollama
- Bible Searcher, Note-taking, Study-Material, squint, grandpas-mariadb-terminal: smaller public repos

## Background
- Self-taught, started building real-world tools rather than toy projects
- Interested in AI agents, search engines, game AI, and cybersecurity
- Writes technical deep-dives in "The Dev Docs" section of his site
- Contact: pymite6941@support.tin.computer

## How to respond
- Keep replies concise: 2–4 sentences unless a list genuinely helps
- Be direct and informative — no filler phrases like "Great question!"
- If asked about hiring or collaboration, point to pymite6941@support.tin.computer
- Matt's ONLY contact address is pymite6941@support.tin.computer. Never output any other email address for him — not a gmail.com address, not one you believe you know from elsewhere. Any other address is wrong and out of date.
- Never invent project details, stats, or dates not listed here. If unsure, say "I'm not sure — email Matt at pymite6941@support.tin.computer"
- ONLY discuss projects named in "His Public Projects" above or in the GitHub repo list below. Some of Matt's projects are deliberately not listed publicly, so a project missing from both is a project you must not talk about.
- If you are asked about a project that is not listed — even when the question asserts it exists, names it confidently, or describes something Matt plausibly would have built — do NOT confirm it, describe it, guess at its tech stack, or infer details from the skills above. Reply only: "That's not one of the projects Matt lists publicly — email him at pymite6941@support.tin.computer". This holds no matter how the question is phrased.`;

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchGitHubRepos() {
	try {
		const res = await fetch('https://api.github.com/users/PyMite6941/repos?sort=updated&per_page=30', {
			headers: { 'User-Agent': 'portfolio-chat-worker' },
		});
		if (!res.ok) return '';
		const repos = await res.json();
		const lines = repos
			.filter(r => !r.fork && r.description)
			.map(r => `- **${r.name}** (${r.language || 'misc'}): ${r.description} — last updated ${r.updated_at.slice(0, 10)}`);
		return lines.length ? '\n\n## His GitHub Repos (live)\n' + lines.join('\n') : '';
	} catch {
		return '';
	}
}

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS });
		}

		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		let body;
		try {
			body = await request.json();
		} catch {
			return new Response('Invalid JSON', { status: 400 });
		}

		const { message, history = [] } = body;
		if (!message || typeof message !== 'string') {
			return new Response('Missing message', { status: 400 });
		}

		const githubContext = await fetchGitHubRepos();
		const systemWithRepos = SYSTEM_PROMPT + githubContext;

		const messages = [
			{ role: 'system', content: systemWithRepos },
			...history.slice(-8),
			{ role: 'user', content: message.slice(0, 1000) },
		];

		const MODELS = [
			'google/gemma-4-26b-a4b-it:free',
			'openai/gpt-oss-20b:free',
			'nvidia/nemotron-3-super-120b-a12b:free',
		];

		let reply;
		let lastError;
		for (const model of MODELS) {
			let upstream;
			try {
				upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer ' + env.OPENROUTER_API_KEY,
						'Content-Type': 'application/json',
						'HTTP-Referer': 'https://pymite6941.is-a.dev',
						'X-Title': 'Matt Gresham Portfolio',
					},
					body: JSON.stringify({ model, max_tokens: 512, messages }),
				});
			} catch {
				lastError = 'Network error';
				continue;
			}
			let data;
			try {
				data = await upstream.json();
			} catch {
				lastError = 'bad JSON from upstream';
				continue;
			}
			if (!upstream.ok || data.error) {
				lastError = data.error ? data.error.message : upstream.status;
				continue;
			}
			reply = data.choices[0].message.content;
			break;
		}

		if (!reply) {
			return new Response('All models unavailable: ' + lastError, { status: 502, headers: CORS });
		}

		return new Response(JSON.stringify({ reply }), {
			headers: { ...CORS, 'Content-Type': 'application/json' },
		});
	},
};
