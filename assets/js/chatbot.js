(function () {
	var WORKER_URL = 'https://portfolio-chat.greshamd27.workers.dev';

	var history = [];

	var CSS = [
		'#chat-bubble{position:fixed;bottom:28px;right:28px;z-index:9999;width:52px;height:52px;',
		'border-radius:50%;background:var(--button-color);border:none;cursor:pointer;',
		'box-shadow:0 4px 16px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;',
		'transition:transform .2s;color:#fff;font-size:22px;}',
		'#chat-bubble:hover{transform:scale(1.08);}',

		'#chat-panel{position:fixed;bottom:92px;right:28px;z-index:9998;width:360px;height:480px;',
		'background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;',
		'display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.6);',
		'transform:translateY(20px);opacity:0;pointer-events:none;',
		'transition:transform .25s ease,opacity .25s ease;}',
		'#chat-panel.open{transform:translateY(0);opacity:1;pointer-events:all;}',

		'#chat-header{padding:14px 16px;border-bottom:1px solid var(--border-color);',
		'display:flex;justify-content:space-between;align-items:center;}',
		'#chat-header span{font-weight:600;color:var(--text-color);font-size:.95rem;}',
		'#chat-close{background:none;border:none;color:var(--text-color);cursor:pointer;',
		'font-size:18px;line-height:1;opacity:.6;padding:0;}',
		'#chat-close:hover{opacity:1;}',

		'#chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;',
		'gap:10px;scroll-behavior:smooth;}',
		'#chat-messages::-webkit-scrollbar{width:4px;}',
		'#chat-messages::-webkit-scrollbar-thumb{background:var(--border-color);border-radius:4px;}',

		'.chat-msg{max-width:85%;padding:9px 13px;border-radius:10px;font-size:.875rem;',
		'line-height:1.5;word-wrap:break-word;color:var(--text-color);}',
		'.chat-msg.user{background:var(--button-color);color:#fff;align-self:flex-end;',
		'border-bottom-right-radius:3px;}',
		'.chat-msg.bot{background:#2c313c;align-self:flex-start;border-bottom-left-radius:3px;}',

		'.chat-msg.typing span{display:inline-block;width:6px;height:6px;',
		'background:var(--text-color);border-radius:50%;margin:0 2px;',
		'animation:chatBounce 1.2s infinite;}',
		'.chat-msg.typing span:nth-child(2){animation-delay:.2s;}',
		'.chat-msg.typing span:nth-child(3){animation-delay:.4s;}',
		'@keyframes chatBounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}',

		'#chat-input-row{padding:12px;border-top:1px solid var(--border-color);display:flex;gap:8px;}',
		'#chat-input{flex:1;background:#2c313c;border:1px solid var(--border-color);border-radius:8px;',
		'color:var(--text-color);padding:8px 12px;font-size:.875rem;outline:none;font-family:inherit;}',
		'#chat-input:focus{border-color:var(--button-color);}',
		'#chat-send{background:var(--button-color);border:none;border-radius:8px;color:#fff;',
		'padding:8px 14px;cursor:pointer;font-size:16px;transition:opacity .15s;}',
		'#chat-send:hover{opacity:.85;}#chat-send:disabled{opacity:.4;cursor:default;}',

		'@media(max-width:480px){',
		'#chat-panel{width:calc(100vw - 24px);right:12px;bottom:80px;}',
		'#chat-bubble{bottom:16px;right:16px;}}',
	].join('');

	function injectStyles() {
		var s = document.createElement('style');
		s.textContent = CSS;
		document.head.appendChild(s);
	}

	function buildUI() {
		var bubble = document.createElement('button');
		bubble.id = 'chat-bubble';
		bubble.title = "Ask Matt's AI assistant";
		bubble.innerHTML = '&#128172;';

		var panel = document.createElement('div');
		panel.id = 'chat-panel';
		panel.innerHTML =
			'<div id="chat-header">' +
			'<span>&#128172; Ask about Matt</span>' +
			'<button id="chat-close" title="Close">&#10005;</button>' +
			'</div>' +
			'<div id="chat-messages">' +
			'<div class="chat-msg bot">Hi! I\'m Matt\'s portfolio assistant. Ask me about his projects, skills, or background.</div>' +
			'</div>' +
			'<div id="chat-input-row">' +
			'<input id="chat-input" type="text" placeholder="Ask something\u2026" autocomplete="off" />' +
			'<button id="chat-send">&#9654;</button>' +
			'</div>';

		document.body.appendChild(bubble);
		document.body.appendChild(panel);
	}

	function wireEvents() {
		var bubble = document.getElementById('chat-bubble');
		var panel = document.getElementById('chat-panel');
		var closeBtn = document.getElementById('chat-close');
		var input = document.getElementById('chat-input');
		var send = document.getElementById('chat-send');
		var messages = document.getElementById('chat-messages');

		bubble.addEventListener('click', function () {
			panel.classList.toggle('open');
			if (panel.classList.contains('open')) input.focus();
		});

		closeBtn.addEventListener('click', function () {
			panel.classList.remove('open');
		});

		send.addEventListener('click', sendMessage);
		input.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
		});

		function sendMessage() {
			var text = input.value.trim();
			if (!text) return;

			input.value = '';
			send.disabled = true;

			addMessage('user', text);
			history.push({ role: 'user', content: text });

			var typing = addTyping();

			fetch(WORKER_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: text, history: history.slice(-10) }),
			})
				.then(function (res) {
					if (!res.ok) throw new Error('err');
					return res.json();
				})
				.then(function (data) {
					typing.remove();
					addMessage('bot', data.reply);
					history.push({ role: 'assistant', content: data.reply });
				})
				.catch(function () {
					typing.remove();
					addMessage('bot', 'Sorry, I had trouble connecting. Try again in a moment.');
				})
				.finally(function () {
					send.disabled = false;
					input.focus();
				});
		}

		function addMessage(role, text) {
			var msg = document.createElement('div');
			msg.className = 'chat-msg ' + role;
			msg.textContent = text;
			messages.appendChild(msg);
			messages.scrollTop = messages.scrollHeight;
			return msg;
		}

		function addTyping() {
			var msg = document.createElement('div');
			msg.className = 'chat-msg bot typing';
			msg.innerHTML = '<span></span><span></span><span></span>';
			messages.appendChild(msg);
			messages.scrollTop = messages.scrollHeight;
			return msg;
		}
	}

	function init() {
		injectStyles();
		buildUI();
		wireEvents();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
