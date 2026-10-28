// Window manager
let windowCount = 0;
let highestZ = 200;
const openWindows = {};

function getNodeAtPath(pathArr) {
    let node = FS['Desktop'];
    for (const part of pathArr) {
        if (node.children && node.children[part]) node = node.children[part];
        else return null;
    }
    return node;
}

function createWindow({ title, width = 600, height = 420, content, id, iconColor }) {
    windowCount++;
    const wid = id || `win-${windowCount}`;

    // Center with slight offset
    const left = Math.max(40, Math.min(window.innerWidth - width - 40, 100 + (windowCount % 6) * 28));
    const top = Math.max(40, Math.min(window.innerHeight - height - 60, 60 + (windowCount % 5) * 22));

    const win = document.createElement('div');
    win.className = 'window focused';
    win.id = wid;
    win.style.cssText = `width:${width}px;height:${height}px;left:${left}px;top:${top}px;`;

    win.innerHTML = `
        <div class="window-header" data-wid="${wid}">
          <div class="win-controls">
            <button class="win-btn close" title="Close"></button>
            <button class="win-btn minimize" title="Minimize"></button>
            <button class="win-btn maximize" title="Maximize"></button>
          </div>
          <div class="win-title">${title}</div>
        </div>
        <div class="window-body" id="body-${wid}"></div>
      `;

    document.body.appendChild(win);

    // Controls
    win.querySelector('.close').onclick = () => closeWindow(wid);
    win.querySelector('.minimize').onclick = () => minimizeWindow(wid);
    win.querySelector('.maximize').onclick = () => maximizeWindow(wid);

    // Focus on click
    win.addEventListener('mousedown', () => focusWindow(wid), true);

    // Drag
    const header = win.querySelector('.window-header');
    makeDraggable(win, header);

    // Resize (simple corner)
    makeResizable(win);

    // Set content
    const body = document.getElementById(`body-${wid}`);
    if (typeof content === 'function') content(body);
    else if (content) body.innerHTML = content;

    // Taskbar
    addToTaskbar(wid, title, iconColor);

    openWindows[wid] = { title, minimized: false, maximized: false, prevState: null };
    focusWindow(wid);
    return wid;
}

function focusWindow(wid) {
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    const win = document.getElementById(wid);
    if (win) {
        highestZ++;
        win.style.zIndex = highestZ;
        win.classList.add('focused');
    }
    document.querySelectorAll('.taskbar-item').forEach(t => t.classList.remove('active'));
    const tb = document.getElementById(`tb-${wid}`);
    if (tb) tb.classList.add('active');
}

function closeWindow(wid) {
    const win = document.getElementById(wid);
    if (win) {
        win.style.animation = 'winOpen 0.15s cubic-bezier(0.34,1.56,0.64,1) reverse both';
        setTimeout(() => win.remove(), 150);
    }
    const tb = document.getElementById(`tb-${wid}`);
    if (tb) tb.remove();
    delete openWindows[wid];
}

function minimizeWindow(wid) {
    const win = document.getElementById(wid);
    if (!win) return;
    if (openWindows[wid].minimized) {
        win.classList.remove('minimized');
        openWindows[wid].minimized = false;
        focusWindow(wid);
    } else {
        win.classList.add('minimized');
        openWindows[wid].minimized = true;
        const tb = document.getElementById(`tb-${wid}`);
        if (tb) tb.classList.remove('active');
    }
}

function maximizeWindow(wid) {
    const win = document.getElementById(wid);
    if (!win) return;
    if (openWindows[wid].maximized) {
        const prev = openWindows[wid].prevState;
        if (prev) {
            win.style.left = prev.left; win.style.top = prev.top;
            win.style.width = prev.width; win.style.height = prev.height;
        }
        openWindows[wid].maximized = false;
    } else {
        openWindows[wid].prevState = {
            left: win.style.left, top: win.style.top,
            width: win.style.width, height: win.style.height
        };
        win.style.left = '0'; win.style.top = '0';
        win.style.width = '100vw';
        win.style.height = (window.innerHeight - 50) + 'px';
        openWindows[wid].maximized = true;
    }
}

