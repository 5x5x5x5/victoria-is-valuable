# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Deploy Pony: Enterprise Nightmares" — a browser game satirizing Java enterprise development (Tamagotchi-style pony care + deployment mini-games). Pure static HTML/CSS/vanilla JS: no package.json, no build step, no tests, no dependencies, no external assets (art is generated SVG, audio is procedural Web Audio API).

## Running it

Serve the repo root with any static server and open in a browser:

```
python3 -m http.server 8000
```

Root `index.html` is a landing page linking to the two game versions at `classic/` and `cartoon/`. Each version is fully self-contained — you can also open `classic/index.html` directly.

Deployment: pushes to `main`/`master` publish the whole repo to GitHub Pages via `.github/workflows/deploy.yml`. There is no CI beyond that — no lint or test gates.

## Architecture

Two parallel implementations of the same game with different aesthetics:

- `classic/` — dark Hollow Knight-inspired theme
- `cartoon/` — bright pastel reskin

They share identical structure and module APIs but **every file differs except `audio.js`, which is byte-identical** (palettes, copy/flavor text, physics tuning). A gameplay/logic change usually needs to be applied to both directories, keeping each version's tone; a purely cosmetic change belongs to one.

Within each version, plain `<script>` tags load IIFE modules that communicate as globals (no ES modules, no imports):

- `game.js` — `Game`: core engine. State machine (`LOADING → MENU → CARE ⇄ RIDE / DEPLOY_MINIGAME → GAME_OVER`), pony stats (hunger/happiness/cleanliness/energy, death when one hits 0), XP/levels, score, stat-decay and random-event timers, save/load to localStorage (key `deployPonySave_classic` / `deployPonySave_cartoon`), and a simple `on`/`emit` event bus other modules subscribe to (`stateChange`, `statChange`, `gameStart`, `ponyDied`, etc.). Screens are `.game-screen` divs in `index.html` toggled by `Game.setState()`.
- `pony-care.js` — `PonyCare`: Tamagotchi hub screen; its action buttons transition into the other modes (`PonyRide.start()`, `DeployGames.startRandom()`).
- `pony-ride.js` — `PonyRide`: canvas side-scrolling runner.
- `deploy-games.js` — `DeployGames`: four mini-games (catapult, xmlPuzzle, dependencyHell, theBuild).
- `art.js` — `Art`: all SVG art generation from a `PALETTE` constant (this is where each version's visual identity lives).
- `audio.js` — `Audio`: procedural sound; note it shadows the browser's native `window.Audio` constructor.

Bootstrapping and menu/game-over screen wiring live in an inline `<script>` at the bottom of each version's `index.html`, not in a JS file.

## Conventions

- Keep the joke: all user-facing text is Java/enterprise-dev satire (Spring bean names, Maven/Gradle/Jenkins/JIRA references). Classic is deadpan-gloomy, cartoon is saccharine with emoji.
- New code should follow the existing pattern: one IIFE per module returning a public API object, registered as a global, wired through `Game`'s event bus and state machine.
