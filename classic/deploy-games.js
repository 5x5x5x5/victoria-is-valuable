// ============================================================
// deploy-games.js — Deployment Mini-Game Collection
// WAR Catapult, XML Puzzle, Dependency Hell, The Build
// ============================================================

const DeployGames = (() => {
    let container = null;
    let currentGame = null;

    const GAMES = ['catapult', 'xmlPuzzle', 'dependencyHell', 'theBuild'];

    function startRandom() {
        container = document.getElementById('deploy-game-area');
        if (!container) return;
        const game = GAMES[Math.floor(Math.random() * GAMES.length)];
        startGame(game);
    }

    function startGame(type) {
        container = document.getElementById('deploy-game-area');
        currentGame = type;

        switch (type) {
            case 'catapult': warCatapult(); break;
            case 'xmlPuzzle': xmlPuzzle(); break;
            case 'dependencyHell': dependencyHell(); break;
            case 'theBuild': theBuild(); break;
        }
    }

    function endGame(success) {
        if (success) {
            Audio.deploySuccess();
            Game.modifyStat('hunger', 15);
            Game.modifyStat('happiness', 20);
            Game.addScore(200);
            Game.addXP(30);
            Game.incrementDeploys();
            PonyCare.logEvent('Deployment mini-game SUCCESS! Pony is delighted!', 'success');
        } else {
            Audio.deployFail();
            Game.modifyStat('happiness', -10);
            Game.addException('DeploymentFailedException');
            Game.incrementDeploys();
            Game.incrementFailedDeploys();
            PonyCare.logEvent('Deployment mini-game FAILED. Pony is disappointed.', 'error');
        }

        Game.save();
        setTimeout(() => {
            Game.setState(Game.STATES.CARE);
            PonyCare.updateStats();
        }, 1500);
    }

    // =========================================================
    // MINI-GAME 1: WAR FILE CATAPULT
    // =========================================================
    function warCatapult() {
        let angle = 45;
        let power = 50;
        let launched = false;
        let warX = 80, warY = 0;
        let warVX = 0, warVY = 0;
        let targetX = 500;
        let targetW = 80;
        let landed = false;
        let animFrame = null;

        container.innerHTML = `
            <div class="minigame-header">
                <h2>WAR File Catapult</h2>
                <p>Launch the .war file onto the Tomcat server!</p>
            </div>
            <canvas id="catapult-canvas" width="700" height="350"></canvas>
            <div class="catapult-controls">
                <div class="control-group">
                    <label>Angle: <span id="angle-val">45</span>°</label>
                    <input type="range" id="angle-slider" min="10" max="80" value="45"/>
                </div>
                <div class="control-group">
                    <label>Power: <span id="power-val">50</span>%</label>
                    <input type="range" id="power-slider" min="10" max="100" value="50"/>
                </div>
                <button class="action-btn" id="launch-btn" onclick="DeployGames._catapultLaunch()">
                    <span class="btn-prompt">&gt;</span> mvn deploy:launch
                </button>
            </div>
        `;

        const canvas = document.getElementById('catapult-canvas');
        const ctx = canvas.getContext('2d');

        // Responsive
        const parent = canvas.parentElement;
        canvas.width = Math.min(700, parent.clientWidth - 40);

        targetX = canvas.width * 0.7;

        document.getElementById('angle-slider').oninput = (e) => {
            angle = parseInt(e.target.value);
            document.getElementById('angle-val').textContent = angle;
        };
        document.getElementById('power-slider').oninput = (e) => {
            power = parseInt(e.target.value);
            document.getElementById('power-val').textContent = power;
        };

        DeployGames._catapultLaunch = () => {
            if (launched) return;
            launched = true;
            Audio.catapultLaunch();
            document.getElementById('launch-btn').disabled = true;

            const radians = angle * Math.PI / 180;
            const p = power * 0.18;
            warVX = Math.cos(radians) * p;
            warVY = -Math.sin(radians) * p;
            warX = 80;
            warY = canvas.height - 60;
        };

        function render() {
            const w = canvas.width;
            const h = canvas.height;

            // Background
            ctx.fillStyle = Art.PALETTE.void;
            ctx.fillRect(0, 0, w, h);

            // Ground
            ctx.fillStyle = Art.PALETTE.darkGrey;
            ctx.fillRect(0, h - 30, w, 30);
            ctx.strokeStyle = Art.PALETTE.purple;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h - 30);
            ctx.lineTo(w, h - 30);
            ctx.stroke();

            // Catapult base
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(50, h - 60, 60, 30);
            ctx.strokeStyle = Art.PALETTE.orange;
            ctx.strokeRect(50, h - 60, 60, 30);

            // Trajectory preview (if not launched)
            if (!launched) {
                ctx.strokeStyle = Art.PALETTE.cyan;
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                const radians = angle * Math.PI / 180;
                const p = power * 0.18;
                let px = 80, py = h - 60;
                let pvx = Math.cos(radians) * p;
                let pvy = -Math.sin(radians) * p;
                ctx.moveTo(px, py);
                for (let i = 0; i < 50; i++) {
                    px += pvx;
                    pvy += 0.3;
                    py += pvy;
                    if (py > h - 30) break;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Target (Tomcat)
            ctx.fillStyle = Art.PALETTE.darkGrey;
            ctx.strokeStyle = Art.PALETTE.grey;
            ctx.lineWidth = 2;
            ctx.fillRect(targetX - targetW / 2, h - 90, targetW, 60);
            ctx.strokeRect(targetX - targetW / 2, h - 90, targetW, 60);
            ctx.fillStyle = Art.PALETTE.orange;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TOMCAT', targetX, h - 65);
            ctx.font = '18px monospace';
            ctx.fillText('🐱', targetX, h - 42);

            // Landing zone
            ctx.strokeStyle = Art.PALETTE.cyan;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(targetX - targetW / 2, h - 100, targetW, 12);
            ctx.setLineDash([]);

            // WAR file
            if (launched && !landed) {
                warX += warVX;
                warVY += 0.3;
                warY += warVY;

                // Check landing
                if (warY >= h - 45) {
                    landed = true;
                    const hit = Math.abs(warX - targetX) < targetW / 2 + 10;

                    if (hit) {
                        ctx.fillStyle = Art.PALETTE.green;
                        ctx.font = 'bold 18px monospace';
                        ctx.fillText('DEPLOYED! ✓', w / 2, h / 2);
                        setTimeout(() => endGame(true), 1200);
                    } else {
                        ctx.fillStyle = Art.PALETTE.red;
                        ctx.font = 'bold 18px monospace';
                        ctx.fillText('MISSED! 404 Not Found', w / 2, h / 2);
                        setTimeout(() => endGame(false), 1200);
                    }
                }
            }

            if (!landed || !launched) {
                const drawX = launched ? warX : 80;
                const drawY = launched ? warY : h - 65;
                ctx.fillStyle = '#3a2a1a';
                ctx.strokeStyle = Art.PALETTE.orange;
                ctx.lineWidth = 1.5;
                ctx.fillRect(drawX - 12, drawY - 15, 24, 30);
                ctx.strokeRect(drawX - 12, drawY - 15, 24, 30);
                ctx.fillStyle = Art.PALETTE.orange;
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('.war', drawX, drawY + 2);
            }

            ctx.textAlign = 'left';

            if (!landed) {
                animFrame = requestAnimationFrame(render);
            }
        }

        render();
    }

    // =========================================================
    // MINI-GAME 2: XML PUZZLE
    // =========================================================
    function xmlPuzzle() {
        const tags = [
            { text: '<beans>', order: 0 },
            { text: '  <bean id="pony">', order: 1 },
            { text: '    <property name="food"', order: 2 },
            { text: '      value="hay.xml"/>', order: 3 },
            { text: '  </bean>', order: 4 },
            { text: '</beans>', order: 5 },
        ];

        // Shuffle
        const shuffled = [...tags].sort(() => Math.random() - 0.5);
        let slots = shuffled.map((t, i) => ({ ...t, currentPos: i }));
        let selectedIndex = null;
        let timeLeft = 30;
        let timerInterval = null;

        function renderPuzzle() {
            container.innerHTML = `
                <div class="minigame-header">
                    <h2>XML Configuration Puzzle</h2>
                    <p>Arrange the XML tags in the correct order! Time: <span id="xml-timer" class="${timeLeft < 10 ? 'timer-warning' : ''}">${timeLeft}s</span></p>
                </div>
                <div class="xml-slots">
                    ${slots.map((tag, i) => `
                        <div class="xml-slot ${selectedIndex === i ? 'selected' : ''} ${tag.order === i ? 'correct' : ''}"
                             onclick="DeployGames._xmlSelect(${i})">
                            <span class="slot-number">${i + 1}.</span>
                            <code>${tag.text}</code>
                        </div>
                    `).join('')}
                </div>
                <button class="action-btn" onclick="DeployGames._xmlCheck()">
                    <span class="btn-prompt">&gt;</span> xmllint --validate
                </button>
            `;
        }

        DeployGames._xmlSelect = (index) => {
            Audio.click();
            if (selectedIndex === null) {
                selectedIndex = index;
            } else {
                // Swap
                const temp = slots[selectedIndex];
                slots[selectedIndex] = slots[index];
                slots[index] = temp;
                selectedIndex = null;
            }
            renderPuzzle();
        };

        DeployGames._xmlCheck = () => {
            clearInterval(timerInterval);
            const correct = slots.every((tag, i) => tag.order === i);
            endGame(correct);
        };

        timerInterval = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('xml-timer');
            if (timerEl) {
                timerEl.textContent = timeLeft + 's';
                if (timeLeft < 10) timerEl.classList.add('timer-warning');
            }
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame(false);
            }
        }, 1000);

        renderPuzzle();
    }

    // =========================================================
    // MINI-GAME 3: DEPENDENCY HELL (Memory Match)
    // =========================================================
    function dependencyHell() {
        const deps = [
            'spring-core:5.3.21',
            'hibernate:5.6.9',
            'log4j:2.17.1',
            'jackson:2.13.3',
            'commons-io:2.11',
            'guava:31.1',
        ];

        // Create pairs and shuffle
        const cards = [...deps, ...deps]
            .map((dep, i) => ({ dep, id: i, flipped: false, matched: false }))
            .sort(() => Math.random() - 0.5);

        let firstFlip = null;
        let secondFlip = null;
        let canFlip = true;
        let matchesFound = 0;
        let attempts = 0;
        const maxAttempts = 15;

        function renderCards() {
            container.innerHTML = `
                <div class="minigame-header">
                    <h2>Dependency Hell</h2>
                    <p>Match the dependency versions! Attempts: ${attempts}/${maxAttempts} | Matches: ${matchesFound}/${deps.length}</p>
                </div>
                <div class="dep-grid">
                    ${cards.map((card, i) => `
                        <div class="dep-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}"
                             onclick="DeployGames._depFlip(${i})">
                            <div class="dep-card-front">
                                <span class="dep-q">?</span>
                                <span class="dep-label">.jar</span>
                            </div>
                            <div class="dep-card-back">
                                <span class="dep-name">${card.dep}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        DeployGames._depFlip = (index) => {
            if (!canFlip || cards[index].flipped || cards[index].matched) return;

            Audio.click();
            cards[index].flipped = true;

            if (firstFlip === null) {
                firstFlip = index;
                renderCards();
            } else {
                secondFlip = index;
                attempts++;
                canFlip = false;
                renderCards();

                if (cards[firstFlip].dep === cards[secondFlip].dep) {
                    // Match!
                    Audio.collect();
                    cards[firstFlip].matched = true;
                    cards[secondFlip].matched = true;
                    matchesFound++;
                    firstFlip = null;
                    secondFlip = null;
                    canFlip = true;
                    renderCards();

                    if (matchesFound === deps.length) {
                        endGame(true);
                    }
                } else {
                    // No match
                    setTimeout(() => {
                        cards[firstFlip].flipped = false;
                        cards[secondFlip].flipped = false;
                        firstFlip = null;
                        secondFlip = null;
                        canFlip = true;
                        renderCards();

                        if (attempts >= maxAttempts) {
                            endGame(false);
                        }
                    }, 800);
                }
            }
        };

        renderCards();
    }

    // =========================================================
    // MINI-GAME 4: THE BUILD
    // =========================================================
    function theBuild() {
        let progress = 0;
        let target = 100;
        let clicks = 0;
        let buildInterval = null;
        let setbacks = 0;
        let currentMessage = 'Initializing Maven build...';

        const BUILD_MESSAGES = [
            'Downloading the internet...',
            'Resolving SNAPSHOT dependencies...',
            'Running 847 unit tests...',
            'Compiling AbstractSingletonProxyFactoryBean...',
            'Scanning classpath for Spring beans...',
            'Configuring Hibernate session factory...',
            'Indexing node_modules (just kidding)...',
            'Negotiating with Jenkins...',
            'Praying to the deployment gods...',
            'Generating bytecode for pony emotions...',
            'Serializing hay bales to JSON...',
            'Establishing database connection pool...',
        ];

        const SETBACK_MESSAGES = [
            'COMPILATION ERROR: Cannot find symbol "happiness"',
            'TEST FAILURE: PonyFeedTest.testXmlDigestion',
            'DEPENDENCY CONFLICT: spring-pony 5.3 vs 5.4',
            'WARNING: Deprecated API in PonyGroomer.java',
            'ERROR: OutOfMemoryError in BuildModule',
            'NETWORK ERROR: Repository unreachable',
        ];

        function renderBuild() {
            const barColor = progress < 30 ? Art.PALETTE.red :
                             progress < 70 ? Art.PALETTE.orange : Art.PALETTE.green;

            container.innerHTML = `
                <div class="minigame-header">
                    <h2>The Build</h2>
                    <p>Click to help the build along! Fight the setbacks!</p>
                </div>
                <div class="build-area">
                    <div class="build-terminal">
                        <div class="terminal-header">$ mvn clean install -DskipTests=false</div>
                        <div class="build-message" id="build-msg">${currentMessage}</div>
                    </div>
                    <div class="build-bar-container">
                        <div class="build-bar" style="width: ${progress}%; background: ${barColor}">
                            ${Math.floor(progress)}%
                        </div>
                    </div>
                    <div class="build-stats">
                        Clicks: ${clicks} | Setbacks: ${setbacks}
                    </div>
                    <button class="action-btn build-click-btn" id="build-btn" onclick="DeployGames._buildClick()">
                        <span class="btn-prompt">&gt;</span> BUILD HARDER
                    </button>
                </div>
            `;
        }

        DeployGames._buildClick = () => {
            Audio.click();
            clicks++;
            progress += 3 + Math.random() * 2;
            currentMessage = BUILD_MESSAGES[Math.floor(Math.random() * BUILD_MESSAGES.length)];
            if (progress >= target) {
                clearInterval(buildInterval);
                endGame(true);
                return;
            }
            renderBuild();
        };

        // Random setbacks
        buildInterval = setInterval(() => {
            if (Math.random() < 0.35) {
                const setback = 5 + Math.random() * 15;
                progress = Math.max(0, progress - setback);
                setbacks++;
                currentMessage = SETBACK_MESSAGES[Math.floor(Math.random() * SETBACK_MESSAGES.length)];
                Audio.errorBuzz();
                renderBuild();

                // Flash the container red
                if (container) {
                    container.classList.add('build-setback');
                    setTimeout(() => container.classList.remove('build-setback'), 300);
                }
            } else {
                // Slow passive progress
                progress += 0.5;
                if (progress >= target) {
                    clearInterval(buildInterval);
                    endGame(true);
                    return;
                }
                currentMessage = BUILD_MESSAGES[Math.floor(Math.random() * BUILD_MESSAGES.length)];
                renderBuild();
            }
        }, 2000);

        renderBuild();
    }

    return {
        startRandom,
        startGame,
        _catapultLaunch: null,
        _xmlSelect: null,
        _xmlCheck: null,
        _depFlip: null,
        _buildClick: null,
    };
})();
