// ============================================================
// art.js — SVG Art Generation for Deploy Pony: Enterprise Nightmares
// CARTOON EDITION — Bright, bouncy, colorful!
// ============================================================

const Art = (() => {
    const PALETTE = {
        void: '#87CEEB',       // sky blue (was black)
        deepBlue: '#C9B1FF',   // soft lavender
        purple: '#FF69B4',     // hot pink
        midPurple: '#E088C0',  // soft rose
        cyan: '#FFD700',       // golden yellow (accent)
        orange: '#FFA500',     // tangerine
        red: '#FF4444',        // candy red
        green: '#32CD32',      // lime green
        white: '#FFFEF2',      // cream white
        grey: '#B0B0C8',       // light grey
        darkGrey: '#E8E0F0',   // soft lavender-grey
        skyTop: '#87CEEB',
        skyBottom: '#FFF8DC',
        grass: '#5CBF3A',
        grassDark: '#3EA520',
        ponyPink: '#FFB6D9',
        ponyBody: '#E89AC5',
        manePurple: '#9B59B6',
        maneBlue: '#5DADE2',
        cheekPink: '#FF9999',
    };

    // Wobble for cartoon feel (bigger = more wobbly)
    function wobble(val, amount = 3) {
        return val + (Math.random() - 0.5) * amount;
    }

    function wobblePath(points, closed = true) {
        if (points.length === 0) return '';
        let d = `M ${wobble(points[0][0])} ${wobble(points[0][1])}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = wobble((points[i - 1][0] + points[i][0]) / 2, 5);
            const cp1y = wobble((points[i - 1][1] + points[i][1]) / 2, 5);
            d += ` Q ${cp1x} ${cp1y} ${wobble(points[i][0])} ${wobble(points[i][1])}`;
        }
        if (closed) d += ' Z';
        return d;
    }

    // ---- PONY SVG (Cartoon style!) ----
    function pony(state = 'idle', scale = 1) {
        const s = scale;
        const eyeColor = state === 'sick' ? '#FF6B6B' : state === 'happy' ? '#44DD44' : '#5DADE2';
        const bodyColor = state === 'sick' ? '#D4A0C0' : PALETTE.ponyPink;
        const bodyStroke = state === 'sick' ? '#C080A0' : PALETTE.ponyBody;
        const maneColor = state === 'happy' ? '#E74C9C' : PALETTE.manePurple;

        const bounceAnim = state === 'idle' || state === 'happy' ?
            `<animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="1.2s" repeatCount="indefinite"/>` : '';

        const sickSwirl = state === 'sick' ? `
            <g class="sick-swirls">
                <text x="70" y="-10" fill="${PALETTE.red}" font-size="14" font-family="monospace" opacity="0.9">
                    💫 NullPtr
                    <animateTransform attributeName="transform" type="translate" values="0,0;5,-15;10,-30" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite"/>
                </text>
                <text x="-30" y="-25" fill="${PALETTE.orange}" font-size="16" opacity="0.8">
                    🤒
                    <animateTransform attributeName="transform" type="translate" values="0,0;-5,-20;-10,-40" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;0" dur="2.5s" repeatCount="indefinite"/>
                </text>
            </g>` : '';

        const happySparkles = state === 'happy' ? `
            <g class="sparkles">
                ${[[-20,-30],[30,-25],[0,-45],[50,-15],[-15,-10]].map((p, i) => `
                    <text x="${p[0]}" y="${p[1]}" font-size="12" opacity="0">
                        ${['⭐','✨','💖','🌟','💫'][i]}
                        <animate attributeName="opacity" values="0;1;0" dur="${1.2 + i * 0.2}s" begin="${i * 0.15}s" repeatCount="indefinite"/>
                        <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="${1 + i * 0.2}s" repeatCount="indefinite"/>
                    </text>
                `).join('')}
            </g>` : '';

        return `<svg viewBox="-30 -55 130 130" width="${90 * s}" height="${90 * s}" xmlns="http://www.w3.org/2000/svg">
            <g>${bounceAnim}
                <!-- Body (rounder, softer) -->
                <ellipse cx="30" cy="30" rx="30" ry="25" fill="${bodyColor}" stroke="${bodyStroke}" stroke-width="2.5">
                    <animate attributeName="ry" values="25;27;25" dur="1.2s" repeatCount="indefinite"/>
                </ellipse>

                <!-- Legs (chubby!) -->
                ${[[8,50],[22,52],[38,52],[52,50]].map((l, i) => {
                    const legAnim = state === 'idle' ?
                        `<animate attributeName="y2" values="${l[1]};${l[1]-3};${l[1]}" dur="1.2s" begin="${i*0.15}s" repeatCount="indefinite"/>` : '';
                    return `<line x1="${l[0]}" y1="48" x2="${wobble(l[0],1)}" y2="${l[1]}" stroke="${bodyStroke}" stroke-width="5" stroke-linecap="round">${legAnim}</line>
                    <circle cx="${l[0]}" cy="${l[1]+3}" r="4" fill="${bodyStroke}" stroke="${PALETTE.ponyBody}" stroke-width="1"/>`;
                }).join('')}

                <!-- Tail (fluffy rainbow!) -->
                <path d="${wobblePath([[57,22],[68,10],[75,20],[72,32],[65,38]], false)}" fill="none" stroke="#E74C9C" stroke-width="5" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 55 30;8 55 30;0 55 30;-5 55 30;0 55 30" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="${wobblePath([[58,24],[70,14],[76,24]], false)}" fill="none" stroke="#5DADE2" stroke-width="4" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 55 30;6 55 30;0 55 30;-4 55 30;0 55 30" dur="2.2s" repeatCount="indefinite"/>
                </path>
                <path d="${wobblePath([[59,26],[72,18],[77,28]], false)}" fill="none" stroke="${PALETTE.cyan}" stroke-width="3" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 55 30;4 55 30;0 55 30;-3 55 30;0 55 30" dur="2.4s" repeatCount="indefinite"/>
                </path>

                <!-- Head (bigger, rounder) -->
                <ellipse cx="3" cy="8" rx="22" ry="20" fill="${bodyColor}" stroke="${bodyStroke}" stroke-width="2.5"/>

                <!-- Blush cheeks -->
                <ellipse cx="12" cy="16" rx="5" ry="3" fill="${PALETTE.cheekPink}" opacity="0.5"/>
                <ellipse cx="-8" cy="16" rx="5" ry="3" fill="${PALETTE.cheekPink}" opacity="0.5"/>

                <!-- Horn (sparkly golden!) -->
                <path d="M 3 -10 L 0 -30 L 6 -30 Z" fill="${PALETTE.cyan}" stroke="#DAA520" stroke-width="1.5">
                    <animate attributeName="fill-opacity" values="1;0.7;1" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x="3" y="-32" text-anchor="middle" font-size="10">
                    ✨
                    <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite"/>
                </text>

                <!-- Ear (pointy & cute) -->
                <path d="${wobblePath([[-10,-2],[-16,-18],[-4,-8]])}" fill="${bodyColor}" stroke="${bodyStroke}" stroke-width="2"/>
                <path d="${wobblePath([[-10,-4],[-14,-14],[-6,-7]])}" fill="${PALETTE.cheekPink}" opacity="0.3"/>

                <!-- Eyes (BIG cartoon anime eyes!) -->
                <!-- Left eye -->
                <ellipse cx="-5" cy="5" rx="7" ry="${state === 'happy' ? 3 : 8}" fill="white" stroke="${bodyStroke}" stroke-width="1"/>
                ${state !== 'happy' ? `
                    <ellipse cx="-4" cy="5" rx="4" ry="5" fill="${eyeColor}"/>
                    <ellipse cx="-3" cy="4" rx="2" ry="2.5" fill="#222"/>
                    <ellipse cx="-2" cy="2" rx="1.5" ry="1.5" fill="white" opacity="0.9"/>
                    <ellipse cx="-5" cy="6" rx="0.8" ry="0.8" fill="white" opacity="0.6"/>
                ` : `
                    <path d="M -10 5 Q -5 1 0 5" fill="none" stroke="${eyeColor}" stroke-width="2.5" stroke-linecap="round"/>
                `}

                <!-- Blink -->
                ${state !== 'sick' ? `<ellipse cx="-5" cy="5" rx="7.5" ry="8.5" fill="${bodyColor}" opacity="0">
                    <animate attributeName="opacity" values="0;0;0;0;0;0;0;0;0;1;0" dur="3.5s" repeatCount="indefinite"/>
                </ellipse>` : ''}

                <!-- Mouth -->
                ${state === 'happy'
                    ? `<path d="M -8 18 Q 0 26 8 18" fill="none" stroke="#E74C9C" stroke-width="2" stroke-linecap="round"/>
                       <path d="M -5 18 Q 0 23 5 18" fill="#FF9999" opacity="0.5"/>`
                    : state === 'sick'
                    ? `<path d="M -5 20 Q 0 16 5 20" fill="none" stroke="#C080A0" stroke-width="1.5" stroke-linecap="round"/>`
                    : `<path d="M -4 18 Q 1 22 6 18" fill="none" stroke="${bodyStroke}" stroke-width="1.5" stroke-linecap="round"/>`
                }

                <!-- Mane (rainbow flowing!) -->
                <path d="${wobblePath([[14,0],[10,-12],[16,-8],[12,-20],[20,-14],[16,-26]], false)}" fill="none" stroke="#E74C9C" stroke-width="5" stroke-linecap="round"/>
                <path d="${wobblePath([[16,2],[12,-10],[18,-6],[14,-18],[22,-12]], false)}" fill="none" stroke="#5DADE2" stroke-width="4" stroke-linecap="round"/>
                <path d="${wobblePath([[18,4],[14,-8],[20,-4],[16,-16]], false)}" fill="none" stroke="${PALETTE.cyan}" stroke-width="3" stroke-linecap="round"/>

                ${sickSwirl}
                ${happySparkles}
            </g>
        </svg>`;
    }

    // ---- PONY RUNNING (for ride mode canvas - cartoon!) ----
    function drawPonyOnCanvas(ctx, x, y, frame, scale = 1) {
        const s = scale;
        const legOffset = Math.sin(frame * 0.3) * 12; // bigger stride
        const bodyBob = Math.sin(frame * 0.15) * 4;   // bouncier

        ctx.save();
        ctx.translate(x, y + bodyBob);

        // Legs (chubby, rounded)
        ctx.lineWidth = 5 * s;
        ctx.lineCap = 'round';

        const legs = [
            [-12, 0, -15 + legOffset, 18],
            [-4, 0, -2 - legOffset, 18],
            [8, 0, 5 + legOffset, 18],
            [16, 0, 18 - legOffset, 18],
        ];
        legs.forEach(l => {
            ctx.strokeStyle = PALETTE.ponyBody;
            ctx.beginPath();
            ctx.moveTo(l[0] * s, l[1] * s);
            ctx.lineTo(l[2] * s, l[3] * s);
            ctx.stroke();
            // Hoof circle
            ctx.beginPath();
            ctx.arc(l[2] * s, (l[3] + 2) * s, 3 * s, 0, Math.PI * 2);
            ctx.fillStyle = PALETTE.ponyBody;
            ctx.fill();
        });

        // Body (rounder, pastel pink)
        ctx.fillStyle = PALETTE.ponyPink;
        ctx.strokeStyle = PALETTE.ponyBody;
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.ellipse(0, -5 * s, 24 * s, 18 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head (bigger, rounder)
        ctx.beginPath();
        ctx.ellipse(-20 * s, -20 * s, 16 * s, 15 * s, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Blush
        ctx.fillStyle = PALETTE.cheekPink;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(-12 * s, -14 * s, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Horn (golden!)
        ctx.fillStyle = PALETTE.cyan;
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(-22 * s, -32 * s);
        ctx.lineTo(-20 * s, -48 * s);
        ctx.lineTo(-18 * s, -32 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horn sparkle
        ctx.fillStyle = '#FFF';
        ctx.shadowColor = PALETTE.cyan;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(-20 * s, -48 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eye (big, cute, white sclera)
        ctx.fillStyle = 'white';
        ctx.strokeStyle = PALETTE.ponyBody;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.ellipse(-27 * s, -22 * s, 5 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Iris
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.ellipse(-26 * s, -22 * s, 3 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(-25 * s, -23 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-24 * s, -25 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // Mane (rainbow flowing behind — 3 layers)
        ctx.lineWidth = 5 * s;
        ctx.lineCap = 'round';
        const maneWave = Math.sin(frame * 0.2) * 4;

        // Pink layer
        ctx.strokeStyle = '#E74C9C';
        ctx.beginPath();
        ctx.moveTo(-12 * s, -28 * s);
        ctx.quadraticCurveTo(-4 * s, (-36 + maneWave) * s, 4 * s, -24 * s);
        ctx.quadraticCurveTo(10 * s, (-32 - maneWave) * s, 16 * s, -22 * s);
        ctx.stroke();

        // Blue layer
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(-10 * s, -26 * s);
        ctx.quadraticCurveTo(-2 * s, (-33 + maneWave) * s, 6 * s, -22 * s);
        ctx.quadraticCurveTo(12 * s, (-30 - maneWave) * s, 18 * s, -20 * s);
        ctx.stroke();

        // Gold layer
        ctx.strokeStyle = PALETTE.cyan;
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(-8 * s, -24 * s);
        ctx.quadraticCurveTo(0, (-30 + maneWave) * s, 8 * s, -20 * s);
        ctx.stroke();

        // Tail (rainbow)
        ctx.lineWidth = 5 * s;
        ctx.strokeStyle = '#E74C9C';
        ctx.beginPath();
        ctx.moveTo(22 * s, -8 * s);
        ctx.quadraticCurveTo((30 + maneWave) * s, -20 * s, (34 - maneWave) * s, -5 * s);
        ctx.quadraticCurveTo((32 + maneWave) * s, 4 * s, 27 * s, 7 * s);
        ctx.stroke();
        ctx.lineWidth = 3.5 * s;
        ctx.strokeStyle = '#5DADE2';
        ctx.beginPath();
        ctx.moveTo(23 * s, -6 * s);
        ctx.quadraticCurveTo((31 + maneWave) * s, -17 * s, (35 - maneWave) * s, -3 * s);
        ctx.stroke();

        ctx.restore();
    }

    // ---- CARTOON CLOUD (replaces server rack) ----
    function drawServerRack(ctx, x, y, h = 80) {
        // Draw cartoon cloud instead of server rack
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        const cloudY = y + h * 0.3;
        ctx.arc(x + 10, cloudY, 15, 0, Math.PI * 2);
        ctx.arc(x + 25, cloudY - 8, 18, 0, Math.PI * 2);
        ctx.arc(x + 42, cloudY - 4, 14, 0, Math.PI * 2);
        ctx.arc(x + 20, cloudY + 5, 12, 0, Math.PI * 2);
        ctx.arc(x + 35, cloudY + 3, 13, 0, Math.PI * 2);
        ctx.fill();
    }

    // ---- Draw cartoon hills for background ----
    function drawHill(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y);
        ctx.quadraticCurveTo(x, y - h, x + w / 2, y);
        ctx.fill();
    }

    // ---- OBSTACLES FOR RIDE MODE (cute cartoon versions!) ----
    function drawObstacle(ctx, type, x, y, frame) {
        ctx.save();
        ctx.translate(x, y);
        const bounce = Math.sin(frame * 0.15) * 3;

        // Googly eyes helper
        function googlyEyes(ex, ey, size = 5) {
            // White
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ex - size, ey, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + size, ey, size, 0, Math.PI * 2);
            ctx.fill();
            // Pupils (wobble with frame)
            const px = Math.sin(frame * 0.1) * 1.5;
            const py = Math.cos(frame * 0.12) * 1;
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(ex - size + px, ey + py, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + size + px, ey + py, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        switch (type) {
            case 'ClassNotFoundException':
                // Bouncing question-mark block
                ctx.translate(0, bounce);
                ctx.fillStyle = '#FFD93D';
                ctx.strokeStyle = '#E6A800';
                ctx.lineWidth = 2;
                const bw = 32, bh = 32;
                ctx.fillRect(-bw/2, -bh/2, bw, bh);
                ctx.strokeRect(-bw/2, -bh/2, bw, bh);
                ctx.fillStyle = '#E6A800';
                ctx.font = 'bold 18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', 0, 7);
                googlyEyes(0, -8, 4);
                ctx.fillStyle = '#E6A800';
                ctx.font = '5px monospace';
                ctx.fillText('ClassNot', 0, -20);
                ctx.fillText('Found', 0, -14);
                break;

            case 'OutOfMemoryError':
                // Inflating balloon animal
                const inflate = Math.sin(frame * 0.08) * 6;
                ctx.translate(0, bounce);
                ctx.fillStyle = '#FF6B8A';
                ctx.strokeStyle = '#E0506A';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 16 + inflate, 20 + inflate, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                googlyEyes(0, -6, 5);
                // Balloon string
                ctx.strokeStyle = '#CCC';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, 20 + inflate);
                ctx.quadraticCurveTo(5, 28 + inflate, 0, 35 + inflate);
                ctx.stroke();
                ctx.fillStyle = '#E0506A';
                ctx.font = 'bold 7px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('OOM!', 0, 3);
                break;

            case 'StackOverflow':
                // Teetering stack of colorful blocks
                const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
                const tilt = Math.sin(frame * 0.08) * 0.1;
                ctx.rotate(tilt);
                for (let i = 0; i < 5; i++) {
                    const bx = Math.sin(frame * 0.05 + i) * 2;
                    ctx.fillStyle = colors[i];
                    ctx.strokeStyle = '#00000030';
                    ctx.lineWidth = 1;
                    ctx.fillRect(-10 + bx, -i * 10 - 5, 20, 9);
                    ctx.strokeRect(-10 + bx, -i * 10 - 5, 20, 9);
                }
                googlyEyes(0, -52, 4);
                ctx.fillStyle = '#555';
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Stack', 0, -58);
                ctx.fillText('Overflow', 0, -52);
                break;

            case 'ConcurrentModification':
                // Two identical cute blobs bumping into each other
                const bump = Math.sin(frame * 0.2) * 8;
                ctx.fillStyle = '#FF9FF3';
                ctx.beginPath();
                ctx.arc(-8 - bump, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#48DBFB';
                ctx.beginPath();
                ctx.arc(8 + bump, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                // Eyes on each blob
                [[-8 - bump, 0], [8 + bump, 0]].forEach(([bx, by]) => {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(bx - 3, by - 3, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(bx + 3, by - 3, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#222';
                    ctx.beginPath();
                    ctx.arc(bx - 3, by - 3, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(bx + 3, by - 3, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.fillStyle = '#555';
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Concurrent', 0, -18);
                ctx.fillText('Mod!', 0, -12);
                break;
        }
        ctx.restore();
    }

    // ---- COLLECTIBLES (bright & sparkly!) ----
    function drawCollectible(ctx, type, x, y, frame) {
        ctx.save();
        ctx.translate(x, y);
        const bob = Math.sin(frame * 0.12 + x) * 5;
        const spin = Math.sin(frame * 0.08) * 0.1;
        ctx.translate(0, bob);
        ctx.rotate(spin);

        ctx.shadowColor = PALETTE.cyan;
        ctx.shadowBlur = 12;

        switch (type) {
            case 'jar':
                ctx.fillStyle = '#4ECDC4';
                ctx.strokeStyle = '#3BB3AB';
                ctx.lineWidth = 1.5;
                // Jar shape
                ctx.fillRect(-7, -4, 14, 16);
                ctx.strokeRect(-7, -4, 14, 16);
                ctx.fillRect(-5, -8, 10, 5);
                ctx.strokeRect(-5, -8, 10, 5);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 7px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('.jar', 0, 8);
                break;
            case 'bean':
                ctx.fillStyle = PALETTE.green;
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('<bean/>', 0, 4);
                // Sparkle ring
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'gradle':
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('🐘', 0, 6);
                break;
            case 'semicolon':
                ctx.fillStyle = PALETTE.cyan;
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(';', 0, 8);
                break;
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // ---- BOSS (cartoon villain!) ----
    function drawBoss(ctx, type, x, y, frame, hp, maxHp) {
        ctx.save();
        ctx.translate(x, y);
        const pulse = Math.sin(frame * 0.05) * 5;
        const wobbleX = Math.sin(frame * 0.08) * 3;

        // Boss body (bright, round, goofy)
        ctx.fillStyle = '#9B59B6';
        ctx.strokeStyle = '#8E44AD';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(wobbleX, 0, 50 + pulse, 42 + pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Angry eyebrows
        ctx.strokeStyle = '#4A235A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-28, -20);
        ctx.lineTo(-12, -16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(28, -20);
        ctx.lineTo(12, -16);
        ctx.stroke();

        // Big googly eyes
        const eyeScale = 1 + Math.sin(frame * 0.15) * 0.1;
        [-18, 18].forEach(ex => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(ex, -8, 10 * eyeScale, 12 * eyeScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4A235A';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#C0392B';
            ctx.beginPath();
            ctx.arc(ex + Math.sin(frame * 0.1) * 2, -8, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(ex + Math.sin(frame * 0.1) * 2, -9, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ex + 2, -12, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Grumpy mouth
        ctx.strokeStyle = '#4A235A';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-15, 12);
        ctx.quadraticCurveTo(0, 5, 15, 12);
        ctx.stroke();

        // Boss name
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#4A235A';
        ctx.lineWidth = 3;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.strokeText(type, 0, 28);
        ctx.fillText(type, 0, 28);
        ctx.font = '7px monospace';
        ctx.strokeText('ERROR', 0, 38);
        ctx.fillText('ERROR', 0, 38);

        // HP bar (colorful!)
        ctx.fillStyle = 'white';
        ctx.fillRect(-42, -57, 84, 12);
        ctx.strokeStyle = '#8E44AD';
        ctx.lineWidth = 2;
        ctx.strokeRect(-42, -57, 84, 12);
        const hpPct = hp / maxHp;
        const hpColor = hpPct > 0.5 ? PALETTE.green : hpPct > 0.25 ? PALETTE.orange : PALETTE.red;
        ctx.fillStyle = hpColor;
        ctx.fillRect(-40, -55, 80 * hpPct, 8);

        ctx.restore();
    }

    // ---- PARALLAX BACKGROUND ELEMENTS ----
    function drawCable(ctx, x1, y1, x2, y2) {
        // Draw a garland/bunting instead of cable
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const midY = Math.max(y1, y2) + 15;
        ctx.quadraticCurveTo((x1 + x2) / 2, midY, x2, y2);
        ctx.stroke();

        // Little triangular flags
        const flags = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#FF9FF3'];
        const steps = 5;
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const fx = x1 + (x2 - x1) * t;
            const fy = y1 + (midY - y1) * 2 * t * (1 - t) + (y2 - y1) * t;
            ctx.fillStyle = flags[i % flags.length];
            ctx.beginPath();
            ctx.moveTo(fx - 4, fy);
            ctx.lineTo(fx + 4, fy);
            ctx.lineTo(fx, fy + 8);
            ctx.closePath();
            ctx.fill();
        }
    }

    // ---- XML FOOD ITEM ----
    function xmlFood(tag = 'bean') {
        return `<svg viewBox="0 0 80 30" width="80" height="30">
            <rect x="1" y="1" width="78" height="28" rx="10" fill="#E8F8F0" stroke="${PALETTE.green}" stroke-width="2"/>
            <text x="40" y="19" text-anchor="middle" fill="${PALETTE.green}" font-family="monospace" font-size="11" font-weight="bold">&lt;${tag}/&gt;</text>
        </svg>`;
    }

    // ---- STACK TRACE POOP (cute rainbow version!) ----
    function stackTracePoop() {
        const traces = [
            'at com.pony.Feed.digest(Feed.java:42) 💩',
            'at com.pony.Stomach.process(Tummy.java:108) 🌈',
            'at org.spring.BeanFactory.create(BF.java:999) ✨',
            'Caused by: java.lang.NullPonyException 🦄',
        ];
        const trace = traces[Math.floor(Math.random() * traces.length)];
        return `<svg viewBox="0 0 220 28" width="220" height="28">
            <rect x="0" y="0" width="220" height="28" rx="14" fill="#FFF0F5" stroke="#FFB6D9" stroke-width="1.5"/>
            <text x="10" y="18" fill="#E74C9C" font-family="monospace" font-size="8">${trace}</text>
        </svg>`;
    }

    // ---- WAR FILE (for catapult mini-game) ----
    function warFile() {
        return `<svg viewBox="0 0 40 50" width="40" height="50">
            <rect x="2" y="2" width="36" height="46" rx="8" fill="#FFE4B5" stroke="${PALETTE.orange}" stroke-width="2"/>
            <text x="20" y="22" text-anchor="middle" fill="${PALETTE.orange}" font-family="monospace" font-size="9" font-weight="bold">.war</text>
            <text x="20" y="34" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="6">v2.3.1</text>
            <text x="20" y="44" text-anchor="middle" font-size="10">📦</text>
        </svg>`;
    }

    // ---- TOMCAT SERVER TARGET ----
    function tomcatServer() {
        return `<svg viewBox="0 0 80 90" width="80" height="90">
            <rect x="5" y="10" width="70" height="75" rx="12" fill="#FFF5EE" stroke="${PALETTE.orange}" stroke-width="2"/>
            <text x="40" y="35" text-anchor="middle" fill="${PALETTE.orange}" font-family="monospace" font-size="10" font-weight="bold">TOMCAT</text>
            <text x="40" y="50" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="7">v9.0.65</text>
            <text x="40" y="68" text-anchor="middle" font-size="22">🐱</text>
            <rect x="15" y="2" width="50" height="12" rx="6" fill="none" stroke="${PALETTE.cyan}" stroke-width="1.5" stroke-dasharray="4,4">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </rect>
        </svg>`;
    }

    // ---- TITLE LOGO (bright & bouncy!) ----
    function titleLogo() {
        return `<svg viewBox="0 0 500 120" width="500" height="120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <text x="250" y="50" text-anchor="middle" fill="#E74C9C" font-family="monospace" font-size="38" font-weight="bold" stroke="#C0392B" stroke-width="1" filter="url(#glow)">
                DEPLOY PONY
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1.5s" repeatCount="indefinite"/>
            </text>
            <text x="254" y="50" text-anchor="middle" fill="#FF69B4" font-family="monospace" font-size="38" font-weight="bold" opacity="0.4">
                DEPLOY PONY
            </text>
            <text x="250" y="78" text-anchor="middle" fill="#9B59B6" font-family="monospace" font-size="16">
                ✨ Enterprise Nightmares ✨
            </text>
            <text x="250" y="105" text-anchor="middle" fill="${PALETTE.grey}" font-family="monospace" font-size="10">
                A Cartoon Java Deployment Simulator 🐴
            </text>
        </svg>`;
    }

    // ---- PARTICLES (rainbow confetti instead of code!) ----
    function createFloatingCode() {
        const snippets = [
            '⭐', '✨', '💖', '🌟', '🐴', '☁️', '🌈', '💫',
            'null', 'void', '@Bean', '.war', 'deploy!',
            '🦄', '🎀', '🎉', '🐘', ';', '💜', '🌸',
        ];
        return snippets[Math.floor(Math.random() * snippets.length)];
    }

    return {
        PALETTE,
        pony,
        drawPonyOnCanvas,
        serverRack: null, // not used in cartoon mode
        drawServerRack,
        drawObstacle,
        drawCollectible,
        drawBoss,
        drawCable,
        drawHill,
        xmlFood,
        stackTracePoop,
        warFile,
        tomcatServer,
        titleLogo,
        createFloatingCode,
        wobble,
    };
})();
