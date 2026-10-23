# CRYSTALBOUND: THE QUEST BEGINS

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**CRYSTALBOUND: THE QUEST BEGINS** is an original, 2D fantasy adventure game built with React, TypeScript, HTML5 Canvas, and Web Audio API.

Explore the forgotten realm of **Aetherfall**, gather sacred elemental crystals, avoid moving hazards and dangerous obstacles, unlock ancient portals, and restore the legendary **Crystal Heart** across 10 distinct worlds and 100 handcrafted levels.

---

## 🌟 Key Features

- **10 Mythical Worlds & 100 Playable Levels**:
  1. *Whispering Woods* (Levels 1–10)
  2. *The Ancient Ruins* (Levels 11–20)
  3. *Crystal Caverns* (Levels 21–30)
  4. *The Skybound Isles* (Levels 31–40)
  5. *Emberland* (Levels 41–50)
  6. *Frostfall Kingdom* (Levels 51–60)
  7. *Shadowforge* (Levels 61–70)
  8. *The Forgotten Kingdom* (Levels 71–80)
  9. *Celestial Frontier* (Levels 81–90)
  10. *The Eternal Crystal* (Levels 91–100)
- **Fluid 2D Gameplay & Physics**:
  - Smooth 60 FPS HTML5 Canvas engine with camera following and dynamic zooming.
  - Axis-separated bounding box collision with wall sliding for responsive controls.
  - Dangerous obstacle collision detection that ends attempts with clean reset mechanics.
- **Dynamic Procedural World Generator**:
  - Deterministic PRNG ensuring every realm is uniquely configured yet reachable.
  - Breadth-First Search (BFS) grid validation verifying reachability for every crystal and portal.
- **Synthesized Audio Engine**:
  - Pure Web Audio API procedural synthesizer for ambient chords, crystal arpeggios, portal chimes, and hazard SFX without external audio asset dependencies.
- **Progression & Save System**:
  - Automatic `localStorage` persistence tracking unlocked levels, best times, high scores, and achievements.
  - Three difficulty settings: *Easy*, *Normal*, and *Hard* with balanced time limits, health, and score multipliers.
  - Accessibility settings including *Reduced Motion* and customizable audio controls.
- **Responsive Controls**:
  - Keyboard: `WASD` or Arrow Keys to move; `P` or `Esc` to pause.
  - Touch/Mobile: On-screen virtual D-Pad and pause button.

---

## 🎮 How to Play

1. **Move**: Use `W`, `A`, `S`, `D` or the Arrow Keys (or virtual D-Pad on touch devices) to guide your adventurer.
2. **Collect**: Gather all glowing elemental crystals scattered across the map.
3. **Avoid**: Dodge moving sentinels, magma surges, frost vortexes, and dangerous obstacles. Hitting a dangerous obstacle or hazard ends the attempt.
4. **Escape**: Once all crystals are collected, the sealed exit portal unlocks. Reach the portal before the countdown timer expires!
5. **Progress**: Earn time bonuses and level clear points to restore the Crystal Heart.

---

## 🚀 Quick Start & Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `bun`

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/crystalbound-the-quest-begins.git

# Navigate into the project directory
cd crystalbound-the-quest-begins

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Automated Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

The production output is generated in the `dist/` directory, ready to deploy to GitHub Pages, Vercel, Netlify, or any static host.

### Previewing the Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
├── src/
│   ├── audio/              # Web Audio procedural sound synthesizer
│   ├── components/         # React UI modals, HUD, Canvas, and controls
│   ├── data/               # World definitions and level configurations
│   ├── engine/             # Physics, collision detection, renderer, & generator
│   ├── hooks/              # Save data and localStorage persistence hooks
│   ├── types/              # Game TypeScript interfaces and scoring constants
│   ├── App.tsx             # Main game lifecycle manager and state router
│   ├── index.css           # Global Tailwind CSS styles
│   └── main.tsx            # React application entry point
├── tests/                  # 22-suite automated regression test runner
├── index.html              # HTML entry point with metadata and favicon
├── vite.config.ts          # Vite configuration with relative base path
└── package.json            # Project manifest and scripts
```

---

## 📜 License

Apache-2.0
