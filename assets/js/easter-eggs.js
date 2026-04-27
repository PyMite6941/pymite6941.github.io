(function () {
  // ─── Achievements ─────────────────────────────────────────────────────────
  const ALL_ACHIEVEMENTS = [
    { id: 'first_visit',     name: 'First Step',       desc: 'Visited the portfolio for the first time.' },
    { id: 'about_me',        name: "Who's Matt?",       desc: 'Checked out the About Me page.' },
    { id: 'projects_page',   name: 'Window Shopping',   desc: 'Browsed the Projects page.' },
    { id: 'dev_docs',        name: 'Dev Docs Reader',   desc: 'Opened the Dev Docs.' },
    { id: 'explorer_3',      name: 'Explorer',          desc: 'Visited 3 different pages.' },
    { id: 'explorer_5',      name: 'Globe Trotter',     desc: 'Visited 5 different pages.' },
    { id: 'explorer_10',     name: 'Completionist',     desc: 'Visited 10 or more different pages.' },
    { id: 'project_deep',    name: 'Deep Dive',         desc: 'Viewed 3 individual project pages.' },
    { id: 'day_tripper',     name: 'Day Tripper',       desc: 'Visited 3 or more challenge day pages.' },
    { id: 'terminal_hacker', name: 'Terminal Hacker',   desc: 'Opened the secret terminal.' },
    { id: 'confetti_lover',  name: 'Party Animal',      desc: 'Launched the confetti.' },
    { id: 'curious',         name: 'Curious',           desc: 'Typed "secret" in the terminal.' },
  ];

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem('mg_state') || 'null') || { visited: [], unlocked: [] };
    } catch { return { visited: [], unlocked: [] }; }
  }

  function saveState(s) {
    try { localStorage.setItem('mg_state', JSON.stringify(s)); } catch {}
  }

  function unlockAchievement(id) {
    const s = loadState();
    if (s.unlocked.includes(id)) return;
    s.unlocked.push(id);
    saveState(s);
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
    if (ach) showToast(ach);
  }

  function showToast(ach) {
    const toast = document.createElement('div');
    toast.style.cssText = [
      'position:fixed', 'bottom:20px', 'left:20px', 'z-index:10000',
      'background:#161b22', 'border:1px solid #8957e5', 'border-radius:10px',
      'padding:12px 16px', 'max-width:280px',
      'box-shadow:0 4px 20px rgba(137,87,229,0.35)',
      "font-family:'Google Sans',sans-serif", 'color:#e6edf3',
      'transform:translateX(-110%)', 'transition:transform 0.35s ease',
      'pointer-events:none',
    ].join(';');
    toast.innerHTML =
      '<div style="font-size:0.68rem;color:#8957e5;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">Achievement Unlocked</div>' +
      '<div style="font-size:0.98rem;font-weight:bold;margin:4px 0;">' + ach.name + '</div>' +
      '<div style="font-size:0.8rem;color:#8b949e;">' + ach.desc + '</div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.style.transform = 'translateX(0)'; });
    });
    setTimeout(function () {
      toast.style.transform = 'translateX(-110%)';
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  function trackPageVisit() {
    var path = location.pathname;
    var s = loadState();
    if (!s.visited.includes(path)) {
      s.visited.push(path);
      saveState(s);
    }

    unlockAchievement('first_visit');

    if (/about-me\.html/.test(path))    unlockAchievement('about_me');
    if (/\/projects\.html/.test(path))  unlockAchievement('projects_page');
    if (/the-dev-docs/.test(path))      unlockAchievement('dev_docs');
    if (s.visited.length >= 3)          unlockAchievement('explorer_3');
    if (s.visited.length >= 5)          unlockAchievement('explorer_5');
    if (s.visited.length >= 10)         unlockAchievement('explorer_10');

    var projCount = s.visited.filter(function (v) { return /project-pages\//.test(v); }).length;
    if (projCount >= 3) unlockAchievement('project_deep');

    var dayCount = s.visited.filter(function (v) { return /30DaysOfAIProgrammingPrompts\/Day/.test(v); }).length;
    if (dayCount >= 3) unlockAchievement('day_tripper');
  }

  // ─── Confetti ─────────────────────────────────────────────────────────────
  var _confettiLoaded = false;

  function fireConfetti() {
    if (_confettiLoaded) { _doConfetti(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    s.onload = function () { _confettiLoaded = true; _doConfetti(); };
    document.head.appendChild(s);
    unlockAchievement('confetti_lover');
  }

  function _doConfetti() {
    window.confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 },
      colors: ['#8957e5', '#61afef', '#11d978', '#e2490d', '#e6edf3'] });
    setTimeout(function () {
      window.confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
      window.confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
    }, 250);
  }

  window.fireConfetti = fireConfetti;

  // ─── Terminal ─────────────────────────────────────────────────────────────
  var TERM_CSS = [
    '#mg-terminal{position:fixed;bottom:24px;right:24px;z-index:9000;',
    'width:520px;max-width:calc(100vw - 48px);',
    'background:#0d1117;border:1px solid #3e4451;border-radius:10px;overflow:hidden;',
    'box-shadow:0 8px 32px rgba(0,0,0,0.6);',
    "font-family:'Courier New',monospace;font-size:0.88rem;display:none;}",
    '#mg-terminal.open{display:block;}',
    '#mg-term-titlebar{background:#161b22;padding:8px 14px;',
    'display:flex;justify-content:space-between;align-items:center;',
    'border-bottom:1px solid #3e4451;user-select:none;}',
    '#mg-term-titlebar span{color:#8b949e;font-size:0.76rem;}',
    '#mg-term-close{background:#e2490d;border:none;color:#fff;border-radius:50%;',
    'width:14px;height:14px;cursor:pointer;font-size:10px;line-height:14px;text-align:center;padding:0;}',
    '#mg-term-output{padding:12px 14px;min-height:160px;max-height:300px;',
    'overflow-y:auto;color:#abb2bf;white-space:pre-wrap;line-height:1.55;}',
    '#mg-term-input-row{display:flex;align-items:center;gap:6px;',
    'padding:8px 14px;border-top:1px solid #3e4451;}',
    '#mg-term-prompt{color:#8957e5;white-space:nowrap;user-select:none;}',
    '#mg-term-input{flex:1;background:transparent;border:none;outline:none;',
    "color:#e6edf3;font-family:'Courier New',monospace;font-size:0.88rem;}",
    '.mg-t-ok{color:#11d978}.mg-t-warn{color:#e2a20d}.mg-t-err{color:#e2490d}.mg-t-hi{color:#8957e5}',
  ].join('');

  var COMMANDS = {
    help: function () {
      return [
        '<span class="mg-t-ok">Available commands:</span>',
        '  help          — show this list',
        '  about         — who is Matt',
        '  skills        — tech stack',
        '  projects      — project list',
        '  achievements  — your unlocked achievements (' + loadState().unlocked.length + '/' + ALL_ACHIEVEMENTS.length + ')',
        '  secret        — ???',
        '  confetti      — 🎉',
        '  sudo          — nice try',
        '  clear         — clear the terminal',
        '  close / exit  — close the terminal',
      ].join('\n');
    },

    about: function () {
      return 'Matt Gresham — self-taught dev, Python &amp; Go main, occasional React enjoyer.\nBuilding real tools since 2024. Currently competing in NOAI.';
    },

    skills: function () {
      return [
        '<span class="mg-t-hi">Languages:</span>   Python · Go · JavaScript/React · HTML/CSS · Rust (learning)',
        '<span class="mg-t-hi">Frameworks:</span>  Streamlit · PyScript · React+Vite · SQLite',
        '<span class="mg-t-hi">Concepts:</span>    DFS/minimax · REST APIs · web scraping · full-stack arch',
      ].join('\n');
    },

    projects: function () {
      return [
        '<span class="mg-t-hi">Finance Kit</span>       — full-stack finance tracker (Python + Streamlit)',
        '<span class="mg-t-hi">Magellan</span>           — Go spider + React search engine',
        '<span class="mg-t-hi">Connect 4 Bot</span>      — minimax AI with pixel board reading',
        '<span class="mg-t-hi">Chess Site</span>         — React + Vite chess game (Vercel)',
        '<span class="mg-t-hi">MD→HTML</span>            — Go CLI Markdown converter',
        '<span class="mg-t-hi">Markdown Previewer</span> — live split-pane editor (React)',
        '<span class="mg-t-hi">Study Tools</span>        — browser-playable PyScript tools',
        '<span class="mg-t-hi">30 Days Challenge</span>  — daily prompts across Python, Go, Rust',
      ].join('\n');
    },

    achievements: function () {
      var s = loadState();
      if (s.unlocked.length === 0) return '<span class="mg-t-warn">No achievements yet — keep exploring!</span>';
      var lines = ALL_ACHIEVEMENTS.map(function (a) {
        var done = s.unlocked.includes(a.id);
        var check = done ? '<span class="mg-t-ok">✓</span>' : '<span style="color:#3e4451">○</span>';
        var label = done ? '<strong>' + a.name + '</strong>' : '<span style="color:#3e4451">' + a.name + '</span>';
        return check + ' ' + label + (done ? ' — ' + a.desc : '');
      });
      return lines.join('\n') + '\n\n<span class="mg-t-warn">' + s.unlocked.length + '/' + ALL_ACHIEVEMENTS.length + ' unlocked</span>';
    },

    secret: function () {
      unlockAchievement('curious');
      return '<span class="mg-t-warn">⚠  ACCESS LEVEL: VISITOR</span>\nYou found the terminal. That\'s the secret.\nThere is no deeper layer. Probably.';
    },

    confetti: function () { fireConfetti(); return '<span class="mg-t-ok">🎉 confetti launched</span>'; },

    sudo: function () {
      return '<span class="mg-t-err">[sudo] password for visitor:</span>\n<span class="mg-t-err">visitor is not in the sudoers file. This incident will not be reported.</span>';
    },

    close: function () { return '__CLOSE__'; },
    exit:  function () { return '__CLOSE__'; },
    clear: function () { return '__CLEAR__'; },
  };

  function buildTerminal() {
    var style = document.createElement('style');
    style.textContent = TERM_CSS;
    document.head.appendChild(style);

    var term = document.createElement('div');
    term.id = 'mg-terminal';
    term.innerHTML =
      '<div id="mg-term-titlebar">' +
        '<span>matt-terminal v1.0.0 &nbsp;&middot;&nbsp; press ` to toggle</span>' +
        '<button id="mg-term-close" title="close">&times;</button>' +
      '</div>' +
      '<div id="mg-term-output"><span class="mg-t-ok">matt-terminal v1.0.0</span>\n' +
        'Type <strong>help</strong> to see available commands.\n</div>' +
      '<div id="mg-term-input-row">' +
        '<span id="mg-term-prompt">visitor@matt-g&nbsp;$&nbsp;</span>' +
        '<input id="mg-term-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command..." />' +
      '</div>';
    document.body.appendChild(term);

    var output = document.getElementById('mg-term-output');
    var input  = document.getElementById('mg-term-input');

    document.getElementById('mg-term-close').addEventListener('click', close);

    function open() {
      term.classList.add('open');
      input.focus();
      unlockAchievement('terminal_hacker');
    }
    function close() { term.classList.remove('open'); }
    function toggle() { term.classList.contains('open') ? close() : open(); }

    window.addEventListener('keydown', function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (e.key === '`' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && term.classList.contains('open')) close();
    });

    function appendLine(html) {
      output.innerHTML += html + '\n';
      output.scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      appendLine('<span class="mg-t-hi">visitor@matt-g $</span> ' + raw);
      var fn = COMMANDS[raw.toLowerCase()];
      if (fn) {
        var result = fn();
        if (result === '__CLEAR__')      { output.innerHTML = ''; }
        else if (result === '__CLOSE__') { close(); }
        else                             { appendLine(result); }
      } else {
        appendLine('<span class="mg-t-err">command not found: ' + raw + '</span> — type <strong>help</strong>');
      }
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    trackPageVisit();
    buildTerminal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
