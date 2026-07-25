// ============================================================
// pony-care.js — Tamagotchi-style Pony Care Mode
// Feed XML, groom code, play with your enterprise pony
// ============================================================

const PonyCare = (() => {
    let ponyContainer = null;
    let statsContainer = null;
    let actionsContainer = null;
    let eventLog = null;
    let poopContainer = null;
    let dialogueBubble = null;
    let poops = [];
    let currentPonyState = 'idle';
    let autoSaveInterval = null;

    const DIALOGUES = {
        idle: [
            "I hunger for well-formed XML...",
            "My classpath feels empty.",
            "Did someone say... dependency injection?",
            "*stares at you with glowing cyan eyes*",
            "The server room is cold and dark. I like it.",
            "I dreamt of a world without NullPointerExceptions...",
            "When will the next sprint end?",
            "I can smell an unhandled exception nearby.",
            "My hooves are configured for maximum throughput.",
        ],
        hungry: [
            "Please... just one more <bean> tag...",
            "My stomach.xml is empty!",
            "ERROR: FeedNotFoundException",
            "I'm so hungry I could eat a pom.xml...",
            "Is that... a Spring configuration file? *drools*",
        ],
        happy: [
            "BUILD SUCCESSFUL in 0.3s! Neigh!",
            "All tests passing! Life is beautiful!",
            "I feel like I could deploy to production twice!",
            "My beans are perfectly autowired!",
            "Zero exceptions today! A new record!",
        ],
        sad: [
            "Another deployment failed... another dream shattered.",
            "I've seen things... terrible XML schemas...",
            "The Jenkins pipeline... it haunts me.",
            "Why do they keep using Java 8?",
            "My soul is a deprecated API.",
        ],
        sick: [
            "NullPointerException... in my heart...",
            "*coughs up a stack trace*",
            "I think I caught a ClassNotFoundException...",
            "Help... my garbage collector isn't collecting...",
            "The heap... it overflows...",
        ],
    };

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function init() {
        ponyContainer = document.getElementById('pony-display');
        statsContainer = document.getElementById('pony-stats');
        actionsContainer = document.getElementById('pony-actions');
        eventLog = document.getElementById('event-log');
        poopContainer = document.getElementById('poop-container');
        dialogueBubble = document.getElementById('dialogue-bubble');

        setupActions();
        setupEventListeners();
        startDialogueLoop();

        // Auto-save every 30 seconds
        autoSaveInterval = setInterval(() => {
            if (Game.getState() === Game.STATES.CARE) {
                Game.save();
            }
        }, 30000);
    }

    function setupActions() {
        if (!actionsContainer) return;
        actionsContainer.innerHTML = `
            <button class="action-btn feed-btn" onclick="PonyCare.feed()">
                <span class="btn-prompt">&gt;</span> feed --xml beans.xml
            </button>
            <button class="action-btn groom-btn" onclick="PonyCare.groom()">
                <span class="btn-prompt">&gt;</span> mvn clean groom
            </button>
            <button class="action-btn play-btn" onclick="PonyCare.play()">
                <span class="btn-prompt">&gt;</span> java -jar play.jar
            </button>
            <button class="action-btn heal-btn" onclick="PonyCare.heal()">
                <span class="btn-prompt">&gt;</span> try { heal(); } catch(e) {}
            </button>
            <button class="action-btn deploy-btn" onclick="PonyCare.startRide()">
                <span class="btn-prompt">&gt;</span> deploy --env production
            </button>
            <button class="action-btn minigame-btn" onclick="PonyCare.startMiniGame()">
                <span class="btn-prompt">&gt;</span> mvn deploy:war
            </button>
        `;
    }

    function setupEventListeners() {
        Game.on('statChange', updateStats);
        Game.on('randomEvent', showRandomEvent);
        Game.on('exception', showException);
        Game.on('gameStart', () => {
            updatePonyDisplay();
            updateStats();
        });
        Game.on('stateChange', ({ to }) => {
            if (to === Game.STATES.CARE) {
                updatePonyDisplay();
                updateStats();
            }
        });
        Game.on('levelUp', ({ level }) => {
            logEvent(`LEVEL UP! Your pony reached Enterprise Level ${level}!`, 'success');
            Audio.deploySuccess();
        });
    }

    function updatePonyDisplay() {
        if (!ponyContainer) return;
        const pony = Game.getPony();
        if (!pony) return;

        // Determine visual state
        if (pony.hunger < 20 || pony.energy < 20) currentPonyState = 'sick';
        else if (pony.happiness > 70 && pony.hunger > 50) currentPonyState = 'happy';
        else if (pony.happiness < 30) currentPonyState = 'sad';
        else currentPonyState = 'idle';

        ponyContainer.innerHTML = Art.pony(currentPonyState, 2.5);
    }

    function updateStats() {
        if (!statsContainer) return;
        const pony = Game.getPony();
        if (!pony) return;

        updatePonyDisplay();

        const statBar = (label, value, icon, color) => {
            const barColor = value < 25 ? Art.PALETTE.red : value < 50 ? Art.PALETTE.orange : color;
            const pulse = value < 25 ? 'pulse-warning' : '';
            return `<div class="stat-bar ${pulse}">
                <span class="stat-label">${icon} ${label}</span>
                <div class="stat-track">
                    <div class="stat-fill" style="width: ${value}%; background: ${barColor}"></div>
                </div>
                <span class="stat-value">${Math.round(value)}%</span>
            </div>`;
        };

        statsContainer.innerHTML = `
            <div class="pony-name">${escapeHtml(pony.name)}</div>
            <div class="pony-level">Enterprise Level ${pony.level} | XP: ${pony.xp}/${pony.level * 100}</div>
            ${statBar('Hunger (XML)', pony.hunger, '📄', Art.PALETTE.green)}
            ${statBar('Happiness (Deploys)', pony.happiness, '🚀', Art.PALETTE.cyan)}
            ${statBar('Cleanliness (Code Quality)', pony.cleanliness, '🧹', Art.PALETTE.purple)}
            ${statBar('Energy (Heap Memory)', pony.energy, '⚡', Art.PALETTE.orange)}
            <div class="deploy-stats">
                Deploys: ${Game.getTotalDeploys()} | Failed: ${Game.getFailedDeploys()} | Score: $${Game.getScore().toLocaleString()}
            </div>
            ${pony.exceptions.length > 0 ? `<div class="exception-list">
                <div class="exception-header">Active Exceptions:</div>
                ${pony.exceptions.slice(-3).map(e => `<div class="exception-item">⚠ ${escapeHtml(e.name)}</div>`).join('')}
            </div>` : ''}
        `;
    }

    function logEvent(text, type = 'info') {
        if (!eventLog) return;
        const entry = document.createElement('div');
        entry.className = `event-entry event-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
        eventLog.prepend(entry);

        // Keep only last 20 events
        while (eventLog.children.length > 20) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }

    function showRandomEvent(event) {
        logEvent(event.text, event.delta > 0 ? 'success' : 'warning');
        showDialogue(event.text);
    }

    function showException(data) {
        logEvent(`Exception caught: ${data.name}`, 'error');
        Audio.errorBuzz();
    }

    function showDialogue(text) {
        if (!dialogueBubble) return;
        dialogueBubble.textContent = text;
        dialogueBubble.classList.add('visible');
        setTimeout(() => dialogueBubble.classList.remove('visible'), 4000);
    }

    function startDialogueLoop() {
        setInterval(() => {
            if (Game.getState() !== Game.STATES.CARE) return;
            const pony = Game.getPony();
            if (!pony || !pony.alive) return;

            const pool = DIALOGUES[currentPonyState] || DIALOGUES.idle;
            showDialogue(pool[Math.floor(Math.random() * pool.length)]);
        }, 10000);
    }

    // ---- PONY ACTIONS ----
    function feed() {
        Audio.feedSound();
        Game.modifyStat('hunger', 20);
        Game.addXP(5);
        Game.addScore(10);
        logEvent('Fed pony a delicious <bean> configuration.', 'success');
        showDialogue('Mmm... well-formed XML... *munch munch*');
        spawnPoop();
        updatePonyDisplay();
    }

    function groom() {
        Audio.click();
        Game.modifyStat('cleanliness', 25);
        Game.addXP(5);
        Game.addScore(15);
        logEvent('Ran mvn clean on pony. Code quality improved!', 'success');
        showDialogue('Ahh... freshly refactored! No more code smells.');
        updatePonyDisplay();
    }

    function play() {
        Audio.whinny();
        Game.modifyStat('happiness', 15);
        Game.modifyStat('energy', -10);
        Game.addXP(10);
        Game.addScore(20);
        logEvent('Played java -jar play.jar. Pony is amused!', 'success');
        showDialogue('Wheee! Running in circles at O(n²) complexity!');
        updatePonyDisplay();
    }

    function heal() {
        const pony = Game.getPony();
        if (!pony) return;

        if (pony.exceptions.length === 0) {
            showDialogue("No exceptions to catch! I'm healthy!");
            logEvent('No exceptions to heal.', 'info');
            return;
        }

        Audio.collect();
        const healed = pony.exceptions.pop();
        Game.modifyStat('happiness', 10);
        Game.modifyStat('energy', 10);
        Game.addXP(15);
        logEvent(`Caught ${healed.name} with a try-catch block!`, 'success');
        showDialogue(`${healed.name} has been caught and handled!`);
        updateStats();
    }

    function spawnPoop() {
        if (!poopContainer) return;
        const poop = document.createElement('div');
        poop.className = 'pony-poop';
        poop.innerHTML = Art.stackTracePoop();
        poop.style.left = (30 + Math.random() * 40) + '%';
        poop.style.bottom = (5 + Math.random() * 15) + '%';
        poop.onclick = () => {
            poop.classList.add('poof');
            Audio.click();
            Game.modifyStat('cleanliness', 5);
            logEvent('Cleaned up a stack trace. Gross.', 'info');
            setTimeout(() => poop.remove(), 300);
        };
        poopContainer.appendChild(poop);
        poops.push(poop);

        // Max 5 poops
        while (poops.length > 5) {
            const old = poops.shift();
            if (old.parentNode) old.remove();
        }
    }

    function startRide() {
        Audio.click();
        const pony = Game.getPony();
        if (pony && pony.energy < 20) {
            showDialogue("Too tired to ride... Need more heap memory...");
            logEvent('Pony too exhausted to ride. Feed and rest first!', 'warning');
            return;
        }
        logEvent('Deploying to production... Entering the server caverns!', 'info');
        Game.save();
        Game.setState(Game.STATES.RIDE);
        PonyRide.start();
    }

    function startMiniGame() {
        Audio.click();
        logEvent('Starting deployment mini-game...', 'info');
        Game.save();
        Game.setState(Game.STATES.DEPLOY_MINIGAME);
        DeployGames.startRandom();
    }

    return {
        init,
        feed,
        groom,
        play,
        heal,
        startRide,
        startMiniGame,
        updateStats,
        updatePonyDisplay,
        logEvent,
    };
})();