function addToTaskbar(wid, title, color) {
    const bar = document.getElementById('taskbar-apps');
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.id = `tb-${wid}`;
    item.innerHTML = `<span class="tb-dot" style="background:${color || 'var(--accent)'}"></span>${title}`;
    item.onclick = () => {
        if (openWindows[wid]?.minimized) {
            minimizeWindow(wid);
        } else if (document.getElementById(wid)?.classList.contains('focused')) {
            minimizeWindow(wid);
        } else {
            focusWindow(wid);
        }
    };
    bar.appendChild(item);
}

// Drage and resize
function makeDraggable(win, handle) {
    let isDragging = false, startX, startY, startL, startT;
    handle.addEventListener('mousedown', e => {
        if (e.target.classList.contains('win-btn')) return;
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        startL = parseInt(win.style.left) || 0;
        startT = parseInt(win.style.top) || 0;
        document.body.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        win.style.left = Math.max(0, startL + dx) + 'px';
        win.style.top = Math.max(0, Math.min(window.innerHeight - 60, startT + dy)) + 'px';
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = '';
    });
}

function makeResizable(win) {
    const grip = document.createElement('div');
    grip.style.cssText = `
        position:absolute;right:0;bottom:0;width:16px;height:16px;
        cursor:se-resize;z-index:10;
      `;
    win.appendChild(grip);

    let isResizing = false, startX, startY, startW, startH;
    grip.addEventListener('mousedown', e => {
        isResizing = true;
        startX = e.clientX; startY = e.clientY;
        startW = win.offsetWidth; startH = win.offsetHeight;
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isResizing) return;
        const w = Math.max(340, startW + e.clientX - startX);
        const h = Math.max(200, startH + e.clientY - startY);
        win.style.width = w + 'px';
        win.style.height = h + 'px';
    });
    document.addEventListener('mouseup', () => { isResizing = false; });
}

// File Browser
function openFolder(pathArr) {
    const name = pathArr[pathArr.length - 1] || 'Desktop';
    const node = getNodeAtPath(pathArr);
    if (!node || !node.children) return;

    const wid = createWindow({
        title: ` ${name}`,
        width: 580, height: 400,
        iconColor: node.color || 'var(--folder-yellow)',
        content(body) {
            renderFileBrowser(body, pathArr);
        }
    });
}

function renderFileBrowser(body, pathArr) {
    const node = getNodeAtPath(pathArr);
    if (!node) return;
    const pathStr = '~/' + pathArr.join('/');

    body.innerHTML = '';
    const fb = document.createElement('div');
    fb.className = 'file-browser';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'browser-toolbar';
    const backBtn = document.createElement('button');
    backBtn.textContent = ' Back';
    const pathEl = document.createElement('div');
    pathEl.className = 'browser-path';
    pathEl.textContent = pathStr;
    toolbar.appendChild(backBtn);
    toolbar.appendChild(pathEl);
    fb.appendChild(toolbar);

    // Back button
    if (pathArr.length > 0) {
        backBtn.onclick = () => {
            const newPath = pathArr.slice(0, -1);
            renderFileBrowser(body, newPath);
        };
    } else {
        backBtn.disabled = true;
        backBtn.style.opacity = '0.4';
    }

    // Content
    const content = document.createElement('div');
    content.className = 'browser-content';

    if (node.children) {
        Object.entries(node.children).forEach(([name, child]) => {
            const icon = document.createElement('div');
            icon.className = 'browser-icon';

            if (child.type === 'folder') {
                icon.innerHTML = `${folderSVG(child.color || '#e3b341')}<span>${name}</span>`;
                icon.ondblclick = () => renderFileBrowser(body, [...pathArr, name]);
            } else if (child.type === 'text') {
                icon.innerHTML = `${fileSVG('#58a6ff')}<span>${name}</span>`;
                icon.ondblclick = () => openTextFile(name, child.content);
            } else if (child.type === 'about') {
                icon.innerHTML = `${appSVG('#d2a8ff')}<span>${name}</span>`;
                icon.ondblclick = () => openAbout();
            } else if (child.type === 'terminal') {
                icon.innerHTML = `${termSVG('#3fb950')}<span>${name}</span>`;
                icon.ondblclick = () => openTerminal();
            }

            content.appendChild(icon);
        });
    }

    fb.appendChild(content);
    body.appendChild(fb);
}

