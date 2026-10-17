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
        key: 'ps5',
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
      { id: 'doge',      name: 'Golden Inle Chef', phrase: '"Much Parcel! Very Fast!"' },
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
      },
      {
        id: 'paris',
        name: 'Paris',
        banner: 'BIENVENUE À PARIS',
        gatePrimary: 0x2563eb,
        gateSecondary: 0xef4444,
        walls: [0xfef3c7, 0xf8fafc, 0xfde68a],
        roofs: [0x475569, 0x334155, 0x1e293b],
        accent: 0x2563eb,
        signs: [
          { top: 'BOULANGERIE', bottom: 'CROISSANTS & PAIN', bg: '#1e3a8a', fg: '#fef08a' },
          { top: 'CAFÉ DE PARIS', bottom: 'BISTRO PARISIEN',  bg: '#7f1d1d', fg: '#ffffff' },
          { top: 'PÂTISSERIE',   bottom: 'MACARONS ROYAUX',   bg: '#047857', fg: '#fde047' }
        ]
      },
      {
        id: 'rio',
        name: 'Rio de Janeiro',
        banner: 'BEM-VINDO AO RIO DE JANEIRO',
        gatePrimary: 0x16a34a,
        gateSecondary: 0xfacc15,
        walls: [0xf8fafc, 0xfef08a, 0x67e8f9],
        roofs: [0x0284c7, 0x15803d, 0xf97316],
        accent: 0x16a34a,
        signs: [
          { top: 'ÁGUA DE COCO', bottom: 'COPACABANA BEACH', bg: '#15803d', fg: '#facc15' },
          { top: 'CHURRASCARIA', bottom: 'SAMBA & GRILL',    bg: '#991b1b', fg: '#ffffff' },
          { top: 'AÇAÍ TROPICAL', bottom: 'PRAIA DE IPANEMA', bg: '#4a044e', fg: '#38bdf8' }
        ]
      },
      {
        id: 'washington',
        name: 'Washington D.C.',
        banner: 'WELCOME TO WASHINGTON D.C.',
        gatePrimary: 0x1d4ed8,
        gateSecondary: 0xef4444,
        walls: [0xf8fafc, 0xe2e8f0, 0x991b1b],
        roofs: [0x1e293b, 0x334155, 0x0f172a],
        accent: 0xef4444,
        signs: [
          { top: 'CAPITOL DINER', bottom: 'HOT DOGS & PIES',   bg: '#1e3a8a', fg: '#ffffff' },
          { top: 'SMITHSONIAN',   bottom: 'NATIONAL ARCHIVES', bg: '#0f172a', fg: '#facc15' },
          { top: 'THE MALL CAFE', bottom: 'COFFEE & PRETZELS', bg: '#b91c1c', fg: '#f8fafc' }
        ]
      },
      {
        id: 'dubai',
        name: 'Dubai',
        banner: 'مرحباً بكم في دبي (WELCOME TO DUBAI)',
        gatePrimary: 0xfacc15,
        gateSecondary: 0x0284c7,
        walls: [0x334155, 0x0f172a, 0xfef3c7],
        roofs: [0xfacc15, 0x38bdf8, 0xd97706],
        accent: 0x38bdf8,
        signs: [
          { top: 'سوق الذهب',     bottom: 'DUBAI GOLD SOUK',   bg: '#78350f', fg: '#facc15' },
          { top: 'مقهى القهوة',   bottom: 'ARABIC GAHWA CAFE', bg: '#0f172a', fg: '#00f5d4' },
          { top: 'برج مارينا',   bottom: 'MARINA SKY LOUNGE', bg: '#0369a1', fg: '#ffffff' }
        ]
      },
            {
        id: 'cairo',
        name: 'Cairo',
        banner: 'مرحباً بكم في القاهرة (WELCOME TO CAIRO)',
        gatePrimary: 0xd97706,
        gateSecondary: 0xfacc15,
        walls: [0xfde68a, 0xf59e0b, 0xd97706],
        roofs: [0xd97706, 0x92400e, 0x78350f],
        accent: 0xfacc15,
        signs: [
          { top: 'خان الخليلي',  bottom: 'KHAN EL-KHALILI BAZAAR', bg: '#7f1d1d', fg: '#facc15' },
          { top: 'قهوة النيل',   bottom: 'NILE-SIDE AHWA TEAHOUSE', bg: '#064e3b', fg: '#fef08a' },
          { top: 'أهرامات الجيزة', bottom: 'GIZA PYRAMID MARKET',   bg: '#78350f', fg: '#ffffff' }
        ]
      }
    ];

    const TIME_PRESETS = [
      {
        id: 'cozy_night',
        name: 'Cozy Midnight',
        skyHex: 0x0c1228,
        fogHex: 0x161e38,
        roadHex: 0x1d2436,
        sidewalkHex: 0x334155,
        hemiSky: 0x60a5fa,
        hemiGround: 0x0f172a,
        hemiInt: 0.65,
        dirHex: 0xfef08a,
        dirInt: 0.75,
        sunPos: [-36, 42, 20],
        windowEmissive: 1.85,
        lightsOn: true,
        moteColor: 0xfde047,
        moteOpacity: 0.95
      },
      {
        id: 'sunset_glow',
        name: 'Golden Sunset Twilight',
        skyHex: 0xd95d39,
        fogHex: 0xd95d39,
        roadHex: 0x332630,
        sidewalkHex: 0xcca685,
        hemiSky: 0xfed7aa,
        hemiGround: 0x241820,
        hemiInt: 0.72,
        dirHex: 0xffd166,
        dirInt: 1.15,
        sunPos: [-50, 24, 16],
        windowEmissive: 1.35,
        lightsOn: true,
        moteColor: 0xffd166,
        moteOpacity: 0.90
      },
      {
        id: 'sakura_dawn',
        name: 'Sakura Rose Dawn',
        skyHex: 0x8a5b78,
        fogHex: 0x8a5b78,
        roadHex: 0x382e3b,
        sidewalkHex: 0xd4b8c7,
        hemiSky: 0xfce7f3,
        hemiGround: 0x261928,
        hemiInt: 0.68,
        dirHex: 0xfbcfe8,
        dirInt: 0.98,
        sunPos: [48, 26, 18],
        windowEmissive: 0.85,
        lightsOn: false,
        moteColor: 0xf9a8d4,
        moteOpacity: 0.88
      },
      {
        id: 'starry_synth',
        name: 'Starry Synthwave',
        skyHex: 0x060914,
        fogHex: 0x060914,
        roadHex: 0x141c2c,
        sidewalkHex: 0x1e293b,
        hemiSky: 0x818cf8,
        hemiGround: 0x05070e,
        hemiInt: 0.48,
        dirHex: 0x00f5d4,
        dirInt: 0.65,
        sunPos: [-42, 34, 22],
        windowEmissive: 1.95,
        lightsOn: true,
        moteColor: 0x00f5d4,
        moteOpacity: 1.0
      },
      {
        id: 'warm_afternoon',
        name: 'Warm Sunny Breeze',
        skyHex: 0x48a9a6,
        fogHex: 0x48a9a6,
        roadHex: 0x384152,
        sidewalkHex: 0xc9d5e3,
        hemiSky: 0xfef3c7,
        hemiGround: 0x1e293b,
        hemiInt: 0.82,
        dirHex: 0xfffbeb,
        dirInt: 1.05,
        sunPos: [36, 52, 24],
        windowEmissive: 0.25,
        lightsOn: false,
        moteColor: 0xfef08a,
        moteOpacity: 0.45
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

    const gameState = {
      mode: 'home',
      score: 0,
      deliveries: 0,
      bestDeliveries: 0,
      bestDistance: 0,
      coins: 250,
      runCoinsEarned: 0,
      combo: 1,
      nearMissCount: 0,
      perfectDropCount: 0,
      hearts: 3,
      maxHearts: 5,
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
      selectedSlotIndex: 0,
      cityIndex: 0,
      timeIndex: 0,
      weatherIndex: 4,
      distanceMeters: 0,
      nextGateDistance: 220,
      invulnerableTimer: 0,
      dragging: false,
      dragSlotIndex: 0,
      dragSide: null,
      dragCancel: false,
      targetAptLock: null,
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
      unlockedChars: ['goblin', 'doge']
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

    function loadSavedProgression() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to load save from localStorage', e);
        return null;
      }
    }

    function saveProgression() {
      try {
        const payload = {
          coins: gameState.coins,
          bestDistance: gameState.bestDistance,
          bestDeliveries: gameState.bestDeliveries,
          ownedVans: gameState.ownedVans,
          equippedVanId: gameState.equippedVanId,
          unlockedItems: gameState.unlockedItems,
          unlockedChars: gameState.unlockedChars,
          courierXP: gameState.courierXP,
          courierRankLevel: gameState.courierRankLevel,
          shiftContracts: gameState.shiftContracts,
          vanTuning: gameState.vanTuning
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to save progression to localStorage', e);
      }
    }

