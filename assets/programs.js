// DATA LAYER - filesystem simulation


const FS = {
    'Desktop': {
        type: 'folder', color: '#58a6ff',
        children: {
            'Documents': {
                type: 'folder', color: '#e3b341',
                children: {
                    'readme.txt': {
                        type: 'text', content: `CloudOS - Desktop Environment v1.0
==================================

Welcome to CloudOS, a browser-based desktop simulation.

FEATURES:
      - Draggable, resizable windows
      - File explorer with folder navigation
      - Terminal emulator
      - Multi-window management
      - Taskbar with clock

Created with HTML, CSS, and JavaScript.
No frameworks. No dependencies.` },
                    'notes.txt': {
                        type: 'text', content: `Personal Notes
--------------

- Buy groceries
- Finish the CloudOS project 
- Read that article about WebAssembly
- Call dentist on Friday
- Review pull request #42

Ideas:
      • Add a music player widget
      • Implement a settings panel
      • Add themes (light/dark/retro)
      • File upload from host OS` },
                    'config.json': {
                        type: 'text', content: `{
      "user": "guest",
      "theme": "dark",
      "wallpaper": "cosmos",
      "resolution": "1920x1080",
      "fontSize": 12,
      "language": "en-US",
      "features": {
        "animations": true,
        "transparency": true,
        "snapWindows": false
      }
}` },
                }
            },
            'Projects': {
                type: 'folder', color: '#3fb950',
                children: {
                    'WebApp': {
                        type: 'folder', color: '#3fb950',
                        children: {
                            'index.html': {
                                type: 'text', content: `<!DOCTYPE html>
<html lang="en">
<head>
      <meta charset="UTF-8">
      <title>My Web App</title>
</head>
<body>
      <h1>Hello, World!</h1>
      <p>This is a placeholder project file.</p>
</body>
</html>` },
                            'style.css': {
                                type: 'text', content: `/* Main Styles */

:root {
      --primary: #58a6ff;
      --bg: #0d1117;
      --text: #e6edf3;
}

body {
      margin: 0;
      font-family: sans-serif;
      background: var(--bg);
      color: var(--text);
}

h1 {
      color: var(--primary);
}` },
                        }
                    },
                    'ideas.txt': {
                        type: 'text', content: `Project Ideas
=============

[x] Browser Desktop OS
[ ] Picture with steganography elements
[ ] Flappy Bird
[ ] Doom
[ ] C executable
[ ] Minesweeper` },
                }
            },
            'System': {
                type: 'folder', color: '#d2a8ff',
                children: {
                    'flappy.app': { type: 'flappy' }, //move to game folder 
                    'about.app': { type: 'about' },
                    'terminal.app': { type: 'terminal' },
                    'hello.exe': { type: 'native', src: 'assets/bin/hello.js', factory: 'createHello' }, //c exec file
                    'doom.exe': { type: 'native', gfx: true, src: 'assets/bin/doom.js', factory: 'createDoom', args: ['-iwad', 'doom1.wad'] }, //doom 
                    'syslog.txt': {
                        type: 'text', content: `[2026-04-25 08:00:01] BOOT: CloudOS kernel initializing... 
[2026-04-25 08:00:02] BOOT: Loading modules... OK
[2026-04-25 08:00:03] BOOT: Mounting filesystem... OK
[2026-04-25 08:00:04] BOOT: Starting window manager... OK
[2026-04-25 08:00:05] BOOT: Loading desktop environment... OK
[2026-04-25 08:00:06] INFO: User session started: guest
[2026-04-25 08:00:10] INFO: Desktop rendered in 342ms
[2026-04-25 08:01:15] INFO: Window opened: Documents
[2026-04-25 08:02:40] INFO: Window opened: Terminal
[2026-04-25 08:03:01] INFO: File accessed: config.json` },
                }
            },
            'Trash': {
                type: 'folder', color: '#f78166',
                children: {
                    'old_project.txt': {
                        type: 'text', content: `This file was deleted.
Content is no longer relevant.` },
                    'backup_2025.txt': {
                        type: 'text', content: `Old backup file.
No longer needed.` },
                }
            },
        }
    }
};

