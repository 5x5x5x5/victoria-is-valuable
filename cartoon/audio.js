// ============================================================
// audio.js — Procedural Audio for Deploy Pony: Enterprise Nightmares
// All sounds generated via Web Audio API — no external files
// ============================================================

const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let ambientOsc = null;
    let ambientGain = null;
    let muted = false;

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(ctx.destination);
    }

    function ensureContext() {
        if (!ctx) init();
        if (ctx.state === 'suspended') ctx.resume();
    }

    function toggleMute() {
        muted = !muted;
        if (masterGain) masterGain.gain.value = muted ? 0 : 0.3;
        return muted;
    }

    // ---- Dark ambient drone ----
    function startAmbient() {
        ensureContext();
        if (ambientOsc) return;

        ambientGain = ctx.createGain();
        ambientGain.gain.value = 0.08;
        ambientGain.connect(masterGain);

        // Low drone
        ambientOsc = ctx.createOscillator();
        ambientOsc.type = 'sawtooth';
        ambientOsc.frequency.value = 55;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 5;

        // Slow LFO for eerie movement
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        ambientOsc.connect(filter);
        filter.connect(ambientGain);
        ambientOsc.start();

        // Second layer — higher hum
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 110;
        const gain2 = ctx.createGain();
        gain2.gain.value = 0.03;
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start();
    }

    function stopAmbient() {
        if (ambientOsc) {
            ambientOsc.stop();
            ambientOsc = null;
        }
    }

    // ---- Clip-clop hoofbeats ----
    function clipClop() {
        ensureContext();
        const now = ctx.currentTime;

        [0, 0.15].forEach(offset => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 800 + Math.random() * 400;
            gain.gain.setValueAtTime(0.1, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + offset);
            osc.stop(now + offset + 0.06);
        });
    }

    // ---- Feed sound (munching XML) ----
    function feedSound() {
        ensureContext();
        const now = ctx.currentTime;

        for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 200 + Math.random() * 100;
            gain.gain.setValueAtTime(0.08, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.08);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.1);
        }
    }

    // ---- Error buzz ----
    function errorBuzz() {
        ensureContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 80;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // ---- Deploy success jingle ----
    function deploySuccess() {
        ensureContext();
        const now = ctx.currentTime;
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.35);
        });
    }

    // ---- Deploy fail sad trombone ----
    function deployFail() {
        ensureContext();
        const now = ctx.currentTime;
        const notes = [392, 370, 349, 220]; // G4 F#4 F4 A3

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, now + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.4);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.3);
            osc.stop(now + i * 0.3 + 0.45);
        });
    }

    // ---- Jump sound ----
    function jump() {
        ensureContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // ---- Collect item sparkle ----
    function collect() {
        ensureContext();
        const now = ctx.currentTime;

        [880, 1100, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.06, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.2);
        });
    }

    // ---- UI click ----
    function click() {
        ensureContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    // ---- Pony happy whinny ----
    function whinny() {
        ensureContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.2);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.65);
    }

    // ---- Boss warning ----
    function bossWarning() {
        ensureContext();
        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 150;
            gain.gain.setValueAtTime(0.12, now + i * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + 0.3);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.4);
            osc.stop(now + i * 0.4 + 0.35);
        }
    }

    // ---- Catapult launch ----
    function catapultLaunch() {
        ensureContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    return {
        init,
        toggleMute,
        startAmbient,
        stopAmbient,
        clipClop,
        feedSound,
        errorBuzz,
        deploySuccess,
        deployFail,
        jump,
        collect,
        click,
        whinny,
        bossWarning,
        catapultLaunch,
    };
})();
