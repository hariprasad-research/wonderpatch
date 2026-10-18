# WonderPatch

A responsive, paper-craft-inspired family creativity game. This is a complete static web application designed to run in a browser, including on Android.

## Features

- Responsive home, player setup, garden, discovery book, and settings screens.
- Shared-device turn-taking for 1–4 players.
- Mission mode and free-create mode.
- Place and select objects in the garden.
- Ten hand-authored object-combination reactions.
- Discovery collection and mission progress.
- Undo and clear garden objects.
- Local progress persistence with `localStorage`.
- Export/import save backups as JSON.
- Sound effects toggle, reduced motion, large text.
- Installable web-app manifest and basic service-worker caching.
- No external runtime libraries, backend, account, or API keys required.

## Run locally

### Option A: Python

Python 3 is often already available on Windows.

```powershell
python -m http.server 8080
```

Open `http://localhost:8080`.

### Option B: Node.js

Install Node.js 18 or later, then run:

```bash
npm start
```

Open `http://localhost:8080`.

Do not open `index.html` directly from the file system if you want service-worker/offline features. Use a local HTTP server.

## GitHub Codespaces

1. Create a GitHub repository named `wonderpatch`.
2. Upload/push all project files to the repository.
3. Open **Code → Codespaces → Create codespace on main**.
4. In the terminal run `python -m http.server 8080`.
5. Open the forwarded port 8080 in the Codespaces Ports panel.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Choose the framework preset **Other**.
4. Leave Build Command and Output Directory empty; this is a static site.
5. Deploy.

You can also deploy with the Vercel CLI, if installed:

```bash
vercel
```

## Install on Android

Deploy to an HTTPS host such as Vercel, then open the site in Chrome on Android. Use the browser menu's **Install app** or **Add to Home screen** option if available.

This project is a browser/PWA game, not a Unity project and not a native APK/AAB. Native packaging can be added later with an appropriate wrapper such as Capacitor, but that requires additional setup and Android build tooling.

## Save data and privacy

- Progress is stored locally in the current browser profile under `wonderpatch-save-v1`.
- There is no backend, login, analytics, or network gameplay.
- Browser data clearing can remove progress. Use **Settings → Export save** for a backup.
- Import only save files you trust.
- Online multiplayer and cloud sync are not included.

## Controls

1. Select an object from the object basket.
2. Tap/click an open part of the garden to place it.
3. Tap two placed objects to select them.
4. Press **Try it!** to trigger a known reaction.
5. In mission mode, discover a reaction that matches the current goal.
6. Use Free Create for relaxed placement and experimentation.

Some combinations intentionally have no special reaction. Try different pairs. Existing discoveries can be found in the Discovery Book.

## Project structure

```text
wonderpatch/
├── index.html
├── styles.css
├── game.js
├── manifest.webmanifest
├── sw.js
├── package.json
├── vercel.json
├── .gitignore
├── README.md
└── assets/
    └── favicon.svg
```

## Development checks

With Node.js installed:

```bash
npm run check
```

The app uses standard browser APIs and does not require dependency installation.
