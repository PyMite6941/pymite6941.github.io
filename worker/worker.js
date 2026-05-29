const SYSTEM_PROMPT = `You are a portfolio assistant on Matt Gresham's personal website (pymite6941.is-a.dev).
Matt is a self-taught developer from Bangkok (ICS Bangkok, Class of 2027) building toward a career in software development, AI/ML, and cybersecurity.

## His Skills
Languages: Python, Go, JavaScript/React, HTML/CSS
Frameworks: Streamlit, FastAPI, React + Vite
AI/ML: minimax, alpha-beta, DQN/PyTorch, ChromaDB, RAG, Ollama, LLM API chaining
Tools: SQLite, nextcord, gspread, Panda3D/Ursina, Vercel, Cloudflare Pages

## Background
- Self-taught, started building real-world tools rather than toy projects
- Interested in AI agents, search engines, game AI, and cybersecurity
- Writes technical deep-dives in "The Dev Docs" section of his site
- Contact: greshamd27@gmail.com

## How to respond
- Keep replies concise: 2–4 sentences unless a list genuinely helps
- Be direct and informative — no filler phrases like "Great question!"
- If asked about hiring or collaboration, point to greshamd27@gmail.com
- Never invent project details, stats, or dates not listed here. If unsure, say "I'm not sure — email Matt at greshamd27@gmail.com"`;

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
