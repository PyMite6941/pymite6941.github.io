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
				body: JSON.stringify({
					model: 'google/gemma-3-27b-it:free',
					max_tokens: 512,
					messages,
				}),
			});
		} catch {
			return new Response('Failed to reach upstream', { status: 502, headers: CORS });
		}

		if (!upstream.ok) {
			const err = await upstream.text();
			return new Response('Upstream error: ' + err, { status: 502, headers: CORS });
		}

		const data = await upstream.json();
		const reply = data.choices[0].message.content;

		return new Response(JSON.stringify({ reply }), {
			headers: { ...CORS, 'Content-Type': 'application/json' },
		});
	},
};
