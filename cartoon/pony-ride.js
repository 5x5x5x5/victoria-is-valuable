// ============================================================
// pony-ride.js — Side-Scrolling Runner through Server Meadows
// CARTOON EDITION — Bright skies, green hills, bouncy physics!
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
    let squashTimer = 0; // for squash-and-stretch on landing

    // World
    const GROUND_Y = 0.75;
    let obstacles = [];
    let collectibles = [];
    let bgElements = [];
    let particles = [];
    let boss = null;
    let bossActive = false;
    let bossHP = 0;
    let bossMaxHP = 0;
    let nextBossAt = 800;

    // Background hills (pre-generated)
    let hills = [];

    const OBSTACLE_TYPES = ['ClassNotFoundException', 'OutOfMemoryError', 'StackOverflow', 'ConcurrentModification'];
    const COLLECTIBLE_TYPES = ['jar', 'bean', 'gradle', 'semicolon'];
    const ZONE_NAMES = ['The Tomcat Meadows', 'WebSphere Wonderland', 'JBoss Jungle Gym', 'The Docker Playground'];

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
        squashTimer = 0;
        obstacles = [];
        collectibles = [];
        bgElements = [];
        particles = [];
        boss = null;
        bossActive = false;
        nextBossAt = 800;
        currentZone = 0;
        clopTimer = 0;

        // Pre-populate background clouds
        for (let i = 0; i < 12; i++) {
            bgElements.push({
                x: Math.random() * canvas.width * 2,
                layer: Math.floor(Math.random() * 3),
                type: 'cloud',
                height: 40 + Math.random() * 50,
            });
        }

        // Pre-generate rolling hills
        hills = [];
        for (let i = 0; i < 3; i++) {
            const hillLayer = [];
            for (let j = 0; j < 8; j++) {
                hillLayer.push({
                    x: j * 200 + Math.random() * 100,
                    width: 120 + Math.random() * 100,
                    height: 30 + Math.random() * 40 + i * 15,
                });
            }
            hills.push(hillLayer);
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
            if (e.code === 'Escape') {
                endRide(false);
            }
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
    }

    function removeInput() {
        if (keyHandler) window.removeEventListener('keydown', keyHandler);
        if (window._rideKeyUp) window.removeEventListener('keyup', window._rideKeyUp);
        if (touchHandler && canvas) canvas.removeEventListener('touchstart', touchHandler);
    }

    function jump() {
        if (!grounded || !alive) return;
        ponyVelY = -13; // slightly higher jump for cartoon feel
        grounded = false;
        Audio.jump();
    }

    function attackBoss() {
        if (!bossActive || !boss) return;
        bossHP -= 10;
        Audio.click();
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: boss.x - 30,
                y: boss.y + Math.random() * 40 - 20,
                vx: -2 - Math.random() * 3,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                text: ['💥', '⭐', '💫', '✨', '🌟'][Math.floor(Math.random() * 5)],
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

        for (let i = 0; i < 25; i++) {
            particles.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 60,
                text: ['🎉', '✨', '🚀', '🌈', '⭐', '💖'][Math.floor(Math.random() * 6)],
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

        clopTimer++;
        if (clopTimer > 15 && grounded) {
            Audio.clipClop();
            clopTimer = 0;
        }

        // Physics (slightly floatier for cartoon)
        if (!grounded) {
            ponyVelY += 0.5; // slightly less gravity
            ponyY += ponyVelY;
            if (ponyY >= 0) {
                ponyY = 0;
                ponyVelY = 0;
                grounded = true;
                squashTimer = 8; // trigger squash on landing
            }
        }

        if (squashTimer > 0) squashTimer--;

        speed = 3 + distance * 0.001;
        if (bossActive) speed = 1;

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
                y: type === 'OutOfMemoryError' ? groundY - 80 - Math.random() * 60 : groundY,
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

        // Move background
        bgElements.forEach(bg => {
            const parallaxSpeed = [0.2, 0.4, 0.7][bg.layer];
            bg.x -= speed * parallaxSpeed;
            if (bg.x < -80) {
                bg.x = canvas.width + 50 + Math.random() * 200;
            }
        });

        // Move hills
        hills.forEach((layer, i) => {
            const hillSpeed = [0.15, 0.3, 0.6][i];
            layer.forEach(hill => {
                hill.x -= speed * hillSpeed;
                if (hill.x + hill.width < -50) {
                    hill.x += layer.length * 200 + Math.random() * 100;
                }
            });
        });

        obstacles.forEach(o => { o.x -= speed; });
        obstacles = obstacles.filter(o => o.x > -60);

        collectibles.forEach(c => { c.x -= speed; });
        collectibles = collectibles.filter(c => c.x > -30);

        // Collision detection
        const ponyX = 80;
        const ponyActualY = groundY - 30 + ponyY;
        const ponyW = ducking ? 35 : 30;
        const ponyH = ducking ? 20 : 40;

        for (const o of obstacles) {
            if (ponyX + ponyW > o.x && ponyX < o.x + o.width &&
                ponyActualY + ponyH > o.y && ponyActualY < o.y + o.height) {
                die(o.type);
                return;
            }
        }

        collectibles = collectibles.filter(c => {
            if (Math.abs(ponyX - c.x) < 25 && Math.abs(ponyActualY - c.y) < 25) {
                Audio.collect();
                collected++;
                Game.addScore(25);
                for (let i = 0; i < 5; i++) {
                    particles.push({
                        x: c.x, y: c.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: -2 - Math.random() * 4,
                        life: 25,
                        text: ['⭐', '✨', '💫'][Math.floor(Math.random() * 3)],
                    });
                }
                return false;
            }
            return true;
        });

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        particles = particles.filter(p => p.life > 0);

        // Spawn floating confetti
        if (Math.random() < 0.06) {
            particles.push({
                x: canvas.width + 20,
                y: Math.random() * canvas.height * 0.5,
                vx: -0.8 - Math.random() * 0.5,
                vy: 0.5 + Math.random() * 0.5,
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

        // Cartoon crash particles
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: 80, y: canvas.height * GROUND_Y - 30,
                vx: (Math.random() - 0.5) * 8,
                vy: -3 - Math.random() * 5,
                life: 40,
                text: ['💫', '⭐', '😵', '💥', '🌀'][Math.floor(Math.random() * 5)],
            });
        }

        setTimeout(() => {
            endRide(true);
        }, 1500);
    }

    function endRide(died) {
        stop();

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

        Game.setState(Game.STATES.CARE);
        PonyCare.logEvent(
            died
                ? `Oopsie! Ride crashed after ${linesDeployed} LOC. Collected ${collected} goodies!`
                : `Yay! Ride complete! ${linesDeployed} LOC deployed. Collected ${collected} goodies!`,
            died ? 'error' : 'success'
        );
        PonyCare.updateStats();
    }

    // ---- RENDERING (CARTOON!) ----
    function render() {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        const groundY = h * GROUND_Y;

        // Bright sky gradient!
        const grad = ctx.createLinearGradient(0, 0, 0, groundY);
        grad.addColorStop(0, '#87CEEB'); // sky blue
        grad.addColorStop(0.5, '#B0E0FF');
        grad.addColorStop(1, '#FFF8DC'); // cornsilk near horizon
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Sun (cheerful!)
        ctx.fillStyle = '#FFE44D';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(w - 80, 60, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sun rays
        ctx.strokeStyle = 'rgba(255, 228, 77, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + frame * 0.005;
            ctx.beginPath();
            ctx.moveTo(w - 80 + Math.cos(angle) * 35, 60 + Math.sin(angle) * 35);
            ctx.lineTo(w - 80 + Math.cos(angle) * 50, 60 + Math.sin(angle) * 50);
            ctx.stroke();
        }

        // Background clouds (parallax)
        bgElements.forEach(bg => {
            const alpha = [0.4, 0.6, 0.85][bg.layer];
            const cloudY = 30 + bg.layer * 40 + Math.sin(frame * 0.01 + bg.x) * 5;
            ctx.globalAlpha = alpha;
            Art.drawServerRack(ctx, bg.x, cloudY, bg.height); // draws clouds now
            ctx.globalAlpha = 1;
        });

        // Rolling hills (3 layers, parallax)
        const hillColors = [
            ['#8FD08F', '#7BC07B'], // far - light green
            ['#6BB86B', '#5CA85C'], // mid - medium green
            ['#5CBF3A', '#4AAF2A'], // near - bright green
        ];
        hills.forEach((layer, i) => {
            layer.forEach(hill => {
                Art.drawHill(ctx, hill.x, groundY + 8, hill.width, hill.height, hillColors[i][0]);
                // Highlight
                Art.drawHill(ctx, hill.x - 5, groundY + 8, hill.width * 0.7, hill.height * 0.6, hillColors[i][1]);
            });
        });

        // Bunting/garlands across the top
        for (let i = 0; i < 4; i++) {
            const offset = (frame * 0.3 + i * 250) % (w + 400) - 200;
            Art.drawCable(ctx, offset, 15, offset + 120, 15);
        }

        // Ground (bright green with grass!)
        ctx.fillStyle = '#5CBF3A';
        ctx.fillRect(0, groundY + 8, w, h - groundY);

        // Grass top edge (wavy)
        ctx.fillStyle = '#6DD04A';
        ctx.beginPath();
        ctx.moveTo(0, groundY + 8);
        for (let x = 0; x < w; x += 20) {
            const grassY = groundY + 5 + Math.sin((x + frame * speed * 0.5) * 0.05) * 3;
            ctx.lineTo(x, grassY);
        }
        ctx.lineTo(w, groundY + 15);
        ctx.lineTo(0, groundY + 15);
        ctx.closePath();
        ctx.fill();

        // Grass tufts
        ctx.strokeStyle = '#4AAF2A';
        ctx.lineWidth = 1.5;
        for (let x = -(frame * speed * 0.8) % 30; x < w; x += 30) {
            const baseY = groundY + 10;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x - 3, baseY - 8);
            ctx.moveTo(x, baseY);
            ctx.lineTo(x + 2, baseY - 6);
            ctx.moveTo(x, baseY);
            ctx.lineTo(x + 5, baseY - 7);
            ctx.stroke();
        }

        // Flowers in the ground
        const flowerColors = ['#FF69B4', '#FFD700', '#FF6B6B', '#FF9FF3', '#48DBFB'];
        for (let x = -(frame * speed * 0.6) % 80; x < w; x += 80) {
            const flowerY = groundY + 18 + Math.sin(x * 0.1) * 3;
            ctx.fillStyle = flowerColors[Math.floor(Math.abs(x) / 80) % flowerColors.length];
            ctx.beginPath();
            ctx.arc(x, flowerY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, flowerY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Floating confetti particles (background)
        particles.filter(p => p.isCode).forEach(p => {
            ctx.globalAlpha = Math.min(1, p.life / 50) * 0.6;
            ctx.font = '14px monospace';
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

            // Boss attack text (bouncy!)
            ctx.fillStyle = '#E74C9C';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            const attackY = 30 + Math.sin(frame * 0.1) * 3;
            ctx.strokeText('Press X/Z to bonk!', w / 2, attackY);
            ctx.fillText('Press X/Z to bonk!', w / 2, attackY);
            ctx.textAlign = 'left';
        }

        // Pony (with squash-and-stretch!)
        const ponyX = 80;
        const ponyActualY = groundY - 30 + ponyY;
        ctx.save();
        if (ducking) {
            ctx.translate(ponyX, ponyActualY + 10);
            ctx.scale(1.2, 0.6);
            ctx.translate(-ponyX, -(ponyActualY + 10));
        } else if (squashTimer > 0) {
            // Landing squash
            const squashAmount = squashTimer / 8;
            ctx.translate(ponyX, ponyActualY + 5);
            ctx.scale(1 + squashAmount * 0.15, 1 - squashAmount * 0.15);
            ctx.translate(-ponyX, -(ponyActualY + 5));
        } else if (!grounded) {
            // Stretch while in air
            ctx.translate(ponyX, ponyActualY);
            ctx.scale(0.9, 1.1);
            ctx.translate(-ponyX, -ponyActualY);
        }
        Art.drawPonyOnCanvas(ctx, ponyX, ponyActualY, frame, ducking ? 0.8 : 1);
        ctx.restore();

        // Non-code particles (sparkles, effects)
        particles.filter(p => !p.isCode).forEach(p => {
            ctx.globalAlpha = Math.min(1, p.life / 20);
            ctx.font = '16px monospace';
            ctx.fillText(p.text, p.x, p.y);
        });
        ctx.globalAlpha = 1;

        // HUD (bright, rounded feel)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        const hudR = 10;
        ctx.moveTo(10 + hudR, 10);
        ctx.lineTo(260 - hudR, 10);
        ctx.arcTo(260, 10, 260, 10 + hudR, hudR);
        ctx.lineTo(260, 60 - hudR);
        ctx.arcTo(260, 60, 260 - hudR, 60, hudR);
        ctx.lineTo(10 + hudR, 60);
        ctx.arcTo(10, 60, 10, 60 - hudR, hudR);
        ctx.lineTo(10, 10 + hudR);
        ctx.arcTo(10, 10, 10 + hudR, 10, hudR);
        ctx.fill();
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#E74C9C';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`LOC Deployed: ${Math.floor(distance)}`, 20, 28);
        ctx.fillStyle = '#9B59B6';
        ctx.fillText(`Dependencies: ${collected}`, 20, 44);

        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText(`Zone: ${ZONE_NAMES[currentZone]}`, 20, 56);

        // NO vignette in cartoon mode! Bright and open!

        // Death overlay (cartoon bonk!)
        if (!alive) {
            ctx.fillStyle = 'rgba(255, 240, 245, 0.8)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#E74C9C';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.strokeText('BONK! PONY DOWN!', w / 2, h / 2 - 20);
            ctx.fillText('BONK! PONY DOWN!', w / 2, h / 2 - 20);

            ctx.font = '16px monospace';
            ctx.fillStyle = '#9B59B6';
            ctx.fillText('Oopsie! Redeploying... 🐴💫', w / 2, h / 2 + 15);
            ctx.textAlign = 'left';
        }

        // Controls hint
        if (distance < 200 && alive) {
            ctx.fillStyle = '#9B59B6';
            ctx.font = '12px monospace';
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
