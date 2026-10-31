# 🚚 Midnight Delivery — Voxel World Tour

> **Digit7 Jam 2026 (Myanmar HTML5 Arcade Game Tournament) — Official Submission**

[![HTML5](https://img.shields.io/badge/HTML5-Vanilla_JS-E34F26?logo=html5&logoColor=white)]()
[![Three.js](https://img.shields.io/badge/Three.js-r128_(Vendored_MIT)-000000?logo=three.js)]()
[![Tailwind CSS](https://img.shields.io/badge/Styles-Pre--Compiled_Tailwind-38BDF8?logo=tailwindcss)]()
[![Audio](https://img.shields.io/badge/Audio-Web_Audio_Synth_%2B_Dual_BGM-F59E0B)]()
[![Viewports](https://img.shields.io/badge/Viewports-Mobile_360x640_%7C_Desktop_1280x720-10B981)]()

---

## 📖 About the Game

**Midnight Delivery — Voxel World Tour** is a fast-paced, mobile-first and desktop-ready **3D arcade voxel courier runner** built for **Digit7 Jam 2026**. Players get behind the wheel of customizable courier vans and race down neon-lit midnight highways across **Yangon (ရန်ကုန်)** and vibrant world districts (**Tokyo**, **Chinatown**, **Little India**, and **Pastel Metro**).

Celebrating Myanmar street culture alongside an arcade world tour, the Yangon highway features golden pagoda silhouettes, Burmese tea shops (`လက်ဖက်ရည်ဆိုင်`), Mohinga noodle stalls (`မုန့်ဟင်းခါး`), and glowing Shwedagon-inspired (`ရွှေတိဂုံ`) landmarks. Every 3D vehicle, building, parcel, and character in the game is constructed procedurally in code using Three.js voxel geometry and object pooling for smooth, sustained 60 FPS gameplay without external 3D model downloads or build steps.

---

## 🎯 Objective

1. **Complete Roadside Deliveries Under Pressure:** Steer across a 4-lane highway while matching and throwing requested parcels from your **3-Slot Parcel Dock** to waiting roadside residents before passing their porch drop zone.
2. **Survive the Midnight Shift:** Protect your **3 Hearts** by dodging multi-lane traffic and crosswalk hazards, managing physical **Roof Cargo Stack** stability through low-clearance overpasses, surviving **Midnight Blackout** power outages, and out-delivering the rival **Shadow Express** courier van.
3. **Climb Courier Ranks & Upgrade Your Fleet:** Earn Score, Coins, and Courier XP to complete **Active Shift Contracts**, advance from **Level 1 (Yangon Rookie)** to **Level 5 (Digit7 Legend)**, unlock 6 playable rigs via **Garage Requisitions**, tune vehicle stats (**Engine**, **Suspension/Handling**, and **Chrono-Battery**), and collect 12 original parody items across 4 rarity tiers via **Courier Supply Drops**.

---

## 🎮 Gameplay & Controls

### Controls (Mobile Touch & Desktop Keyboard/Mouse)

The game is engineered for **one- or two-thumb mobile play** as well as snappy **desktop keyboard/mouse** play—including **simultaneous mid-swerve parcel delivery** while changing lanes:

| Action | Mobile / Touch (`360×640`+) | Desktop (`1280×720`+) |
| :--- | :--- | :--- |
| **Switch Lanes** | Swipe **Left** or **Right** anywhere on the road (1 discrete lane per swipe; instant mid-swerve reversal supported) | `A` / `D` or `←` / `→` Arrow Keys |
| **Instant Throw (3-Slot Dock)** | Tap any **Parcel Dock Card** at the bottom—or tap the resident's **Order Badge** directly (works simultaneously while swiping lanes) | Press `Q` / `1` (Left), `W` / `2` (Middle), `E` / `3` (Right), or click a card / order badge |
| **Tactical Slow-Mo Drag Aim** | Touch & hold a parcel card, drag to aim, release to throw | Click & hold a parcel card, drag to aim, release to throw |
| **Side-Ram Rival Van** | Swipe into the adjacent lane while alongside **Shadow Express** | Steer into the adjacent lane while alongside **Shadow Express** |
| **Pause & Settings** | Tap the top-right **Pause (`❚❚`)** button | Press `Escape` or click **Pause (`❚❚`)** |
| **Garage 3D Showroom Orbit** | Drag finger horizontally across the 3D showroom | Click & drag horizontally across the 3D showroom |

---

### Core Gameplay Mechanics

#### 1. 3-Slot Designated Parcel Matching & Modifiers
- **Smart Order Guarantee:** Whenever a roadside resident enters range, at least one of your 3 dock slots is guaranteed to hold their requested parcel, highlighted with a pulsing match indicator and floating key prompt (`[Q]`, `[W]`, or `[E]`).
- **Exact Order vs. Wrong Parcel:**
  - **🎯 Exact Order:** Awards **`2×` Points & Coins** and flips the resident badge to a green **`DELIVERED!`** confirmation.
  - **⚡ Sweet-Spot Drop:** Releasing when the roadside target ring pulses gold in the sweet spot grants a **Perfect Drop** bonus and extra coins.
  - **📦 Wrong Parcel:** Still completes at **`50%` Points & Coins** (`WRONG PARCEL!` badge) to keep arcade momentum flowing.
- **Special Parcel Modifiers:** Watch for **Hot / Timed** parcels (deliver before the countdown expires for bonus tips) and **Fragile** parcels (**`2.5×` intact payout**, shattered if you collide with traffic).

#### 2. Roof-Stacking Cargo Physics, Supply Depots & Overpasses (`scripts/cargo.js`)
- **Physical Roof Crates:** Every shift begins with **3 roof crates** (maximum capacity: **6**). Every parcel throw consumes 1 physical crate from the roof rack.
- **Score Multiplier vs. Sway Risk:** Carrying taller stacks boosts all delivery payouts (`0` crates: `×1.0` · `1–2` crates: `×1.5` · `3–4` crates: `×2.0` · `5–6` crates: `×3.0`), but rapid opposite-direction swerves build lateral sway—pushing sway danger past 100% tumbles your top crate onto the asphalt.
- **Supply Depots & Low Overpasses:** Drive through green **`SUPPLY / +2 CRATES`** arches to restock. When approaching **Low-Clearance Overpass** gantries, steer into the marked green **High-Clearance Safe Lane** or excess roof crates will be sheared off.

#### 3. Midnight Blackout Zones & Pit-Stop Repairs (`scripts/night.js`)
- **Power Grid Blackouts:** Periodic **14-second Midnight Blackout** events plunge the highway into darkness while building windows glow, residents ignite **red/gold SOS flares** with spark particles, and delivery destination badges switch to **high-contrast night-vision colors**.
- **Headlight Damage & Repair Pads:** Traffic impacts can damage a headlight beam; driving over a glowing blue **`🔧 PIT-STOP REPAIR`** pad restores full lighting and heals **+1 Heart**.

#### 4. Shadow Express Rival AI & Split-Road Route Forks (`scripts/rivals.js`)
- **Rival Delivery Races:** Roughly every 45 seconds, rival courier **Shadow Express** pulls alongside to race for active resident orders. Beat their throw to score **`⚡ SNIPED RIVAL! +500`**, or **side-ram** into their lane while side-by-side to stun them for 4 seconds and claim bonus roof crates.
- **Split-Road Route Gates:** Periodic highway forks offer a 20-second tactical choice:
  - **Left Gate — `EXPRESS SHORTCUT`:** Denser traffic and low bridges in exchange for **`2×` Coin payouts**.
  - **Right Gate — `SAFE BYPASS`:** Lighter traffic plus a guaranteed **Supply Depot** and **Pit-Stop Repair Pad**.

#### 5. Overdrive Fever, Near-Misses & Road Power-Ups
- **Traffic Near-Misses** and chained deliveries charge the **Overdrive Bar**. Reaching 100% triggers **Overdrive Fever** (boosted speed, temporary crash immunity, and `2×` score).
- Collect highway power-ups including **Drone Assist** (automated deliveries), **Coin Magnet**, and **Shield Bumper**.

---

## 🚀 How to Run the Game

**Midnight Delivery** requires **zero compilation or bundling** to play. Both [`index.html`](index.html) and [`midnight_delivery.html`](midnight_delivery.html) are byte-for-byte synchronized entry points.

### Option 1: Built-in Node.js Local Server (Recommended)
Requires **Node.js 18+** (uses only built-in Node core modules—no `npm install` needed just to play):

```bash
node server.js
# or
npm start
```

Open **`http://localhost:8080`** (or **`http://localhost:8080/midnight_delivery.html`**) in Chrome, Edge, Safari, or Firefox.
*(Note: If port `8080` is already in use, `server.js` automatically falls back to `8081`, `8082`, etc. and prints the active URL in the terminal.)*

### Option 2: Any Static Web Server or Direct File Open
You can serve the folder with any static file server (e.g., `python -m http.server 8080` or VS Code **Live Server**), or open `index.html` / `midnight_delivery.html` directly in a modern desktop browser.

### Option 3: Automated Verification, Layout & Stress Suite (Optional)
For reviewers who want to run the automated headless verification suite (static syntax/DOM/compliance checks, `CourierDB` storage unit tests, gameplay mechanics checks, and Playwright `1280×720` + `360×640` viewport layout & FPS audits):

```bash
# Install the single devDependency (playwright-core)
npm ci

# Run static checks + unit tests + desktop & mobile headless browser verification
npm test

# Run 1,000-throw & cargo-sway physics stress test
npm run test:stress

# Run 15-minute continuous memory & FPS soak test
npm run test:soak
```

*(If running `npm test` only for static & database checks without launching a headless browser, run `node tests/verify_build.js --static`.)*

---

## 🔍 What Reviewers Should Know

1. **True Mobile (`360×640`) & Desktop (`1280×720`) Responsiveness:**
   - Designed with zero horizontal overflow, non-clipping HUD/modals, enlarged mobile parcel dock cards, critically damped ($\zeta = 1.0$) lane-switching physics without camera jitter, and multi-touch support so mobile players can swipe lanes and tap deliveries simultaneously.
2. **Sustained 60 FPS & Leak-Free WebGL / Web Audio Memory Management:**
   - All common voxel geometries and materials are cached and shared globally (`scripts/voxels.js`).
   - Traffic vehicles (`trafficMeshPool`), fallen crates (`fallenCargoPool`), burst particles (capped at 60), and SOS flare sparks (capped at 120 vertices) are pre-allocated and recycled with zero mid-run WebGL allocation churn.
   - `SoundSystem` (`scripts/audio.js`) caps active Web Audio synthesis at **32 pooled voices** and disconnects every oscillator/gain node immediately on `onended`.
   - Frame delta time (`dt`) is strictly clamped (`0.001s`–`0.05s`) with finite-number guards across vehicle steering and parabolic parcel arcs.
3. **Crash-Resilient Local Persistence & Mid-Shift Session Recovery (`CourierDB`):**
   - All progression, active contracts, vehicle upgrades, audio preferences, and top-10 local run history are stored locally via `localStorage` (`scripts/database.js`) with strict schema validation, atomic backup recovery, JSON save export/import (in **Settings**), and graceful in-memory fallback if browser storage is restricted.
   - **Refresh Recovery:** Reloading the browser mid-run preserves an active shift checkpoint and presents a **Resume Shift** prompt with a `3–2–1` countdown so progress is never lost accidentally.
4. **Fail-Safe Startup Watchdog:**
   - `scripts/startup.js` arms an 8-second boot watchdog before scripts load so any unexpected WebGL/environment failure cleanly surfaces a non-destructive retry screen without harming saved progress. Web fonts degrade gracefully to system fonts when offline.
5. **Strict Digit7 Jam 2026 Rule Compliance:**
   - **Zero Wagering Mechanics:** All unlocks use transparent coin costs, **Garage Requisitions**, and **Courier Supply Drops**.
   - **Zero Unauthorized External APIs:** Runs 100% client-side with zero unannounced network calls.
   - **Automated Compliance Gate:** `tests/verify_build.js` automatically verifies entry-point synchronization, DOM ID integrity, and competition terminology compliance on every test run.

### Project Structure

```text
Midnight-Delivery/
├── index.html                 # Primary HTML entry point (HUD, showroom, modals)
├── midnight_delivery.html     # Byte-for-byte synchronized alternate entry point
├── server.js                  # Zero-dependency Node.js local static server
├── resources/
│   ├── Passing_Streetlights.mp3   # Highway drive looping BGM track
│   └── Asphalt_Reflections.mp3    # Garage showroom looping BGM track
├── styles/
│   ├── main.css               # Custom arcade HUD, Blackout high-contrast & mobile rules
│   ├── utilities.css          # Pre-compiled local Tailwind CSS utilities (no CDN lag)
│   └── utilities.input.css    # Tailwind source entry for rebuilding utilities.css
├── scripts/
│   ├── startup.js             # Boot watchdog & non-destructive startup error boundary
│   ├── audio.js               # 32-voice pooled Web Audio API synth + dual-BGM controller
│   ├── data.js                # Playable vans, city themes, parody parcels & game state
│   ├── database.js            # Schema-validated CourierDB, checkpoints & save export/import
│   ├── voxels.js              # Three.js scene, shared caches & procedural voxel builders
│   ├── pools.js               # Pooled traffic vehicles & bounded particle systems
│   ├── cargo.js               # Roof cargo stack, sway physics, depots & overpasses
│   ├── night.js               # Midnight Blackout zones, headlight cones, flares & pit-stops
│   ├── rivals.js              # Shadow Express rival courier AI & split-road route forks
│   ├── game.js                # Main loop, critically damped steering, multi-touch & throws
│   └── vendor/
│       ├── three.r128.min.js  # Vendored Three.js r128 runtime
│       └── THREE-LICENSE.txt  # Bundled Three.js MIT License
└── tests/
    ├── verify_build.js        # Static AST/DOM/compliance auditor + test runner
    ├── database.js            # CourierDB schema, backup & storage fallback tests
    ├── mechanics.js           # Blackout, rival, cargo, mobile multi-touch & checkpoint tests
    ├── layout.js              # 1280×720 desktop & 360×640 mobile bounding-box auditor
    ├── smoke.js               # Headless Chromium/Edge FPS & runtime error harness
    └── stress_test.js         # 1,000-throw & extreme cargo-sway stress test
```

---

## 📜 Asset Rights, Licensing & Originality Declaration

All visual, audio, code, and narrative assets in **Midnight Delivery — Voxel World Tour** are cleared for **Digit7 Jam 2026** judging, public web hosting, and tournament showcase:

| Asset Category | Source & Provenance | License / Rights Status |
| :--- | :--- | :--- |
| **3D Models, Vehicles, Characters & City Props** | **100% Original Procedural Code** (`scripts/voxels.js`, `scripts/cargo.js`, `scripts/night.js`, `scripts/rivals.js`). Built at runtime from Three.js primitive geometries; zero third-party `.glb`/`.obj`/`.fbx` meshes. | **Original First-Party Work** (Full rights held by team) |
| **2D Parcel Icons, Signboards & Textures** | **100% Original Procedural HTML5 `<canvas>` Renders** & inline SVG HUD icons generated at runtime. Zero ripped sprites or external image packs. | **Original First-Party Work** (Full rights held by team) |
| **In-Game Brands, Items & Character Personas** | **100% Original Parody Creations** (*DigitBox 7 Pro Console*, *Midnight Shan Noodle XL*, *Golden King Durian*, *Golden Inle Chef*, *Master Bamboo*, *Neon Samurai*, etc.). Contains **no** unauthorized third-party trademarks or copyrighted characters. | **Original First-Party IP** (Competition Compliant) |
| **Gameplay Sound Effects (SFX)** | **100% Original Procedural Synthesis** (`scripts/audio.js`). Generated live via the browser's native Web Audio API (`OscillatorNode` / `GainNode`). Zero external SFX sample packs. | **Original First-Party Work** (Full rights held by team) |
| **Background Music (`resources/*.mp3`)** | *Passing Streetlights* (Highway Drive BGM) & *Asphalt Reflections* (Garage Showroom BGM) — royalty-free / original instrumental synth tracks produced for this project (controllable and mutable anytime via **Settings**). | **Royalty-Free / Cleared for Commercial & Competition Distribution** |
| **Three.js `r128`** | Vendored locally at `scripts/vendor/three.r128.min.js`. | **MIT License** — full license text included in [`scripts/vendor/THREE-LICENSE.txt`](scripts/vendor/THREE-LICENSE.txt) |
| **Tailwind CSS `v3.4.17`** | Pre-compiled locally into `styles/utilities.css`. | **MIT License** |
| **Typography (Web Fonts)** | *Fredoka*, *Press Start 2P*, and *Space Grotesk* served via Google Fonts CSS with local system-font fallbacks. | **SIL Open Font License 1.1 (OFL)** |
| **Playwright Core (`devDependencies`)** | Used solely in `tests/` for offline automated verification; never loaded or bundled in the game client. | **Apache-2.0 License** |

---

Developed with ❤️ in Myanmar for **Digit7 Jam 2026**.
