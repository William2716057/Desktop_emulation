function openFlappyBird() {
    const W = 400, H = 560, GROUND = 60;
    const GRAVITY = 0.5, FLAP = -7.6, SPEED = 3;
    const GAP = 150, PIPE_W = 56, PIPE_SPACING = 220;

    let rafId = null, keyHandler = null;

    createWindow({
        title: ' Flappy Bird',
        width: 420, height: 640,
        iconColor: 'var(--folder-yellow)',
        onClose() {
            cancelAnimationFrame(rafId);
            document.removeEventListener('keydown', keyHandler);
        },
        content(body) {
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
            body.style.background = '#0a0e14';
            body.style.overflow = 'hidden';

            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            canvas.style.cursor = 'pointer';
            body.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            // Scale canvas to fit  window
            const fit = () => {
                const s = Math.min(body.clientWidth / W, body.clientHeight / H);
                canvas.style.width = W * s + 'px';
                canvas.style.height = H * s + 'px';
            };
            new ResizeObserver(fit).observe(body);
            fit();

            // Game states
            let state = 'start'; 
            let bird, pipes, score, best = 0, t0 = 0;

            function reset() {
                bird = { x: 100, y: H / 2 - 30, vy: 0, r: 14 };
                pipes = [];
                score = 0;
            }
            reset();

            function flap() {
                if (state === 'start' || state === 'over') {
                    reset();
                    state = 'play';
                }
                bird.vy = FLAP;
            }

            function gameOver() {
                state = 'over';
                best = Math.max(best, score);
            }

            function update(dt) {
                bird.vy += GRAVITY * dt;
                bird.y += bird.vy * dt;

                //Pipes
                const last = pipes[pipes.length - 1];
                if (!last || last.x < W - PIPE_SPACING) {
                    const top = 50 + Math.random() * (H - GROUND - GAP - 100);
                    pipes.push({ x: W, top, scored: false });
                }

                for (const p of pipes) {
                    p.x -= SPEED * dt;

                    // Collision
                    const bx = bird.x - bird.r, by = bird.y - bird.r, bs = bird.r * 2;
                    const hitX = bx + bs > p.x && bx < p.x + PIPE_W;
                    if (hitX && (by < p.top || by + bs > p.top + GAP)) gameOver();

                    // Score
                    if (!p.scored && p.x + PIPE_W < bird.x) { p.scored = true; score++; }
                }
                pipes = pipes.filter(p => p.x + PIPE_W > 0);

                // Floor / ceiling
                if (bird.y - bird.r < 0 || bird.y + bird.r > H - GROUND) gameOver();
            }

            function text(str, x, y, size, color) {
                ctx.font = `bold ${size}px 'IBM Plex Mono', monospace`;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000'; ctx.fillText(str, x + 2, y + 2);
                ctx.fillStyle = color; ctx.fillText(str, x, y);
            }

            function draw(now) {
                // background
                ctx.fillStyle = '#70c5ce';
                ctx.fillRect(0, 0, W, H);

                // Pipes
                ctx.fillStyle = '#3fb950';
                for (const p of pipes) {
                    ctx.fillRect(p.x, 0, PIPE_W, p.top);
                    ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - GROUND - p.top - GAP);
                }

                // Ground
                ctx.fillStyle = '#c9a227';
                ctx.fillRect(0, H - GROUND, W, GROUND);

                // Bird 
                const by = state === 'start' ? bird.y + Math.sin(now / 200) * 6 : bird.y;
                ctx.fillStyle = '#ffd33d';
                ctx.beginPath(); ctx.arc(bird.x, by, bird.r, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(bird.x + 5, by - 4, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(bird.x + 6, by - 4, 2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f78166';
                ctx.fillRect(bird.x + 8, by + 1, 10, 5);

                // HUD
                text(String(score), W / 2, 60, 44, '#ffd33d');
                if (state === 'start') {
                    text('Flappy Bird', W / 2, 180, 32, '#fff');
                    text('Space / click to flap', W / 2, 215, 16, '#fff');
                } else if (state === 'over') {
                    text('Game Over', W / 2, 200, 36, '#fff');
                    text(`Best: ${best}`, W / 2, 235, 18, '#ffd33d');
                    text('Space / click to restart', W / 2, 265, 16, '#fff');
                }
            }

            // Main loop 
            const win = body.closest('.window');
            function loop(now) {
                const dt = Math.min(2, (now - t0) / 16.667 || 1);
                t0 = now;
                if (!win.classList.contains('minimized')) {
                    if (state === 'play') update(dt);
                    draw(now);
                }
                rafId = requestAnimationFrame(loop);
            }
            rafId = requestAnimationFrame(loop);

            // Input
            keyHandler = e => {
                if (!win.classList.contains('focused') || win.classList.contains('minimized')) return;
                if (e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!e.repeat) flap();
                }
            };
            document.addEventListener('keydown', keyHandler);
            canvas.addEventListener('mousedown', flap);
        }
    });
}