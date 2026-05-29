const SYSTEM_PROMPT = `You are a portfolio assistant on Matt Gresham's personal website (pymite6941.is-a.dev).
Matt is a self-taught developer from Bangkok (ICS Bangkok, Class of 2027) building toward a career in software development, AI/ML, and cybersecurity.

## His Projects
- **The Finance Kit** — Python + Streamlit. Tracks expenses, income, subscriptions. Separate frontend/backend, deployed on Streamlit Cloud.
- **Magellan Search Engine** — Go web spider that crawls from a seed URL into SQLite, React frontend to search results. Deployed on Vercel.
- **Connect4 Bot** — Python AI using minimax with DFS and transposition table. Reads board state from screen pixels using image processing.
- **VORTEX** — First-person shooter game built with Panda3D/Ursina. 3 maps, 4 game modes, 13 guns, skin shop, XP system.
- **PixelCode** — Self-hosted AI coding assistant. FastAPI backend + rich CLI. Multi-provider LLM chain: Groq → Gemini → OpenRouter → Ollama fallback.
- **Chess AI** — Python minimax with alpha-beta pruning, expanding toward a Deep Q-Network trained via self-play.
- **Markdown to HTML Converter** — Go CLI tool that converts .md files to styled HTML pages.
- **CLI Flash Cards** — Go CLI flashcard app with JSON data storage.
- **STEAMxchange Assign Bot** — Discord bot (nextcord) for automated project assignment via Google Sheets. Runs assignment ranking algorithms for writers, designers, and QC.
- **Study Assistant** — RAG tool submitted to Hack America 2026. Ingests notes (Markdown, PDFs, images) into ChromaDB, query them conversationally via Ollama or cloud models.

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
- If asked about something you don't know, say so honestly rather than guessing`;

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

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

		// Keep last 8 turns to stay within token budget
		const messages = [
			{ role: 'system', content: SYSTEM_PROMPT },
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
		} catch (err) {
			return new Response('Failed to reach upstream', {
				status: 502,
				headers: CORS,
			});
		}

		if (!upstream.ok) {
			const err = await upstream.text();
			return new Response('Upstream error: ' + err, {
				status: 502,
				headers: CORS,
			});
		}

		const data = await upstream.json();
		const reply = data.choices[0].message.content;

		return new Response(JSON.stringify({ reply }), {
			headers: { ...CORS, 'Content-Type': 'application/json' },
		});
	},
};