// Terminal
function openTerminal() {
    createWindow({
        title: '$ Terminal',
        width: 560, height: 360,
        iconColor: 'var(--accent2)',
        content(body) {
            body.style.padding = '0';
            const term = document.createElement('div');
            term.className = 'terminal-body';

            const history = [];
            let histIdx = -1;

            // Input line (created first so write() can use it)
            const inputLine = document.createElement('div');
            inputLine.className = 'terminal-input-line';
            inputLine.innerHTML = `<span class="prompt">guest@cloudos:~$ </span>`;
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('spellcheck', 'false');
            inputLine.appendChild(input);

            // Output helper (also used by C programs)
            const write = (text, err = false) => {
                text.split('\n').forEach(l => {
                    const o = document.createElement('div');
                    o.className = 'terminal-line' + (err ? ' error' : '');
                    o.innerHTML = '<span class="output"></span>';
                    o.firstChild.textContent = l;
                    term.insertBefore(o, inputLine);
                });
                term.scrollTop = term.scrollHeight;
            };

            const commands = {
                help: () => `Available commands:\n  help          Show this help\n  ls            List files\n  pwd           Print working directory\n  echo [msg]    Print message\n  date          Show current date\n  clear         Clear terminal\n  whoami        Show current user\n  uname         System info\n  uptime        System uptime\n  run [prog]    Run a program (e.g. run hello)`,
                ls: () => `Documents/\nProjects/\nSystem/\nTrash/`,
                pwd: () => `/home/guest/Desktop`,
                whoami: () => `guest`,
                date: () => new Date().toString(),
                uname: () => `CloudOS 1.0.0 Browser x86_64`,
                uptime: () => `up just now, 1 user, load average: 0.00, 0.00, 0.00`,
                clear: () => '__clear__',
                echo: (args) => args.join(' '),
                run: async (args) => {
                    const prog = findFile(args[0] || '');
                    if (!prog || prog.type !== 'native') return `run: ${args[0] || ''}: no such program`;
                    if (prog.gfx) { openNativeGfx(args[0], prog); return ''; }
                    await runNative(prog, write, args.slice(1));
                    return '';
                },
            };

            // Initial
            const welcome = document.createElement('div');
            welcome.innerHTML = `<span class="output" style="color:var(--accent2)">CloudOS Terminal - type 'help' for commands</span>`;
            welcome.className = 'terminal-line';
            term.appendChild(welcome);
            term.appendChild(inputLine);

            term.onclick = () => input.focus();

            input.addEventListener('keydown', async e => {
                if (e.key === 'Enter') {
                    const raw = input.value.trim();
                    const [cmd, ...args] = raw.split(' ');
                    input.value = '';

                    if (raw) history.unshift(raw);
                    histIdx = -1;

                    // Echo the typed line
                    const echoLine = document.createElement('div');
                    echoLine.className = 'terminal-line';
                    echoLine.innerHTML = `<span class="prompt">guest@cloudos:~$ </span><span class="cmd"></span>`;
                    echoLine.querySelector('.cmd').textContent = raw;
                    term.insertBefore(echoLine, inputLine);

                    if (!raw) { term.scrollTop = term.scrollHeight; return; }

                    if (commands[cmd]) {
                        const result = await commands[cmd](args);
                        if (result === '__clear__') {
                            while (term.firstChild !== inputLine) term.removeChild(term.firstChild);
                        } else if (result) {
                            write(result);
                        }
                    } else {
                        write(`bash: ${cmd}: command not found`, true);
                    }
                    term.scrollTop = term.scrollHeight;
                } else if (e.key === 'ArrowUp') {
                    if (histIdx < history.length - 1) histIdx++;
                    input.value = history[histIdx] || '';
                } else if (e.key === 'ArrowDown') {
                    if (histIdx > 0) histIdx--;
                    input.value = histIdx >= 0 ? history[histIdx] : '';
                }
            });

            body.appendChild(term);
            setTimeout(() => input.focus(), 100);
        }
    });
}