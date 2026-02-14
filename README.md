# 🇧🇩 GeoQuizBD — Bangladesh District Quiz

An interactive map-based quiz app to learn and test all **64 districts of Bangladesh**.

Built with **React + TypeScript + Vite + Tailwind CSS** and optimized for both mobile and desktop map interactions (pinch zoom, drag pan, study mode labels, and quiz flow).

## 🌐 Live Demo

**Vercel:** https://geoquizbd.vercel.app

## ✨ Features

- 🗺️ Interactive Bangladesh district SVG map
- 📖 Study mode with district labels
- 🎯 Quiz mode with score tracking and progress bar
- 🔍 Division highlighting/filtering
- 🤏 Pinch-to-zoom + drag-to-pan on touch devices
- 🖱️ Mouse wheel zoom + drag pan on desktop
- ✅ Correct/wrong answer feedback with map highlights
- 📊 End-of-quiz summary + quick stats

## 🧱 Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`)
- **Linting:** ESLint 9 + TypeScript ESLint + React Hooks plugin
- **Deployment:** Vercel

## 📁 Project Structure

```text
bd-map-2/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ data/
│  │  └─ districts.ts                # Auto-generated district geometry + metadata
│  ├─ features/
│  │  └─ game/
│  │     └─ screens/
│  │        ├─ MenuScreen.tsx
│  │        ├─ StudyScreen.tsx
│  │        ├─ QuizScreen.tsx
│  │        └─ index.ts
│  ├─ App.tsx                        # App shell + mode orchestration
│  ├─ BangladeshMap.tsx              # Reusable map component (zoom/pan/interactions)
│  ├─ useGameState.ts                # Core quiz/study state machine
│  ├─ main.tsx
│  └─ index.css
├─ bd_districts_temp.json            # Raw source geometry (large)
├─ process-geojson.cjs               # One-off script to generate src/data/districts.ts
├─ vite.config.ts
├─ eslint.config.js
├─ tsconfig*.json
└─ package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js **20.19+** (recommended for Vite 7)
- npm

### Installation

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🧠 Architecture Notes

The app currently uses a mode-driven single-page flow (`menu`, `study`, `quiz`, `result`) managed by `useGameState`.

To keep the codebase scalable for future multi-page plans:

- `App.tsx` now acts as a lightweight shell/orchestrator.
- Feature UI is grouped under `src/features/game/screens`.
- The map logic is isolated in `BangladeshMap.tsx`, making it reusable in upcoming pages (e.g., district info pages, additional quiz types).

When routing is introduced later (e.g., React Router), these screens can be promoted to route-level pages with minimal rework.

## 🗺️ Data Pipeline

District map data is generated from raw geometry:

- **Input:** `bd_districts_temp.json`
- **Generator:** `process-geojson.cjs`
- **Output:** `src/data/districts.ts`

The generator projects coordinates, simplifies paths, computes centroids, and embeds division colors + Bengali names.

## 📌 Current Modes

- **Menu:** Start quiz or study mode
- **Study:** Explore all districts with labels and division filter
- **Quiz:** Identify requested district on map
- **Result:** Instant answer feedback and final summary

## 🛣️ Roadmap

- [ ] Add route-based multi-page navigation
- [ ] Add district detail pages (history, division, map facts)
- [ ] Add multiple quiz variants (division quiz, timed mode, reverse quiz)
- [ ] Add persistent stats/history (local storage or backend)
- [ ] Add accessibility pass (keyboard map navigation + ARIA improvements)

## 🤝 Contributing

Contributions, ideas, and issue reports are welcome.

If you open a PR, please:

1. Keep behavior unchanged unless the change is intentional.
2. Run lint/build locally.
3. Keep UI responsive on mobile and desktop.

## 📄 License

This project is currently unlicensed. Add a `LICENSE` file if you want to define usage rights explicitly.