// Text Viewer
function openTextFile(name, text) {
    createWindow({
        title: ` ${name}`,
        width: 520, height: 380,
        iconColor: 'var(--accent)',
        content(body) {
            const viewer = document.createElement('div');
            viewer.className = 'text-viewer';
            viewer.textContent = text;
            body.appendChild(viewer);
        }
    });
}

// About
function openAbout() {
    createWindow({
        title: ' About CloudOS',
        width: 420, height: 380,
        iconColor: 'var(--accent4)',
        content(body) {
            body.innerHTML = `
            <div class="about-page">
              <h1>CloudOS</h1>
              <div class="version">v1.0.0 - Browser Desktop Environment</div>
              <p>A fully simulated desktop operating system running in your web browser. Built with vanilla HTML, CSS, and JavaScript - no frameworks.</p>
              <p>Open folders, read files, run commands in the terminal, and manage multiple windows just like a real OS.</p>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Windows Open</div>
                  <div class="stat-value" id="stat-wins">-</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Uptime</div>
                  <div class="stat-value" id="stat-uptime">-</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Platform</div>
                  <div class="stat-value" style="font-size:13px">Browser</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Build</div>
                  <div class="stat-value" style="font-size:13px">2026.04</div>
                </div>
              </div>
            </div>`;
            const startTime = Date.now();
            setInterval(() => {
                const el = document.getElementById('stat-wins');
                const up = document.getElementById('stat-uptime');
                if (el) el.textContent = Object.keys(openWindows).length;
                if (up) {
                    const s = Math.floor((Date.now() - startTime) / 1000);
                    up.textContent = `${Math.floor(s / 60)}m ${s % 60}s`;
                }
            }, 1000);
        }
    });
}



// SVG ICONS
function folderSVG(color = '#e3b341') {
    return `<svg viewBox="0 0 52 44" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="10" width="50" height="33" rx="4" fill="${color}" opacity="0.9"/>
        <rect x="1" y="8" width="22" height="8" rx="3" fill="${color}"/>
        <rect x="1" y="10" width="50" height="33" rx="4" fill="rgba(255,255,255,0.08)"/>
        <rect x="6" y="18" width="40" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>
        <rect x="6" y="24" width="30" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      </svg>`;
}

function fileSVG(color = '#58a6ff') {
    return `<svg viewBox="0 0 44 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2h22l10 10v36a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#1c2128" stroke="${color}" stroke-width="1.5"/>
        <path d="M28 2l10 10H30a2 2 0 01-2-2V2z" fill="${color}" opacity="0.5"/>
        <rect x="10" y="20" width="24" height="1.5" rx="0.75" fill="${color}" opacity="0.6"/>
        <rect x="10" y="26" width="20" height="1.5" rx="0.75" fill="${color}" opacity="0.4"/>
        <rect x="10" y="32" width="16" height="1.5" rx="0.75" fill="${color}" opacity="0.3"/>
      </svg>`;
}

