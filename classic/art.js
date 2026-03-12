// ============================================================
// art.js — SVG Art Generation for Deploy Pony: Enterprise Nightmares
// Hollow Knight-inspired dark atmospheric hand-drawn aesthetic
// ============================================================

const Art = (() => {
    const PALETTE = {
        void: '#0a0a0f',
        deepBlue: '#1a1a2e',
        purple: '#4a3f6b',
        midPurple: '#6b5b95',
        cyan: '#00fff5',
        orange: '#ff6b35',
        red: '#ff3366',
        green: '#39ff14',
        white: '#e8e8f0',
        grey: '#3a3a5c',
        darkGrey: '#1e1e32',
    };

    // Add slight randomness to SVG path points for hand-drawn feel
    function wobble(val, amount = 2) {
        return val + (Math.random() - 0.5) * amount;
    }

    function wobblePath(points, closed = true) {
        if (points.length === 0) return '';
        let d = `M ${wobble(points[0][0])} ${wobble(points[0][1])}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = wobble((points[i - 1][0] + points[i][0]) / 2, 4);
            const cp1y = wobble((points[i - 1][1] + points[i][1]) / 2, 4);
            d += ` Q ${cp1x} ${cp1y} ${wobble(points[i][0])} ${wobble(points[i][1])}`;
        }
        if (closed) d += ' Z';
        return d;
    }

    // ---- PONY SVG ----
    function pony(state = 'idle', scale = 1) {
        const s = scale;
        const eyeGlow = state === 'sick' ? PALETTE.red : state === 'happy' ? PALETTE.green : PALETTE.cyan;
        const bodyColor = state === 'sick' ? '#2a1a3e' : '#2e2245';
        const maneColor = state === 'happy' ? '#6b3fa0' : '#4a2875';

        const breathAnim = state === 'idle' || state === 'happy' ?
            `<animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite"/>` : '';

        const sickSwirl = state === 'sick' ? `
            <g class="sick-swirls">
                <text x="70" y="-10" fill="${PALETTE.red}" font-size="12" font-family="monospace" opacity="0.8">
                    NullPtr
                    <animateTransform attributeName="transform" type="translate" values="0,0;5,-15;10,-30" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
                </text>
                <text x="-20" y="-20" fill="${PALETTE.orange}" font-size="10" font-family="monospace" opacity="0.7">
                    Exception!
                    <animateTransform attributeName="transform" type="translate" values="0,0;-5,-20;-10,-40" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;0" dur="2.5s" repeatCount="indefinite"/>
                </text>
            </g>` : '';

        const happySparkles = state === 'happy' ? `
            <g class="sparkles">
                ${[[-20,-30],[30,-25],[0,-40],[45,-15],[-15,-10]].map((p, i) => `
                    <text x="${p[0]}" y="${p[1]}" fill="${PALETTE.cyan}" font-size="8" opacity="0">
                        ✦
                        <animate attributeName="opacity" values="0;1;0" dur="${1.5 + i * 0.3}s" begin="${i * 0.2}s" repeatCount="indefinite"/>
                    </text>
                `).join('')}
            </g>` : '';

        return `<svg viewBox="-30 -50 120 120" width="${80 * s}" height="${80 * s}" xmlns="http://www.w3.org/2000/svg">
            <g>${breathAnim}
                <!-- Body -->
                <ellipse cx="30" cy="30" rx="28" ry="22" fill="${bodyColor}" stroke="${PALETTE.purple}" stroke-width="1.5">
                    <animate attributeName="ry" values="22;23;22" dur="2s" repeatCount="indefinite"/>
                </ellipse>

                <!-- Legs -->
                ${[[10,48],[20,50],[40,50],[50,48]].map((l, i) => {
                    const legAnim = state === 'idle' ?
                        `<animate attributeName="y2" values="${l[1]};${l[1]-2};${l[1]}" dur="2s" begin="${i*0.2}s" repeatCount="indefinite"/>` : '';
                    return `<line x1="${l[0]}" y1="45" x2="${wobble(l[0],1)}" y2="${l[1]}" stroke="${PALETTE.purple}" stroke-width="3" stroke-linecap="round">${legAnim}</line>
                    <circle cx="${l[0]}" cy="${l[1]+2}" r="3" fill="${PALETTE.darkGrey}" stroke="${PALETTE.purple}" stroke-width="1"/>`;
                }).join('')}

                <!-- Tail -->
                <path d="${wobblePath([[55,25],[65,15],[70,25],[68,35],[60,38]], false)}" fill="none" stroke="${maneColor}" stroke-width="4" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 55 30;5 55 30;0 55 30;-3 55 30;0 55 30" dur="3s" repeatCount="indefinite"/>
                </path>

                <!-- Head -->
                <ellipse cx="5" cy="10" rx="18" ry="16" fill="${bodyColor}" stroke="${PALETTE.purple}" stroke-width="1.5"/>

                <!-- Horn (deployment antenna!) -->
                <path d="M 5 -5 L 3 -22 L 7 -22 Z" fill="${PALETTE.grey}" stroke="${PALETTE.cyan}" stroke-width="1">
                    <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
                </path>
                <circle cx="5" cy="-22" r="2" fill="${PALETTE.cyan}">
                    <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                </circle>

                <!-- Ear -->
                <path d="${wobblePath([[-8,-2],[-12,-14],[-2,-6]])}" fill="${bodyColor}" stroke="${PALETTE.purple}" stroke-width="1.5"/>

                <!-- Eyes -->
                <ellipse cx="-2" cy="8" rx="4" ry="${state === 'happy' ? 2 : 5}" fill="${PALETTE.void}"/>
                <ellipse cx="-2" cy="8" rx="2.5" ry="${state === 'happy' ? 1.5 : 3}" fill="${eyeGlow}">
                    <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                ${state !== 'happy' ? `<ellipse cx="-1" cy="7" rx="1" ry="1.5" fill="${PALETTE.white}" opacity="0.5"/>` : ''}

                <!-- Blink -->
                ${state !== 'sick' ? `<rect x="-7" y="3" width="10" height="10" fill="${bodyColor}" opacity="0">
                    <animate attributeName="opacity" values="0;0;0;0;0;0;0;0;0;1;0" dur="4s" repeatCount="indefinite"/>
                </rect>` : ''}

                <!-- Mouth -->
                <path d="M -5 16 Q 0 ${state === 'happy' ? 20 : state === 'sick' ? 14 : 18} 5 16" fill="none" stroke="${PALETTE.purple}" stroke-width="1.2"/>

                <!-- Mane -->
                <path d="${wobblePath([[12,-2],[8,-10],[15,-8],[10,-16],[18,-12],[14,-20]], false)}" fill="none" stroke="${maneColor}" stroke-width="4" stroke-linecap="round"/>

                ${sickSwirl}
                ${happySparkles}
            </g>
        </svg>`;
    }

    // ---- PONY RUNNING (for ride mode canvas) ----
    function drawPonyOnCanvas(ctx, x, y, frame, scale = 1) {
        const s = scale;
        const legOffset = Math.sin(frame * 0.3) * 8;
        const bodyBob = Math.sin(frame * 0.15) * 2;

        ctx.save();
        ctx.translate(x, y + bodyBob);

        // Legs (animated)
        ctx.strokeStyle = PALETTE.purple;
        ctx.lineWidth = 3 * s;
        ctx.lineCap = 'round';

        const legs = [
            [-12, 0, -15 + legOffset, 18],
            [-4, 0, -2 - legOffset, 18],
            [8, 0, 5 + legOffset, 18],
            [16, 0, 18 - legOffset, 18],
        ];
        legs.forEach(l => {
            ctx.beginPath();
            ctx.moveTo(l[0] * s, l[1] * s);
            ctx.lineTo(l[2] * s, l[3] * s);
            ctx.stroke();
        });

        // Body
        ctx.fillStyle = '#2e2245';
        ctx.strokeStyle = PALETTE.purple;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.ellipse(0, -5 * s, 22 * s, 16 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.ellipse(-20 * s, -18 * s, 14 * s, 12 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Horn
        ctx.strokeStyle = PALETTE.cyan;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(-22 * s, -28 * s);
        ctx.lineTo(-20 * s, -42 * s);
        ctx.lineTo(-18 * s, -28 * s);
        ctx.closePath();
        ctx.fillStyle = PALETTE.grey;
        ctx.fill();
        ctx.stroke();

        // Horn glow
        ctx.beginPath();
        ctx.arc(-20 * s, -42 * s, 3 * s, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.cyan;
        ctx.shadowColor = PALETTE.cyan;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eye
        ctx.fillStyle = PALETTE.void;
        ctx.beginPath();
        ctx.ellipse(-26 * s, -20 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.cyan;
        ctx.beginPath();
        ctx.ellipse(-26 * s, -20 * s, 2 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mane (flowing behind)
        ctx.strokeStyle = '#4a2875';
        ctx.lineWidth = 4 * s;
        ctx.lineCap = 'round';
        const maneWave = Math.sin(frame * 0.2) * 3;
        ctx.beginPath();
        ctx.moveTo(-12 * s, -22 * s);
        ctx.quadraticCurveTo(-5 * s, (-30 + maneWave) * s, 2 * s, -20 * s);
        ctx.quadraticCurveTo(8 * s, (-28 - maneWave) * s, 14 * s, -18 * s);
        ctx.stroke();

        // Tail
        ctx.beginPath();
        ctx.moveTo(20 * s, -8 * s);
        ctx.quadraticCurveTo((28 + maneWave) * s, -18 * s, (32 - maneWave) * s, -5 * s);
        ctx.quadraticCurveTo((30 + maneWave) * s, 2 * s, 25 * s, 5 * s);
        ctx.stroke();

        ctx.restore();
    }

    // ---- SERVER RACK SVG ----
    function serverRack(height = 120) {
        const leds = Array.from({length: Math.floor(height/15)}, (_, i) => {
            const color = Math.random() > 0.3 ? PALETTE.green : PALETTE.red;
            const blink = Math.random() > 0.5 ? `<animate attributeName="opacity" values="1;0.3;1" dur="${1 + Math.random()*2}s" repeatCount="indefinite"/>` : '';
            return `<circle cx="${15 + Math.random()*20}" cy="${15 + i*15}" r="2" fill="${color}">${blink}</circle>`;
        }).join('');

        return `<svg viewBox="0 0 50 ${height}" width="50" height="${height}">
            <rect x="2" y="2" width="46" height="${height-4}" rx="2" fill="${PALETTE.darkGrey}" stroke="${PALETTE.grey}" stroke-width="1.5"/>
            ${Array.from({length: Math.floor(height/20)}, (_, i) =>
                `<rect x="6" y="${6 + i*20}" width="38" height="14" rx="1" fill="${PALETTE.void}" stroke="${PALETTE.grey}" stroke-width="0.5"/>`
            ).join('')}
            ${leds}
        </svg>`;
    }

    // ---- DRAW SERVER RACKS ON CANVAS ----
    function drawServerRack(ctx, x, y, h = 80) {
        ctx.fillStyle = PALETTE.darkGrey;
        ctx.strokeStyle = PALETTE.grey;
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, 35, h);
        ctx.strokeRect(x, y, 35, h);

        for (let i = 0; i < Math.floor(h / 16); i++) {
            ctx.fillStyle = PALETTE.void;
            ctx.fillRect(x + 4, y + 4 + i * 16, 27, 10);

            // LED
            ctx.beginPath();
            ctx.arc(x + 28, y + 9 + i * 16, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = Math.random() > 0.3 ? PALETTE.green : PALETTE.red;
            ctx.fill();
        }
    }

    // ---- OBSTACLES FOR RIDE MODE ----
    function drawObstacle(ctx, type, x, y, frame) {
        ctx.save();
        ctx.translate(x, y);

        switch (type) {
            case 'ClassNotFoundException':
                // Pit with text
                ctx.fillStyle = PALETTE.void;
                ctx.fillRect(-20, 0, 40, 30);
                ctx.strokeStyle = PALETTE.red;
                ctx.lineWidth = 1;
                ctx.strokeRect(-20, 0, 40, 30);
                ctx.fillStyle = PALETTE.red;
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('ClassNot', 0, -5);
                ctx.fillText('Found', 0, 3);
                break;

            case 'OutOfMemoryError':
                // Falling boulder with text
                const pulse = Math.sin(frame * 0.1) * 3;
                ctx.beginPath();
                ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 2);
                ctx.fillStyle = '#3a1525';
                ctx.fill();
                ctx.strokeStyle = PALETTE.red;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = PALETTE.red;
                ctx.font = 'bold 7px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('OOM', 0, -2);
                ctx.font = '5px monospace';
                ctx.fillText('Error', 0, 6);
                break;

            case 'StackOverflow':
                // Spiral trap
                ctx.strokeStyle = PALETTE.orange;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 30; i++) {
                    const angle = i * 0.5 + frame * 0.05;
                    const r = i * 0.8;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.stroke();
                ctx.fillStyle = PALETTE.orange;
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Stack', 0, -20);
                ctx.fillText('Overflow', 0, -14);
                break;

            case 'ConcurrentModification':
                // Glitchy shifting shape
                const shift = Math.sin(frame * 0.3) * 5;
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = PALETTE.orange;
                ctx.fillRect(-10 + shift, -15, 20, 30);
                ctx.fillStyle = PALETTE.cyan;
                ctx.globalAlpha = 0.4;
                ctx.fillRect(-10 - shift, -12, 20, 30);
                ctx.globalAlpha = 1;
                ctx.fillStyle = PALETTE.white;
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Concurrent', 0, 0);
                ctx.fillText('Mod!', 0, 7);
                break;
        }
        ctx.restore();
    }

    // ---- COLLECTIBLES ----
    function drawCollectible(ctx, type, x, y, frame) {
        ctx.save();
        ctx.translate(x, y);
        const bob = Math.sin(frame * 0.1 + x) * 3;
        ctx.translate(0, bob);

        ctx.shadowColor = PALETTE.cyan;
        ctx.shadowBlur = 8;

        switch (type) {
            case 'jar':
                ctx.fillStyle = '#2a4a3a';
                ctx.fillRect(-6, -8, 12, 16);
                ctx.fillStyle = PALETTE.green;
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('.jar', 0, 3);
                break;
            case 'bean':
                ctx.fillStyle = PALETTE.green;
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('<bean/>', 0, 4);
                break;
            case 'gradle':
                ctx.fillStyle = '#5a9a5a';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('🐘', 0, 5);
                break;
            case 'semicolon':
                ctx.fillStyle = PALETTE.cyan;
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(';', 0, 6);
                break;
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // ---- BOSS ----
    function drawBoss(ctx, type, x, y, frame, hp, maxHp) {
        ctx.save();
        ctx.translate(x, y);
        const pulse = Math.sin(frame * 0.05) * 5;

        // Boss body
        ctx.fillStyle = '#1a0a1a';
        ctx.strokeStyle = PALETTE.red;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 50 + pulse, 40 + pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Boss eyes
        const eyeGlow = Math.sin(frame * 0.15);
        ctx.fillStyle = PALETTE.red;
        ctx.shadowColor = PALETTE.red;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(-18, -10, 8, 5 + eyeGlow * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(18, -10, 8, 5 + eyeGlow * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Boss name
        ctx.fillStyle = PALETTE.white;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(type, 0, 5);
        ctx.font = '7px monospace';
        ctx.fillText('ERROR', 0, 15);

        // HP bar
        ctx.fillStyle = PALETTE.void;
        ctx.fillRect(-40, -55, 80, 8);
        ctx.fillStyle = PALETTE.red;
        ctx.fillRect(-40, -55, 80 * (hp / maxHp), 8);
        ctx.strokeStyle = PALETTE.grey;
        ctx.strokeRect(-40, -55, 80, 8);

        ctx.restore();
    }

    // ---- PARALLAX BACKGROUND ELEMENTS ----
    function drawCable(ctx, x1, y1, x2, y2) {
        ctx.strokeStyle = PALETTE.grey;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const midY = Math.max(y1, y2) + 20 + Math.random() * 30;
        ctx.quadraticCurveTo((x1 + x2) / 2, midY, x2, y2);
        ctx.stroke();
    }

    // ---- XML FOOD ITEM ----
    function xmlFood(tag = 'bean') {
        return `<svg viewBox="0 0 80 30" width="80" height="30">
            <rect x="1" y="1" width="78" height="28" rx="4" fill="${PALETTE.darkGrey}" stroke="${PALETTE.green}" stroke-width="1"/>
            <text x="40" y="19" text-anchor="middle" fill="${PALETTE.green}" font-family="monospace" font-size="11">&lt;${tag}/&gt;</text>
        </svg>`;
    }

    // ---- STACK TRACE POOP ----
    function stackTracePoop() {
        const traces = [
            'at com.pony.Feed.digest(Feed.java:42)',
            'at com.pony.Stomach.process(Stomach.java:108)',
            'at org.spring.BeanFactory.create(BF.java:999)',
            'Caused by: java.lang.NullPonyException',
        ];
        const trace = traces[Math.floor(Math.random() * traces.length)];
        return `<svg viewBox="0 0 200 24" width="200" height="24">
            <rect x="0" y="0" width="200" height="24" rx="3" fill="${PALETTE.void}" opacity="0.9"/>
            <text x="5" y="16" fill="${PALETTE.red}" font-family="monospace" font-size="8" opacity="0.8">${trace}</text>
        </svg>`;
    }

    // ---- WAR FILE (for catapult mini-game) ----
    function warFile() {
        return `<svg viewBox="0 0 40 50" width="40" height="50">
            <rect x="2" y="2" width="36" height="46" rx="3" fill="#3a2a1a" stroke="${PALETTE.orange}" stroke-width="1.5"/>
            <text x="20" y="22" text-anchor="middle" fill="${PALETTE.orange}" font-family="monospace" font-size="9" font-weight="bold">.war</text>
            <text x="20" y="34" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="6">v2.3.1</text>
        </svg>`;
    }

    // ---- TOMCAT SERVER TARGET ----
    function tomcatServer() {
        return `<svg viewBox="0 0 80 90" width="80" height="90">
            <rect x="5" y="10" width="70" height="75" rx="5" fill="${PALETTE.darkGrey}" stroke="${PALETTE.grey}" stroke-width="2"/>
            <text x="40" y="35" text-anchor="middle" fill="${PALETTE.orange}" font-family="monospace" font-size="10" font-weight="bold">TOMCAT</text>
            <text x="40" y="50" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="7">v9.0.65</text>
            <text x="40" y="65" text-anchor="middle" fill="${PALETTE.green}" font-family="monospace" font-size="18">🐱</text>
            <!-- landing zone -->
            <rect x="15" y="2" width="50" height="12" rx="2" fill="none" stroke="${PALETTE.cyan}" stroke-width="1" stroke-dasharray="3,3">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </rect>
        </svg>`;
    }

    // ---- TITLE LOGO ----
    function titleLogo() {
        return `<svg viewBox="0 0 500 120" width="500" height="120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <text x="250" y="50" text-anchor="middle" fill="${PALETTE.cyan}" font-family="monospace" font-size="36" font-weight="bold" filter="url(#glow)">
                DEPLOY PONY
                <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/>
            </text>
            <text x="250" y="80" text-anchor="middle" fill="${PALETTE.purple}" font-family="monospace" font-size="16">
                ~ Enterprise Nightmares ~
            </text>
            <text x="250" y="105" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="10">
                A Hollow Knight-inspired Java Deployment Simulator
            </text>
        </svg>`;
    }

    // ---- PARTICLES ----
    function createFloatingCode() {
        const snippets = [
            'null', 'void', 'static', 'final', 'synchronized',
            'AbstractFactory', 'implements', '@Autowired', 'throws',
            'catch(Exception e)', '.war', 'pom.xml', 'ClassPath',
            '{ }', '/**/', '@Bean', '@Override', 'extends',
            'private', 'transient', 'volatile', 'instanceof',
        ];
        return snippets[Math.floor(Math.random() * snippets.length)];
    }

    return {
        PALETTE,
        pony,
        drawPonyOnCanvas,
        serverRack,
        drawServerRack,
        drawObstacle,
        drawCollectible,
        drawBoss,
        drawCable,
        xmlFood,
        stackTracePoop,
        warFile,
        tomcatServer,
        titleLogo,
        createFloatingCode,
        wobble,
    };
})();
