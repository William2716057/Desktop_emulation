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

KEYBOARD SHORTCUTS:
      (none yet - coming soon)

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
[ ] Minesweeper` },
                }
            },
            'System': {
                type: 'folder', color: '#d2a8ff',
                children: {
                    'about.app': { type: 'about' },
                    'terminal.app': { type: 'terminal' },
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