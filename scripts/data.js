    // ============================================================================
    // 2. 12 TIERED SURPRISE & MEME ITEMS (RAINBOW LEGENDARY, GOLD, EPIC, RARE)
    // ============================================================================
    const PARCEL_TYPES = [
      {
        id: 0,
        key: 'moai',
        name: 'Cool Shades Moai 🗿',
        short: 'MOAI STATUE',
        pts: 600,
        tier: 'LEGENDARY',
        tierClass: 'tier-legendary',
        boxTierClass: 'tier-box-legendary',
        badgeBg: 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-slate-950',
        color: 0xfacc15
      },
      {
        id: 1,
        key: 'toilet',
        name: '24K Solid Gold Toilet',
        short: 'GOLD TOILET',
        pts: 600,
        tier: 'LEGENDARY',
        tierClass: 'tier-legendary',
        boxTierClass: 'tier-box-legendary',
        badgeBg: 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-slate-950',
        color: 0xf59e0b
      },
      {
        id: 2,
        key: 'digitbox',
        name: 'DigitBox 7 Pro Console',
        short: 'DIGITBOX 7',
        pts: 450,
        tier: 'GOLD TIER',
        tierClass: 'tier-gold',
        boxTierClass: 'tier-box-gold',
        badgeBg: 'bg-amber-400 text-slate-950',
        color: 0x38bdf8
      },
      {
        id: 3,
        key: 'durian',
        name: 'Golden King Durian',
        short: 'GOLD DURIAN',
        pts: 450,
        tier: 'GOLD TIER',
        tierClass: 'tier-gold',
        boxTierClass: 'tier-box-gold',
        badgeBg: 'bg-amber-400 text-slate-950',
        color: 0x84cc16
      },
      {
        id: 4,
        key: 'fishcan',
        name: 'Open Sardine Fish Can',
        short: 'SARDINE CAN',
        pts: 350,
        tier: 'EPIC TIER',
        tierClass: 'tier-epic',
        boxTierClass: 'tier-box-epic',
        badgeBg: 'bg-purple-500 text-white',
        color: 0xa855f7
      },
      {
        id: 5,
        key: 'catbox',
        name: 'Meowing Cat-in-a-Box',
        short: 'CAT IN BOX',
        pts: 350,
        tier: 'EPIC TIER',
        tierClass: 'tier-epic',
        boxTierClass: 'tier-box-epic',
        badgeBg: 'bg-purple-500 text-white',
        color: 0xf97316
      },
      {
        id: 6,
        key: 'bike',
        name: 'Voxel Bicycle',
        short: 'VOXEL BIKE',
        pts: 250,
        tier: 'RARE TIER',
        tierClass: 'tier-rare',
        boxTierClass: 'tier-box-rare',
        badgeBg: 'bg-sky-500 text-white',
        color: 0x38bdf8
      },
      {
        id: 7,
        key: 'ramen',
        name: 'Midnight Shan Noodle XL',
        short: 'SHAN NOODLE',
        pts: 250,
        tier: 'RARE TIER',
        tierClass: 'tier-rare',
        boxTierClass: 'tier-box-rare',
        badgeBg: 'bg-sky-500 text-white',
        color: 0xef4444
      },
      {
        id: 8,
        key: 'katana',
        name: 'Cyber Neon Katana',
        short: 'NEON KATANA',
        pts: 600,
        tier: 'LEGENDARY',
        tierClass: 'tier-legendary',
        boxTierClass: 'tier-box-legendary',
        badgeBg: 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-slate-950',
        color: 0x00f5d4
      },
      {
        id: 9,
        key: 'maneki',
        name: 'Golden Lucky Cat',
        short: 'LUCKY NEKO',
        pts: 450,
        tier: 'GOLD TIER',
        tierClass: 'tier-gold',
        boxTierClass: 'tier-box-gold',
        badgeBg: 'bg-amber-400 text-slate-950',
        color: 0xfacc15
      },
      {
        id: 10,
        key: 'lavalamp',
        name: 'Galactic Lava Lamp',
        short: 'LAVA LAMP',
        pts: 350,
        tier: 'EPIC TIER',
        tierClass: 'tier-epic',
        boxTierClass: 'tier-box-epic',
        badgeBg: 'bg-purple-500 text-white',
        color: 0xec4899
      },
      {
        id: 11,
        key: 'boba',
        name: 'Brown Sugar Boba XL',
        short: 'BOBA TEA XL',
        pts: 250,
        tier: 'RARE TIER',
        tierClass: 'tier-rare',
        boxTierClass: 'tier-box-rare',
        badgeBg: 'bg-sky-500 text-white',
        color: 0xf472b6
      }
    ];

    // 8 Expressive, Cool Voxel Characters
    const CHARACTER_TYPES = [
      { id: 'goblin',    name: 'Big-Eye Goblin',   phrase: '"Hehe!  Yes!"' },
      { id: 'inlechef',  name: 'Golden Inle Chef', phrase: '"Fresh parcels, happy neighbors!"' },
      { id: 'banana',    name: 'Cool Banana Bro',  phrase: '"Peel Good Bro!"' },
      { id: 'neko',      name: 'Neko-Chan',        phrase: '"Meow! Toss Here!"' },
      { id: 'ledbot',    name: 'LED-Bot 9000',     phrase: '"BEEP! Drop Beat!"' },
      { id: 'wizard',    name: 'Starlight Wizard', phrase: '"By My Beard!"' },
      { id: 'panda',     name: 'Master Bamboo',    phrase: '"Inner Peace! Drop Here!"' },
      { id: 'cyberpunk', name: 'Neon Samurai',     phrase: '"Laser-Sharp Delivery!"' }
    ];

    const PLAYABLE_VANS = [
      {
        id: 'classic',
        name: 'Express Courier GTI',
        tier: 'STARTER RIG',
        speedStat: 80,
        handStat: 90,
        coinBonus: 0,
        desc: 'Sculpted twin-axle step-van with front radiator grille, flared wheel arches, wing mirrors & roof cargo rack.',
        bodyHex: 0xf97316,
        stripeHex: 0xfacc15,
        roofHex: 0xf8fafc
      },
      {
        id: 'ramen',
        name: 'Harajuku Ramen Truck',
        tier: 'RARE RIG',
        speedStat: 85,
        handStat: 93,
        coinBonus: 15,
        desc: 'Japanese street-noodle kei truck with serving counter, red paper lanterns, cat hood ears & giant 3D ramen bowl!',
        bodyHex: 0xf472b6,
        stripeHex: 0xfef08a,
        roofHex: 0xfff1f2
      },
      {
        id: 'cyber',
        name: 'Cyber-Blade 2099',
        tier: 'EPIC RIG',
        speedStat: 95,
        handStat: 96,
        coinBonus: 25,
        desc: 'Low-slung wedge super-courier with rear window louvers, laser visor, GT wing & dual plasma thrusters.',
        bodyHex: 0x1e293b,
        stripeHex: 0x00f5d4,
        roofHex: 0x0f172a
      },
      {
        id: 'goldtuktuk',
        name: 'Royal Bangkok Tuk-Tuk',
        tier: 'RARE RIG',
        speedStat: 89,
        handStat: 99,
        coinBonus: 20,
        desc: 'Nimble 3-wheeled motorized rickshaw with gold-trimmed canopy, checkered taxi sides & twin chrome zoomie pipes!',
        bodyHex: 0x16a34a,
        stripeHex: 0xfacc15,
        roofHex: 0xf59e0b
      },
      {
        id: 'bullion',
        name: 'Fort Knox Bullion Rig',
        tier: 'EPIC RIG',
        speedStat: 87,
        handStat: 89,
        coinBonus: 35,
        desc: '6-wheel heavy armored bank vault truck with front riot bullbar, rear vault dial & solid 24K gold bullion stack.',
        bodyHex: 0x334155,
        stripeHex: 0xfacc15,
        roofHex: 0x1e293b
      },
      {
        id: 'moairig',
        name: 'Mecha-Moai Interceptor',
        tier: 'LEGENDARY',
        speedStat: 100,
        handStat: 97,
        coinBonus: 50,
        desc: 'Chiseled Easter Island stone hot-rod with Deal-With-It shades, chrome V8 supercharger & twin jet turbines!',
        bodyHex: 0x64748b,
        stripeHex: 0x00f5d4,
        roofHex: 0xfacc15
      }
    ];

    const STATIC_LEADERBOARD = [
      { name: 'Akira_Drift99',      vanId: 'moairig',    van: 'Mecha-Moai Interceptor', delivered: 142, distance: 4820, rank: 1 },
      { name: 'NekoChan_Tokyo',     vanId: 'cyber',      van: 'Cyber-Blade 2099',       delivered: 118, distance: 3940, rank: 2 },
      { name: 'YangonTeaMaster',    vanId: 'goldtuktuk', van: 'Royal Bangkok Tuk-Tuk',  delivered: 96,  distance: 3310, rank: 3 },
      { name: 'ChaiWallah_Express', vanId: 'bullion',    van: 'Fort Knox Bullion Rig',  delivered: 84,  distance: 2890, rank: 4 },
      { name: 'InleChef_Fast',      vanId: 'ramen',      van: 'Harajuku Ramen Truck',   delivered: 68,  distance: 2350, rank: 5 },
      { name: 'Moai_Shades_Bro',    vanId: 'classic',    van: 'Express Courier GTI',    delivered: 45,  distance: 1620, rank: 6 }
    ];

    // 5 Authentic World Tour Cities
    const CITY_THEMES = [
      {
        id: 'tokyo',
        name: 'Tokyo',
        banner: 'WELCOME TO TOKYO (東京)',
        gatePrimary: 0xe11d48,
        gateSecondary: 0x1e293b,
        walls: [0xfef3c7, 0xf8fafc, 0xfde68a],
        roofs: [0x1e293b, 0x0f172a, 0x991b1b],
        accent: 0xe11d48,
        signs: [
          { top: 'ラーメン', bottom: 'TOKYO RAMEN',    bg: '#b91c1c', fg: '#fef08a' },
          { top: 'たこ焼き', bottom: 'TOKYO TAKOYAKI', bg: '#0f172a', fg: '#ffffff' },
          { top: '居酒屋',   bottom: 'SHIBUYA IZAKAYA', bg: '#4c1d95', fg: '#00f5d4' }
        ]
      },
      {
        id: 'chinatown',
        name: 'ChinaTown',
        banner: 'WELCOME TO CHINATOWN (唐人街)',
        gatePrimary: 0xdc2626,
        gateSecondary: 0xf59e0b,
        walls: [0xb91c1c, 0x991b1b, 0x7f1d1d],
        roofs: [0xf59e0b, 0xd97706, 0x059669],
        accent: 0xfacc15,
        signs: [
          { top: '黃金茶樓', bottom: 'GOLDEN DIM SUM', bg: '#7f1d1d', fg: '#facc15' },
          { top: '功夫麵館', bottom: 'KUNG FU NOODLE', bg: '#b91c1c', fg: '#fef08a' },
          { top: '招財進寶', bottom: 'DRAGON EMPORIUM', bg: '#064e3b', fg: '#fde047' }
        ]
      },
      {
        id: 'littleindia',
        name: 'Little India',
        banner: 'WELCOME TO LITTLE INDIA (लिटिल इंडिया)',
        gatePrimary: 0xf97316,
        gateSecondary: 0xfacc15,
        walls: [0xfb7185, 0xfdba74, 0xfde047],
        roofs: [0xfef08a, 0xf8fafc, 0xf59e0b],
        accent: 0xf59e0b,
        signs: [
          { top: 'गरमा गरम चाय', bottom: 'MASALA CHAI CART', bg: '#9a3412', fg: '#fef08a' },
          { top: 'मसाला डोसा',   bottom: 'LITTLE INDIA DOSA', bg: '#831843', fg: '#fde047' },
          { top: 'ताज पैलेस',    bottom: 'SPICE BAZAAR',      bg: '#1e1b4b', fg: '#38bdf8' }
        ]
      },
      {
        id: 'yangon',
        name: 'Yangon',
        banner: 'WELCOME TO YANGON (ရန်ကုန်)',
        gatePrimary: 0xfacc15,
        gateSecondary: 0xd97706,
        walls: [0xfef08a, 0xfde68a, 0xfdba74],
        roofs: [0xfacc15, 0xeab308, 0xd97706],
        accent: 0x10b981,
        signs: [
          { top: 'လက်ဖက်ရည်ဆိုင်', bottom: 'YANGON TEA SHOP', bg: '#065f46', fg: '#fef08a' },
          { top: 'မုန့်ဟင်းခါး',    bottom: 'MOHINGA STALL',   bg: '#991b1b', fg: '#ffffff' },
          { top: 'ရွှေတိဂုံ',       bottom: 'GOLDEN PAGODA',   bg: '#78350f', fg: '#facc15' }
        ]
      },
      {
        id: 'pastel',
        name: 'Pastel Metro',
        banner: 'WELCOME TO PASTEL METRO',
        gatePrimary: 0x38bdf8,
        gateSecondary: 0xfacc15,
        walls: [0x5eead4, 0xd8b4fe, 0xfde047, 0x93c5fd, 0xfda4af, 0x6ee7b7],
        roofs: [0x334155, 0x1e293b, 0x475569],
        accent: 0xef4444,
        signs: [
          { top: 'ARCADE', bottom: 'VOXEL CAFE',   bg: '#0f172a', fg: '#00f5d4' },
          { top: 'BAKERY', bottom: 'SWEET DONUTS', bg: '#be185d', fg: '#fef08a' },
          { top: 'GAMING', bottom: 'CYBER SHOP',   bg: '#1e1b4b', fg: '#38bdf8' }
        ]
      }
    ];

    const TIME_PRESETS = [
      {
        id: 'day',
        name: 'Mint Day',
        skyHex: 0x6bf2c6,
        fogHex: 0x6bf2c6,
        roadHex: 0x3b4254,
        sidewalkHex: 0xcfd8e3,
        hemiSky: 0xffffff,
        hemiGround: 0x334155,
        hemiInt: 0.74,
        dirHex: 0xfffbeb,
        dirInt: 0.94,
        sunPos: [36, 52, 24],
        windowEmissive: 0.0,
        lightsOn: false,
        moteColor: 0xffffff,
        moteOpacity: 0.0
      },
      {
        id: 'morning',
        name: 'Rose Dawn',
        skyHex: 0xdf8375,
        fogHex: 0xdf8375,
        roadHex: 0x3d3542,
        sidewalkHex: 0xd6bfc2,
        hemiSky: 0xffedd5,
        hemiGround: 0x272030,
        hemiInt: 0.64,
        dirHex: 0xfde68a,
        dirInt: 0.98,
        sunPos: [54, 25, 18],
        windowEmissive: 0.45,
        lightsOn: false,
        moteColor: 0xfffbeb,
        moteOpacity: 0.85
      },
      {
        id: 'evening',
        name: 'Amber Sunset',
        skyHex: 0xe37424,
        fogHex: 0xe37424,
        roadHex: 0x362d38,
        sidewalkHex: 0xd4b499,
        hemiSky: 0xfed7aa,
        hemiGround: 0x291d24,
        hemiInt: 0.58,
        dirHex: 0xffedd5,
        dirInt: 1.05,
        sunPos: [-54, 23, 15],
        windowEmissive: 0.95,
        lightsOn: true,
        moteColor: 0xfef08a,
        moteOpacity: 0.92
      },
      {
        id: 'night',
        name: 'Starry Night',
        skyHex: 0x070b19,
        fogHex: 0x070b19,
        roadHex: 0x182032,
        sidewalkHex: 0x334155,
        hemiSky: 0x38bdf8,
        hemiGround: 0x050811,
        hemiInt: 0.38,
        dirHex: 0x7dd3fc,
        dirInt: 0.52,
        sunPos: [-42, 34, 22],
        windowEmissive: 1.65,
        lightsOn: true,
        moteColor: 0xfef08a,
        moteOpacity: 1.0
      },
      {
        id: 'azure',
        name: 'Azure Dusk',
        skyHex: 0x257ca3,
        fogHex: 0x257ca3,
        roadHex: 0x283548,
        sidewalkHex: 0x94a3b8,
        hemiSky: 0xbae6fd,
        hemiGround: 0x1e293b,
        hemiInt: 0.62,
        dirHex: 0xe0f2fe,
        dirInt: 0.88,
        sunPos: [-48, 28, -18],
        windowEmissive: 1.15,
        lightsOn: true,
        moteColor: 0xe0f2fe,
        moteOpacity: 0.88
      }
    ];

    const WEATHER_MODES = [
      { id: 'clear',  name: 'Clear' },
      { id: 'autumn', name: 'Autumn Leaves' },
      { id: 'rain',   name: 'Rain' },
      { id: 'snow',   name: 'Snow' },
      { id: 'sakura', name: 'Sakura' }
    ];

    const LANES = [-5.4, -1.8, 1.8, 5.4];
    const ROAD_WIDTH = 16.5;
    const CARGO_CONFIG = Object.freeze({ capacity: 6, spacing: 0.72, crateHeight: 0.66, swayLimit: 0.5 });

    const gameState = {
      mode: 'home',
      score: 0,
      deliveries: 0,
      bestDeliveries: 0,
      bestDistance: 0,
      coins: 250,
      callsign: 'Courier',
      highScore: 0,
      lifetimeDeliveries: 0,
      maxRoofStack: 3,
      runCoinsEarned: 0,
      roofCrates: 3,
      vanSwayAngle: 0,
      cargoSwayVelocity: 0,
      cargoStress: 0,
      cargoDanger: 0,
      cargoLossCooldown: 0,
      lastCargoVelocity: 0,
      lastCargoSteerTime: -Infinity,
      lastCargoSteerDir: 0,
      nextSupplyDistance: 65,
      nextOverpassDistance: 100,
      combo: 1,
      nearMissCount: 0,
      perfectDropCount: 0,
      hearts: 3,
      maxHearts: 3,
      laneIndex: 2,
      currentX: LANES[2],
      vanZ: -5.4,
      throttle: 0.72,
      boostTimer: 0,
      slowMoEnergy: 6.0,
      maxSlowMoEnergy: 8.0,
      immortalTimer: 0,
      entranceTimer: 0,
      baseSpeed: 31,
      handSlots: [0, 2, 6],
      handModifiers: [null, null, null],
      selectedSlotIndex: 0,
      cityIndex: 0,
      timeIndex: 0,
      weatherIndex: 0,
      distanceMeters: 0,
      nextGateDistance: 220,
      invulnerableTimer: 0,
      dragging: false,
      dragSlotIndex: 0,
      dragSide: null,
      dragCancel: false,
      targetAptLock: null,
      // Overdrive & Power-Up States
      overdriveMeter: 0,
      overdriveActive: false,
      overdriveTimer: 0,
      droneAssistTimer: 0,
      coinMagnetTimer: 0,
      shieldBumperActive: false,
      // Dynamic Road Events
      survivalTimer: 0,
      rushHourActive: false,
      rushHourTimer: 0,
      nextRushHourAt: 60.0,
      // Courier Rank & Retention State
      courierXP: 0,
      courierRankLevel: 1,
      shiftContracts: [],
      vanTuning: {},
      // Step-by-Step Tutorial State
      tutorialActive: false,
      tutorialStep: 0,
      tutorialSteerCount: 0,
      tutorialCompletedOnce: false,
      // Garage & Progression State
      ownedVans: ['classic'],
      selectedVanIndex: 0,
      equippedVanId: 'classic',
      unlockedItems: [0, 2, 6],
      unlockedChars: ['goblin', 'inlechef']
    };

    const COURIER_RANKS = [
      { level: 1, title: 'Yangon Rookie', xpNeeded: 300, badgeBg: 'bg-slate-700 text-sky-200' },
      { level: 2, title: 'Midnight Runner', xpNeeded: 750, badgeBg: 'bg-emerald-600 text-white' },
      { level: 3, title: 'ASEAN Express', xpNeeded: 1500, badgeBg: 'bg-cyan-600 text-slate-950 font-bold' },
      { level: 4, title: 'Cyber Courier', xpNeeded: 2600, badgeBg: 'bg-purple-600 text-amber-200 font-bold' },
      { level: 5, title: 'Digit7 Legend', xpNeeded: 4200, badgeBg: 'bg-amber-400 text-slate-950 font-extrabold' }
    ];

    const CONTRACT_TEMPLATES = [
      { id: 'deliv_run', title: 'Deliver 5 Parcels in a Single Run', target: 5, type: 'deliveries_run', rewardCoins: 150, rewardXP: 100 },
      { id: 'perfect_3', title: 'Land 3 Perfect Drops', target: 3, type: 'perfect_drops', rewardCoins: 150, rewardXP: 120 },
      { id: 'near_miss_4', title: 'Perform 4 Traffic Near-Misses', target: 4, type: 'near_misses', rewardCoins: 150, rewardXP: 110 },
      { id: 'yangon_coins', title: 'Collect 40 Coins in Yangon', target: 40, type: 'yangon_coins', rewardCoins: 150, rewardXP: 100 },
      { id: 'combo_5', title: 'Reach Combo x5 without crashing', target: 5, type: 'combo_max', rewardCoins: 150, rewardXP: 130 },
      { id: 'dist_500', title: 'Drive 500 Meters in a Shift', target: 500, type: 'distance_shift', rewardCoins: 150, rewardXP: 100 },
      { id: 'legend_item', title: 'Deliver a Legendary Tier Parcel', target: 1, type: 'legendary_drop', rewardCoins: 200, rewardXP: 150 }
    ];

    const TUNING_STAT_SPECS = {
      cargoMagnet: {
        name: 'Cargo Magnet', desc: 'Wider supply depot collection range', icon: '🧲',
        costs: [0, 100, 220, 360, 580], labels: ['Standard Reach', 'Reach +0.15m', 'Reach +0.30m', 'Reach +0.45m', 'Reach +0.60m']
      },
      headlights: {
        name: 'Headlight Beam', desc: 'Longer ground illumination in blackout zones', icon: '💡',
        costs: [0, 100, 220, 360, 580], labels: ['Standard Beam', 'Reach +2m', 'Reach +4m', 'Reach +6m', 'Reach +8m']
      },
      engine: {
        name: 'Engine Tune',
        desc: 'Boosts Top Speed & Score Multiplier',
        icon: '⚡',
        costs: [0, 120, 240, 400, 650],
        labels: ['Stock V4', 'Stage 1 Turbo (+4% Spd, +5% Pts)', 'Stage 2 Intercooler (+8% Spd, +10% Pts)', 'Stage 3 ECU Map (+12% Spd, +15% Pts)', 'Twin-Turbo Max (+18% Spd, +25% Pts)']
      },
      handling: {
        name: 'Suspension / Handling',
        desc: 'Faster Lane-Switch Snap & Reaction Speed',
        icon: '🎯',
        costs: [0, 100, 220, 360, 580],
        labels: ['Stock Springs', 'Sport Struts (+15% Snap)', 'Pro Sway Bars (+30% Snap)', 'Race Coilovers (+50% Snap)', 'Active Aero Dampers (+75% Snap)']
      },
      battery: {
        name: 'Chrono-Battery',
        desc: 'Extends Slow-Mo Aiming Duration & Lowers Drain',
        icon: '⏱️',
        costs: [0, 110, 230, 380, 600],
        labels: ['8.0s Capacity', '9.5s Capacity (+1.5s)', '11.0s Capacity (+3.0s)', '12.5s Capacity (+4.5s)', '14.5s Max & 30% Slower Drain']
      }
    };

    const SAVE_KEY = 'midnight_delivery_v1_save';
    const hudNumberFormat = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    function formatHudNumber(value) { return value < 100000 ? Math.round(value).toLocaleString('en') : hudNumberFormat.format(value); }

    function loadSavedProgression() {
      return courierDB.data.profile;
    }

    function saveProgression() {
      saveCourierProfile();
    }

