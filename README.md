# WonderPatch Stage 1 — Top-down 3D paper kart prototype

## Scope
This replaces the turn-based WonderPatch gameplay with a single-player 3D paper-craft racing prototype. It is not multiplayer yet. Three.js is loaded from jsDelivr, so the browser needs internet access to fetch the engine.

## Files
- `index.html`: page and HUD
- `styles.css`: responsive layout and touch controls
- `game.js`: Three.js scene, kart movement, track, checkpoints, tokens and lap logic

## Apply in Codespaces
1. Open the existing WonderPatch repository.
2. Commit/stash current changes before replacing files.
3. Copy these four files into the repository root, replacing the matching `index.html`, `styles.css`, `game.js`, and `README.md`.
4. From the repository root, run `python3 -m http.server 8080`.
5. In the Codespaces **Ports** tab, open port 8080.
6. Use WASD/arrow keys. Space consumes a boost after collecting a token. Mobile has touch buttons.
7. Restart race resets the timer, laps and tokens.

## Current limits
Single player only; no AI, sound, saved best time, multiplayer, accounts, room codes or public matchmaking. The infield ramp is decorative. Track and island collision use simple boundary checks, not a full physics engine. Test lap progression and handling in your browser before building multiplayer.
