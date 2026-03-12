// ============================================================
// game.js — Core Game Engine for Deploy Pony: Enterprise Nightmares
// State machine, pony stats, save/load, transitions
// ============================================================

const Game = (() => {
    // ---- GAME STATES ----
    const STATES = {
        LOADING: 'LOADING',
        MENU: 'MENU',
        CARE: 'CARE',
        RIDE: 'RIDE',
        DEPLOY_MINIGAME: 'DEPLOY_MINIGAME',
        GAME_OVER: 'GAME_OVER',
    };

    const PONY_NAMES = [
        'AbstractSingletonProxyFactoryBean',
        'DefaultBeanFactoryPostProcessor',
        'TransactionalProxyFactoryBean',
        'SimpleManagedConnectionFactory',
        'AnnotationConfigApplicationContext',
        'DelegatingFilterProxy',
    ];

    const LORE = [
        "In the dark caverns beneath the Data Center, a pony stirs...",
        "It has been 47 sprints since the last successful deployment.",
        "The XML configs grow restless. The ClassPath hungers.",
        "Only you, DevOps Knight, can save AbstractSingletonProxyFactoryBean.",
        "Mount your pony. Configure your beans. Deploy to production.",
        "May your heap never overflow.",
    ];

    const DEATH_MESSAGES = [
        "Your pony threw an uncaught exception and has been garbage collected.",
        "Application server has stopped responding. Have you tried turning your pony off and on again?",
        "Fatal: AbstractSingletonProxyFactoryBean has encountered a segfault in the hay module.",
        "BUILD FAILED. Your pony could not resolve dependency: love:love:LATEST.",
        "java.lang.PonyStarvedException: No XML beans found in classpath.",
        "CRITICAL: Pony heap space exhausted. Too many stack traces consumed.",
    ];

    const RANDOM_EVENTS = [
        { text: "A wild ConcurrentModificationException appeared!", stat: 'happiness', delta: -10 },
        { text: "Someone pushed to main without a PR! Pony is stressed.", stat: 'happiness', delta: -8 },
        { text: "Free donuts in the break room! Pony found a Spring Bean.", stat: 'hunger', delta: 15 },
        { text: "Jenkins build passed on first try! A miracle!", stat: 'happiness', delta: 20 },
        { text: "JIRA ticket assigned: Refactor legacy pony grooming module.", stat: 'cleanliness', delta: -12 },
        { text: "Memory leak detected in pony's dream subsystem.", stat: 'energy', delta: -15 },
        { text: "New Gradle plugin available: pony-care-optimizer v0.0.1-SNAPSHOT", stat: 'happiness', delta: 5 },
        { text: "Friday deploy detected. Pony judges you silently.", stat: 'happiness', delta: -5 },
        { text: "Hot-fix deployed successfully! Pony does a little dance.", stat: 'happiness', delta: 15 },
        { text: "OutOfMemoryError in the barn. Pony needs more -Xmx.", stat: 'energy', delta: -20 },
    ];

    let currentState = STATES.LOADING;
    let pony = null;
    let score = 0;
    let totalDeploys = 0;
    let failedDeploys = 0;
    let listeners = {};
    let statDecayInterval = null;
    let randomEventInterval = null;
    let lastEventText = '';

    // ---- PONY STATE ----
    function createPony(name) {
        return {
            name: name || PONY_NAMES[Math.floor(Math.random() * PONY_NAMES.length)],
            hunger: 70,
            happiness: 60,
            cleanliness: 80,
            energy: 75,
            level: 1,
            xp: 0,
            exceptions: [],
            alive: true,
        };
    }

    // ---- EVENT SYSTEM ----
    function on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
    }

    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(cb => cb(data));
        }
    }

    // ---- STATE TRANSITIONS ----
    function setState(newState) {
        const oldState = currentState;
        currentState = newState;
        emit('stateChange', { from: oldState, to: newState });

        // Show/hide screens
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        const screenId = {
            [STATES.LOADING]: 'loading-screen',
            [STATES.MENU]: 'menu-screen',
            [STATES.CARE]: 'care-screen',
            [STATES.RIDE]: 'ride-screen',
            [STATES.DEPLOY_MINIGAME]: 'deploy-screen',
            [STATES.GAME_OVER]: 'gameover-screen',
        }[newState];

        if (screenId) {
            const el = document.getElementById(screenId);
            if (el) {
                setTimeout(() => el.classList.add('active'), 50);
            }
        }
    }

    // ---- STAT MANAGEMENT ----
    function modifyStat(stat, delta) {
        if (!pony || !pony.alive) return;
        pony[stat] = Math.max(0, Math.min(100, pony[stat] + delta));

        // Check death conditions
        if (pony.hunger <= 0 || pony.happiness <= 0 || pony.energy <= 0) {
            pony.alive = false;
            emit('ponyDied', { cause: stat });
            setState(STATES.GAME_OVER);
        }

        emit('statChange', { stat, value: pony[stat], delta });
    }

    function addXP(amount) {
        if (!pony) return;
        pony.xp += amount;
        const xpNeeded = pony.level * 100;
        if (pony.xp >= xpNeeded) {
            pony.xp -= xpNeeded;
            pony.level++;
            emit('levelUp', { level: pony.level });
        }
    }

    function addException(name) {
        if (!pony) return;
        pony.exceptions.push({ name, time: Date.now() });
        if (pony.exceptions.length > 10) pony.exceptions.shift();
        modifyStat('happiness', -5);
        emit('exception', { name });
    }

    // ---- STAT DECAY ----
    function startStatDecay() {
        if (statDecayInterval) clearInterval(statDecayInterval);
        statDecayInterval = setInterval(() => {
            if (currentState === STATES.CARE && pony && pony.alive) {
                modifyStat('hunger', -2);
                modifyStat('cleanliness', -1);
                modifyStat('energy', -1);
                if (Math.random() < 0.05) {
                    modifyStat('happiness', -3);
                }
            }
        }, 3000);
    }

    function startRandomEvents() {
        if (randomEventInterval) clearInterval(randomEventInterval);
        randomEventInterval = setInterval(() => {
            if (currentState === STATES.CARE && pony && pony.alive && Math.random() < 0.3) {
                const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
                modifyStat(event.stat, event.delta);
                lastEventText = event.text;
                emit('randomEvent', event);
            }
        }, 8000);
    }

    // ---- SAVE / LOAD ----
    function save() {
        if (!pony) return;
        const data = {
            pony,
            score,
            totalDeploys,
            failedDeploys,
            savedAt: Date.now(),
        };
        localStorage.setItem('deployPonySave_classic', JSON.stringify(data));
    }

    function load() {
        const raw = localStorage.getItem('deployPonySave_classic');
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            pony = data.pony;
            score = data.score || 0;
            totalDeploys = data.totalDeploys || 0;
            failedDeploys = data.failedDeploys || 0;
            return true;
        } catch {
            return false;
        }
    }

    function clearSave() {
        localStorage.removeItem('deployPonySave_classic');
    }

    // ---- INITIALIZATION ----
    function init() {
        // Show loading screen
        setState(STATES.LOADING);

        // Fake loading messages
        const loadingEl = document.getElementById('loading-text');
        const messages = [
            'Initializing AbstractSingletonProxyFactoryBean...',
            'Resolving 847 Maven dependencies...',
            'Downloading the internet...',
            'Configuring XML namespaces...',
            'Warming up the JVM...',
            'Allocating heap space for pony emotions...',
            'Scanning classpath for carrots...',
            'Deploying pony-care-service-2.3.1-SNAPSHOT.war...',
            'Please wait 6-8 business sprints...',
        ];

        let msgIndex = 0;
        const loadingInterval = setInterval(() => {
            if (loadingEl) {
                loadingEl.textContent = messages[msgIndex % messages.length];
            }
            msgIndex++;
        }, 600);

        // Transition to menu after loading
        setTimeout(() => {
            clearInterval(loadingInterval);
            setState(STATES.MENU);
        }, 4000);
    }

    function startNewGame() {
        pony = createPony();
        score = 0;
        totalDeploys = 0;
        failedDeploys = 0;
        startStatDecay();
        startRandomEvents();
        setState(STATES.CARE);
        emit('gameStart', { pony });
        Audio.init();
        Audio.startAmbient();
    }

    function continueGame() {
        if (load()) {
            startStatDecay();
            startRandomEvents();
            setState(STATES.CARE);
            emit('gameStart', { pony });
            Audio.init();
            Audio.startAmbient();
        } else {
            startNewGame();
        }
    }

    function restartGame() {
        clearSave();
        startNewGame();
    }

    function getDeathMessage() {
        return DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
    }

    function getLore() {
        return LORE;
    }

    return {
        STATES,
        init,
        startNewGame,
        continueGame,
        restartGame,
        setState,
        getState: () => currentState,
        getPony: () => pony,
        getScore: () => score,
        setScore: (s) => { score = s; },
        addScore: (s) => { score += s; },
        getTotalDeploys: () => totalDeploys,
        incrementDeploys: () => { totalDeploys++; },
        incrementFailedDeploys: () => { failedDeploys++; },
        getFailedDeploys: () => failedDeploys,
        modifyStat,
        addXP,
        addException,
        save,
        load,
        on,
        emit,
        getDeathMessage,
        getLore,
        getLastEvent: () => lastEventText,
        PONY_NAMES,
    };
})();
