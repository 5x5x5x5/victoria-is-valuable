// ============================================================
// pony-ride.js — Side-Scrolling Runner through Server Caverns
// Ride your pony through the dark infrastructure of production
// ============================================================

const PonyRide = (() => {
    let canvas = null;
    let ctx = null;
    let running = false;
    let animFrame = null;
    let frame = 0;

    // Game state
    let ponyY = 0;
    let ponyVelY = 0;
    let ducking = false;
    let grounded = true;
    let distance = 0;
    let speed = 3;
    let collected = 0;
    let alive = true;
    let ended = false; // guards endRide against double-fire (ESC during death sequence)

    // World
    const GROUND_Y = 0.75; // fraction of canvas height
    let obstacles = [];
    let collectibles = [];
    let bgElements = []; // server racks, cables
    let particles = [];
    let boss = null;
    let bossActive = false;
    let bossHP = 0;
    let bossMaxHP = 0;
    let nextBossAt = 800;

    const OBSTACLE_TYPES = ['ClassNotFoundException', 'OutOfMemoryError', 'StackOverflow', 'ConcurrentModification'];
    const COLLECTIBLE_TYPES = ['jar', 'bean', 'gradle', 'semicolon'];
    const ZONE_NAMES = ['The Tomcat Tunnels', 'WebSphere Wastes', 'JBoss Jungle', 'The Docker Depths'];

    let currentZone = 0;
    let clopTimer = 0;

    function start() {
        canvas = document.getElementById('ride-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resizeCanvas();

        // Reset state
        frame = 0;
        ponyY = 0;
        ponyVelY = 0;
        ducking = false;
        grounded = true;
        distance = 0;
        speed = 3;
        collected = 0;
        alive = true;
        ended = false;
        obstacles = [];
        collectibles = [];
        bgElements = [];
        particles = [];
        boss = null;
        bossActive = false;
        nextBossAt = 800;
        currentZone = 0;
        clopTimer = 0;

        // Pre-populate background
        for (let i = 0; i < 15; i++) {
            bgElements.push({
                x: Math.random() * canvas.width * 2,
                layer: Math.floor(Math.random() * 3), // 0=far, 1=mid, 2=near
                type: 'rack',
                height: 60 + Math.random() * 80,
            });
        }

        setupInput();
        running = true;
        updateZoneDisplay();
        gameLoop();
    }

    function stop() {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        removeInput();
    }

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 400;
    }

    // ---- INPUT ----
    let keyHandler = null;
    let touchHandler = null;
    let resizeHandler = null;

    function setupInput() {
        keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                ducking = true;
            }
            if (e.code === 'Escape' && alive) {
                endRide(false);
            }
            // Attack boss with X or Z
            if ((e.code === 'KeyX' || e.code === 'KeyZ') && bossActive && boss) {
                attackBoss();
            }
        };
        const keyUpHandler = (e) => {
            if (e.code === 'ArrowDown') ducking = false;
        };
        window.addEventListener('keydown', keyHandler);
        window.addEventListener('keyup', keyUpHandler);
        window._rideKeyUp = keyUpHandler;

        touchHandler = (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            if (touchY < canvas.height * 0.5) {
                jump();
            } else if (bossActive) {
                attackBoss();
            } else {
                ducking = true;
                setTimeout(() => { ducking = false; }, 500);
            }
        };
        canvas.addEventListener('touchstart', touchHandler);

        resizeHandler = () => {
            if (running) resizeCanvas();
        };
        window.addEventListener('resize', resizeHandler);
    }

    function removeInput() {
        if (keyHandler) window.removeEventListener('keydown', keyHandler);
        if (window._rideKeyUp) window.removeEventListener('keyup', window._rideKeyUp);
        if (touchHandler && canvas) canvas.removeEventListener('touchstart', touchHandler);
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    }

    function jump() {
        if (!grounded || !alive) return;
        ponyVelY = -12;
        grounded = false;
        Audio.jump();
    }

    function attackBoss() {
        if (!bossActive || !boss) return;
        bossHP -= 10;
        Audio.click();
        // Knockback particles
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: boss.x - 30,
                y: boss.y + Math.random() * 40 - 20,
                vx: -2 - Math.random() * 3,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                text: '💥',
            });
        }
        if (bossHP <= 0) {
            defeatBoss();
        }
    }

    function defeatBoss() {
        bossActive = false;
        Audio.deploySuccess();
        Game.addScore(500);
        Game.addXP(50);
        collected += 10;

        // Victory particles
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 60,
                text: ['🎉', '✨', '🚀', ';'][Math.floor(Math.random() * 4)],
            });
        }

        boss = null;
        nextBossAt = distance + 800 + Math.random() * 400;
        speed += 0.5;
    }

    // ---- GAME LOOP ----
    function gameLoop() {
        if (!running) return;
        frame++;
        update();
        render();
        animFrame = requestAnimationFrame(gameLoop);
    }

    function update() {
        if (!alive) return;

        const groundY = canvas.height * GROUND_Y;
        distance += speed;

        // Clop sounds
        clopTimer++;
        if (clopTimer > 15 && grounded) {
            Audio.clipClop();
            clopTimer = 0;
        }

        // Physics
        if (!grounded) {
            ponyVelY += 0.6; // gravity
            ponyY += ponyVelY;
            if (ponyY >= 0) {
                ponyY = 0;
                ponyVelY = 0;
                grounded = true;
            }
        }

        // Speed increases over time
        speed = 3 + distance * 0.001;
        if (bossActive) speed = 1; // Slow down for boss

        // Zone progression
        const newZone = Math.min(3, Math.floor(distance / 2000));
        if (newZone !== currentZone) {
            currentZone = newZone;
            updateZoneDisplay();
        }

        // Spawn obstacles
        if (!bossActive && Math.random() < 0.02 + distance * 0.00001) {
            const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
            obstacles.push({
                x: canvas.width + 50,
                y: type === 'OutOfMemoryError' ? groundY - 55 - Math.random() * 8 : groundY,
                type,
                width: 40,
                height: type === 'OutOfMemoryError' ? 36 : 30,
            });
        }

        // Spawn collectibles
        if (!bossActive && Math.random() < 0.03) {
            const type = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
            collectibles.push({
                x: canvas.width + 50,
                y: groundY - 30 - Math.random() * 80,
                type,
            });
        }

        // Spawn boss
        if (!bossActive && distance >= nextBossAt) {
            bossActive = true;
            bossMaxHP = 50 + currentZone * 30;
            bossHP = bossMaxHP;
            const bossNames = ['OutOfMemory', 'NullPointer', 'StackOverflow', 'ClassNotFound'];
            boss = {
                x: canvas.width - 80,
                y: groundY - 60,
                name: bossNames[currentZone % bossNames.length],
            };
            Audio.bossWarning();
        }

        // Move background elements
        bgElements.forEach(bg => {
            const parallaxSpeed = [0.3, 0.6, 1.0][bg.layer];
            bg.x -= speed * parallaxSpeed;
            if (bg.x < -50) {
                bg.x = canvas.width + 50 + Math.random() * 200;
            }
        });

        // Move obstacles
        obstacles.forEach(o => { o.x -= speed; });
        obstacles = obstacles.filter(o => o.x > -60);

        // Move collectibles
        collectibles.forEach(c => { c.x -= speed; });
        collectibles = collectibles.filter(c => c.x > -30);

        // Collision detection
        const ponyX = 80;
        const ponyActualY = groundY - 30 + ponyY;
        const ponyW = ducking ? 35 : 30;
        const ponyTop = ducking ? ponyActualY + 15 : ponyActualY;
        const ponyH = ducking ? 25 : 40;

        // Obstacle collisions
        for (const o of obstacles) {
            if (ponyX + ponyW > o.x && ponyX < o.x + o.width &&
                ponyTop + ponyH > o.y && ponyTop < o.y + o.height) {
                die(o.type);
                return;
            }
        }

        // Collectible collisions
        collectibles = collectibles.filter(c => {
            if (Math.abs(ponyX - c.x) < 25 && Math.abs(ponyActualY - c.y) < 25) {
                Audio.collect();
                collected++;
                Game.addScore(25);
                // Spawn sparkle particles
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        x: c.x, y: c.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: -2 - Math.random() * 3,
                        life: 20,
                        text: '✦',
                    });
                }
                return false;
            }
            return true;
        });

        // Update particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        particles = particles.filter(p => p.life > 0);

        // Spawn floating code particles
        if (Math.random() < 0.05) {
            particles.push({
                x: canvas.width + 20,
                y: Math.random() * canvas.height * 0.6,
                vx: -1 - Math.random(),
                vy: (Math.random() - 0.5) * 0.5,
                life: 200,
                text: Art.createFloatingCode(),
                isCode: true,
            });
        }
    }

    function die(cause) {
        alive = false;
        Audio.errorBuzz();
        Game.addException(cause);
        Game.modifyStat('energy', -15);

        // Show death overlay
        setTimeout(() => {
            endRide(true);
        }, 1500);
    }

    function endRide(died) {
        if (ended) return;
        ended = true;
        stop();

        // Apply rewards
        const linesDeployed = Math.floor(distance);
        Game.addXP(Math.floor(distance / 50));
        if (collected > 0) {
            Game.modifyStat('hunger', Math.min(collected * 3, 30));
        }
        Game.modifyStat('energy', -20);

        if (!died) {
            Game.addScore(linesDeployed);
            Game.modifyStat('happiness', 10);
        }

        Game.incrementDeploys();
        if (died) Game.incrementFailedDeploys();

        // If the pony didn't survive these penalties, Game already switched
        // to GAME_OVER — don't drag the player back to a dead-pony care screen.
        const pony = Game.getPony();
        if (!pony || !pony.alive) {
            return;
        }

        // Return to care mode
        Game.setState(Game.STATES.CARE);
        PonyCare.logEvent(
            died
                ? `Ride crashed after ${linesDeployed} LOC. Collected ${collected} dependencies.`
                : `Ride complete! ${linesDeployed} LOC deployed. Collected ${collected} dependencies.`,
            died ? 'error' : 'success'
        );
        PonyCare.updateStats();
    }

    // ---- RENDERING ----
    function render() {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        const groundY = h * GROUND_Y;

        // Clear with dark background
        ctx.fillStyle = Art.PALETTE.void;
        ctx.fillRect(0, 0, w, h);

        // Background gradient (dark atmospheric)
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.4, '#0f0f2a');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Background server racks (parallax)
        bgElements.forEach(bg => {
            const alpha = [0.15, 0.3, 0.5][bg.layer];
            ctx.globalAlpha = alpha;
            Art.drawServerRack(ctx, bg.x, groundY - bg.height, bg.height);
            ctx.globalAlpha = 1;
        });

        // Cables across the ceiling
        ctx.strokeStyle = Art.PALETTE.grey;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            const offset = (frame * 0.5 + i * 200) % (w + 400) - 200;
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.quadraticCurveTo(offset + 50, 30 + Math.sin(frame * 0.02 + i) * 10, offset + 100, 0);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Ground
        ctx.fillStyle = Art.PALETTE.darkGrey;
        ctx.fillRect(0, groundY + 10, w, h - groundY);
        ctx.strokeStyle = Art.PALETTE.purple;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY + 10);
        ctx.lineTo(w, groundY + 10);
        ctx.stroke();

        // Ground pattern (circuit-like)
        ctx.strokeStyle = Art.PALETTE.grey;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        for (let x = -(frame * speed) % 40; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, groundY + 10);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Code particles (background)
        particles.filter(p => p.isCode).forEach(p => {
            ctx.fillStyle = Art.PALETTE.grey;
            ctx.globalAlpha = Math.min(1, p.life / 50) * 0.3;
            ctx.font = '10px monospace';
            ctx.fillText(p.text, p.x, p.y);
        });
        ctx.globalAlpha = 1;

        // Obstacles
        obstacles.forEach(o => {
            Art.drawObstacle(ctx, o.type, o.x + o.width / 2, o.y, frame);
        });

        // Collectibles
        collectibles.forEach(c => {
            Art.drawCollectible(ctx, c.type, c.x, c.y, frame);
        });

        // Boss
        if (bossActive && boss) {
            Art.drawBoss(ctx, boss.name, boss.x, boss.y, frame, bossHP, bossMaxHP);

            // Boss attack text
            ctx.fillStyle = Art.PALETTE.white;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Press X/Z to attack!', w / 2, 30);
            ctx.textAlign = 'left';
        }

        // Pony
        const ponyX = 80;
        const ponyActualY = groundY - 30 + ponyY;
        if (ducking) {
            ctx.save();
            ctx.translate(ponyX, ponyActualY + 10);
            ctx.scale(1, 0.6);
            ctx.translate(-ponyX, -(ponyActualY + 10));
        }
        Art.drawPonyOnCanvas(ctx, ponyX, ponyActualY, frame, ducking ? 0.8 : 1);
        if (ducking) ctx.restore();

        // Non-code particles (sparkles, effects)
        particles.filter(p => !p.isCode).forEach(p => {
            ctx.globalAlpha = Math.min(1, p.life / 20);
            ctx.font = '14px monospace';
            ctx.fillStyle = Art.PALETTE.cyan;
            ctx.fillText(p.text, p.x, p.y);
        });
        ctx.globalAlpha = 1;

        // HUD
        ctx.fillStyle = Art.PALETTE.void;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(10, 10, 250, 50);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = Art.PALETTE.purple;
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 250, 50);

        ctx.fillStyle = Art.PALETTE.cyan;
        ctx.font = '12px monospace';
        ctx.fillText(`LOC Deployed: ${Math.floor(distance)}`, 20, 28);
        ctx.fillText(`Dependencies: ${collected}`, 20, 44);

        ctx.fillStyle = Art.PALETTE.white;
        ctx.font = '10px monospace';
        ctx.fillText(`Zone: ${ZONE_NAMES[currentZone]}`, 20, 56);

        // Vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        // Death overlay
        if (!alive) {
            ctx.fillStyle = 'rgba(10,0,0,0.7)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = Art.PALETTE.red;
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('APPLICATION CRASHED', w / 2, h / 2 - 20);
            ctx.font = '14px monospace';
            ctx.fillStyle = Art.PALETTE.orange;
            ctx.fillText('Redeploying...', w / 2, h / 2 + 10);
            ctx.textAlign = 'left';
        }

        // Controls hint
        if (distance < 200 && alive) {
            ctx.fillStyle = Art.PALETTE.grey;
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.max(0, 1 - distance / 200);
            ctx.fillText('SPACE/UP: Jump | DOWN: Duck | ESC: Exit', w / 2, h - 20);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }
    }

    function updateZoneDisplay() {
        const zoneEl = document.getElementById('ride-zone');
        if (zoneEl) {
            zoneEl.textContent = ZONE_NAMES[currentZone];
            zoneEl.classList.add('zone-flash');
            setTimeout(() => zoneEl.classList.remove('zone-flash'), 2000);
        }
    }

    return {
        start,
        stop,
    };
})();
