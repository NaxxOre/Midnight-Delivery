# 🚚 Midnight Delivery — Voxel World Tour

[![HTML5](https://img.shields.io/badge/HTML5-Vanilla_JS-E34F26?logo=html5&logoColor=white)]()
[![Three.js](https://img.shields.io/badge/Three.js-r128_(Vendored_MIT)-000000?logo=three.js)]()
[![Styles](https://img.shields.io/badge/CSS-Pre--Compiled_Tailwind_%2B_Custom_HUD-38BDF8?logo=tailwindcss)]()
[![Audio](https://img.shields.io/badge/Audio-Web_Audio_Synth_%2B_Gemini_BGM-F59E0B)]()
[![Platform](https://img.shields.io/badge/Platform-Mobile_%26_Desktop_Web-10B981)]()

**Midnight Delivery — Voxel World Tour** is a fast-paced, mobile-first and desktop-ready **3D arcade voxel courier runner** playable directly in the browser. Pilot a fleet of **13 customizable delivery rigs** down bustling 4-lane highways across **10 global cities**, balance a physical stack of roof cargo crates through low-clearance bridges, survive sudden midnight power blackouts, out-deliver a rival courier van, and sling quirky parcels to waiting roadside residents.

Built with pure **HTML5, CSS3, Vanilla JavaScript, Three.js (`r128`), and the Web Audio API**, the entire game runs at 60 FPS with **zero build step, zero external 3D model files, and 100% local browser persistence**.

---

## 📖 About the Game

In **Midnight Delivery**, every shift drops you onto a living voxel avenue lined with multi-story apartments, glowing bilingual shopfronts, animated sidewalk pedestrians (dog walkers, cyclists, street cafes, and market stalls), and towering world landmarks:

- **10 World Tour Destinations:** Race through **Yangon (ရန်ကုန်)** *(Shwedagon Pagoda, Burmese tea shops `လက်ဖက်ရည်ဆိုင်`, and Mohinga stalls `မုန့်ဟင်းခါး`)*, **Tokyo (東京)** *(Tokyo Tower, ramen & takoyaki stalls)*, **ChinaTown (唐人街)** *(Temple of Heaven, dim sum & lantern arcades)*, **Little India (लिटिल इंडिया)** *(Taj Mahal, masala chai carts & spice bazaars)*, **Pastel Metro** *(Space Needle & neon Ferris wheel)*, **Paris** *(Eiffel Tower & corner bistros)*, **Rio de Janeiro** *(Christ the Redeemer & Copacabana kiosks)*, **Washington D.C.** *(U.S. Capitol & National Mall)*, **Dubai (دبي)** *(Burj Khalifa & Gold Souk)*, and **Cairo (القاهرة)** *(Great Pyramid, Sphinx & Nile teahouses)*.
- **Dynamic Atmosphere & Weather:** Transitions smoothly across **5 lighting presets** (*Cozy Midnight*, *Golden Sunset Twilight*, *Sakura Rose Dawn*, *Starry Synthwave*, and *Warm Sunny Breeze*) and **5 particle weather modes** (*Clear*, *Autumn Leaves*, *Rain*, *Snow*, and *Sakura Petals*).
- **13 Unlockable Courier Rigs:** Collect and drive everything from the starter *Express Courier GTI*, *Bogyoke Market Pickup*, *Yangon Golden Coach*, *Royal Bangkok Tuk-Tuk*, and *Harajuku Ramen Truck* to the *Shibuya Drift AE-86*, *Cyber-Blade 2099*, *Shinjuku Dekotora Star*, *Mecha-Moai Interceptor*, and *Golden Hintha Sovereign*.

---

## 🎯 Objective

1. **Fulfill Roadside Orders at High Speed:** Watch for approaching residents calling for deliveries on the left and right sidewalks. Match their requested item from your **3-Slot Parcel Dock** and throw it before passing their porch drop zone.
2. **Protect Your Van & Roof Cargo:** Each shift begins with **3 Hearts** of van armor and **3 physical crates** strapped to your roof rack (stackable up to **6 crates**). Dodge 9 types of signaling traffic vehicles and pedestrian crosswalks while keeping your cargo stack intact through sharp swerves and low-clearance overpasses.
3. **Build Your Fleet, Rank & Handbook:** Earn **Score**, **Coins**, and **Courier XP** to:
   - Complete **Active Shift Contracts** (3 rotating missions) and earn promotions across **5 Courier Ranks**.
   - Unlock new vehicles in the **Fleet Capsule Machine** (featuring guaranteed Epic+ and Legendary pity counters and duplicate coin refunds).
   - Upgrade each vehicle individually across **4 Rig Tuning Systems** (**Cargo Magnet**, **Engine Tune**, **Suspension / Handling**, and **Chrono-Battery**, Levels 1–5).
   - Discover all **12 Tiered Parody Delivery Items** and **8 Voxel Customer Personas** in the **Handbook (Hall of Fame)** and log your top 10 runs in **Records**.

---

## 🎮 Gameplay & Controls

### Control Scheme (Mobile-First Multi-Touch & Desktop)

The input system supports **simultaneous multi-touch** on mobile—letting you swipe lanes with one thumb while tapping parcel deliveries mid-swerve with the other—alongside responsive keyboard and mouse controls on desktop:

| Action | Mobile / Touch (`360×640`+) | Desktop (`1280×720`+) |
| :--- | :--- | :--- |
| **Steer / Switch Lanes** | Swipe **Left** or **Right** anywhere on the road (1 discrete lane per swipe; instant mid-swerve reversal supported) | `A` / `D` or `←` / `→` Arrow Keys |
| **Instant Throw (3-Slot Dock)** | Tap any of the **3 Parcel Dock Cards** at the bottom—or tap the resident's floating **Order Badge** (works simultaneously while swiping lanes) | Press `Q` / `1` (Left), `W` / `2` (Middle), `E` / `3` (Right), or click a dock card / order badge |
| **Slow-Mo Precision Drag Aim** | Touch & hold a parcel card, drag to aim the 3D arc, release to throw *(drag down to the bottom red `✕` zone to cancel)* | Click & hold a parcel card, drag to aim the 3D arc, release to throw *(drag down to cancel)* |
| **Side-Ram Rival Courier** | Swipe into the adjacent lane while side-by-side with **Shadow Express** | Steer into the adjacent lane while side-by-side with **Shadow Express** |
| **Start Shift (From Garage)** | Tap **`START SHIFT`** | Press `Spacebar` or click **`START SHIFT`** |
| **Pause & Settings** | Tap the top-right **`PAUSE`** button | Press `Escape` or click **`PAUSE`** |
| **3D Garage Turntable Orbit** | Drag horizontally across the showroom background | Click & drag horizontally across the showroom background |

---

### Core Gameplay Systems

#### 1. 3-Slot Parcel Dock, Smart Order Matching & Modifiers
- **Guaranteed Match Slot:** When a resident enters delivery range, at least one of your 3 dock slots is guaranteed to stock their requested parcel, highlighted with a pulsing card border and a floating key badge (`[Q]`, `[W]`, or `[E]`).
- **Delivery Accuracy & Sweet-Spot Timing:**
  - **🎯 Exact Order:** Awards **`2×` Points & Coins** and switches the resident's speech bubble to a green **`DELIVERED!`** badge.
  - **⚡ Sweet-Spot Perfect Drop:** Throwing while the porch ground ring pulses gold in the sweet spot grants an additional Perfect Drop bonus and extra coins.
  - **📦 Wrong Parcel:** Still completes at **`50%` Points & Coins** (`WRONG PARCEL!` badge) so a mistimed tap never stalls your run.
- **Special Parcel Modifiers:** Dock cards can roll **Hot / Timed** modifiers (an 8-second countdown bar for urgent bonus tips) or **Fragile** modifiers (**`2.5×` intact bonus**, cracked if you collide with traffic).

#### 2. Roof-Stacking Cargo Physics, Supply Depots & Overpasses
- **Physical Roof Crates:** Every parcel throw consumes **1 physical crate** from your van's roof rack (capacity: **6 crates**). If your roof rack hits `0/6`, collect a depot arch to reload before throwing again.
- **Stack Multiplier vs. Lateral Sway:** Taller stacks raise your delivery score multiplier (`0` crates: `×1.0` · `1–2` crates: `×1.5` · `3–4` crates: `×2.0` · `5–6` crates: `×3.0`), displayed live on the HUD alongside a **Sway Danger Bar**. Rapid back-and-forth lane reversals whip tall stacks—pushing sway danger past 100% sends your top crate tumbling onto the highway.
- **Supply Depots & Low Overpasses:** Drive through green **`SUPPLY / +2 CRATES`** arches to restock. When approaching **Low-Clearance Overpasses**, steer into the marked green **High-Clearance Safe Lane** or excess roof crates will be sheared off.

#### 3. Midnight Blackout Zones, Headlights & Pit-Stop Repairs
- **Power Outage Events:** Periodic **14-second Midnight Blackout** zones plunge the highway into deep darkness while apartment windows glow, waiting customers ignite **red/gold SOS flares** with rising sparks, and floating delivery badges automatically switch to a **high-contrast night-vision color scheme**.
- **Asymmetric Headlight Damage & Repairs:** Colliding with traffic damages your right headlight beam until you drive over a glowing blue **`🔧 PIT-STOP REPAIR`** pad, which restores full headlights and heals **+1 Heart**.

#### 4. Shadow Express Rival AI & Split-Road Route Forks
- **Rival Courier Races:** Every ~45 seconds, rival van **Shadow Express** pulls into an adjacent lane and races to snipe roadside orders. Deliver before their 1.5-second throw wind-up finishes to earn **`⚡ SNIPED RIVAL! +500`**, or **side-ram** into their lane while side-by-side to stun them for 4 seconds and loot bonus roof crates.
- **Split-Road Route Gates:** Periodic highway forks offer a 20-second tactical choice:
  - **Left Gate (`EXPRESS SHORTCUT`):** High-density traffic and low bridges in exchange for **`2×` Coin payouts**.
  - **Right Gate (`SAFE BYPASS`):** Lighter traffic plus a guaranteed **Supply Depot** and **Pit-Stop Repair Pad**.

#### 5. Overdrive Fever, Traffic Near-Misses, Rush Hour & Power-Ups
- **Near-Misses & Overdrive:** Passing closely past signaling vehicles (including emergency vans, tuk-tuks, dump trucks, and rare highway UFOs) builds Combo multipliers (up to `×8`) and charges the **Overdrive Bar**. Filling it unleashes 7 seconds of **Overdrive Fever** (turbo speed, crash immunity, and `2×` score).
- **Road Events & Pickups:** Navigate **Rush Hour** traffic surges and active **Pedestrian Crosswalks**, and grab floating road power-ups: **Drone Assist** (auto-delivers nearby orders), **Coin Magnet**, and **Shield Bumper**.

---

## 🚀 How to Run the Game

No bundler, build step, or external database is required. Both [`index.html`](index.html) and [`midnight_delivery.html`](midnight_delivery.html) are byte-for-byte identical entry points.

### Option 1: Built-in Node.js Local Server (Recommended)
Requires **Node.js 18+**. Uses only Node's built-in core modules (`node:http`, `node:fs`, `node:path`)—no `npm install` is needed just to run and play:

```bash
node server.js
# or
npm start
```

Then open **`http://localhost:8080`** in any modern desktop or mobile browser (Chrome, Edge, Safari, or Firefox).
*(If port `8080` is busy, `server.js` automatically increments to `8081`, `8082`, etc. and logs the active URL.)*

### Option 2: Any Static Web Server or Direct Browser Open
- **Python:** `python -m http.server 8080`
- **VS Code:** Right-click `index.html` → *Open with Live Server*
- **Static Hosting:** Deploy the root directory directly to **Vercel**, **GitHub Pages**, **Netlify**, or **Cloudflare Pages** with zero build command.
- **Direct File Open:** Double-click `index.html` or `midnight_delivery.html` to launch directly in a browser.

### Option 3: Running the Automated Verification & Stress Suite (Optional)
The repository includes an automated test suite covering static syntax/DOM validation, `CourierDB` persistence unit tests, gameplay mechanics, `1280×720` (Desktop) & `360×640` (Mobile) bounding-box layout audits, and soak/stress tests:

```bash
# Install the single devDependency (playwright-core) used by headless browser tests
npm ci

# Run full verification (static checks + DB unit tests + desktop & mobile browser smoke/layout suite)
npm test

# Run static & database unit checks only (no browser required)
node tests/verify_build.js --static

# Run 1,000-throw & extreme cargo-sway physics stress harness
npm run test:stress

# Run 15-minute continuous memory & FPS soak test
npm run test:soak
```

*(Note: Utility classes in `styles/utilities.css` are pre-compiled so no Tailwind CDN is needed at runtime. If you add new utility classes while editing HTML/JS, rebuild with `npx --yes --package tailwindcss@3.4.17 tailwindcss -i styles/utilities.input.css -o styles/utilities.css --content "./*.html,./scripts/*.js" --minify`.)*

---

## 🔍 What Reviewers Should Know

1. **Mobile-First & Desktop Dual-Viewport Engineering (`360×640` & `1280×720`):**
   - Lane switching uses **exact critical damping** ($\zeta = 1.0$) and frame-rate-independent exponential chassis banking with cushioned lateral camera follow—eliminating oscillation wobble and routine screen-shake jitter while supporting instant mid-swerve reversals and simultaneous multi-touch throwing.
   - All 8 modals (**Pause**, **Settings**, **Garage Tuning**, **Handbook**, **Records**, **Contracts**, **Fleet Capsule Machine**, and **Game Over**), HUD counters, and floating order badges are tested against `360×640` and `1280×720` viewports in `tests/layout.js` to ensure zero clipping or horizontal scroll.
2. **Sustained 60 FPS & Zero-Leak Memory Architecture:**
   - **Geometry Batching & Shared Caches:** Static voxel sub-meshes are merged (`batchStaticVoxelBoxes`), and materials/geometries are cached globally in `scripts/voxels.js`.
   - **Object Pooling:** Traffic vehicles (`trafficMeshPool` in `scripts/pools.js`), fallen roof crates (`fallenCargoPool` in `scripts/cargo.js`), voxel burst particles (capped at 60), and blackout SOS sparks (capped at 120 vertices) are pre-allocated and recycled without mid-game garbage-collection spikes.
   - **32-Voice Pooled Web Audio Engine:** `SoundSystem` (`scripts/audio.js`) caps simultaneous Web Audio voices at 32, recycles `GainNode` instances, and immediately disconnects finished `OscillatorNode`/`GainNode` pairs on `onended`.
   - **Physics Safety Guards:** Frame delta time (`dt`) is strictly clamped (`0.001s`–`0.05s`) with finite-number guards across steering, cargo sway, and homing parcel trajectories.
3. **Crash-Resilient Save Engine & Mid-Shift Refresh Recovery (`CourierDB`):**
   - `scripts/database.js` enforces strict schema and range validation on all profile fields, vehicle upgrades, contracts, and top-10 run history records in `localStorage`, maintaining an automatic `_backup` slot against corrupted writes and offering **JSON Save Export & Import** inside **Settings**.
   - **Mid-Shift Checkpoints:** Active shifts auto-save every 5 seconds (and on pause/visibility change). Refreshing or closing the tab mid-run greets the player with a **Resume Active Shift?** prompt that restores exact score, hearts, roof cargo, dock modifiers, blackout/rival timers, and road events behind a `3–2–1` countdown.
   - **Restricted Storage Fallback:** Runs cleanly in private/incognito WebViews where `localStorage` is blocked by falling back to validated in-memory storage.
4. **Fail-Safe Startup Watchdog & Offline Readiness:**
   - `scripts/startup.js` registers global error listeners and an **8-second boot watchdog** before deferred scripts execute; if WebGL or script loading fails, a clean retry screen is presented without overwriting saved data.
   - All runtime scripts and Three.js `r128` are bundled locally. Google Fonts act purely as progressive enhancement with local system-font fallbacks when offline.
5. **Built-in Reviewer Testing Aids:**
   - Reviewers who want to inspect every city or test high-tier vehicles immediately without grinding can open **Settings** (`05 SETTINGS` on the home screen) to **jump directly to any of the 10 World Tour cities** or use the **`+300 COINS` / `+1,000 🪙` Courier Grant** buttons in **Settings** and the **Fleet Capsule Machine** (`04 DRAW`).

### Codebase Architecture

```text
Midnight-Delivery/
├── index.html                 # Primary HTML entry point (HUD, 3D showroom overlay & 8 modals)
├── midnight_delivery.html     # Byte-for-byte synchronized alternate HTML entry point
├── server.js                  # Zero-dependency Node.js local static HTTP server
├── package.json               # Scripts for start, test, stress test & 15-min soak test
├── resources/
│   ├── Passing_Streetlights.mp3   # Highway driving BGM track (generated with Google Gemini)
│   └── Asphalt_Reflections.mp3    # Garage showroom BGM track (generated with Google Gemini)
├── styles/
│   ├── main.css               # Custom arcade HUD, Blackout high-contrast & mobile responsive CSS
│   ├── utilities.css          # Pre-compiled local Tailwind CSS utility classes
│   └── utilities.input.css    # Tailwind input file for rebuilding utilities.css
├── scripts/
│   ├── startup.js             # 8-second boot watchdog & non-destructive startup error boundary
│   ├── audio.js               # 32-voice pooled Web Audio API synth + dual-BGM mixer
│   ├── data.js                # 13 vans, 10 cities, 12 items, 8 characters, ranks & tuning specs
│   ├── database.js            # Schema-validated CourierDB, mid-shift checkpoints & JSON backup
│   ├── voxels.js              # Three.js scene, geometry batching, landmarks & voxel builders
│   ├── pools.js               # Pooled traffic vehicles (9 types) with 3-point turn blinkers
│   ├── cargo.js               # Roof cargo stacking, sway physics, supply depots & overpasses
│   ├── night.js               # Midnight Blackout zones, headlight cones, SOS flares & pit-stops
│   ├── rivals.js              # Shadow Express rival courier AI & split-road route fork gates
│   ├── game.js                # Main loop, critically damped steering, multi-touch & throw arcs
│   └── vendor/
│       ├── three.r128.min.js  # Locally vendored Three.js r128 WebGL runtime
│       └── THREE-LICENSE.txt  # Bundled Three.js MIT License
└── tests/
    ├── verify_build.js        # Static AST/syntax/DOM auditor + full verification orchestrator
    ├── database.js            # CourierDB schema rejection, backup recovery & fallback unit tests
    ├── mechanics.js           # Blackout contrast, rival AI, cargo, multi-touch & resume tests
    ├── layout.js              # 1280×720 desktop & 360×640 mobile viewport layout auditor
    ├── smoke.js               # Headless browser FPS, frame-pacing & runtime error harness
    └── stress_test.js         # 1,000-throw & extreme cargo-sway physics stress test
```

---

## 📜 Asset Rights, AI Usage Disclosure & Open-Source Licenses

### 🤖 AI Usage Disclosure
In the spirit of full creative and technical transparency:
- **AI-Generated Background Music (Google Gemini):** Both looping background soundtrack files—[`resources/Passing_Streetlights.mp3`](resources/Passing_Streetlights.mp3) *(Highway Driving BGM)* and [`resources/Asphalt_Reflections.mp3`](resources/Asphalt_Reflections.mp3) *(3D Garage Showroom BGM)*—were generated using **Google Gemini**. Volume levels are balanced softly by default (`25%`) and can be adjusted or muted at any time via the HUD mute toggle or **Settings**.
- **AI-Assisted Development:** AI coding tools (including Google Gemini / Antigravity) were used as pair-programming assistants for procedural Three.js voxel mesh construction, Web Audio synthesizer routines, responsive UI polish, and automated Playwright test scripts, under direct human design, gameplay tuning, and verification.

### 📦 Complete Asset Rights & Third-Party License Inventory

Every visual, audio, font, and software component in this repository is original procedural work, transparent AI-generated media created for this project, or permissively licensed open-source software:

| Component / Asset | Path / Location | Provenance & Rights Status | License |
| :--- | :--- | :--- | :--- |
| **3D Vehicles, Landmarks, Buildings & Characters** | `scripts/voxels.js`, `scripts/cargo.js`, `scripts/night.js`, `scripts/rivals.js` | **100% Original Procedural Code** — assembled at runtime from Three.js primitive geometries; zero external `.glb`, `.obj`, or `.fbx` models. | First-Party Project Code |
| **2D Item Thumbnails, Signboards & UI Icons** | `scripts/voxels.js`, `index.html` | **100% Procedural HTML5 `<canvas>` Renders & Inline SVGs** — rendered dynamically at startup; zero third-party sprite sheets or image packs. | First-Party Project Code |
| **In-Game Vehicle, Item & Character Names** | `scripts/data.js` | **100% Original & Parody Creations** (*Midnight Shan Noodle XL*, *Golden King Durian*, *Golden Inle Chef*, *Master Bamboo*, *Golden Hintha Sovereign*, etc.) — free of third-party trademarks or copyrighted IP. | First-Party Original IP |
| **Gameplay Sound Effects (SFX)** | `scripts/audio.js` | **100% Procedural Web Audio API Synthesis** — all engine hums, parcel throws, chimes, sirens, coins, and UI clicks are synthesized live in code with zero external SFX sample files. | First-Party Project Code |
| **Background Music Tracks (BGM)** | `resources/Passing_Streetlights.mp3`, `resources/Asphalt_Reflections.mp3` | **AI-Generated Music via Google Gemini** created specifically for *Midnight Delivery*'s driving and garage loops. | Cleared Project Audio (Gemini-Generated) |
| **Three.js (`r128`)** | `scripts/vendor/three.r128.min.js` | Locally vendored open-source 3D WebGL library (`Copyright © 2010–2021 three.js authors`). | **MIT License** ([`THREE-LICENSE.txt`](scripts/vendor/THREE-LICENSE.txt)) |
| **Tailwind CSS (`v3.4.17`)** | `styles/utilities.css` | Pre-compiled utility stylesheet generated locally from project markup. | **MIT License** |
| **Web Fonts** (*Fredoka*, *Press Start 2P*, *Space Grotesk*) | `index.html` (Google Fonts CSS + local fallbacks) | Open-source display and UI typefaces loaded with non-blocking system-font fallbacks. | **SIL Open Font License 1.1 (OFL)** |
| **Playwright Core (`v1.58.2`)** | `package.json` (`devDependencies` only) | Used strictly offline in `tests/` for automated browser verification; never shipped or loaded by the game client. | **Apache-2.0 License** |
