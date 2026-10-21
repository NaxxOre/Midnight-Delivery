# AGENTS.md — Midnight Delivery (Digit7 Jam 2026 PRD & Architecture Guide)

## 1. Project Overview & Competition Context
- **Game Title:** Midnight Delivery — Voxel World Tour
- **Event:** Digit7 Jam 2026 (Myanmar HTML Arcade Game Tournament)
- **Tech Stack:** HTML5, Tailwind CSS (CDN), Three.js (r128), Web Audio API (Procedural Synth), Vanilla JS, LocalStorage.
- **Core Concept:** A 3D arcade voxel runner where players steer customizable delivery vans across global and Myanmar city highways (Yangon, Tokyo, Chinatown, Little India, Pastel Metro), dodging traffic and throwing designated parcels from a 3-slot dock to roadside residents.

## 2. Strict Competition Compliance Rules (DO NOT VIOLATE)
1. **No Gambling / Wagering:** Never use terms like "Gacha", "Bet", "Lottery", or "Casino". All unlocks must use "Courier Supply Drops" or "Garage Requisitions".
2. **No Unauthorized Third-Party IP:** Do not use real-world copyrighted brands or characters (e.g., no PS5, Ichiraku, Kung-Fu Panda, Doge). Use original parody names only (`DigitBox 7 Pro Console`, `Midnight Shan Noodle XL`, `Master Bamboo`, `Golden Inle Chef`).
3. **Target Viewports & Devices:** Must run smoothly at 60 FPS on Desktop (`1280x720`) and Mobile (`360x640`) across Chrome, Safari, Edge, and Firefox without UI clipping or horizontal scrolling.
4. **No Unannounced External APIs:** Use `localStorage` for all player profile, progression, shift contracts, and session recovery data.

## 3. Codebase Structure
The project is transitioning/operating in the Digit7 production build format (check workspace for whether `midnight_delivery.html` is still monolithic or split into these files):
- `index.html` (or `midnight_delivery.html`): Entry HTML, HUD overlays, modals, and `<div id="loading-overlay">`.
- `styles/main.css`: Custom arcade HUD styles and responsive rules.
- `scripts/audio.js`: `SoundSystem` class (Web Audio API synth).
- `scripts/data.js`: Game registries (`PARCEL_TYPES`, `CHARACTER_TYPES`, `PLAYABLE_VANS`, `CITY_THEMES`, `gameState`).
- `scripts/voxels.js`: Three.js procedural voxel mesh builders.
- `scripts/cargo.js`: Roof cargo, sway physics, supply depots, overpasses, and pooled fallen crates.
- `scripts/game.js`: Core `tick()` loop, physics, input handlers, spawning, and delivery mechanics.

## 4. Current Priority Tasks for Codex (In Order)

### Priority 1: Fix the 10-Second Freeze / Crash Bug (CRITICAL)
Currently, the game lags, freezes, and stops moving after ~10–15 seconds of gameplay.
- **Root Cause A (Three.js Memory/Draw-Call Leak):** Creating new `THREE.BoxGeometry` and `THREE.MeshLambertMaterial` instances for every spawned building, car, and particle without disposing or pooling them.
  - *Fix:* Cache shared geometries/materials globally in `voxels.js`. When despawning any Three.js group/mesh behind the camera, traverse children and dispose non-shared geometries/materials, or use Object Pooling.
- **Root Cause B (Infinite Loop / Unbounded Arrays):** Check `tick()` for arrays (traffic, roadside props, particles, floating DOM text) that grow infinitely or `while` loops during spawning that hang when lanes are full.
- **Root Cause C (`dt` / `NaN` Physics Corruption):** Clamp delta time strictly (`const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05)`) and guard against `NaN` positions in lane switching and homing parcel arcs.
- **Root Cause D (Web Audio Node Leak):** Ensure every oscillator/gain node in `SoundSystem` disconnects after stopping, and cap simultaneous active sound nodes.

### Priority 2: Refined 3-Slot Parcel Selection & Throw Controls
- **Steering:** `A` / `D` or `Left` / `Right` Arrow keys (Desktop), Swipe Left / Right (Mobile).
- **3-Slot Instant Throw:** The bottom Parcel Dock has 3 slots:
  - Slot 0 (Left): Key `Q` or `1` (or single tap/click on card)
  - Slot 1 (Middle): Key `W` or `2` (or single tap/click on card)
  - Slot 2 (Right): Key `E` or `3` (or single tap/click on card)
- **Designated Target Matching:**
  - When a roadside resident spawns, ensure at least 1 of the 3 dock slots contains their requested parcel type.
  - Show a clear floating badge above the resident with their requested parcel icon + the matching slot key (`[Q]`, `[W]`, or `[E]`).
  - Pressing `Q`, `W`, or `E` immediately throws the parcel from that slot along a magnetic parabolic arc toward the in-range resident.
  - Matching parcel = `🎯 EXACT ORDER! 2x Bonus`; Wrong slot parcel = `📦 WRONG PARCEL! (50% Points)`.

### Priority 3: Arcade Gameplay Depth & Feel
- **Snappy Vehicle Physics:** Spring-damped lane switching with chassis yaw, body roll tilt, and instant lane-switch cancellation.
- **Special Parcel Modifiers:** Hot/Timed parcels (8s countdown bar), Fragile parcels (breaks on collision, 2.5x intact bonus), and VIP Double-Drop targets.
- **Overdrive Fever Mode & Road Power-Ups:** Overdrive bar that triggers 7s of boosted speed/2x points at 100%, plus road pickups (`DRONE_ASSIST`, `COIN_MAGNET`, `SHIELD_BUMPER`).

## 5. Coding Rules for Codex
- Never truncate code with `// ... existing code ...` when writing files.
- Always test syntax validity (`node --check` on JS files) after making edits.
- Keep commits atomic and descriptive on feature branches.

## 6. Unique Core Mechanics Roadmap

Implement and validate these pillars in three phases, preserving the compact HUD and the existing crash fixes.

### Phase 1: Roof-Stacking Cargo Physics & Overpasses
- Physical roof cargo is capped at six crates; throws consume cargo.
- Green Supply Depot Arches add two crates, capped at capacity.
- Higher stacks raise delivery scores from x1.0 to x3.0 and sway during lane changes; reckless reversals can drop the top crate.
- Low-clearance lanes shear off excessive cargo. A clearly marked high-clearance lane offers a safe route.
- Reuse crate assets and fallen-crate pools; reset all cargo and road-event state between shifts.

### Phase 2: Midnight Blackout & Headlight Cone
- Periodic blackout zones dim ambient and hemisphere lighting.
- Dual headlight spotlights or ground cones illuminate the road; traffic impacts damage a headlight until a repair pit-stop.
- Residents use red/gold SOS flares and bounded spark particles during blackouts.

### Phase 3: Rival Courier AI & Split-Road Route Forks
- Shadow Express spawns roughly every 45 seconds, attempts deliveries, and can be side-rammed for a bonus crate.
- Route gates appear around every 500m: Express Alley adds traffic and low bridges with double coins and more VIP orders; Safe Bypass offers a clear road and repair pit-stop with normal rewards.
