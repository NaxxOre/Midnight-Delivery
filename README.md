# 🚚 Midnight Delivery — Voxel World Tour
> **Digit7 Competition (Myanmar) — Arcade 3D Web Game**

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-CDN-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Synth-amber)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20Mobile%20Responsive-brightgreen)]()

---

## 📖 Executive Summary
**Midnight Delivery** is a high-octane 3D arcade voxel delivery runner developed for Myanmar's **Digit7 competition**. Players pilot customizable delivery rigs across global metropolitan highways (featuring **Yangon**, Tokyo, Chinatown, Little India, and Pastel Metro), dodging traffic hazards, navigating pedestrian crosswalks, and slinging tiered meme parcels to quirky roadside voxel residents.

The game is built as a self-contained, zero-dependency, single-file HTML5 web application (`midnight_delivery.html`) utilizing Three.js and procedural Web Audio chiptune synthesis.

---

## 🚀 Quick Start & How to Run

### Option 1: Direct File Opening
Double-click [`midnight_delivery.html`](file:///c:/Users/ZL_sht_H/Documents/Projects/digit7/midnight_delivery.html) or open it directly in any modern browser (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
```powershell
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```
Then visit: **`http://localhost:8000/midnight_delivery.html`**

---

## 🎮 Gameplay & Controls

| Action | Desktop Keyboard | Mobile / Touch |
| :--- | :--- | :--- |
| **Steer / Switch Lanes** | `A` / `D` or `←` / `→` Arrow Keys | Swipe Left / Right on road |
| **Deliver Parcel** | Drag parcel slot & release left or right | Touch & drag parcel card from dock to roadside target |
| **⚡ Sweet-Spot Perfect Drop** | Release parcel when roadside ring shrinks to center | Release in golden pulsing zone for 2x pts & +10 coins |
| **🔥 Traffic Near-Miss** | Pass close in adjacent lane or dodge at last second | Close-pass traffic to build combo & trigger speed lines |
| **Slow-Mo Aiming** | Hold parcel while dragging | Hold parcel while dragging |
| **Pause / Resume** | `Escape` key | Pause button on top-right HUD |
| **Garage Orbit** | Click & drag 3D turntable | Drag finger on 3D garage showroom |

---

## 🗺️ Codebase Architecture & System Map

The project is structured into the official **Digit7 Jam Modular Architecture** with shared global scope:

```
├── index.html                 : HTML head, CDNs, #loading-overlay (<10s loader), UI modals, and script tags
├── styles/
│   └── main.css               : Arcade design system, glassmorphism, 3D buttons, and loading spinner styles
├── scripts/
│   ├── audio.js               : SoundSystem Web Audio synth with iOS/Safari try/catch compatibility (~300 lines)
│   ├── data.js                : Registries (PARCEL_TYPES, CHARACTER_TYPES, PLAYABLE_VANS, CITY_THEMES, gameState) (~475 lines)
│   ├── voxels.js              : Three.js Scene, Camera, Lights, and procedural Voxel Geometry builders (~1,520 lines)
│   └── game.js                : Showroom Garage, UI handlers, Traffic, Crosswalks, Controls, and Game Loop (~2,520 lines)
└── midnight_delivery.html     : Single-file source backup (preserved)
```

---

## 💎 Core Game Entities & Data Models

### 1. 🛞 Playable Rigs (`PLAYABLE_VANS`)
1. **Express Courier GTI:** Starter step-van with roof rack.
2. **Harajuku Ramen Truck:** Kei truck with ramen bowl, lanterns, and neko ears (+15% coin bonus).
3. **Cyber-Blade 2099:** Wedge cyber-courier with GT wing and plasma thrusters (+25% coin bonus).
4. **Royal Bangkok Tuk-Tuk:** 3-wheeled motorized rickshaw (+20% coin bonus, max handling).
5. **Fort Knox Bullion Rig:** 6-wheel armored bank truck (+35% coin bonus).
6. **Mecha-Moai Interceptor:** Easter Island rock rod with chrome V8 supercharger (+50% coin bonus).

### 2. 🇲🇲 Authentic World Tour Cities (`CITY_THEMES`)
- **Yangon (ရန်ကုန်):** Golden Pagoda architecture, Burmese tea shops (`လက်ဖက်ရည်ဆိုင်`), Mohinga stalls (`မုန့်ဟင်းခါး`), and Shwedagon gold aesthetic (`ရွှေတိဂုံ`).
- **Tokyo (東京):** Torii gates, Shibuya neon signs, Takoyaki & Ramen stalls.
- **ChinaTown (唐人街):** Red lanterns, golden dim sum banners, dragon temple roofs.
- **Little India (लिटिल इंडिया):** Masala chai carts, spice bazaars, vibrant floral archways.
- **Pastel Metro:** Retro-wave vaporwave cityscape.

### 3. 📦 Parcel Tiers (`PARCEL_TYPES`)
- **Legendary Tier:** Cool Shades Moai 🗿, 24K Gold Toilet, Cyber Neon Katana (600 pts).
- **Gold Tier:** DigitBox 7 Pro Console, Golden King Durian, Golden Lucky Cat (450 pts).
- **Epic Tier:** Sardine Can, Cat-in-a-Box, Galactic Lava Lamp (350 pts).
- **Rare Tier:** Voxel Bicycle, Midnight Shan Noodle XL, Brown Sugar Boba XL (250 pts).

### 4. 👥 Quirky Voxel Residents (`CHARACTER_TYPES`)
- Big-Eye Goblin (`"Hehe! Yes!"`)
- Golden Inle Chef (`"Much Parcel! Very Fast!"`)
- Cool Banana Bro (`"Peel Good Bro!"`)
- Neko-Chan (`"Meow! Toss Here!"`)
- LED-Bot 9000 (`"BEEP! Drop Beat!"`)
- Starlight Wizard (`"By My Beard!"`)
- Master Bamboo (`"Inner Peace! Drop Here!"`)
- Neon Samurai (`"Laser-Sharp Delivery!"`)

---

## 📋 Shift Contracts & ⚙️ Rig Tuning (Retention & Progression)

### 1. Active Shift Contracts & Courier Ranks
- **3 Persistent Missions:** Players always have 3 active contracts chosen from a pool:
  - *Deliver 5 Parcels in a Single Run*
  - *Land 3 Perfect Drops*
  - *Perform 4 Traffic Near-Misses*
  - *Collect 40 Coins in Yangon*
  - *Reach Combo x5 without crashing*
  - *Drive 500 Meters in a Shift*
  - *Deliver a Legendary Tier Parcel*
- **Rewards & Progression:** Completing each contract awards bonus **+150 Coins** and **Courier XP**.
- **Courier Ranks:** Level 1 "Yangon Rookie" → Level 2 "Midnight Runner" → Level 3 "ASEAN Express" → Level 4 "Cyber Courier" → Level 5 "Digit7 Legend", complete with rank promotions and bonus awards.
- **Live Widgets:** Real-time contract progress displayed on `#home-screen`, live during gameplay, and summarized on the Game Over screen. All progress persists across sessions in `localStorage`.

### 2. Rig Tuning Upgrades (Garage Progression)
Players can invest earned Coins to tune their unlocked vehicles across 3 stats (Level 1 to 5 each):
- **⚡ Engine Tune:** Increases top speed multiplier (up to +18%) and score multiplier (up to +25%).
- **🎯 Suspension / Handling:** Accelerates lane-switching snap lerp speed (up to +75% reaction speed).
- **⏱️ Chrono-Battery:** Extends Slow-Mo aim capacity (from 8.0s up to 14.5s) and grants a 30% slower drain rate at Level 5.
- Multipliers are applied dynamically in real time within the `animate()` physics and input loop.

---

## 🛠️ Vibe Coding with Gemini Argon & Antigravity

When prompting **Gemini (Argon model)** or working cooperatively with your AI assistant on this codebase, use these targeted prompt strategies:

### 💡 Prompt Blueprint 1: Adding a New Vehicle
> *"In `midnight_delivery.html`, add a new vehicle to `PLAYABLE_VANS` called 'Yangon Golden Bus' (a vintage Burmese wooden/metal bus). Give it custom stats, hex colors, and update `createPlayableVan()` to assemble its voxel mesh with authentic roof luggage and headlights."*

### 💡 Prompt Blueprint 2: Adding New Power-Ups
> *"In `midnight_delivery.html`, look at `activePowerUps` and the power-up spawn logic near line 5327. Add a new power-up type: 'Coin Magnet' (draws nearby coins and delivers parcels automatically within a radius for 6 seconds)."*

### 💡 Prompt Blueprint 3: Adding Myanmar Cultural Elements
> *"In `midnight_delivery.html`, add more Myanmar-themed roadside props to the `yangon` theme (such as roadside sugarcane juice carts, Thanaka-wearing voxel characters, and Bagan pagoda spires in the background)."*

### 💡 Prompt Blueprint 4: Sound & Music Tweaks
> *"In `midnight_delivery.html`, inspect the `SoundSystem` class near line 906. Add a custom engine acceleration pitch modulation that scales smoothly with `playerSpeed`."*

---

## 🏆 Digit7 Myanmar Competition Checklist
- [x] Functional 3D arcade runner prototype
- [x] Authentic Myanmar theme (Yangon, Burmese signboards, local lore)
- [x] Responsive layout (playable on mobile phones and PC desktops)
- [x] Procedural audio synthesis without external asset lag
- [x] Gacha / Collection progression & high score retention
- [ ] Additional Myanmar landmarks (e.g., Mandalay Palace, Inle Lake stilt houses)
- [ ] Multiplayer / Local pass-and-play ghost racer mode
- [ ] Burmese language UI toggle option (Zawgyi / Unicode)

---

Developed with ❤️ for **Digit7 Myanmar**.
