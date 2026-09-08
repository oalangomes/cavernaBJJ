# Caverna BJJ

**A lightweight, offline-first workout PWA built around a real training use case.**

Caverna BJJ started as a personal tool for generating varied conditioning workouts around Brazilian Jiu-Jitsu training. It deliberately avoids a backend, accounts, cloud infrastructure, and unnecessary framework complexity.

The result is a small browser application that works offline, stores data locally, generates workouts from user preferences and recent history, and can be installed as a PWA.

## Why this project exists

Training plans are useful only if they are easy to use consistently.

For this project, the engineering goal was not to build a fitness platform. It was to make a small tool that:

- works on a phone;
- keeps working without internet access;
- remembers profile and workout history;
- avoids excessive exercise repetition;
- adapts suggestions to available equipment and training context;
- remains simple to run and maintain.

## Core capabilities

- personalized profile with training locations, equipment and goals;
- workout generation based on exercise metadata and recent history;
- cooldown logic to reduce repetitive muscle-group selection;
- configurable workout duration and intensity;
- interactive workout checklist;
- local workout history;
- CSV export;
- progress summaries such as training days and streaks;
- exercise descriptions and video references;
- low-intensity return/beginner mode;
- installable offline PWA.

## Architecture

```text
browser
   │
   ├── profile + workout history
   │        └── localStorage
   │
   ├── workout generation
   │        ├── app.js
   │        └── exercise dataset
   │
   └── offline shell
            ├── manifest.json
            └── service worker
```

The application is intentionally **local-first**.

There is no application server or remote database in the core product. User state is persisted in `localStorage`, while the service worker caches the static application shell for offline use.

This keeps deployment and operation simple and makes the trade-off explicit: data stays on the device, but there is no cross-device synchronization.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- `localStorage`
- Web App Manifest
- Service Worker
- Jest + jsdom
- GitHub Actions

## Project structure

```text
cavernaBJJ/
├── index.html
├── app.js
├── dados.js
├── exercicios.json
├── style.css
├── manifest.json
├── sw.js
├── __tests__/
└── .github/workflows/test.yml
```

## Run locally

There is no application build step.

Clone the repository and serve the directory with any local static server. For example:

```bash
git clone https://github.com/oalangomes/cavernaBJJ.git
cd cavernaBJJ
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

A local HTTP server is recommended because PWA/service-worker behavior is not reliably exercised by opening `index.html` directly from the filesystem.

## Tests

Install the development dependencies and run:

```bash
npm install
npm test
```

The Jest suite uses `jsdom` to exercise browser-oriented behavior such as workout state and `localStorage` persistence.

GitHub Actions runs the test suite on pushes and pull requests.

## Design decisions

### No backend by default

The product does not need authentication, server-side persistence, queues, or APIs to solve its core problem. Keeping those out reduces cost, failure modes and maintenance.

### Vanilla JavaScript

The application remains small enough that a framework would add more operational and dependency surface than product value.

### Offline-first

The workout flow should remain available in places with poor connectivity. Static assets are cached by the service worker and user state remains on the device.

### Heuristics instead of pretending to be AI

Workout suggestions are produced by explicit application rules and exercise metadata. The project does not label deterministic heuristics as artificial intelligence.

## Limitations

- no account or cloud synchronization;
- browser storage can be cleared by the user or browser;
- no server-side backup;
- workout generation is heuristic, not a physiological optimization model;
- exercise content and videos require manual maintenance;
- the project is a training utility, not medical or rehabilitation guidance.

## Screenshots

| Workout | Exercise detail | History |
|---|---|---|
| ![Workout](screens/treino.png) | ![Exercise detail](screens/modal.png) | ![History](screens/historico.png) |

## License

MIT. See [LICENSE](LICENSE).

## Author

**Alan Gomes**

Built from a real personal use case as an exercise in keeping product scope and architecture proportional to the problem.