function appSVG(color = '#d2a8ff') {
    return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="40" height="40" rx="10" fill="#1c2128" stroke="${color}" stroke-width="1.5"/>
        <circle cx="22" cy="19" r="7" fill="none" stroke="${color}" stroke-width="2"/>
        <text x="22" y="23" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" font-weight="bold">i</text>
        <rect x="18" y="32" width="8" height="2" rx="1" fill="${color}" opacity="0.5"/>
      </svg>`;
}

function termSVG(color = '#3fb950') {
    return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="40" height="40" rx="6" fill="#090d12" stroke="${color}" stroke-width="1.5"/>
        <rect x="2" y="2" width="40" height="10" rx="6" fill="${color}" opacity="0.2"/>
        <circle cx="9" cy="7" r="2" fill="#f78166"/>
        <circle cx="16" cy="7" r="2" fill="#e3b341"/>
        <circle cx="23" cy="7" r="2" fill="${color}"/>
        <text x="8" y="25" fill="${color}" font-size="8" font-family="monospace">$ _</text>
        <text x="8" y="34" fill="${color}" font-size="7" font-family="monospace" opacity="0.5">~</text>
      </svg>`;
}


// icons
const desktopItems = [
    { name: 'Documents', icon: folderSVG('#e3b341'), path: ['Documents'], type: 'folder' },
    { name: 'Projects', icon: folderSVG('#3fb950'), path: ['Projects'], type: 'folder' },
    { name: 'System', icon: folderSVG('#d2a8ff'), path: ['System'], type: 'folder' },
    { name: 'Trash', icon: folderSVG('#f78166'), path: ['Trash'], type: 'folder' },
    { name: 'Terminal', icon: termSVG('#3fb950'), path: null, type: 'terminal' },
    //{ name: 'photo.png', img: 'icon.png', path: null, type: 'image' },
    { name: 'photo.png', img: 'icon.png', src: 'photo.png', path: null, type: 'image' },
    { name: 'About', icon: appSVG('#d2a8ff'), path: null, type: 'about' },
];



function openImageFile(src, name) {
    createWindow({
        title: ` ${name}`,
        width: 600, height: 480,
        iconColor: 'var(--accent4)',
        content(body) {
            body.style.padding = '0';
            body.style.background = '#0a0e14';
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
            body.appendChild(img);
        }
    });
}

function buildDesktop() {
    const desktop = document.getElementById('desktop');
    desktopItems.forEach(item => {
        const el = document.createElement('div');
        el.className = 'desktop-icon';

        const iconHTML = item.img
            ? `<img src="${item.img}" style="width:48px;height:48px;object-fit:contain;">`
            : `<div class="folder-icon">${item.icon}</div>`;

        el.innerHTML = `${iconHTML}<div class="icon-label">${item.name}</div>`;
        el.ondblclick = () => {
            if (item.type === 'folder') openFolder(item.path);
            else if (item.type === 'terminal') openTerminal(); //add to here
            else if (item.type === 'about') openAbout();
            else if (item.type === 'image') openImageFile(item.src, item.name);
        };
        desktop.appendChild(el);
    });
}

// clock
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' });
    document.getElementById('clock').innerHTML = `${time}<br><span style="font-size:10px">${date}</span>`;
}

// context menu
const ctxMenu = document.getElementById('context-menu');

document.getElementById('desktop').addEventListener('contextmenu', e => {
    e.preventDefault();
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
    ctxMenu.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
    ctxMenu.innerHTML = `
        <div class="ctx-item" onclick="openFolder(['Documents'])"> Open Documents</div>
        <div class="ctx-item" onclick="openFolder(['Projects'])"> Open Projects</div>
        <div class="ctx-item" onclick="openTerminal()">$ Open Terminal</div>
        <div class="ctx-divider"></div>
        <div class="ctx-item" onclick="openAbout()"> About CloudOS</div>
      `;
});

document.addEventListener('click', () => { ctxMenu.style.display = 'none'; });
document.addEventListener('contextmenu', e => {
    if (!e.target.closest('#desktop')) ctxMenu.style.display = 'none';
});

// INIT
buildDesktop();
updateClock();
setInterval(updateClock, 1000);

// Auto-open welcome
setTimeout(() => {
    openAbout();
}, 300);