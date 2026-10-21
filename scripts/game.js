    // ============================================================================
    // 10. GAME STATE, 3D SHOWROOM GARAGE STAGE & ANIMATED PRIZE MACHINE
    // ============================================================================
    var playerVan = createPlayerDeliveryVan();
    window.playerVan = playerVan;
    playerVan.position.set(gameState.currentX, 0, gameState.vanZ);
    scene.add(playerVan);
    attachRoofCargoToVan(playerVan);

    // Neon Overdrive Aura Shell
    const overdriveAuraMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.8, 5.8),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.85 })
    );
    overdriveAuraMesh.position.y = 1.35;
    overdriveAuraMesh.visible = false;
    playerVan.add(overdriveAuraMesh);

    // Shield Bumper Forcefield Guard
    const shieldBumperMesh = new THREE.Group();
    const shieldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.15, 8, 24, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 })
    );
    shieldRing.rotation.y = Math.PI;
    shieldRing.position.set(0, 0.75, -2.6);
    shieldBumperMesh.add(shieldRing);
    shieldBumperMesh.visible = false;
    playerVan.add(shieldBumperMesh);

    // Collectible Drone Assist Quadcopter
    const droneGroup = new THREE.Group();
    const dOpt = { emissive: 0x00f5d4, emissiveIntensity: 0.95 };
    addVoxelBox(droneGroup, 0.75, 0.28, 0.75, 0, 0, 0, 0x0f172a, dOpt);
    addVoxelBox(droneGroup, 1.5, 0.08, 0.16, 0, 0.12, 0, 0x38bdf8);
    addVoxelBox(droneGroup, 0.16, 0.08, 1.5, 0, 0.12, 0, 0x38bdf8);
    const droneRotors = [];
    [[-0.75, 0, -0.75], [0.75, 0, -0.75], [-0.75, 0, 0.75], [0.75, 0, 0.75]].forEach(pos => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.12), new THREE.MeshBasicMaterial({ color: 0x00f5d4 }));
      r.position.set(pos[0], 0.2, pos[2]);
      droneGroup.add(r);
      droneRotors.push(r);
    });
    droneGroup.visible = false;
    scene.add(droneGroup);
    let droneThrowCooldown = 0;

    // 3D Architectural Blueprint Showroom Stage (Visible when gameState.mode === 'home')
    const blueprintGarageGroup = new THREE.Group();
    scene.add(blueprintGarageGroup);

    // Deep Midnight Wet-Look Asphalt Floor
    const studioFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ color: 0x090b12, roughness: 0.18, metalness: 0.55 })
    );
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.36;
    studioFloor.receiveShadow = true;
    blueprintGarageGroup.add(studioFloor);

    // Subtle Industrial Asphalt Seams
    const asphaltSeams = new THREE.GridHelper(48, 12, 0x181c28, 0x0e111a);
    asphaltSeams.position.y = -0.34;
    blueprintGarageGroup.add(asphaltSeams);

    // High-Contrast Cyan & Magenta Neon Reflections
    const garageNeonCyan = new THREE.PointLight(0x06b6d4, 2.4, 24, 1.8);
    garageNeonCyan.position.set(5.5, 1.6, -4.5);
    blueprintGarageGroup.add(garageNeonCyan);

    const garageNeonMagenta = new THREE.PointLight(0xd946ef, 1.9, 24, 1.8);
    garageNeonMagenta.position.set(-5.5, 2.2, -2.0);
    blueprintGarageGroup.add(garageNeonMagenta);

    // Warm Sodium Streetlamp Rim Light above-rear
    const garageStreetlampRim = new THREE.DirectionalLight(0xf59e0b, 1.85);
    garageStreetlampRim.position.set(-6, 15, 6);
    blueprintGarageGroup.add(garageStreetlampRim);

    // Surrounding Voxel Showroom Skyline Pillars pushed far back
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 38 + (i % 3) * 5;
      const h = 7 + (i % 4) * 4;
      const w = 3.2 + (i % 2) * 1.5;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      addVoxelBox(blueprintGarageGroup, w, h, w, bx, h / 2 - 0.35, bz, 0x0b0d14);
    }

    // Multi-Tiered Tactical Mechanical Turntable Podium
    const turntableGroup = new THREE.Group();
    blueprintGarageGroup.add(turntableGroup);

    const outerPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.85, 5.25, 0.32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0d0f17, roughness: 0.4, metalness: 0.6 })
    );
    outerPodium.position.y = -0.20;
    outerPodium.receiveShadow = true;
    turntableGroup.add(outerPodium);

    const innerPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.15, 4.35, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0x131722, roughness: 0.35, metalness: 0.5 })
    );
    innerPodium.position.y = -0.05;
    innerPodium.receiveShadow = true;
    turntableGroup.add(innerPodium);

    // Hazard Yellow & Dark Steel Rim Markings around Turntable
    for (let g = 0; g < 16; g++) {
      const a = (g / 16) * Math.PI * 2;
      const tooth = addVoxelBox(
        turntableGroup,
        0.55,
        0.22,
        0.55,
        Math.cos(a) * 4.55,
        -0.08,
        Math.sin(a) * 4.55,
        g % 2 === 0 ? 0xfacc15 : 0x1e2433,
        { emissive: g % 2 === 0 ? 0xd97706 : 0x000000, emissiveIntensity: g % 2 === 0 ? 0.35 : 0 }
      );
      tooth.rotation.y = -a;
    }

    const outerGlowRing = new THREE.Mesh(
      new THREE.RingGeometry(4.02, 4.18, 48),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    outerGlowRing.rotation.x = -Math.PI / 2;
    outerGlowRing.position.y = 0.05;
    turntableGroup.add(outerGlowRing);

    const innerGlowRing = new THREE.Mesh(
      new THREE.RingGeometry(2.75, 2.85, 48),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    innerGlowRing.rotation.x = -Math.PI / 2;
    innerGlowRing.position.y = 0.05;
    turntableGroup.add(innerGlowRing);

    // Twin Glowing Headlight Ground Reflection Discs on the wet asphalt
    const garageHeadlightSpotL = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.32, depthWrite: false })
    );
    garageHeadlightSpotL.rotation.x = -Math.PI / 2;
    garageHeadlightSpotL.position.set(-0.75, 0.02, -5.2);
    turntableGroup.add(garageHeadlightSpotL);

    const garageHeadlightSpotR = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.32, depthWrite: false })
    );
    garageHeadlightSpotR.rotation.x = -Math.PI / 2;
    garageHeadlightSpotR.position.set(0.75, 0.02, -5.2);
    turntableGroup.add(garageHeadlightSpotR);

    // Display Van Container on the Turntable
    const garageVanHolder = new THREE.Group();
    turntableGroup.add(garageVanHolder);

    const holoScanRing = { position: { y: 0 } };

    function rebuildGarageTurntableVan() {
      while (garageVanHolder.children.length > 0) {
        garageVanHolder.remove(garageVanHolder.children[0]);
      }
      const vanSpec = PLAYABLE_VANS[gameState.selectedVanIndex];
      const mesh = createPlayableVanMesh(vanSpec.id, true);
      mesh.position.set(0, 0.04, 0);
      if (mesh.userData.beamLeft) {
        mesh.userData.beamLeft.visible = true;
        mesh.userData.beamLeft.material.opacity = 0.45;
      }
      if (mesh.userData.beamRight) {
        mesh.userData.beamRight.visible = true;
        mesh.userData.beamRight.material.opacity = 0.45;
      }

      garageVanHolder.add(mesh);
      updateHomeGarageUI();
    }
    function updateCapsulePityUI() {
      const pityEpicEl = document.getElementById('capsule-pity-epic');
      const pityLegEl = document.getElementById('capsule-pity-legendary');
      const coinsReadout = document.getElementById('draw-coins-Readout');

      const pityEpic = gameState.capsulePityEpic || 0;
      const pityLeg = gameState.capsulePityLegendary || 0;

      if (pityEpicEl) pityEpicEl.textContent = `${Math.max(1, 10 - (pityEpic % 10))}`;
      if (pityLegEl) pityLegEl.textContent = `${Math.max(1, 30 - Math.min(29, pityLeg))}`;
      if (coinsReadout) coinsReadout.textContent = gameState.coins.toLocaleString();
    }

    function resetCapsuleModalStage() {
      const singleView = document.getElementById('capsule-single-view');
      const multiView = document.getElementById('capsule-multi-view');
      const singleActions = document.getElementById('capsule-single-actions');
      const mysteryCrate = document.getElementById('draw-mystery-crate');
      const vehicleImg = document.getElementById('draw-vehicle-img');
      const tierPill = document.getElementById('draw-tier-pill');
      const titleEl = document.getElementById('draw-result-title');
      const subEl = document.getElementById('draw-result-sub');
      const stageBox = document.getElementById('draw-stage-box');
      const sunburst = document.getElementById('draw-sunburst');
      const actionButtons = document.getElementById('capsule-action-buttons');

      if (singleView) singleView.classList.remove('hidden');
      if (multiView) {
        multiView.classList.add('hidden');
        multiView.classList.remove('flex');
      }
      if (singleActions) singleActions.classList.add('hidden');
      if (mysteryCrate) mysteryCrate.classList.remove('hidden');
      if (vehicleImg) vehicleImg.classList.add('hidden');
      if (actionButtons) actionButtons.classList.remove('hidden');
      if (tierPill) {
        tierPill.textContent = 'FLEET CAPSULE';
        tierPill.className = 'px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider -mt-1';
      }
      if (titleEl) titleEl.textContent = 'FLEET CAPSULE MACHINE';
      if (subEl) subEl.textContent = 'Spin for Common, Rare, Epic, & Legendary Delivery Rigs';
      if (sunburst) sunburst.style.opacity = '0.35';
      if (stageBox) {
        stageBox.classList.remove('prize-reveal-anim', 'capsule-tumbling');
        stageBox.classList.add('blind-crate-idle');
        stageBox.style.borderColor = '#facc15';
        stageBox.style.boxShadow = '0 0 30px rgba(250,204,21,0.45)';
      }
      updateCapsulePityUI();
    }

    function rollGachaRarity(guaranteeEpicOrHigher = false) {
      const pityLeg = gameState.capsulePityLegendary || 0;
      const pityEpic = gameState.capsulePityEpic || 0;

      if (pityLeg >= 29) return 'LEGENDARY';
      if (guaranteeEpicOrHigher || pityEpic >= 9) {
        return Math.random() < 0.20 ? 'LEGENDARY' : 'EPIC';
      }

      const rand = Math.random();
      if (rand < RARITY_TIERS.LEGENDARY.dropRate) return 'LEGENDARY';
      if (rand < RARITY_TIERS.LEGENDARY.dropRate + RARITY_TIERS.EPIC.dropRate) return 'EPIC';
      if (rand < RARITY_TIERS.LEGENDARY.dropRate + RARITY_TIERS.EPIC.dropRate + RARITY_TIERS.RARE.dropRate) return 'RARE';
      return 'COMMON';
    }

    function executeSingleCapsulePull(guaranteeEpicOrHigher = false) {
      const rarity = rollGachaRarity(guaranteeEpicOrHigher);
      const tierInfo = RARITY_TIERS[rarity] || RARITY_TIERS.COMMON;
      const matchingVans = PLAYABLE_VANS.filter(v => v.rarity === rarity);
      const pool = matchingVans.length > 0 ? matchingVans : PLAYABLE_VANS;

      // 80% bias toward unowned vehicles in that rarity tier if any exist
      const unowned = pool.filter(v => !gameState.ownedVans.includes(v.id));
      let wonVan;
      if (unowned.length > 0 && Math.random() < 0.80) {
        wonVan = unowned[Math.floor(Math.random() * unowned.length)];
      } else {
        wonVan = pool[Math.floor(Math.random() * pool.length)];
      }

      // Update Pity counters
      if (rarity === 'LEGENDARY') {
        gameState.capsulePityLegendary = 0;
        gameState.capsulePityEpic = 0;
      } else if (rarity === 'EPIC') {
        gameState.capsulePityEpic = 0;
        gameState.capsulePityLegendary = (gameState.capsulePityLegendary || 0) + 1;
      } else {
        gameState.capsulePityEpic = (gameState.capsulePityEpic || 0) + 1;
        gameState.capsulePityLegendary = (gameState.capsulePityLegendary || 0) + 1;
      }
      gameState.capsuleTotalPulls = (gameState.capsuleTotalPulls || 0) + 1;

      const wasNew = !gameState.ownedVans.includes(wonVan.id);
      let scrapCoins = 0;
      if (wasNew) {
        gameState.ownedVans.push(wonVan.id);
      } else {
        scrapCoins = tierInfo.scrapCoins || 60;
        gameState.coins += scrapCoins;
      }

      return { van: wonVan, rarity, tierInfo, wasNew, scrapCoins };
    }

    let isSpinningCapsule = false;
    let lastWonVanId = null;

    function spinCapsuleDraw(pullCount = 1) {
      if (isSpinningCapsule) return;
      const cost = pullCount === 10 ? 900 : 100;

      const titleEl = document.getElementById('draw-result-title');
      const subEl = document.getElementById('draw-result-sub');

      if (gameState.coins < cost) {
        soundFX.playCrash();
        if (titleEl) titleEl.textContent = `INSUFFICIENT COINS (NEED ${cost})`;
        if (subEl) subEl.textContent = 'Deliver wishes on the road to earn coins or complete shift contracts!';
        return;
      }

      soundFX.init();
      isSpinningCapsule = true;
      gameState.coins -= cost;
      updateHomeGarageUI();
      updateCapsulePityUI();
      saveProgression();

      const stageBox = document.getElementById('draw-stage-box');
      const mysteryCrate = document.getElementById('draw-mystery-crate');
      const vehicleImg = document.getElementById('draw-vehicle-img');
      const tierPill = document.getElementById('draw-tier-pill');
      const sunburst = document.getElementById('draw-sunburst');
      const singleView = document.getElementById('capsule-single-view');
      const multiView = document.getElementById('capsule-multi-view');
      const singleActions = document.getElementById('capsule-single-actions');

      if (singleView) singleView.classList.remove('hidden');
      if (multiView) {
        multiView.classList.add('hidden');
        multiView.classList.remove('flex');
      }
      if (singleActions) singleActions.classList.add('hidden');
      if (mysteryCrate) mysteryCrate.classList.remove('hidden');
      if (vehicleImg) vehicleImg.classList.add('hidden');

      if (stageBox) {
        stageBox.classList.remove('prize-reveal-anim', 'blind-crate-idle');
        stageBox.classList.add('capsule-tumbling');
      }
      if (sunburst) sunburst.style.opacity = '0.9';
      if (titleEl) titleEl.textContent = pullCount === 10 ? 'OPENING 10x FLEET CRATES...' : 'DISPENSING CAPSULE CAPSULE...';
      if (subEl) subEl.textContent = 'Querying global courier requisition database...';

      // Execute pull logic
      const results = [];
      if (pullCount === 10) {
        let gotEpicOrHigher = false;
        for (let i = 0; i < 9; i++) {
          const res = executeSingleCapsulePull(false);
          if (res.rarity === 'EPIC' || res.rarity === 'LEGENDARY') gotEpicOrHigher = true;
          results.push(res);
        }
        // 10th pull is guaranteed Epic+ if none hit yet
        results.push(executeSingleCapsulePull(!gotEpicOrHigher));
      } else {
        results.push(executeSingleCapsulePull(false));
      }

      // Mystery badges animation
      const mysteryBadges = ['COMMON ★', 'RARE ★★', 'EPIC ★★★', 'LEGENDARY ★★★★★', 'LOCKED RIG', 'UNBOXING!'];
      const totalSteps = pullCount === 10 ? 18 : 14;
      let step = 0;

      function nextTick() {
        if (tierPill) tierPill.textContent = mysteryBadges[step % mysteryBadges.length];
        soundFX.playReelTick(320 + step * 28);
        step++;
        if (step < totalSteps) {
          const delay = 45 + Math.pow(step / totalSteps, 2.0) * 150;
          setTimeout(nextTick, delay);
        } else {
          // Reveal Results!
          if (stageBox) stageBox.classList.remove('capsule-tumbling');
          if (pullCount === 10) {
            renderGachaMultiResult(results);
          } else {
            renderGachaSingleResult(results[0]);
          }
          isSpinningCapsule = false;
          saveProgression();
          updateHomeGarageUI();
          updateCapsulePityUI();
        }
      }
      nextTick();
    }

    function renderGachaSingleResult(res) {
      const stageBox = document.getElementById('draw-stage-box');
      const mysteryCrate = document.getElementById('draw-mystery-crate');
      const vehicleImg = document.getElementById('draw-vehicle-img');
      const tierPill = document.getElementById('draw-tier-pill');
      const titleEl = document.getElementById('draw-result-title');
      const subEl = document.getElementById('draw-result-sub');
      const singleActions = document.getElementById('capsule-single-actions');

      if (mysteryCrate) mysteryCrate.classList.add('hidden');
      if (vehicleImg) {
        vehicleImg.src = vanIconDataURLs[res.van.id] || vanIconDataURLs['classic'] || '';
        vehicleImg.classList.remove('hidden');
      }

      lastWonVanId = res.van.id;

      if (tierPill) {
        tierPill.textContent = `${res.tierInfo.stars} ${res.van.rarity}`;
        tierPill.className = `px-2.5 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider -mt-1 ${res.tierInfo.bgClass || 'bg-slate-700 text-white'}`;
      }

      if (stageBox) {
        stageBox.style.borderColor = res.tierInfo.color || '#facc15';
        stageBox.style.boxShadow = `0 0 32px ${res.tierInfo.glowColor || 'rgba(250,204,21,0.5)'}`;
        void stageBox.offsetWidth;
        stageBox.classList.add('prize-reveal-anim');
      }

      if (res.wasNew) {
        soundFX.playCapsuleFanfare(res.van.rarity);
        triggerPrizeConfetti();
        if (titleEl) titleEl.textContent = `✨ UNLOCKED: ${res.van.name.toUpperCase()}!`;
        if (subEl) subEl.textContent = `${res.tierInfo.stars} ${res.van.rarity} • Added to your Garage Fleet!`;
      } else {
        soundFX.playDeliverSuccess();
        triggerPrizeConfetti();
        if (titleEl) titleEl.textContent = `FLEET DUPLICATE: ${res.van.name.toUpperCase()}`;
        if (subEl) subEl.textContent = `Scrapped into +${res.scrapCoins} Coins Refund!`;
      }

      if (singleActions) singleActions.classList.remove('hidden');
    }

    function renderGachaMultiResult(results) {
      const singleView = document.getElementById('capsule-single-view');
      const multiView = document.getElementById('capsule-multi-view');
      const grid = document.getElementById('capsule-multi-grid');
      const summaryEl = document.getElementById('capsule-multi-summary');

      if (singleView) singleView.classList.add('hidden');
      if (multiView) {
        multiView.classList.remove('hidden');
        multiView.classList.add('flex');
      }

      // Count new rigs and scrap refund
      const newCount = results.filter(r => r.wasNew).length;
      const totalScrap = results.reduce((sum, r) => sum + r.scrapCoins, 0);

      // Highest rarity pulled
      const rarityRank = { 'LEGENDARY': 4, 'EPIC': 3, 'RARE': 2, 'COMMON': 1 };
      let highestRarity = 'COMMON';
      let bestVanId = results[0].van.id;
      results.forEach(r => {
        if (rarityRank[r.rarity] > rarityRank[highestRarity]) {
          highestRarity = r.rarity;
          bestVanId = r.van.id;
        }
      });
      lastWonVanId = bestVanId;

      soundFX.playCapsuleFanfare(highestRarity);
      triggerPrizeConfetti();

      if (summaryEl) {
        summaryEl.textContent = `✨ ${newCount} New Rig(s) Unlocked • +${totalScrap} Coins Refunded`;
      }

      if (grid) {
        grid.innerHTML = results.map((r) => {
          const t = r.tierInfo;
          const cardClass = `capsule-card-${t.id || 'common'}`;
          return `
            <div class="${cardClass} rounded-2xl p-2 flex flex-col items-center justify-between text-center relative overflow-hidden transition-transform hover:scale-105">
              <div class="flex items-center justify-between w-full text-[8px] font-extrabold">
                <span class="text-amber-300 font-mono">${t.stars}</span>
                <span class="px-1.5 py-0.2 rounded text-[7px] ${t.bgClass || 'bg-slate-700 text-white'}">${r.rarity}</span>
              </div>
              <img src="${vanIconDataURLs[r.van.id] || ''}" alt="${r.van.name}" class="w-14 h-14 sm:w-16 sm:h-16 object-contain my-1 drop-shadow" />
              <div class="text-[9px] sm:text-[10px] font-extrabold text-white truncate max-w-full">${r.van.name}</div>
              <div class="mt-1">
                ${r.wasNew 
                  ? '<span class="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[8px] animate-pulse">NEW!</span>'
                  : `<span class="px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-300 font-extrabold text-[8px]">+${r.scrapCoins} 🪙</span>`}
              </div>
            </div>
          `;
        }).join('');
      }
    }

        // RETENTION & PROGRESSION LOOP: CONTRACTS, COURIER RANKS & RIG TUNING
    // ============================================================================
    function initSavedProgression() {
      const saved = loadSavedProgression();
      if (saved) {
        gameState.callsign = saved.callsign;
        gameState.highScore = saved.highScore;
        gameState.lifetimeDeliveries = saved.lifetimeDeliveries;
        gameState.tutorialCompletedOnce = saved.tutorialCompletedOnce;
        if (typeof saved.coins === 'number') gameState.coins = saved.coins;
        if (typeof saved.bestDistance === 'number') gameState.bestDistance = saved.bestDistance;
        if (typeof saved.bestDeliveries === 'number') gameState.bestDeliveries = saved.bestDeliveries;
        if (Array.isArray(saved.ownedVans) && saved.ownedVans.length > 0) gameState.ownedVans = saved.ownedVans;
        if (saved.equippedVanId) gameState.equippedVanId = saved.equippedVanId;
        if (typeof saved.capsulePityEpic === 'number') gameState.capsulePityEpic = saved.capsulePityEpic;
        if (typeof saved.capsulePityLegendary === 'number') gameState.capsulePityLegendary = saved.capsulePityLegendary;
        if (typeof saved.capsuleTotalPulls === 'number') gameState.capsuleTotalPulls = saved.capsuleTotalPulls;
        if (Array.isArray(saved.unlockedItems)) gameState.unlockedItems = saved.unlockedItems;
        if (Array.isArray(saved.unlockedChars)) gameState.unlockedChars = saved.unlockedChars;
        if (typeof saved.courierXP === 'number') gameState.courierXP = saved.courierXP;
        if (typeof saved.courierRankLevel === 'number') gameState.courierRankLevel = saved.courierRankLevel;
        if (Array.isArray(saved.shiftContracts)) gameState.shiftContracts = saved.shiftContracts;
        if (saved.vanTuning && typeof saved.vanTuning === 'object') gameState.vanTuning = saved.vanTuning;
      }
      ensureActiveContracts();
      const eqIdx = PLAYABLE_VANS.findIndex(v => v.id === gameState.equippedVanId);
      if (eqIdx !== -1) gameState.selectedVanIndex = eqIdx;

      const battLvl = getVanTuningLevel(gameState.equippedVanId, 'battery');
      gameState.maxSlowMoEnergy = 8.0 + (battLvl - 1) * 1.5;
      gameState.slowMoEnergy = gameState.maxSlowMoEnergy;
    }

    function ensureActiveContracts() {
      if (!Array.isArray(gameState.shiftContracts)) gameState.shiftContracts = [];
      gameState.shiftContracts = gameState.shiftContracts.filter(c => !c.completed);
      while (gameState.shiftContracts.length < 3) {
        const activeIds = gameState.shiftContracts.map(c => c.id);
        const pool = CONTRACT_TEMPLATES.filter(t => !activeIds.includes(t.id));
        const pick = pool.length > 0
          ? pool[Math.floor(Math.random() * pool.length)]
          : CONTRACT_TEMPLATES[Math.floor(Math.random() * CONTRACT_TEMPLATES.length)];
        gameState.shiftContracts.push({
          id: pick.id,
          title: pick.title,
          target: pick.target,
          type: pick.type,
          current: 0,
          rewardCoins: pick.rewardCoins,
          rewardXP: pick.rewardXP,
          completed: false,
          claimed: false
        });
      }
      saveProgression();
    }

    function getVanTuningLevel(vanId, statKey) {
      if (!gameState.vanTuning) gameState.vanTuning = {};
      if (!gameState.vanTuning[vanId]) {
        gameState.vanTuning[vanId] = { engine: 1, handling: 1, battery: 1 };
      }
      if (!gameState.vanTuning[vanId][statKey]) {
        gameState.vanTuning[vanId][statKey] = 1;
      }
      return gameState.vanTuning[vanId][statKey];
    }

    function addCourierXP(amount) {
      gameState.courierXP = (gameState.courierXP || 0) + amount;
      let leveledUp = false;
      while (gameState.courierRankLevel < COURIER_RANKS.length) {
        const currentRankSpec = COURIER_RANKS.find(r => r.level === gameState.courierRankLevel);
        if (currentRankSpec && gameState.courierXP >= currentRankSpec.xpNeeded) {
          gameState.courierRankLevel++;
          leveledUp = true;
        } else {
          break;
        }
      }
      if (leveledUp) {
        soundFX.playCityGateChime();
        const newRank = COURIER_RANKS.find(r => r.level === gameState.courierRankLevel);
        gameState.coins += 200;
        triggerDiscoveryToast(`PROMOTED: ${newRank.title}! (+200 COINS)`, vanIconDataURLs[gameState.equippedVanId]);
        // Rank level up
      }
      updateRankUI();
      saveProgression();
    }

    function updateContractProgress(type, amount = 1, isMaxCheck = false) {
      if (!gameState.shiftContracts) return;
      let updated = false;
      gameState.shiftContracts.forEach((c) => {
        if (c.type === type && !c.completed) {
          const previousProgress = c.current;
          if (isMaxCheck) {
            c.current = Math.min(c.target, Math.max(c.current, amount));
          } else {
            c.current = Math.min(c.target, c.current + amount);
          }
          if (c.current === previousProgress) return;
          if (c.current >= c.target) {
            c.completed = true;
            c.claimed = true;
            gameState.coins += c.rewardCoins;
            gameState.runCoinsEarned += c.rewardCoins;
            soundFX.playCityGateChime();
            showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), `MISSION COMPLETE! +${c.rewardCoins}`, 'combat-text-gold');
            addCourierXP(c.rewardXP);
          }
          updated = true;
        }
      });
      if (updated) {
        saveProgression();
        renderHomeContractsUI();
      }
    }

    function updateRankUI() {
      const rankSpec = COURIER_RANKS.find(r => r.level === gameState.courierRankLevel) || COURIER_RANKS[0];
      const nextRankSpec = COURIER_RANKS.find(r => r.level === gameState.courierRankLevel + 1);

      const prevXpNeeded = rankSpec.level === 1 ? 0 : (COURIER_RANKS[rankSpec.level - 2]?.xpNeeded || 0);
      const targetXp = rankSpec.xpNeeded;
      const progressPercent = nextRankSpec
        ? Math.min(100, Math.max(0, ((gameState.courierXP - prevXpNeeded) / (targetXp - prevXpNeeded)) * 100))
        : 100;

      const modalBadge = document.getElementById('modal-rank-badge');
      const modalTag = document.getElementById('modal-rank-level-tag');
      const modalTitle = document.getElementById('modal-rank-title');
      const modalFill = document.getElementById('modal-rank-progress-fill');
      const modalXp = document.getElementById('modal-rank-xp-readout');
      const modalNext = document.getElementById('modal-rank-next');

      if (modalBadge) {
        modalBadge.textContent = `R${rankSpec.level}`;
        modalBadge.className = `w-12 h-12 rounded-2xl ${rankSpec.badgeBg} border-2 border-white flex items-center justify-center font-extrabold text-base arcade-font shadow flex-shrink-0`;
      }
      if (modalTag) modalTag.textContent = `LEVEL ${rankSpec.level}`;
      if (modalTitle) modalTitle.textContent = rankSpec.title;
      if (modalFill) modalFill.style.width = `${progressPercent}%`;
      if (modalXp) modalXp.textContent = nextRankSpec
        ? `${gameState.courierXP} / ${targetXp} XP`
        : `${gameState.courierXP} XP (MAX RANK)`;
      if (modalNext) modalNext.textContent = nextRankSpec ? nextRankSpec.title : 'DIGIT7 MASTER COURIER';
    }

    function renderHomeContractsUI() {
      if (!gameState.shiftContracts || gameState.shiftContracts.length === 0) {
        ensureActiveContracts();
      }
    }

    function renderContractsModal() {
      updateRankUI();
      const listEl = document.getElementById('modal-contracts-list');
      if (!listEl) return;
      if (!gameState.shiftContracts || gameState.shiftContracts.length === 0) {
        ensureActiveContracts();
      }
      listEl.innerHTML = gameState.shiftContracts.map((c) => {
        const pct = Math.min(100, Math.round((c.current / c.target) * 100));
        const isDone = c.completed;
        return `
          <div class="bg-slate-950/85 border-2 ${isDone ? 'border-emerald-400 bg-emerald-950/20' : 'border-sky-500/30'} rounded-2xl p-3 flex items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm">${isDone ? '✅' : '📦'}</span>
                <span class="arcade-font text-sm text-white truncate">${c.title}</span>
              </div>
              <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/20 my-1">
                <div class="h-full ${isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-cyan-300'}" style="width: ${pct}%"></div>
              </div>
              <div class="flex items-center gap-3 text-[10px] text-sky-300 font-semibold">
                <span>Progress: <strong class="text-white">${c.current} / ${c.target}</strong></span>
                <span>Reward: <strong class="text-amber-300">+${c.rewardCoins} Coins</strong></span>
                <span>XP: <strong class="text-cyan-300">+${c.rewardXP} XP</strong></span>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="px-2.5 py-1 rounded-lg ${isDone ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-sky-200 font-bold'} text-[10px] uppercase">
                ${isDone ? 'COMPLETED' : `${pct}%`}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderTuningModal() {
      const vanSpec = PLAYABLE_VANS[gameState.selectedVanIndex];
      const isOwned = gameState.ownedVans.includes(vanSpec.id);

      const imgEl = document.getElementById('tuning-van-img');
      const nameEl = document.getElementById('tuning-van-name');
      const tierEl = document.getElementById('tuning-van-tier');
      const coinsReadout = document.getElementById('tuning-coins-readout');
      const container = document.getElementById('tuning-stats-container');

      if (imgEl) imgEl.src = vanIconDataURLs[vanSpec.id] || vanIconDataURLs['classic'] || '';
      if (nameEl) nameEl.textContent = vanSpec.name;
      if (tierEl) {
        const rInfo = (typeof RARITY_TIERS !== 'undefined' && RARITY_TIERS[vanSpec.rarity]) ? RARITY_TIERS[vanSpec.rarity] : { stars: '', bgClass: 'bg-slate-700 text-white' };
        tierEl.textContent = isOwned ? `${rInfo.stars} ${vanSpec.rarity || vanSpec.tier}` : 'LOCKED RIG';
        tierEl.className = `px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${isOwned ? (rInfo.bgClass || 'bg-amber-400 text-slate-950') : 'bg-rose-500 text-white'}`;
      }
      if (coinsReadout) coinsReadout.textContent = gameState.coins.toLocaleString();

      if (!container) return;
      container.innerHTML = Object.keys(TUNING_STAT_SPECS).map((statKey) => {
        const spec = TUNING_STAT_SPECS[statKey];
        const currentLvl = getVanTuningLevel(vanSpec.id, statKey);
        const isMax = currentLvl >= 5;
        const nextCost = isMax ? 0 : spec.costs[currentLvl];
        const canAfford = gameState.coins >= nextCost && isOwned && !isMax;

        const pipsHtml = [1, 2, 3, 4, 5].map((lvl) => {
          return `<div class="stat-pip ${lvl <= currentLvl ? 'pip-active' : 'pip-inactive'}"></div>`;
        }).join('');

        return `
          <div class="bg-slate-950/90 rounded-2xl p-3 border-2 border-sky-500/30">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">${spec.icon}</span>
                <div>
                  <div class="arcade-font text-sm sm:text-base text-white leading-tight">${spec.name}</div>
                  <div class="text-[9px] text-sky-300 font-semibold">${spec.desc}</div>
                </div>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase">
                  ${isMax ? 'MAX LEVEL 5' : `LV.${currentLvl} / 5`}
                </span>
              </div>
            </div>

            <!-- Pips Bar -->
            <div class="flex items-center gap-1.5 my-2">
              ${pipsHtml}
            </div>

            <!-- Current Spec Label & Upgrade Action -->
            <div class="flex items-center justify-between pt-1 border-t border-sky-400/20">
              <span class="text-[10px] text-amber-200 font-bold truncate max-w-[200px] sm:max-w-xs">
                ${spec.labels[currentLvl - 1]}
              </span>
              <button data-upgrade-stat="${statKey}" ${!canAfford ? 'disabled' : ''} class="arcade-btn px-3 py-1.5 rounded-xl font-extrabold text-[10px] sm:text-xs arcade-font flex items-center gap-1 ${
                isMax
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                  : (canAfford ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 cursor-pointer' : 'bg-slate-800 text-sky-400/60 border-slate-700 cursor-not-allowed')
              }">
                ${isMax ? 'MAXED' : `UPGRADE (${nextCost} 🪙)`}
              </button>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('[data-upgrade-stat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const statKey = btn.dataset.upgradeStat;
          const currentLvl = getVanTuningLevel(vanSpec.id, statKey);
          if (currentLvl >= 5 || !isOwned) return;
          const cost = TUNING_STAT_SPECS[statKey].costs[currentLvl];
          if (gameState.coins >= cost) {
            gameState.coins -= cost;
            gameState.vanTuning[vanSpec.id][statKey] = currentLvl + 1;
            soundFX.init();
            soundFX.playCityGateChime();
            saveProgression();
            updateHomeGarageUI();
            renderTuningModal();
            triggerDiscoveryToast(`UPGRADED: ${TUNING_STAT_SPECS[statKey].name} LV.${currentLvl + 1}!`, vanIconDataURLs[vanSpec.id]);
          } else {
            soundFX.playCrash();
          }
        });
      });
    }

    function renderGameOverContracts() {
      const container = document.getElementById('gameover-contracts-list');
      const xpGainedEl = document.getElementById('gameover-xp-gained');
      if (xpGainedEl) xpGainedEl.textContent = `COURIER RANK LV.${gameState.courierRankLevel} • ${gameState.courierXP} XP`;
      if (!container || !gameState.shiftContracts) return;

      container.innerHTML = gameState.shiftContracts.map((c) => {
        const pct = Math.min(100, Math.round((c.current / c.target) * 100));
        const isDone = c.completed;
        return `
          <div class="flex items-center justify-between text-[10px] bg-slate-900/90 px-2.5 py-1.5 rounded-xl border ${isDone ? 'border-emerald-400 text-emerald-300' : 'border-slate-700 text-sky-200'}">
            <div class="flex items-center gap-1.5 min-w-0">
              <span>${isDone ? '✅' : '📋'}</span>
              <span class="font-bold truncate max-w-[170px]">${c.title}</span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="font-extrabold text-amber-300">${c.current}/${c.target}</span>
              <span class="px-1.5 py-0.2 rounded ${isDone ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300'} text-[8px]">
                ${isDone ? '+150 🪙' : `${pct}%`}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    function updateHomeGarageUI() {
      const spec = PLAYABLE_VANS[gameState.selectedVanIndex];
      const isOwned = gameState.ownedVans.includes(spec.id);

      document.getElementById('home-coins-val').textContent = gameState.coins.toLocaleString();
      document.getElementById('hud-coins-val').textContent = gameState.coins.toLocaleString();
      document.getElementById('draw-coins-Readout').textContent = gameState.coins.toLocaleString();
      document.getElementById('home-best-dist').textContent = `${Math.round(gameState.bestDistance)}m`;
      const totalUnlocked = gameState.unlockedItems.length + gameState.unlockedChars.length;
      const totalPossible = PARCEL_TYPES.length + CHARACTER_TYPES.length;
      const unlockedEl = document.getElementById('home-unlocked-count');
      if (unlockedEl) unlockedEl.textContent = `${totalUnlocked} / ${totalPossible}`;
      const hallSub = document.getElementById('hall-subtitle');
      if (hallSub) hallSub.textContent = `${totalUnlocked}/${totalPossible} Discovered`;

      const cityTag = document.getElementById('home-city-tag');
      if (cityTag) {
        const currentCity = CITY_THEMES[gameState.cityIndex] || CITY_THEMES[0];
        const num = String(gameState.cityIndex + 1).padStart(2, '0');
        cityTag.textContent = `SHIFT ${num} — ${currentCity.name.toUpperCase()}`;
      }

      document.getElementById('home-van-name').textContent = spec.name;
      const rarityBadge = document.getElementById('home-van-rarity');
      if (rarityBadge) {
        const rInfo = (typeof RARITY_TIERS !== 'undefined' && RARITY_TIERS[spec.rarity]) ? RARITY_TIERS[spec.rarity] : { stars: '★', bgClass: 'bg-slate-700 text-white' };
        rarityBadge.textContent = `${rInfo.stars} ${spec.rarity || 'COMMON'}`;
        rarityBadge.className = `px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-extrabold uppercase shadow-sm ${rInfo.bgClass || 'bg-slate-700 text-white'}`;
      }
      document.getElementById('home-van-sub').textContent =
        `Owned Fleet: ${gameState.ownedVans.length} / ${PLAYABLE_VANS.length} Vehicles`;

      const dotsEl = document.getElementById('home-van-dots');
      if (dotsEl) {
        dotsEl.innerHTML = PLAYABLE_VANS.map((v, idx) => {
          const owned = gameState.ownedVans.includes(v.id);
          const active = idx === gameState.selectedVanIndex;
          return `<button data-van-idx="${idx}" class="h-2 rounded transition-all ${
            active ? 'w-6 bg-amber-400' : (owned ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-700')
          }"></button>`;
        }).join('');
        dotsEl.querySelectorAll('button').forEach((btn) => {
          btn.addEventListener('click', () => {
            soundFX.init();
            soundFX.playReelTick(500);
            gameState.selectedVanIndex = parseInt(btn.dataset.vanIdx, 10);
            rebuildGarageTurntableVan();
          });
        });
      }

      const statusBadge = document.getElementById('home-van-status');
      if (isOwned) {
        gameState.equippedVanId = spec.id;
        statusBadge.textContent = 'EQUIPPED';
        statusBadge.className = 'px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-extrabold text-[8px] uppercase';
      } else {
        statusBadge.textContent = 'LOCKED';
        statusBadge.className = 'px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold text-[8px] uppercase';
        if (quickDrawBtn) {
          quickDrawBtn.innerHTML = `<span>🎰</span><span>FLEET CAPSULE (100)</span>`;
          quickDrawBtn.classList.remove('hidden');
          quickDrawBtn.classList.add('flex');
        }
      }

      updateRankUI();
      renderHomeContractsUI();
    }

    function setHomePageMode(enable) {
      const homeScreen = document.getElementById('home-screen');
      const uiLayer = document.getElementById('ui-layer');

      if (enable) {
        gameState.mode = 'home';
        endParcelDrag();
        clearHudFeedback();
        homeScreen.classList.remove('hidden');
        homeScreen.classList.add('flex');
        uiLayer.classList.add('hidden');
        uiLayer.classList.remove('flex');

        blueprintGarageGroup.visible = true;
        envGroup.visible = false;
        if (window.cityLeftLandmarkGroup) window.cityLeftLandmarkGroup.visible = false;
        playerVan.visible = false;
        trafficVehicles.forEach(tv => (tv.mesh.visible = false));
        activeGates.forEach(g => (g.mesh.visible = false));
        activeCrosswalks.forEach(cw => (cw.group.visible = false));
        apartments.forEach(apt => apt.cloudEl.classList.add('hidden'));
        if (window.cityLeftLandmarkGroup) window.cityLeftLandmarkGroup.visible = false;

        // Moody Deep Midnight Asphalt Garage (#070913) Sky & Lighting
        scene.background.setHex(0x070913);
        scene.fog.color.setHex(0x070913);
        scene.fog.density = 0.012;
        hemiLight.color.setHex(0x1e293b);
        hemiLight.groundColor.setHex(0x070913);
        hemiLight.intensity = 0.38;
        dirLight.color.setHex(0xf59e0b);
        dirLight.intensity = 1.35;
        dirLight.position.set(-6, 16, 6);

        rebuildGarageTurntableVan();
        updateCameraForViewport();
        if (typeof soundFX !== 'undefined' && soundFX && soundFX.playTrack) soundFX.playTrack('garage');
      } else {
        homeScreen.classList.add('hidden');
        homeScreen.classList.remove('flex');
        uiLayer.classList.remove('hidden');
        uiLayer.classList.add('flex');

        blueprintGarageGroup.visible = false;
        envGroup.visible = true;
        if (window.cityLeftLandmarkGroup) {
          const isCairo = (CITY_THEMES[gameState.cityIndex] && CITY_THEMES[gameState.cityIndex].id === 'cairo');
          const targetX = isCairo ? -34.0 : -28.0;
          window.cityLeftLandmarkGroup.position.set(targetX, 0, -220.0);
          window.cityLeftLandmarkGroup.visible = true;
        }
        replaceActivePlayerVan(gameState.equippedVanId);
        playerVan.visible = true;
        updateCameraForViewport();
        if (typeof soundFX !== 'undefined' && soundFX && soundFX.playTrack) soundFX.playTrack('drive');
      }
    }

    const ARC_POINTS = 28;
    const arcPositions = new Float32Array(ARC_POINTS * 3);
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcLineMat = new THREE.LineBasicMaterial({ color: 0x00f5d4, linewidth: 3 });
    const projectileArcLine = new THREE.Line(arcGeo, arcLineMat);
    projectileArcLine.visible = false;
    scene.add(projectileArcLine);

    const aimNodes = [];
    for (let i = 0; i < 14; i++) {
      const node = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.46, 0.46),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      node.visible = false;
      scene.add(node);
      aimNodes.push(node);
    }

    const aimLandingRing = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 2.0, 28),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide })
    );
    aimLandingRing.rotation.x = -Math.PI / 2;
    aimLandingRing.visible = false;
    scene.add(aimLandingRing);

    const showcaseItemsGroup = new THREE.Group();
    showcaseItemsGroup.position.set(0, 2.4, 9.5);
    showcaseItemsGroup.visible = false;
    scene.add(showcaseItemsGroup);
    PARCEL_TYPES.forEach((p, idx) => {
      const m = createParcelVoxelMesh(p.id, 0.85);
      m.position.set((idx - 3.5) * 2.1, 0, 0);
      showcaseItemsGroup.add(m);
    });

    function triggerDiscoveryToast(title, iconSrc) {
      document.getElementById('hall-new-dot').classList.remove('hidden');
      showActionToast(`Unlocked: ${title}`, 'info');
    }

    function tryRandomDiscoveryOnDelivery(deliveredParcelId, customerCharId) {
      // Unlock the delivered parcel or customer if not yet discovered, or a random locked one!
      if (!gameState.unlockedItems.includes(deliveredParcelId)) {
        gameState.unlockedItems.push(deliveredParcelId);
        const p = PARCEL_TYPES[deliveredParcelId];
        triggerDiscoveryToast(`Item: ${p.name}`, parcelIconDataURLs[deliveredParcelId]);
        return;
      }
      if (customerCharId && !gameState.unlockedChars.includes(customerCharId)) {
        gameState.unlockedChars.push(customerCharId);
        const c = CHARACTER_TYPES.find(ch => ch.id === customerCharId);
        if (c) triggerDiscoveryToast(`Customer: ${c.name}`, charIconDataURLs[customerCharId]);
        return;
      }
      // Otherwise 45% chance on any delivery to unlock a random locked Item or Customer
      if (Math.random() < 0.45) {
        const lockedItems = PARCEL_TYPES.filter(p => !gameState.unlockedItems.includes(p.id));
        const lockedChars = CHARACTER_TYPES.filter(c => !gameState.unlockedChars.includes(c.id));
        if (lockedItems.length > 0 && (lockedChars.length === 0 || Math.random() < 0.55)) {
          const pick = lockedItems[Math.floor(Math.random() * lockedItems.length)];
          gameState.unlockedItems.push(pick.id);
          triggerDiscoveryToast(`Item: ${pick.name}`, parcelIconDataURLs[pick.id]);
        } else if (lockedChars.length > 0) {
          const pick = lockedChars[Math.floor(Math.random() * lockedChars.length)];
          gameState.unlockedChars.push(pick.id);
          triggerDiscoveryToast(`Customer: ${pick.name}`, charIconDataURLs[pick.id]);
        }
      }
    }

    function renderLeaderboardModal(sortBy = 'score') {
      renderRunHistory(sortBy);
    }

    function renderHallOfFameModal(tab = 'items') {
      const gridEl = document.getElementById('hall-grid');
      document.getElementById('hall-items-count').textContent = `${gameState.unlockedItems.length}/${PARCEL_TYPES.length}`;
      document.getElementById('hall-chars-count').textContent = `${gameState.unlockedChars.length}/${CHARACTER_TYPES.length}`;

      if (tab === 'items') {
        gridEl.innerHTML = PARCEL_TYPES.map((p) => {
          const unlocked = gameState.unlockedItems.includes(p.id);
          return `
            <div class="rounded-2xl p-3 border-2 flex flex-col items-center text-center transition ${
              unlocked ? 'bg-slate-950/90 border-emerald-400 shadow-md' : 'bg-slate-950/60 border-slate-800 opacity-60'
            }">
              <div class="flex items-center justify-between w-full mb-1">
                <span class="px-2 py-0.5 rounded-md ${p.badgeBg} font-extrabold text-[8px]">+${p.pts}</span>
                <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold ${unlocked ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">${unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
              </div>
              <div class="w-16 h-16 rounded-xl bg-slate-900 border border-sky-400/30 flex items-center justify-center p-1 my-1">
                <img src="${parcelIconDataURLs[p.id]}" class="w-full h-full object-contain ${unlocked ? '' : 'brightness-0 invert opacity-25'}" alt="${p.name}" />
              </div>
              <div class="arcade-font text-xs text-white leading-tight mt-1">${unlocked ? p.short : 'MYSTERY PARCEL'}</div>
              <div class="text-[9px] text-amber-300 font-bold mt-0.5">${p.tier}</div>
            </div>
          `;
        }).join('');
      } else {
        gridEl.innerHTML = CHARACTER_TYPES.map((c) => {
          const unlocked = gameState.unlockedChars.includes(c.id);
          return `
            <div class="rounded-2xl p-3 border-2 flex flex-col items-center text-center transition ${
              unlocked ? 'bg-slate-950/90 border-sky-400 shadow-md' : 'bg-slate-950/60 border-slate-800 opacity-60'
            }">
              <span class="self-end px-1.5 py-0.5 rounded text-[8px] font-extrabold ${unlocked ? 'bg-sky-400/20 text-sky-300' : 'bg-slate-800 text-slate-400'}">${unlocked ? 'DISCOVERED' : 'LOCKED'}</span>
              <div class="w-16 h-16 rounded-xl bg-slate-900 border border-sky-400/30 flex items-center justify-center p-1 my-1">
                <img src="${charIconDataURLs[c.id]}" class="w-full h-full object-contain ${unlocked ? '' : 'brightness-0 invert opacity-25'}" alt="${c.name}" />
              </div>
              <div class="arcade-font text-xs text-white leading-tight mt-1">${unlocked ? c.name : 'SECRET CUSTOMER'}</div>
              <div class="text-[9px] text-emerald-300 font-bold mt-0.5">${unlocked ? c.phrase : 'Deliver parcels to meet'}</div>
            </div>
          `;
        }).join('');
      }
    }

    // Confetti Burst Animation inside the Prize Draw Modal
    let drawConfettiParticles = [];
    let drawConfettiAnimId = null;

    function triggerPrizeConfetti() {
      const c = document.getElementById('draw-confetti-canvas');
      if (!c) return;
      c.width = c.clientWidth || 420;
      c.height = c.clientHeight || 250;
      const ctx = c.getContext('2d');
      const colors = ['#facc15', '#00f5d4', '#f43f5e', '#38bdf8', '#a855f7', '#4ade80'];

      drawConfettiParticles = Array.from({ length: 55 }, () => ({
        x: c.width / 2,
        y: c.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: -4 - Math.random() * 9,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        life: 1.0
      }));

      if (drawConfettiAnimId) cancelAnimationFrame(drawConfettiAnimId);
      function stepConfetti() {
        ctx.clearRect(0, 0, c.width, c.height);
        let alive = false;
        drawConfettiParticles.forEach((p) => {
          if (p.life <= 0) return;
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.32;
          p.rot += p.vRot;
          p.life -= 0.016;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });
        if (alive) {
        drawConfettiAnimId = requestAnimationFrame(stepConfetti);
      } else {
        ctx.clearRect(0, 0, c.width, c.height);
      }
    }
      stepConfetti();
    }

    function pickSmartParcelType() {
      const upcomingOrders = apartments
        .filter(a => a.hasOrder && !a.delivered && getResidentRelativeZ(a) <= THROW_RANGE_MAX)
        .sort((a, b) => (gameState.vanZ - a.group.position.z) - (gameState.vanZ - b.group.position.z));

      for (const apt of upcomingOrders) {
        if (!gameState.handSlots.includes(apt.wantedType)) {
          return apt.wantedType;
        }
      }
      const pool = PARCEL_TYPES.map(p => p.id).filter(id => !gameState.handSlots.includes(id));
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
      return Math.floor(Math.random() * PARCEL_TYPES.length);
    }

    function rollParcelModifier() {
      const roll = Math.random();
      if (roll < 0.30) {
        return { type: 'hot', timer: 8.0, maxTime: 8.0 };
      } else if (roll < 0.55) {
        return { type: 'fragile', cracked: false };
      }
      return null;
    }

    const SLOT_KEYS = ['Q', 'W', 'E'];
    const THROW_RANGE_MIN = -55;
    const THROW_RANGE_MAX = 18;
    const orderBadgePosition = new THREE.Vector3();
    const aimStartPosition = new THREE.Vector3();
    const aimEndPosition = new THREE.Vector3();

    function getResidentRelativeZ(apt) {
      return apt.group.position.z + apt.customerSlot.position.z - playerVan.position.z;
    }

    function isResidentInThrowRange(apt) {
      if (!apt || !apt.hasOrder || apt.delivered || !apt.charMesh) return false;
      const relativeZ = getResidentRelativeZ(apt);
      return Number.isFinite(relativeZ) && relativeZ >= THROW_RANGE_MIN && relativeZ <= THROW_RANGE_MAX;
    }

    function getResidentHandPosition(apt, position) {
      position.set(0, 1.2 + (apt.charMesh ? apt.charMesh.position.y : 0), 0);
      return apt.customerSlot.localToWorld(position);
    }

    function ensureParcelAvailableInHand(wantedType) {
      if (gameState.handSlots.includes(wantedType)) return;
      const protectedTypes = new Set();
      apartments.forEach(apt => {
        const relativeZ = getResidentRelativeZ(apt);
        if (apt.hasOrder && !apt.delivered && relativeZ >= -95 && relativeZ <= THROW_RANGE_MAX) {
          protectedTypes.add(apt.wantedType);
        }
      });
      const candidates = Array.from(gameState.handSlots.keys()).filter(index =>
        !protectedTypes.has(gameState.handSlots[index]) &&
        !(gameState.dragging && gameState.dragSlotIndex === index)
      );
      const replaceIdx = candidates.find(index => index !== gameState.selectedSlotIndex) ?? candidates[0];
      if (replaceIdx === undefined) return;
      gameState.handSlots[replaceIdx] = wantedType;
      if (!gameState.handModifiers) gameState.handModifiers = [null, null, null];
      gameState.handModifiers[replaceIdx] = rollParcelModifier();
      renderBottomParcelHandUI(replaceIdx);
    }

    function refillHandSlot(slotIndex) {
      gameState.handSlots[slotIndex] = pickSmartParcelType();
      if (!gameState.handModifiers) gameState.handModifiers = [null, null, null];
      gameState.handModifiers[slotIndex] = rollParcelModifier();
      apartments.forEach(apt => {
        if (apt.hasOrder && !apt.delivered && getResidentRelativeZ(apt) >= -95 &&
            getResidentRelativeZ(apt) <= THROW_RANGE_MAX) ensureParcelAvailableInHand(apt.wantedType);
      });
      renderBottomParcelHandUI(slotIndex);
    }

    function renderBottomParcelHandUI(animatedSlotIdx = -1) {
      const container = document.getElementById('parcel-hand-horizontal');
      if (!container) return;

      gameState.handSlots.forEach((parcelTypeId, slotIdx) => {
        const parcel = PARCEL_TYPES[parcelTypeId];
        let card = container.children[slotIdx];
        if (!card) {
          card = document.createElement('div');
          card.dataset.slot = slotIdx;
          card.setAttribute('role', 'button');
          card.tabIndex = 0;
          let pointerId = null;
          let pointerDownX = 0;
          let pointerDownY = 0;

          card.addEventListener('pointerdown', event => {
            if (gameState.mode !== 'playing' || !event.isPrimary || event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            soundFX.init();
            pointerId = event.pointerId;
            pointerDownX = event.clientX;
            pointerDownY = event.clientY;
            card.setPointerCapture(pointerId);
            selectHandSlot(slotIdx);
          });
          card.addEventListener('pointermove', event => {
            if (event.pointerId !== pointerId || gameState.dragging) return;
            if (Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 14) {
              startParcelDrag(slotIdx, event.clientX, event.clientY, pointerId);
            }
          });
          card.addEventListener('pointerup', event => {
            if (event.pointerId !== pointerId) return;
            pointerId = null;
            if (!gameState.dragging) {
              event.stopPropagation();
              throwFromSlot(slotIdx);
            }
          });
          card.addEventListener('pointercancel', () => {
            pointerId = null;
            if (gameState.dragging) gameState.dragCancel = true;
          });
          card.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            if (event.detail === 0) throwFromSlot(slotIdx);
          });
          card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              if (!event.repeat) throwFromSlot(slotIdx);
            }
          });
          container.appendChild(card);
        }

        const modifier = gameState.handModifiers ? gameState.handModifiers[slotIdx] : null;
        const renderKey = `${parcelTypeId}:${modifier ? modifier.type : ''}:${!!(modifier && modifier.cracked)}`;
        card.setAttribute('aria-label', `Throw ${parcel.name}, ${SLOT_KEYS[slotIdx]} or ${slotIdx + 1}`);
        card.setAttribute('aria-keyshortcuts', `${SLOT_KEYS[slotIdx]} ${slotIdx + 1}`);
        card.setAttribute('aria-disabled', 'false');
        if (card.dataset.renderKey === renderKey) return;
        card.dataset.renderKey = renderKey;
        const modifierClass = modifier ? `is-${modifier.type}${modifier.cracked ? ' is-cracked' : ''}` : '';
        card.className = `parcel-card-slot ${parcel.tierClass} ${modifierClass}`;
        card.innerHTML = `
          <div class="parcel-card-inner">
            <span class="parcel-key-badge parcel-dock-key">${SLOT_KEYS[slotIdx]}</span>
            <img class="parcel-dock-icon" src="${parcelIconDataURLs[parcel.id]}" alt="${parcel.name}" />
          </div>`;
      });
    }

    function selectHandSlot(slotIdx) {
      gameState.selectedSlotIndex = slotIdx;
    }

    const dragGhost = document.getElementById('drag-ghost');
    const dragGhostBox = document.getElementById('drag-ghost-box');
    const dragGhostImg = document.getElementById('drag-ghost-img');
    const dragGhostLabel = document.getElementById('drag-ghost-label');
    const cancelDropZone = document.getElementById('cancel-drop-zone');
    const cancelDropCircle = document.getElementById('cancel-drop-circle');
    const slowmoVignette = document.getElementById('slowmo-vignette');
    let dragStartX = 0;
    let dragStartY = 0;
    let activeDragPointerId = null;

    function startParcelDrag(slotIdx, clientX, clientY, pointerId = null) {
      if (gameState.mode !== 'playing') return;
      gameState.dragging = true;
      activeDragPointerId = pointerId;
      gameState.dragSlotIndex = slotIdx;
      dragStartX = clientX;
      dragStartY = clientY;
      gameState.dragSide = null;
      gameState.dragCancel = false;
      gameState.targetAptLock = null;

      const parcelId = gameState.handSlots[slotIdx];
      dragGhostImg.src = parcelIconDataURLs[parcelId];
      dragGhostLabel.textContent = `⬅️ DRAG UP-LEFT / UP-RIGHT • ↓ DOWN TO CANCEL`;
      dragGhost.style.display = 'flex';
      dragGhost.style.left = `${clientX}px`;
      dragGhost.style.top = `${clientY}px`;

      if (cancelDropZone) {
        cancelDropZone.classList.remove('hidden');
        cancelDropZone.classList.add('flex');
      }

      updateParcelDrag(clientX, clientY);
    }

    function findBestTargetApartmentOnSide(side) {
      return findTargetApartment(side);
    }

    function updateProjectileArcVisuals(now = performance.now()) {
      let targetApt = null;
      let parcelId = null;
      let isAutoLock = false;

      if (gameState.dragging && gameState.dragSide && !gameState.dragCancel) {
        targetApt = findBestTargetApartmentOnSide(gameState.dragSide);
        parcelId = gameState.handSlots[gameState.dragSlotIndex];
      } else if (gameState.mode === 'playing' && gameState.lockedTargetApt) {
        targetApt = gameState.lockedTargetApt;
        isAutoLock = true;
        const matchIdx = gameState.handSlots.indexOf(targetApt.wantedType);
        const slotIdx = matchIdx !== -1 ? matchIdx : (gameState.selectedSlotIndex || 0);
        parcelId = gameState.handSlots[slotIdx];
      }

      if (!targetApt) {
        projectileArcLine.visible = false;
        aimNodes.forEach(n => (n.visible = false));
        aimLandingRing.visible = false;
        return;
      }

      gameState.targetAptLock = targetApt;
      const startPos = aimStartPosition.set(playerVan.position.x, 2.9, playerVan.position.z);
      const endPos = getResidentHandPosition(targetApt, aimEndPosition);

      const isMatch = targetApt && targetApt.hasOrder && targetApt.wantedType === parcelId;
      const arcColor = isMatch ? 0x00f5d4 : (isAutoLock ? 0xfacc15 : 0xf43f5e);

      const posAttr = projectileArcLine.geometry.attributes.position;
      for (let i = 0; i < ARC_POINTS; i++) {
        const t = i / (ARC_POINTS - 1);
        const px = THREE.MathUtils.lerp(startPos.x, endPos.x, t);
        const py = THREE.MathUtils.lerp(startPos.y, endPos.y, t) + Math.sin(t * Math.PI) * 6.2;
        const pz = THREE.MathUtils.lerp(startPos.z, endPos.z, t);
        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;
      arcLineMat.color.setHex(arcColor);
      arcLineMat.transparent = true;
      arcLineMat.opacity = isAutoLock ? 0.85 : 1.0;
      projectileArcLine.visible = true;

      const animOffset = ((now * 0.003) % 1) / aimNodes.length;
      aimNodes.forEach((node, idx) => {
        const t = Math.min(0.98, (idx + 0.5) / aimNodes.length + animOffset);
        node.position.lerpVectors(startPos, endPos, t);
        node.position.y += Math.sin(t * Math.PI) * 5.8;
        node.rotation.x += 0.08;
        node.rotation.y += 0.1;
        node.material.color.setHex(arcColor);
        node.visible = true;
      });

      aimLandingRing.position.set(endPos.x, 0.42, endPos.z);
      aimLandingRing.scale.setScalar(1 + Math.sin(now * 0.012) * 0.14);
      aimLandingRing.material.color.setHex(arcColor);
      aimLandingRing.visible = true;
    }

    function updateParcelDrag(clientX, clientY) {
      if (!gameState.dragging) return;
      dragGhost.style.left = `${clientX}px`;
      dragGhost.style.top = `${clientY}px`;

      const dx = clientX - dragStartX;
      const dy = clientY - dragStartY;
      const dist = Math.hypot(dx, dy);

      // Downward Cancel Check: Dragging downward (dy > 22) or into the bottom edge Cancel Strip cancels the throw!
      let isOverCancel = dy > 22 || clientY > window.innerHeight - 42;
      if (cancelDropZone && !isOverCancel && dy > 8) {
        const rect = cancelDropZone.getBoundingClientRect();
        if (
          clientX >= rect.left - 18 &&
          clientX <= rect.right + 18 &&
          clientY >= rect.top - 12
        ) {
          isOverCancel = true;
        }
      }

      if (isOverCancel) {
        gameState.dragCancel = true;
        gameState.dragSide = null;
        if (cancelDropZone) cancelDropZone.style.transform = 'translate(-50%, 0) scale(1.08)';
        if (cancelDropCircle) cancelDropCircle.style.transform = 'scale(1.18)';
        if (dragGhostBox) dragGhostBox.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-950/95 border-3 border-rose-400 shadow-2xl flex items-center justify-center p-1';
        dragGhostLabel.textContent = '✕ RELEASE TO CANCEL THROW';
        dragGhostLabel.className = 'mt-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-200 border border-rose-400 text-[9px] font-bold uppercase tracking-wider shadow';
      } else {
        gameState.dragCancel = false;
        if (cancelDropZone) cancelDropZone.style.transform = 'translate(-50%, 0) scale(1)';
        if (cancelDropCircle) cancelDropCircle.style.transform = 'scale(1)';
        if (dragGhostBox) dragGhostBox.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/95 border-3 border-emerald-400 shadow-2xl flex items-center justify-center p-1';
        dragGhostLabel.className = 'mt-1 px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-emerald-400 text-[9px] font-bold uppercase tracking-wider shadow';

        if (dist > 18) {
          if (dx < -14) {
            gameState.dragSide = 'left';
          } else if (dx > 14) {
            gameState.dragSide = 'right';
          } else {
            gameState.dragSide = clientX < window.innerWidth * 0.5 ? 'left' : 'right';
          }
          dragGhostLabel.textContent = gameState.dragSide === 'left'
            ? '⬅️ RELEASE TO THROW LEFT!'
            : 'RELEASE TO THROW RIGHT! ➡️';
        } else {
          gameState.dragSide = null;
          dragGhostLabel.textContent = '⬅️ DRAG LEFT/RIGHT • ↓ DOWN TO CANCEL';
        }
      }

      updateProjectileArcVisuals();
    }

    function endParcelDrag() {
      if (!gameState.dragging) return;
      const side = gameState.dragSide;
      const isCanceled = gameState.dragCancel;
      const slotIdx = gameState.dragSlotIndex;
      const targetApt = gameState.targetAptLock;

      gameState.dragging = false;
      activeDragPointerId = null;
      gameState.dragSide = null;
      gameState.dragCancel = false;
      gameState.targetAptLock = null;
      slowmoVignette.style.opacity = '0';
      dragGhost.style.display = 'none';
      if (cancelDropZone) {
        cancelDropZone.classList.add('hidden');
        cancelDropZone.classList.remove('flex');
      }
      projectileArcLine.visible = false;
      aimNodes.forEach(n => (n.visible = false));
      aimLandingRing.visible = false;

      if (isCanceled) {
        soundFX.playReelTick(300);
        showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), 'THROW CANCELED ✕', 'text-rose-300');
        return;
      }

      if (side === 'left' || side === 'right') {
        const apt = targetApt || findBestTargetApartmentOnSide(side);
        if (apt) {
          throwParcelFromHandSlot(slotIdx, apt);
          if (gameState.tutorialActive && gameState.tutorialStep === 2) {
            completeInteractiveTutorial();
          }
        }
      }
    }

    window.addEventListener('pointermove', (e) => {
      if (gameState.dragging && (activeDragPointerId === null || e.pointerId === activeDragPointerId)) {
        updateParcelDrag(e.clientX, e.clientY);
      }
    });
    window.addEventListener('pointerup', (e) => {
      if (gameState.dragging && (activeDragPointerId === null || e.pointerId === activeDragPointerId)) {
        endParcelDrag();
      }
    });
    window.addEventListener('pointercancel', (e) => {
      if (gameState.dragging && (activeDragPointerId === null || e.pointerId === activeDragPointerId)) {
        endParcelDrag();
      }
    });

    // ============================================================================
    // 12. THROWING, EXHAUST SMOKE, RAGDOLL KNOCKBACK & RARE ROAD POWER-UPS
    // ============================================================================
    const trafficVehicles = [];
    const flyingParcels = [];
    const particles = [];
    const flyingRagdolls = [];
    const activePowerUps = [];
    const weatherParticles = [];
    const activeGates = [];
    const activeCrosswalks = [];

    // Pre-allocated Exhaust Smoke Particle Pool (Eliminates GC pressure & WebGL shader/material exhaustion)
    const EXHAUST_POOL_SIZE = 28;
    const exhaustMatNormal = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.65 });
    const exhaustMatBoost = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const exhaustPool = [];
    for (let i = 0; i < EXHAUST_POOL_SIZE; i++) {
      const mesh = new THREE.Mesh(unitBoxGeo, exhaustMatNormal);
      mesh.visible = false;
      scene.add(mesh);
      exhaustPool.push({
        mesh,
        active: false,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.55
      });
    }

    // Cached shared geometry and materials for parcel throw trail dots
    const trailDotGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const trailDotMatCache = {};
    function getTrailDotMat(colorHex) {
      if (!trailDotMatCache[colorHex]) {
        trailDotMatCache[colorHex] = new THREE.MeshBasicMaterial({ color: colorHex });
      }
      return trailDotMatCache[colorHex];
    }

    // Sculpted 3D Voxel Road Power-Ups: Drone Assist, Coin Magnet, Shield Bumper, Extra Heart, Chrono Clock, Immortal Star
    const powerUpRingGeo = new THREE.RingGeometry(0.95, 1.35, 24);
    const powerUpRingMats = {
      heart: new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide }),
      slowmo: new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide }),
      drone: new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide }),
      magnet: new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
      shield: new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
      immortal: new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    };

    function createRoadPowerUpMesh(powerType) {
      const group = new THREE.Group();

      const baseRing = new THREE.Mesh(
        powerUpRingGeo,
        powerUpRingMats[powerType] || powerUpRingMats.immortal
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.12;
      group.add(baseRing);

      const core = new THREE.Group();
      core.position.y = 1.45;
      group.add(core);

      if (powerType === 'drone') {
        // Collectible Drone Assist Quadcopter Model
        const dOpt = { emissive: 0x00f5d4, emissiveIntensity: 0.95 };
        addVoxelBox(core, 0.72, 0.28, 0.72, 0, 0, 0, 0x0f172a, dOpt);
        addVoxelBox(core, 1.45, 0.08, 0.16, 0, 0.12, 0, 0x38bdf8);
        addVoxelBox(core, 0.16, 0.08, 1.45, 0, 0.12, 0, 0x38bdf8);
        addVoxelBox(core, 0.42, 0.04, 0.12, -0.7, 0.2, -0.7, 0x00f5d4);
        addVoxelBox(core, 0.42, 0.04, 0.12,  0.7, 0.2, -0.7, 0x00f5d4);
        addVoxelBox(core, 0.42, 0.04, 0.12, -0.7, 0.2,  0.7, 0x00f5d4);
        addVoxelBox(core, 0.42, 0.04, 0.12,  0.7, 0.2,  0.7, 0x00f5d4);
      } else if (powerType === 'magnet') {
        // Collectible Coin Magnet Model
        const mOpt = { emissive: 0xef4444, emissiveIntensity: 0.85 };
        addVoxelBox(core, 0.38, 1.15, 0.38, -0.45, 0.1, 0, 0xef4444, mOpt);
        addVoxelBox(core, 0.42, 0.35, 0.42, -0.45, 0.7, 0, 0xe2e8f0, { metalness: 0.8 });
        addVoxelBox(core, 0.38, 1.15, 0.38,  0.45, 0.1, 0, 0xef4444, mOpt);
        addVoxelBox(core, 0.42, 0.35, 0.42,  0.45, 0.7, 0, 0xe2e8f0, { metalness: 0.8 });
        addVoxelBox(core, 1.25, 0.38, 0.38, 0, -0.45, 0, 0xef4444, mOpt);
      } else if (powerType === 'shield') {
        // Collectible Shield Bumper Forcefield Model
        const sOpt = { emissive: 0x38bdf8, emissiveIntensity: 0.95 };
        addVoxelBox(core, 1.35, 1.35, 0.28, 0, 0.1, 0, 0x0284c7, sOpt);
        addVoxelBox(core, 0.45, 1.65, 0.34, 0, 0.1, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.85 });
        addVoxelBox(core, 1.65, 0.45, 0.34, 0, 0.1, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.85 });
      } else if (powerType === 'heart') {
        // Sculpted 3D Ruby Voxel Heart
        const hOpt = { emissive: 0xe11d48, emissiveIntensity: 0.75, roughness: 0.2 };
        addVoxelBox(core, 0.42, 0.36, 0.42, 0, -0.42, 0, 0xf43f5e, hOpt);
        addVoxelBox(core, 0.84, 0.36, 0.46, 0, -0.08, 0, 0xf43f5e, hOpt);
        addVoxelBox(core, 1.24, 0.42, 0.50, 0,  0.26, 0, 0xf43f5e, hOpt);
        addVoxelBox(core, 0.48, 0.34, 0.48, -0.34, 0.60, 0, 0xfb7185, hOpt);
        addVoxelBox(core, 0.48, 0.34, 0.48,  0.34, 0.60, 0, 0xfb7185, hOpt);
        addVoxelBox(core, 0.22, 0.22, 0.54, -0.36, 0.34, 0, 0xffffff);
      } else if (powerType === 'slowmo') {
        // Sculpted 3D Chrono Hourglass / Clock Core
        const cOpt = { emissive: 0x00f5d4, emissiveIntensity: 0.9 };
        addVoxelBox(core, 1.15, 0.24, 1.15, 0,  0.68, 0, 0xfacc15, { metalness: 0.6 });
        addVoxelBox(core, 1.15, 0.24, 1.15, 0, -0.68, 0, 0xfacc15, { metalness: 0.6 });
        addVoxelBox(core, 0.85, 0.42, 0.85, 0,  0.35, 0, 0x00f5d4, cOpt);
        addVoxelBox(core, 0.42, 0.35, 0.42, 0,  0.0,  0, 0xffffff, cOpt);
        addVoxelBox(core, 0.85, 0.42, 0.85, 0, -0.35, 0, 0x00f5d4, cOpt);
      } else {
        // Sculpted 3D Rainbow Immortal Star Shield
        const sOpt = { emissive: 0xfacc15, emissiveIntensity: 0.95 };
        addVoxelBox(core, 0.92, 0.92, 0.46, 0, 0, 0, 0xfacc15, sOpt);
        addVoxelBox(core, 0.42, 1.52, 0.38, 0, 0, 0, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 0.85 });
        addVoxelBox(core, 1.52, 0.42, 0.38, 0, 0, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.85 });
      }

      group.userData = { powerType, core, baseRing };
      return group;
    }

    function spawnRareRoadPowerUp() {
      const laneIdx = Math.floor(Math.random() * 4);
      const types = ['drone', 'magnet', 'shield', 'heart', 'slowmo', 'immortal'];
      const chosenType = types[Math.floor(Math.random() * types.length)];

      const mesh = createRoadPowerUpMesh(chosenType);
      mesh.position.set(LANES[laneIdx], 0, -165);
      scene.add(mesh);
      activePowerUps.push({ mesh, type: chosenType });
    }

    function spawnExhaustSmoke(isBoosting = false) {
      if (!playerVan || !playerVan.visible) return;
      const p = exhaustPool.find(ep => !ep.active) || exhaustPool[0];
      p.active = true;
      p.mesh.visible = true;
      p.mesh.material = isBoosting ? exhaustMatBoost : exhaustMatNormal;
      const initScale = isBoosting ? 0.38 : 0.24;
      p.mesh.scale.setScalar(initScale);
      const sideOffset = (Math.random() - 0.5) * 0.6;
      p.mesh.position.set(
        playerVan.position.x - 0.55 + sideOffset,
        0.48 + Math.random() * 0.15,
        playerVan.position.z + 2.48
      );
      p.vx = (Math.random() - 0.5) * 1.6;
      p.vy = 1.2 + Math.random() * 1.4;
      p.vz = 7.5 + Math.random() * 3.5;
      p.life = 0.55;
      p.maxLife = 0.55;
    }

    // 3D Collectible Road Coins for Coin Magnet & Progression
    let lastCoinSpawnDist = 0;
    const activeRoadCoins = [];
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 12);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.2
    });

    function spawnRoadCoinCluster(startZ = -165) {
      if (activeRoadCoins.length > 20) return;
      const laneIdx = Math.floor(Math.random() * 4);
      const laneX = LANES[laneIdx];
      const count = 3 + Math.floor(Math.random() * 3);
      for (let c = 0; c < count; c++) {
        const mesh = new THREE.Mesh(coinGeo, coinMat);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.set(laneX, 0.75, startZ - c * 3.8);
        scene.add(mesh);
        activeRoadCoins.push(mesh);
      }
    }

    function throwParcelFromHandSlot(slotIndex, apt, isMagneticHoming = true) {
      if (gameState.mode !== 'playing' || !isResidentInThrowRange(apt) ||
          !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 3 || flyingParcels.length >= 8) return false;
      const pendingCount = flyingParcels.filter(parcel => parcel.targetApt === apt && parcel.targetOrderId === apt.orderId).length;
      const remainingDrops = apt.isVip ? 2 - (apt.vipDelivered || 0) : 1;
      if (pendingCount >= remainingDrops) return false;
      const parcelTypeId = gameState.handSlots[slotIndex];
      if (!PARCEL_TYPES[parcelTypeId]) return false;
      soundFX.playThrow();

      const mesh = createParcelVoxelMesh(parcelTypeId, 0.92);
      const startPos = getRoofThrowPosition(new THREE.Vector3());
      mesh.position.copy(startPos);
      scene.add(mesh);

      const trailDots = [];
      const trailMat = getTrailDotMat(PARCEL_TYPES[parcelTypeId].color);
      for (let i = 0; i < 6; i++) {
        const td = new THREE.Mesh(trailDotGeo, trailMat);
        td.position.copy(startPos);
        scene.add(td);
        trailDots.push(td);
      }

      // Check Sweet-Spot alignment between player van and target resident (center ~18 units ahead)
      const targetZ = apt.group.position.z + 1.2;
      const dz = targetZ - playerVan.position.z;
      const isSweetSpot = Math.abs(dz + 18.0) <= 7.5;

      const slotModifier = (gameState.handModifiers && gameState.handModifiers[slotIndex])
        ? { ...gameState.handModifiers[slotIndex] }
        : null;

      flyingParcels.push({
        mesh,
        trailDots,
        startPos,
        targetApt: apt,
        targetOrderId: apt.orderId,
        cargoMultiplier: getRoofScoreMultiplier(),
        nightMultiplier: nightState.remaining > 0 ? 1.5 : 1,
        routeCoinMultiplier: getRouteCoinMultiplier(),
        endPos: new THREE.Vector3(),
        parcelType: parcelTypeId,
        modifier: slotModifier,
        progress: 0,
        duration: 0.42,
        isSweetSpot,
        magneticHoming: isMagneticHoming
      });

      playerVan.userData.chassis.scale.set(1.12, 0.88, 1.06);
      if (gameState.roofCrates > 0) gameState.roofCrates--;
      claimRivalDelivery(apt, parcelTypeId);
      syncRoofCargo();
      refillHandSlot(slotIndex);
      updateOrderAlertsAndBubbles();
      return true;
    }

    function throwWildParcel(slotIndex) {
      if (gameState.mode !== 'playing' ||
          !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 3 || flyingParcels.length >= 8) return false;
      const parcelTypeId = gameState.handSlots[slotIndex];
      if (!PARCEL_TYPES[parcelTypeId]) return false;
      soundFX.playThrow();

      const mesh = createParcelVoxelMesh(parcelTypeId, 0.92);
      const startPos = getRoofThrowPosition(new THREE.Vector3());
      mesh.position.copy(startPos);
      scene.add(mesh);

      const trailDots = [];
      const trailMat = getTrailDotMat(PARCEL_TYPES[parcelTypeId].color);
      for (let i = 0; i < 6; i++) {
        const td = new THREE.Mesh(trailDotGeo, trailMat);
        td.position.copy(startPos);
        scene.add(td);
        trailDots.push(td);
      }

      const sideX = slotIndex === 0 ? -12 : (slotIndex === 2 ? 12 : (playerVan.position.x < 0 ? -12 : 12));
      const endPos = new THREE.Vector3(sideX, 0.35, playerVan.position.z - 18);

      const slotModifier = (gameState.handModifiers && gameState.handModifiers[slotIndex])
        ? { ...gameState.handModifiers[slotIndex] }
        : null;

      flyingParcels.push({
        mesh,
        trailDots,
        startPos,
        targetApt: null,
        targetOrderId: null,
        cargoMultiplier: getRoofScoreMultiplier(),
        nightMultiplier: nightState.remaining > 0 ? 1.5 : 1,
        routeCoinMultiplier: getRouteCoinMultiplier(),
        endPos,
        parcelType: parcelTypeId,
        modifier: slotModifier,
        progress: 0,
        duration: 0.38,
        isSweetSpot: false,
        magneticHoming: false
      });

      playerVan.userData.chassis.scale.set(1.12, 0.88, 1.06);
      if (gameState.roofCrates > 0) gameState.roofCrates--;
      syncRoofCargo();
      refillHandSlot(slotIndex);
      updateOrderAlertsAndBubbles();
      return true;
    }

    function removeFlyingParcel(index) {
      const parcel = flyingParcels[index];
      scene.remove(parcel.mesh);
      parcel.trailDots.forEach(dot => scene.remove(dot));
      flyingParcels.splice(index, 1);
    }

    function findTargetApartment(targetSide = 'auto') {
      const locked = gameState.lockedTargetApt;
      if (isResidentInThrowRange(locked) && (targetSide === 'auto' || locked.side === targetSide)) return locked;
      let target = null;
      let closestDistance = Infinity;
      apartments.forEach(apt => {
        if (!isResidentInThrowRange(apt) || (targetSide !== 'auto' && apt.side !== targetSide)) return;
        const distance = Math.abs(getResidentRelativeZ(apt) + 18);
        if (distance < closestDistance) {
          target = apt;
          closestDistance = distance;
        }
      });
      return target;
    }

    const slotCooldowns = [0, 0, 0];
    function throwFromSlot(slotIndex, ignoreCooldown = false) {
      if (gameState.mode !== 'playing' || !Number.isInteger(slotIndex) ||
          slotIndex < 0 || slotIndex >= gameState.handSlots.length) return false;
      const now = performance.now() / 1000;
      if (!ignoreCooldown && now < slotCooldowns[slotIndex]) return false;
      slotCooldowns[slotIndex] = now + 0.25;

      const container = document.getElementById('parcel-hand-horizontal');
      if (container && container.children[slotIndex]) {
        const card = container.children[slotIndex];
        card.classList.remove('slot-cooldown');
        void card.offsetWidth;
        card.classList.add('slot-cooldown');
      }

      selectHandSlot(slotIndex);
      const target = findTargetApartment();
      let launched = false;
      if (target) {
        launched = throwParcelFromHandSlot(slotIndex, target);
      } else {
        launched = throwWildParcel(slotIndex);
      }
      if (launched && gameState.tutorialActive && gameState.tutorialStep === 2) completeInteractiveTutorial();
      return launched;
    }

    function autoThrowMatchingSlot() {
      if (gameState.mode !== 'playing') return;
      const target = findTargetApartment();
      if (!target) {
        throwFromSlot(1);
        return;
      }
      ensureParcelAvailableInHand(target.wantedType);
      const matchingSlot = gameState.handSlots.indexOf(target.wantedType);
      if (matchingSlot !== -1) throwFromSlot(matchingSlot);
      else throwFromSlot(1);
    }

    function quickThrowParcel(side = 'auto') {
      if (side === 'left' || side === 'slot0') throwFromSlot(0);
      else if (side === 'right' || side === 'slot2') throwFromSlot(2);
      else if (side === 'slot1') throwFromSlot(1);
      else autoThrowMatchingSlot();
    }

    function updateOrderAlertsAndBubbles() {
      const now = performance.now();
      const playing = gameState.mode === 'playing';
      apartments.forEach(apt => {
        if (!apt.hasOrder || apt.delivered) {
          apt.cloudEl.classList.add('hidden');
          apt.ringGroup.visible = false;
          return;
        }
        const relativeZ = getResidentRelativeZ(apt);
        const pendingDelivery = flyingParcels.some(parcel => parcel.targetApt === apt && parcel.targetOrderId === apt.orderId);
        if (relativeZ > THROW_RANGE_MAX && !pendingDelivery) {
          apt.hasOrder = false;
          apt.cloudEl.classList.add('hidden');
          apt.ringGroup.visible = false;
          return;
        }
        if (playing && relativeZ >= -95 && relativeZ <= THROW_RANGE_MAX) ensureParcelAvailableInHand(apt.wantedType);
        const inRange = playing && isResidentInThrowRange(apt);
        apt.ringGroup.visible = inRange;
        if (!inRange) {
          apt.cloudEl.classList.add('hidden');
          return;
        }

        const sweet = Math.abs(relativeZ + 18) <= 6.5;
        const scale = sweet ? 1 + Math.sin(now * 0.02) * 0.16 : 1 + Math.max(0, (-relativeZ - 18) / 28);
        apt.shrinkRing.scale.set(scale, 1, scale);
        const ringColor = sweet ? 0xfacc15 : 0x00f5d4;
        apt.centerMarker.material.color.setHex(ringColor);
        apt.centerMarker.material.emissive.setHex(ringColor);
        apt.ringBars.forEach(bar => {
          bar.material.color.setHex(ringColor);
          bar.material.emissive.setHex(ringColor);
        });

        const matchingSlot = gameState.handSlots.indexOf(apt.wantedType);
        const parcelInfo = PARCEL_TYPES[apt.wantedType];
        const vipStep = apt.vipDelivered || 0;
        const renderKey = `${apt.orderId}:${apt.wantedType}:${vipStep}`;
        if (apt.cloudEl.dataset.renderKey !== renderKey) {
          apt.cloudEl.dataset.renderKey = renderKey;
          apt.cloudEl.innerHTML = `
            <div class="thought-cloud-pill resident-order-badge">
              <img class="resident-request-icon" src="${parcelIconDataURLs[apt.wantedType]}" alt="${parcelInfo.name}" />
              <div class="resident-order-copy">
                <strong>${parcelInfo.short}</strong>
                <span class="cloud-distance-badge"></span>
                ${apt.isVip ? `<span class="vip-crown-badge">👑 VIP ${vipStep}/2</span>` : ''}
              </div>
              <button type="button" class="quick-throw-cloud-btn parcel-key-badge" title="Throw the requested parcel"></button>
            </div>`;
          apt.cloudDistBadge = apt.cloudEl.querySelector('.cloud-distance-badge');
          apt.cloudBtn = apt.cloudEl.querySelector('.quick-throw-cloud-btn');
        }
        const slotKey = matchingSlot === -1 ? '' : `[${SLOT_KEYS[matchingSlot]}]`;
        if (apt.cloudBtn.textContent !== slotKey) apt.cloudBtn.textContent = slotKey;
        apt.cloudBtn.disabled = matchingSlot === -1;
        apt.cloudDistBadge.textContent = `${Math.max(0, Math.round(-relativeZ * 1.45))}m • ${apt.side.toUpperCase()}`;

        getResidentHandPosition(apt, orderBadgePosition);
        orderBadgePosition.y += 2.2;
        orderBadgePosition.project(camera);
        const padX = Math.min(110, window.innerWidth / 2 - 8);
        const screenX = (orderBadgePosition.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-orderBadgePosition.y * 0.5 + 0.5) * window.innerHeight;
        apt.cloudEl.style.left = `${Math.max(padX, Math.min(window.innerWidth - padX, screenX))}px`;
        apt.cloudEl.style.top = `${Math.max(110, Math.min(window.innerHeight - 180, screenY))}px`;
        apt.cloudEl.classList.toggle('hidden', orderBadgePosition.z >= 1);
      });

      if (!isResidentInThrowRange(gameState.lockedTargetApt)) gameState.lockedTargetApt = null;
      gameState.lockedTargetApt = playing ? findTargetApartment() : null;
      const matchingSlot = gameState.lockedTargetApt ? gameState.handSlots.indexOf(gameState.lockedTargetApt.wantedType) : -1;
      const cards = document.getElementById('parcel-hand-horizontal').children;
      for (let index = 0; index < cards.length; index++) {
        cards[index].classList.toggle('slot-matched-pulse', index === matchingSlot);
      }
      if (gameState.tutorialActive && gameState.tutorialStep === 2 && gameState.lockedTargetApt) {
        updateTutorialStep2Prompt(gameState.lockedTargetApt);
      }
      updateProjectileArcVisuals();
    }

    function increaseOverdrive(amount) {
      if (gameState.overdriveActive) return;
      gameState.overdriveMeter = Math.min(100, (gameState.overdriveMeter || 0) + amount);
      updateHUD();
      if (gameState.overdriveMeter >= 100) {
        triggerOverdrive();
      }
    }

    function triggerOverdrive() {
      gameState.overdriveActive = true;
      gameState.overdriveTimer = 7.0;
      gameState.overdriveMeter = 100;
      soundFX.playCityGateChime();
      soundFX.playBoost();
      if (typeof soundFX.playOverdriveBurst === 'function') soundFX.playOverdriveBurst();
      triggerScreenShake(0.35, 1.4);
      triggerSpeedLines();
      if (playerVan) {
        showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3.4, 0)), '⚡ MIDNIGHT OVERDRIVE!', 'combat-text-gold');
        spawnVoxelBurst(playerVan.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x00f5d4, 32);
      }
      updateHUD();
    }

    // ============================================================================
    // 13. HUD WITH VOXEL HEART SVGS, VIRTUAL JOYSTICK, KEYBOARD & SHOWCASE CONTROLS
    // ============================================================================
    function updateHUD() {
      document.getElementById('score-val').textContent = formatHudNumber(gameState.score);
      document.getElementById('hud-coins-val').textContent = formatHudNumber(gameState.coins);
      document.getElementById('combo-val').textContent = `x${gameState.combo}`;
      const overdrive = Math.round(gameState.overdriveMeter || 0);
      document.getElementById('overdrive-bar-fill').style.width = `${overdrive}%`;
      const overdrivePill = document.getElementById('overdrive-hud-pill');
      overdrivePill.setAttribute('aria-valuenow', overdrive);
      overdrivePill.classList.toggle('is-active', !!gameState.overdriveActive);
      document.getElementById('overdrive-title-text').textContent = gameState.overdriveActive ? '⚡ OVERDRIVE ×2' : '⚡ OVERDRIVE';

      const armorContainer = document.getElementById('armor-boxes');
      if (armorContainer.dataset.hearts === String(gameState.hearts)) return;
      armorContainer.dataset.hearts = String(gameState.hearts);
      armorContainer.setAttribute('aria-label', `${gameState.hearts} hearts`);
      armorContainer.innerHTML = Array.from({ length: 3 }, (unused, index) => {
        const fill = index < gameState.hearts ? '#fb7185' : '#334155';
        return `<svg viewBox="0 0 24 24" fill="${fill}" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      }).join('');
    }

    const MAX_ACTIVE_BURST_PARTICLES = 60;
    function spawnVoxelBurst(pos, colorHex, count = 18) {
      const availableCount = Math.min(count, Math.max(0, MAX_ACTIVE_BURST_PARTICLES - particles.length));
      for (let i = 0; i < availableCount; i++) {
        const s = 0.22 + Math.random() * 0.26;
        const p = new THREE.Mesh(unitBoxGeo, getMat(colorHex, { emissive: colorHex, emissiveIntensity: 0.45 }));
        p.scale.setScalar(s);
        p.position.copy(pos);
        scene.add(p);
        particles.push({
          mesh: p,
          vel: new THREE.Vector3((Math.random() - 0.5) * 14, 4 + Math.random() * 10, (Math.random() - 0.5) * 14),
          life: 0.65 + Math.random() * 0.35
        });
      }
    }

    let screenShakeTime = 0;
    let screenShakeIntensity = 1.0;

    function triggerScreenShake(duration = 0.25, intensity = 1.0) {
      screenShakeTime = duration;
      screenShakeIntensity = intensity;
    }

    function triggerSpeedLines() {
      // Disabled: screen light-up and overlay effects removed per user request
    }

    let actionToastTimer = null;
    let crosswalkWarningActive = false;

    function clearHudFeedback() {
      clearTimeout(actionToastTimer);
      document.getElementById('action-toast').classList.remove('is-visible');
      document.getElementById('action-toast').textContent = '';
      crosswalkWarningActive = false;
    }

    function showActionToast(text, tone = 'bonus') {
      const toast = document.getElementById('action-toast');
      clearTimeout(actionToastTimer);
      toast.textContent = text;
      toast.dataset.tone = tone;
      toast.classList.add('is-visible');
      actionToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1200);
    }

    function showFloatingCombatText(worldPos, text, extraClass = 'combat-text-gold') {
      showActionToast(text, extraClass.includes('rose') ? 'danger' : 'bonus');
    }

    function showFloatingPopup(worldPos, text, colorClass = 'text-amber-300') {
      showActionToast(text, colorClass.includes('rose') ? 'danger' : 'info');
    }

    function initWeatherParticles() {
      for (let i = 0; i < 85; i++) {
        const mesh = new THREE.Mesh(unitBoxGeo, getMat(0xffffff));
        mesh.visible = false;
        scene.add(mesh);
        weatherParticles.push({
          mesh,
          x: (Math.random() - 0.5) * 44,
          y: Math.random() * 26,
          z: 18 - Math.random() * 115,
          vx: (Math.random() - 0.5) * 4,
          vy: -6 - Math.random() * 6,
          rotSpeed: (Math.random() - 0.5) * 6,
          isRain: false
        });
      }
    }

    function applyWeatherMode(index) {
      gameState.weatherIndex = index % WEATHER_MODES.length;
      const w = WEATHER_MODES[gameState.weatherIndex];

      const autumnColors = [0xf97316, 0xef4444, 0xfacc15, 0xd97706];
      const sakuraColors = [0xf472b6, 0xfbcfe8, 0xf9a8d4];

      weatherParticles.forEach((wp, idx) => {
        if (w.id === 'clear') {
          wp.mesh.visible = false;
          return;
        }
        wp.mesh.visible = true;
        wp.mesh.rotation.set(0, 0, 0);
        if (w.id === 'rain') {
          wp.isRain = true;
          wp.mesh.scale.set(0.04, 0.95, 0.04);
          wp.mesh.material = getMat(0x7dd3fc, { opacity: 0.42 });
          wp.vx = -0.8;
          wp.vy = -34 - (idx % 6);
        } else if (w.id === 'snow') {
          wp.isRain = false;
          wp.mesh.scale.set(0.22, 0.22, 0.22);
          wp.mesh.material = getMat(0xffffff);
          wp.vx = (Math.random() - 0.5) * 3.5;
          wp.vy = -6.5 - (idx % 4);
        } else if (w.id === 'autumn') {
          wp.isRain = false;
          wp.mesh.scale.set(0.32, 0.08, 0.26);
          wp.mesh.material = getMat(autumnColors[idx % autumnColors.length]);
          wp.vx = 3.5 + (idx % 3);
          wp.vy = -5.2 - (idx % 3);
        } else if (w.id === 'sakura') {
          wp.isRain = false;
          wp.mesh.scale.set(0.25, 0.07, 0.22);
          wp.mesh.material = getMat(sakuraColors[idx % sakuraColors.length]);
          wp.vx = -2.8 - (idx % 3);
          wp.vy = -4.6 - (idx % 3);
        }
      });
    }

    const targetSkyColor = new THREE.Color(0x6bf2c6);
    const targetFogColor = new THREE.Color(0x6bf2c6);
    const targetRoadColor = new THREE.Color(0x3b4254);
    const targetSidewalkColor = new THREE.Color(0xcfd8e3);
    const targetHemiSky = new THREE.Color(0xffffff);
    const targetHemiGround = new THREE.Color(0x334155);
    const targetDirColor = new THREE.Color(0xfffbeb);
    const targetSunPos = new THREE.Vector3(36, 52, 24);
    let targetHemiInt = 0.74;
    let targetDirInt = 0.94;
    let targetWindowEmissive = 0.0;
    let targetLampEmissive = 0.15;
    let targetMoteOpacity = 0.0;

    function applyTimeOfDay(index, instant = false) {
      gameState.timeIndex = index % TIME_PRESETS.length;
      const t = TIME_PRESETS[gameState.timeIndex];

      targetSkyColor.setHex(t.skyHex);
      targetFogColor.setHex(t.fogHex);
      targetRoadColor.setHex(t.roadHex);
      targetSidewalkColor.setHex(t.sidewalkHex);
      targetHemiSky.setHex(t.hemiSky);
      targetHemiGround.setHex(t.hemiGround);
      targetDirColor.setHex(t.dirHex);
      targetSunPos.set(t.sunPos[0], t.sunPos[1], t.sunPos[2]);
      targetHemiInt = t.hemiInt;
      targetDirInt = t.dirInt;
      targetWindowEmissive = t.windowEmissive;
      targetLampEmissive = t.lightsOn ? 2.2 : 0.15;
      targetMoteOpacity = 0.0; // Disabled: removed floating cubes
      if (moteMat) moteMat.opacity = 0.0;

      if (playerVan && playerVan.userData.beamLeft) {
        playerVan.userData.beamLeft.visible = t.lightsOn;
        playerVan.userData.beamRight.visible = t.lightsOn;
      }
      trafficVehicles.forEach((tv) => {
        if (tv.mesh.userData.beams) {
          tv.mesh.userData.beams.forEach(b => (b.visible = t.lightsOn));
        }
      });
      streetLampPools.forEach(p => {
        p.visible = t.lightsOn;
      });

      if (instant) {
        scene.background.copy(targetSkyColor);
        scene.fog.color.copy(targetFogColor);
        roadMat.color.copy(targetRoadColor);
        sidewalkMat.color.copy(targetSidewalkColor);
        hemiLight.color.copy(targetHemiSky);
        hemiLight.groundColor.copy(targetHemiGround);
        hemiLight.intensity = targetHemiInt;
        dirLight.color.copy(targetDirColor);
        dirLight.intensity = targetDirInt;
        dirLight.position.copy(targetSunPos);
        if (moteMat) moteMat.opacity = 0.0;
        streetLampBulbs.forEach(b => {
          if (b.material) b.material.emissiveIntensity = targetLampEmissive;
        });
        apartments.forEach(apt => {
          if (apt.windowMeshes) {
            apt.windowMeshes.forEach(wm => {
              if (wm.material) wm.material.emissiveIntensity = targetWindowEmissive;
            });
          }
        });
      }
    }

    function updateSmoothAtmosphereTransition(rawDt) {
      const blendRate = Math.min(1, rawDt * 1.2);
      scene.background.lerp(targetSkyColor, blendRate);
      scene.fog.color.lerp(targetFogColor, blendRate);
      roadMat.color.lerp(targetRoadColor, blendRate);
      sidewalkMat.color.lerp(targetSidewalkColor, blendRate);
      hemiLight.color.lerp(targetHemiSky, blendRate);
      hemiLight.groundColor.lerp(targetHemiGround, blendRate);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, targetHemiInt, blendRate);
      dirLight.color.lerp(targetDirColor, blendRate);
      dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, targetDirInt, blendRate);
      dirLight.position.lerp(targetSunPos, blendRate);
      if (moteMat) moteMat.opacity = 0.0;

      streetLampBulbs.forEach(b => {
        if (b.material) {
          b.material.emissiveIntensity = THREE.MathUtils.lerp(b.material.emissiveIntensity, targetLampEmissive, blendRate);
        }
      });
      apartments.forEach(apt => {
        if (apt.windowMeshes) {
          apt.windowMeshes.forEach(wm => {
            if (wm.material) {
              wm.material.emissiveIntensity = THREE.MathUtils.lerp(wm.material.emissiveIntensity, targetWindowEmissive, blendRate);
            }
          });
        }
      });
    }

    function triggerNextCityGate(forceZ = -115, instantSwitch = false) {
      const nextIdx = (gameState.cityIndex + 1) % CITY_THEMES.length;
      const nextTheme = CITY_THEMES[nextIdx];
      const gateMesh = createCityWelcomeGate(nextTheme);
      gateMesh.position.set(0, 0, forceZ);
      scene.add(gateMesh);
      activeGates.push({ mesh: gateMesh, themeIndex: nextIdx, passed: false });

      if (instantSwitch) {
        gameState.cityIndex = nextIdx;
        transformAllApartmentsToCity(nextTheme);
        soundFX.playCityGateChime();
        showCityToast(nextTheme);
        if (nextTheme.id === 'tokyo') applyWeatherMode(4);
        else if (nextTheme.id === 'chinatown') applyWeatherMode(1);
        else if (nextTheme.id === 'yangon') applyWeatherMode(1);
        else if (nextTheme.id === 'littleindia') applyWeatherMode(1);
        else if (nextTheme.id === 'pastel') applyWeatherMode(4);
      }
    }

    function showCityToast(cityTheme) {
      showActionToast(`🏙️ ${cityTheme.name.toUpperCase()}`, 'info');
    }

    function spawnTrafficWave() {
      if (trafficVehicles.length >= getRouteTrafficCap()) return;
      const laneIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      const count = routeState.kind === 'safe' ? 1 : Math.random() < (routeState.kind === 'express' ? 0.75 : 0.30) ? 2 : 1;
      const vehiclePool = ['cattruck', 'tuktuk', 'bankvan', 'dumptruck', 'ambulance', 'firetruck', 'police', 'ufo', 'car'];

      for (let i = 0; i < count; i++) {
        const laneIdx = laneIndices[i];
        const laneX = LANES[laneIdx];
        const spawnZ = -175 - i * 26;

        // Enforce a generous 46-unit minimum distance in the same lane so vehicles never spawn on top of each other
        const sameLaneVehicles = trafficVehicles.filter(v => v.laneIdx === laneIdx);
        const tooClose = sameLaneVehicles.some(v => Math.abs(v.mesh.position.z - spawnZ) < 46);
        if (tooClose) continue;

        const type = vehiclePool[Math.floor(Math.random() * vehiclePool.length)];
        const mesh = acquireTrafficVehicle(type);
        mesh.position.set(laneX, 0, spawnZ);
        scene.add(mesh);

        // Match speed to any vehicle ahead in the same lane so they never collide or pass through each other!
        let forwardDriveSpeed = type === 'tuktuk' ? 10.5 : (12.0 + Math.random() * 3.5);
        if (sameLaneVehicles.length > 0) {
          const nearest = sameLaneVehicles[0];
          forwardDriveSpeed = nearest.forwardDriveSpeed;
        }

        // 25% chance of Lane-Switch AI with turn signal indicators
        const canSwitchLane = Math.random() < 0.25;
        let leftBlinker = mesh.userData.leftBlinker || null;
        let rightBlinker = mesh.userData.rightBlinker || null;
        if (canSwitchLane) {
          if (leftBlinker) leftBlinker.visible = false;
          if (rightBlinker) rightBlinker.visible = false;
        }

        trafficVehicles.push({
          mesh,
          type,
          laneIdx,
          forwardDriveSpeed,
          passedPlayer: false,
          canSwitchLane,
          laneSwitchState: 'idle',
          signalTimer: 0,
          targetLaneIdx: null,
          signalSide: null,
          startLaneX: laneX,
          switchProgress: 0,
          leftBlinker,
          rightBlinker
        });
      }
    }

    function moveLane(dir) {
      if (gameState.mode !== 'playing') return;
      const prevLane = gameState.laneIndex;
      gameState.laneIndex = Math.max(0, Math.min(3, gameState.laneIndex + dir));
      if (gameState.laneIndex !== prevLane) {
        registerCargoSteer(dir);
        queueRivalRam(prevLane, gameState.laneIndex);
        soundFX.playReelTick(440);
        if (gameState.tutorialActive && gameState.tutorialStep === 1) {
          gameState.tutorialSteerCount = (gameState.tutorialSteerCount || 0) + 1;
          const counterEl = document.getElementById('tutorial-counter');
          if (counterEl) {
            counterEl.textContent = `${Math.min(2, gameState.tutorialSteerCount)} / 2 SWIPES`;
          }
          showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), `LANE SWIPE ${Math.min(2, gameState.tutorialSteerCount)}/2!`, 'text-emerald-300');

          if (gameState.tutorialSteerCount >= 2) {
            // Celebrate Step 1 Completion with "GREAT JOB!" then transition to Step 2 (Parcel Delivery)
            gameState.tutorialStep = 1.5;
            soundFX.playDeliverSuccess();
            document.getElementById('tutorial-step-badge').textContent = 'STEP 1 COMPLETE!';
            document.getElementById('tutorial-title').textContent = 'GREAT JOB! STEERING MASTERED!';
            document.getElementById('tutorial-desc').textContent = 'Next up: Let\'s practice matching & throwing a parcel to a customer!';
            const progRow = document.getElementById('tutorial-progress-row');
            if (progRow) progRow.classList.add('hidden');

            setTimeout(() => {
              if (!gameState.tutorialActive) return;
              advanceTutorialToStep2();
            }, 1650);
          }
        }
      }
    }

    function startInteractiveTutorial() {
      gameState.tutorialActive = true;
      gameState.tutorialStep = 1;
      gameState.tutorialSteerCount = 0;
      const overlay = document.getElementById('tutorial-overlay');
      const progRow = document.getElementById('tutorial-progress-row');
      const counterEl = document.getElementById('tutorial-counter');
      if (progRow) progRow.classList.remove('hidden');
      if (counterEl) counterEl.textContent = '0 / 2 SWIPES';

      document.getElementById('tutorial-step-badge').textContent = 'STEP 1 OF 2 • STEERING';
      document.getElementById('tutorial-title').textContent = 'STEER LEFT & RIGHT TO DODGE CARS';
      document.getElementById('tutorial-desc').textContent = 'Swipe Left & Right on the road (or press A / D) twice to practice dodging traffic!';
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
    }

    function advanceTutorialToStep2() {
      gameState.tutorialStep = 2;
      // Spawn a guaranteed customer order ahead on a nearby apartment ~75m away so the player can immediately practice throwing!
      const candidateApt = apartments.find(a => a.group.position.z < -40 && a.group.position.z > -95);
      if (candidateApt) {
        configureApartmentCustomer(candidateApt, true);
        if (!candidateApt.hasOrder) {
          globalOrderCounter++;
          candidateApt.hasOrder = true;
          candidateApt.orderId = globalOrderCounter;
          candidateApt.wantedType = gameState.handSlots[0];
          candidateApt.character = CHARACTER_TYPES[0];
          const charMesh = createVoxelCharacter(candidateApt.character.id, 0.96);
          candidateApt.customerSlot.add(charMesh);
          candidateApt.charMesh = charMesh;
          candidateApt.ringGroup.visible = true;
          ensureParcelAvailableInHand(candidateApt.wantedType);
        }
      }

      document.getElementById('tutorial-step-badge').textContent = 'STEP 2 OF 2 • PARCEL THROW';
      document.getElementById('tutorial-title').textContent = 'MATCH THE PARCEL & PRESS Q, W OR E!';
      document.getElementById('tutorial-desc').textContent = 'Wait for the resident\'s target ring, then press the key on their parcel badge or tap the matching dock card once. Keys 1, 2 and 3 also throw!';
    }

    function updateTutorialStep2Prompt(apt) {
      const sideText = apt.side === 'left' ? 'LEFT' : 'RIGHT';
      const matchingSlot = gameState.handSlots.indexOf(apt.wantedType);
      if (matchingSlot === -1) return;
      const title = `PRESS [${SLOT_KEYS[matchingSlot]}] FOR THE ${sideText} RESIDENT!`;
      if (document.getElementById('tutorial-title').textContent === title) return;
      document.getElementById('tutorial-step-badge').textContent = 'STEP 2 OF 2 • PARCEL THROW';
      document.getElementById('tutorial-title').textContent = title;
      document.getElementById('tutorial-desc').textContent = `Press ${SLOT_KEYS[matchingSlot]} or ${matchingSlot + 1}, or tap the matching parcel card, to deliver the requested item to the ${sideText} resident.`;
    }

    function completeInteractiveTutorial() {
      gameState.tutorialStep = 3;
      soundFX.playDeliverSuccess();
      document.getElementById('tutorial-step-badge').textContent = 'TUTORIAL COMPLETE!';
      document.getElementById('tutorial-title').textContent = 'GREAT JOB! YOU ARE READY TO ROLL!';
      document.getElementById('tutorial-desc').textContent = 'Enjoy your Midnight Delivery World Tour shift!';
      showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.5, 0)), 'GREAT JOB! TUTORIAL COMPLETE!', 'text-amber-300');

      setTimeout(() => {
        gameState.tutorialActive = false;
        gameState.tutorialStep = 0;
        gameState.tutorialCompletedOnce = true;
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
      }, 1700);
    }

    document.getElementById('btn-skip-tutorial').addEventListener('click', () => {
      gameState.tutorialActive = false;
      gameState.tutorialStep = 0;
      gameState.tutorialCompletedOnce = true;
      const overlay = document.getElementById('tutorial-overlay');
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
    });

    // Showroom Turntable Drag-to-Spin + Subway Surfers-style Direct Road Swipe Steering
    // (Completely independent of the camera so swiping on mobile NEVER rotates the camera!)
    let roadTouchId = null;
    let roadTouchStartX = 0;
    let roadTouchStartY = 0;
    let garageDragging = false;
    let garageLastX = 0;
    let garageSpinVel = 0;
    let garageDragOffset = 0;

    canvas.addEventListener('pointerdown', (e) => {
      soundFX.init();
      if (gameState.mode === 'home') {
        garageDragging = true;
        garageLastX = e.clientX;
        return;
      }
      if (gameState.mode !== 'playing' || gameState.dragging) return;
      roadTouchId = e.pointerId;
      roadTouchStartX = e.clientX;
      roadTouchStartY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (gameState.mode === 'home' && garageDragging) {
        const deltaX = e.clientX - garageLastX;
        garageLastX = e.clientX;
        garageDragOffset += deltaX * 0.011;
        garageSpinVel = deltaX * 0.004;
        turntableGroup.rotation.y = (Math.sin(performance.now() * 0.0006) * 0.2618) + garageDragOffset;
        return;
      }
      if (roadTouchId !== null && e.pointerId === roadTouchId && gameState.mode === 'playing' && !gameState.dragging) {
        const dx = e.clientX - roadTouchStartX;
        const dy = e.clientY - roadTouchStartY;
        if (Math.abs(dx) > 22 && Math.abs(dx) > Math.abs(dy)) {
          moveLane(dx > 0 ? 1 : -1);
          roadTouchStartX = e.clientX;
          roadTouchStartY = e.clientY;
        }
      }
    });

    function endRoadTouch(e) {
      garageDragging = false;
      if (roadTouchId !== null && (!e || e.pointerId === roadTouchId)) {
        if (e && gameState.mode === 'playing' && !gameState.dragging) {
          const dx = e.clientX - roadTouchStartX;
          const dy = e.clientY - roadTouchStartY;
          // Tap detection without dragging swerves: tap roadside to quick-throw!
          if (Math.hypot(dx, dy) < 18) {
            if (e.clientX < window.innerWidth * 0.38) {
              quickThrowParcel('left');
            } else if (e.clientX > window.innerWidth * 0.62) {
              quickThrowParcel('right');
            } else {
              quickThrowParcel('auto');
            }
          }
        }
        roadTouchId = null;
      }
    }
    window.addEventListener('pointerup', endRoadTouch);
    window.addEventListener('pointercancel', endRoadTouch);

    // Dedicated Touch Listeners for Instant Mobile Lane Swipes
    let touchSteerStartX = null;
    let touchSteerStartY = null;
    canvas.addEventListener('touchstart', (e) => {
      if (gameState.mode !== 'playing' || gameState.dragging || e.touches.length !== 1) return;
      touchSteerStartX = e.touches[0].clientX;
      touchSteerStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (gameState.mode === 'playing') {
        e.preventDefault();
      }
      if (touchSteerStartX === null || gameState.mode !== 'playing' || gameState.dragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchSteerStartX;
      const dy = e.touches[0].clientY - touchSteerStartY;
      if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)) {
        moveLane(dx > 0 ? 1 : -1);
        touchSteerStartX = e.touches[0].clientX;
        touchSteerStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (touchSteerStartX !== null && gameState.mode === 'playing' && !gameState.dragging && e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchSteerStartX;
        const dy = touch.clientY - touchSteerStartY;
        if (Math.hypot(dx, dy) < 18) {
          if (touch.clientX < window.innerWidth * 0.38) {
            quickThrowParcel('left');
          } else if (touch.clientX > window.innerWidth * 0.62) {
            quickThrowParcel('right');
          } else {
            quickThrowParcel('auto');
          }
        }
      }
      touchSteerStartX = null;
      touchSteerStartY = null;
    }, { passive: true });

    // Universal iOS Safari / Android Chrome Audio Unlock on first user interaction
    ['touchstart', 'pointerdown', 'click'].forEach((evtName) => {
      window.addEventListener(evtName, () => {
        soundFX.init();
      }, { once: true, passive: true });
    });



    window.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      // Escape for Pause / Resume
      if (e.key === 'Escape') {
        if (gameState.mode === 'playing') pauseShift();
        else if (gameState.mode === 'paused') resumeShiftWithCountdown();
        return;
      }

      // Space / Enter on Home or Game Over Screen starts / restarts shift
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        if (gameState.mode === 'home') {
          e.preventDefault();
          const startBtn = document.getElementById('btn-start-play');
          if (startBtn) startBtn.click();
          return;
        } else if (gameState.mode === 'gameover') {
          e.preventDefault();
          const playAgainBtn = document.getElementById('btn-play-again');
          if (playAgainBtn) playAgainBtn.click();
          return;
        }
      }

      if (gameState.mode !== 'playing') return;

      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      // Lane steering: A / D / Arrow Keys (Strictly reserved for steering)
      if (key === 'a' || code === 'KeyA' || key === 'arrowleft') {
        e.preventDefault();
        moveLane(-1);
      }
      if (key === 'd' || code === 'KeyD' || key === 'arrowright') {
        e.preventDefault();
        moveLane(1);
      }

      if (e.repeat) return;

      // Slot 0 throw: Q or 1
      if (key === 'q' || code === 'KeyQ' || key === '1' || code === 'Digit1') {
        e.preventDefault();
        throwFromSlot(0);
      }

      // Slot 1 throw: W or 2
      if (key === 'w' || code === 'KeyW' || key === '2' || code === 'Digit2') {
        e.preventDefault();
        throwFromSlot(1);
      }

      // Slot 2 throw: E or 3
      if (key === 'e' || code === 'KeyE' || key === '3' || code === 'Digit3') {
        e.preventDefault();
        throwFromSlot(2);
      }

      // Auto-throw matching parcel to in-range resident: Space / ArrowUp
      if (key === ' ' || code === 'Space' || key === 'spacebar' || key === 'arrowup') {
        e.preventDefault();
        autoThrowMatchingSlot();
      }
    });

    function syncAudioButtonsUI() {
      const svgOn = document.getElementById('audio-svg-on');
      const svgOff = document.getElementById('audio-svg-off');
      if (svgOn && svgOff) {
        svgOn.classList.toggle('hidden', !soundFX.enabled);
        svgOff.classList.toggle('hidden', soundFX.enabled);
      }
      const settingBtn = document.getElementById('setting-toggle-audio');
      if (settingBtn) {
        settingBtn.textContent = soundFX.enabled ? 'ON' : 'OFF';
        settingBtn.className = soundFX.enabled
          ? 'px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-extrabold arcade-btn'
          : 'px-4 py-2 rounded-xl bg-rose-500 text-white font-extrabold arcade-btn';
      }
      syncVolumeSlidersUI();
    }

    function syncVolumeSlidersUI() {
      const musicSlider = document.getElementById('setting-volume-music');
      const musicVal = document.getElementById('setting-volume-music-val');
      const sfxSlider = document.getElementById('setting-volume-sfx');
      const sfxVal = document.getElementById('setting-volume-sfx-val');

      if (musicSlider && musicVal) {
        const mPct = Math.round(soundFX.bgmVolume * 100);
        musicSlider.value = mPct;
        musicVal.textContent = mPct + '%';
      }
      if (sfxSlider && sfxVal) {
        const sPct = Math.round(soundFX.sfxVolume * 100);
        sfxSlider.value = sPct;
        sfxVal.textContent = sPct + '%';
      }
    }

    document.getElementById('btn-audio').addEventListener('click', () => {
      soundFX.init();
      soundFX.enabled = !soundFX.enabled;
      syncAudioButtonsUI();
      if (soundFX.enabled && !soundFX.isPlayingMusic) soundFX.startCozyMusic(gameState.mode === 'home' ? 'garage' : 'drive');
    });

    // Volume Sliders (Music BGM & Sound SFX)
    const musicSlider = document.getElementById('setting-volume-music');
    const musicVal = document.getElementById('setting-volume-music-val');
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        soundFX.init();
        const val = parseInt(e.target.value, 10) / 100;
        soundFX.setMusicVolume(val);
        if (musicVal) musicVal.textContent = e.target.value + '%';
        if (soundFX.enabled && !soundFX.isPlayingMusic && val > 0) {
          soundFX.startCozyMusic(gameState.mode === 'home' ? 'garage' : 'drive');
        }
      });
    }

    const sfxSlider = document.getElementById('setting-volume-sfx');
    const sfxVal = document.getElementById('setting-volume-sfx-val');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        soundFX.init();
        const val = parseInt(e.target.value, 10) / 100;
        soundFX.setSFXVolume(val);
        if (sfxVal) sfxVal.textContent = e.target.value + '%';
      });
      sfxSlider.addEventListener('change', () => {
        soundFX.playReelTick(480);
      });
    }

    const btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        openModal('modal-settings');
      });
    }

    // Pause & 3-Second Countdown Resume Logic
    let activeCountdownTimer = null;
    function pauseShift() {
      saveActiveShift();
      if (gameState.mode !== 'playing') return;
      endParcelDrag();
      gameState.mode = 'paused';
      openModal('modal-pause');
    }

    function resumeShiftWithCountdown() {
      closeModal('modal-pause');
      gameState.mode = 'countdown';
      const overlay = document.getElementById('countdown-overlay');
      const numEl = document.getElementById('countdown-number');
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');

      let count = 3;
      numEl.textContent = count;
      numEl.classList.remove('countdown-pop-anim');
      void numEl.offsetWidth;
      numEl.classList.add('countdown-pop-anim');
      soundFX.playReelTick(520);

      if (activeCountdownTimer) clearInterval(activeCountdownTimer);
      activeCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          numEl.textContent = count;
          numEl.classList.remove('countdown-pop-anim');
          void numEl.offsetWidth;
          numEl.classList.add('countdown-pop-anim');
          soundFX.playReelTick(520 + (3 - count) * 110);
        } else if (count === 0) {
          numEl.textContent = 'GO!';
          numEl.classList.remove('countdown-pop-anim');
          void numEl.offsetWidth;
          numEl.classList.add('countdown-pop-anim');
          soundFX.playDeliverSuccess();
        } else {
          clearInterval(activeCountdownTimer);
          activeCountdownTimer = null;
          overlay.classList.add('hidden');
          overlay.classList.remove('flex');
          lastTime = performance.now();
          gameState.mode = 'playing';
        }
      }, 850);
    }

    document.getElementById('btn-pause').addEventListener('click', pauseShift);
    document.getElementById('btn-pause-continue').addEventListener('click', resumeShiftWithCountdown);
    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      closeModal('modal-pause');
      resetGame(false);
    });
    document.getElementById('btn-pause-garage').addEventListener('click', () => {
      completePersistentShift();
      closeModal('modal-pause');
      gameState.bestDeliveries = Math.max(gameState.bestDeliveries, gameState.deliveries);
      gameState.bestDistance = Math.max(gameState.bestDistance, gameState.distanceMeters);
      setHomePageMode(true);
    });

    // Home Page Turntable Left / Right Vehicle Switcher
    document.getElementById('btn-prev-van').addEventListener('click', () => {
      soundFX.init();
      soundFX.playReelTick(480);
      gameState.selectedVanIndex = (gameState.selectedVanIndex - 1 + PLAYABLE_VANS.length) % PLAYABLE_VANS.length;
      rebuildGarageTurntableVan();
    });
    document.getElementById('btn-next-van').addEventListener('click', () => {
      soundFX.init();
      soundFX.playReelTick(560);
      gameState.selectedVanIndex = (gameState.selectedVanIndex + 1) % PLAYABLE_VANS.length;
      rebuildGarageTurntableVan();
    });

    // Left Menu Modal Openers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
        if (id === 'modal-settings') { renderCitySelectorUI(); syncVolumeSlidersUI(); }
      }
    }
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    document.getElementById('menu-btn-leaderboard').addEventListener('click', () => {
      renderLeaderboardModal('delivered');
      openModal('modal-leaderboard');
    });
    document.getElementById('tab-lb-delivered').addEventListener('click', (e) => {
      e.target.className = 'flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs arcade-font arcade-btn';
      document.getElementById('tab-lb-distance').className = 'flex-1 py-2.5 rounded-xl bg-slate-800 text-sky-200 font-extrabold text-xs arcade-font arcade-btn';
      renderLeaderboardModal('delivered');
    });
    document.getElementById('tab-lb-distance').addEventListener('click', (e) => {
      e.target.className = 'flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs arcade-font arcade-btn';
      document.getElementById('tab-lb-delivered').className = 'flex-1 py-2.5 rounded-xl bg-slate-800 text-sky-200 font-extrabold text-xs arcade-font arcade-btn';
      renderLeaderboardModal('distance');
    });

    document.getElementById('menu-btn-hall').addEventListener('click', () => {
      document.getElementById('hall-new-dot').classList.add('hidden');
      renderHallOfFameModal('items');
      openModal('modal-hall');
    });
    document.getElementById('tab-hall-items').addEventListener('click', () => {
      document.getElementById('tab-hall-items').className = 'flex-1 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs arcade-font arcade-btn';
      document.getElementById('tab-hall-chars').className = 'flex-1 py-2.5 rounded-xl bg-slate-800 text-sky-200 font-extrabold text-xs arcade-font arcade-btn';
      renderHallOfFameModal('items');
    });
    document.getElementById('tab-hall-chars').addEventListener('click', () => {
      document.getElementById('tab-hall-chars').className = 'flex-1 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs arcade-font arcade-btn';
      document.getElementById('tab-hall-items').className = 'flex-1 py-2.5 rounded-xl bg-slate-800 text-sky-200 font-extrabold text-xs arcade-font arcade-btn';
      renderHallOfFameModal('chars');
    });

    const menuBtnTuning = document.getElementById('menu-btn-tuning');
    if (menuBtnTuning) {
      menuBtnTuning.addEventListener('click', () => {
        renderTuningModal();
        openModal('modal-tuning');
      });
    }
    const spinDrawBtn = document.getElementById('btn-spin-draw');
    if (spinDrawBtn) spinDrawBtn.addEventListener('click', () => spinCapsuleDraw(1));

    const menuBtnDraw = document.getElementById('menu-btn-draw');
    if (menuBtnDraw) {
      menuBtnDraw.addEventListener('click', () => {
        updateHomeGarageUI();
        resetCapsuleModalStage();
        openModal('modal-draw');
      });
    }
    const btnHomeQuickDraw = document.getElementById('btn-home-quick-draw');
    if (btnHomeQuickDraw) {
      btnHomeQuickDraw.addEventListener('click', () => {
        updateHomeGarageUI();
        resetCapsuleModalStage();
        openModal('modal-draw');
      });
    }
    const btnGacha10x = document.getElementById('btn-capsule-10x');
    if (btnGacha10x) btnGacha10x.addEventListener('click', () => spinCapsuleDraw(10));

    const btnEquipWon = document.getElementById('btn-capsule-equip-won');
    if (btnEquipWon) {
      btnEquipWon.addEventListener('click', () => {
        if (lastWonVanId) {
          gameState.equippedVanId = lastWonVanId;
          gameState.selectedVanIndex = PLAYABLE_VANS.findIndex(v => v.id === lastWonVanId);
          rebuildGarageTurntableVan();
          updateHomeGarageUI();
          soundFX.playDeliverSuccess();
          closeModal('modal-draw');
        }
      });
    }

    const btnEquipHighest = document.getElementById('btn-capsule-equip-highest');
    if (btnEquipHighest) {
      btnEquipHighest.addEventListener('click', () => {
        if (lastWonVanId) {
          gameState.equippedVanId = lastWonVanId;
          gameState.selectedVanIndex = PLAYABLE_VANS.findIndex(v => v.id === lastWonVanId);
          rebuildGarageTurntableVan();
          updateHomeGarageUI();
          soundFX.playDeliverSuccess();
          closeModal('modal-draw');
        }
      });
    }

    const btnSpinAnother = document.getElementById('btn-capsule-spin-another');
    if (btnSpinAnother) btnSpinAnother.addEventListener('click', () => spinCapsuleDraw(1));

    const btnSpin10xAgain = document.getElementById('btn-capsule-spin-10x-again');
    if (btnSpin10xAgain) btnSpin10xAgain.addEventListener('click', () => spinCapsuleDraw(10));

    function switchCityByIndex(targetIdx) {
      gameState.cityIndex = (targetIdx + CITY_THEMES.length) % CITY_THEMES.length;
      const theme = CITY_THEMES[gameState.cityIndex];
      transformAllApartmentsToCity(theme);
      soundFX.playCityGateChime();
      showCityToast(theme);
      if (theme.id === 'tokyo') applyWeatherMode(4);
      else if (theme.id === 'chinatown') applyWeatherMode(1);
      else if (theme.id === 'yangon') applyWeatherMode(1);
      else if (theme.id === 'littleindia') applyWeatherMode(1);
      else if (theme.id === 'pastel') applyWeatherMode(4);
      else if (theme.id === 'paris') applyWeatherMode(4);
      else if (theme.id === 'rio') applyWeatherMode(1);
      else if (theme.id === 'washington') applyWeatherMode(4);
      else if (theme.id === 'dubai') applyWeatherMode(1);
      else if (theme.id === 'cairo') applyWeatherMode(1);
      if (window.cityLeftLandmarkGroup) {
        const isCairo = (theme.id === 'cairo');
        const targetX = isCairo ? -34.0 : -28.0;
        window.cityLeftLandmarkGroup.position.set(targetX, 0, -220.0);
        window.cityLeftLandmarkGroup.visible = true;
      }
      renderCitySelectorUI();
    }

    function renderCitySelectorUI() {
      const container = document.getElementById('setting-city-buttons');
      const label = document.getElementById('setting-current-city');
      if (label && CITY_THEMES[gameState.cityIndex]) {
        label.textContent = CITY_THEMES[gameState.cityIndex].name.toUpperCase();
      }
      if (!container) return;
      container.innerHTML = '';
      const cityIcons = {
        tokyo: '🗼',
        chinatown: '🏮',
        littleindia: '🛕',
        yangon: '🇲🇲',
        pastel: '🌆',
        paris: '🥐',
        rio: '🌴',
        washington: '🏛️',
        dubai: '🏙️',
        cairo: '🐪'
      };
      CITY_THEMES.forEach((ct, idx) => {
        const isCur = idx === gameState.cityIndex;
        const btn = document.createElement('button');
        btn.className = 'p-2 rounded-xl text-[10px] font-extrabold text-left transition-all arcade-btn flex items-center gap-1.5 ' + (
          isCur
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-2 border-white shadow-lg'
            : 'bg-slate-900/90 text-sky-200 border border-slate-700 hover:border-sky-400 hover:text-white'
        );
        btn.innerHTML = '<span class="text-sm">' + (cityIcons[ct.id] || '📍') + '</span> <span class="truncate">' + ct.name + '</span>';
        btn.addEventListener('click', () => {
          soundFX.init();
          switchCityByIndex(idx);
        });
        container.appendChild(btn);
      });
    }

    document.getElementById('menu-btn-settings').addEventListener('click', () => {
      renderCitySelectorUI();
      openModal('modal-settings');
    });
    document.getElementById('setting-toggle-audio').addEventListener('click', () => {
      soundFX.init();
      soundFX.enabled = !soundFX.enabled;
      syncAudioButtonsUI();
    });
    document.getElementById('setting-gift-coins').addEventListener('click', () => {
      soundFX.init();
      soundFX.playDeliverSuccess();
      gameState.coins += 300;
      tryRandomDiscoveryOnDelivery(Math.floor(Math.random() * PARCEL_TYPES.length), null);
      updateHomeGarageUI();
    });

    const btnOpenTuning = document.getElementById('btn-open-tuning');
    if (btnOpenTuning) {
      btnOpenTuning.addEventListener('click', () => {
        renderTuningModal();
        openModal('modal-tuning');
      });
    }

    const btnOpenContracts = document.getElementById('btn-open-contracts');
    if (btnOpenContracts) {
      btnOpenContracts.addEventListener('click', () => {
        renderContractsModal();
        openModal('modal-contracts');
      });
    }

    function resetGame(forceTutorial = false) {
      completePersistentShift();
      clearHudFeedback();
      soundFX.init();
      soundFX.startCozyMusic('drive');

      const currentSpec = PLAYABLE_VANS.find(v => v.id === gameState.equippedVanId) || PLAYABLE_VANS[0];
      gameState.baseSpeed = 30 + (currentSpec.speedStat - 75) * 0.25;

      setHomePageMode(false);
      gameState.mode = 'playing';

      gameState.score = 0;
      gameState.deliveries = 0;
      gameState.runCoinsEarned = 0;
      gameState.combo = 1;
      gameState.nearMissCount = 0;
      gameState.perfectDropCount = 0;
      gameState.hearts = 3;
      gameState.laneIndex = 2;
      gameState.currentX = LANES[2];
      gameState.lateralVelocity = 0;
      resetCargoRun();
      resetNightRun();
      resetRivalRun();
      gameState.throttle = 0.72;
      gameState.boostTimer = 0;

      // Chrono-Battery Upgrade sets Max Slow-Mo Capacity
      const battLvl = getVanTuningLevel(gameState.equippedVanId, 'battery');
      gameState.maxSlowMoEnergy = 8.0 + (battLvl - 1) * 1.5;
      gameState.slowMoEnergy = gameState.maxSlowMoEnergy;
      gameState.immortalTimer = 0;

      // Shift Contracts: Reset run-scoped missions and replenish pool
      if (gameState.shiftContracts) {
        gameState.shiftContracts.forEach((c) => {
          if ((c.type === 'deliveries_run' || c.type === 'combo_max' || c.type === 'distance_shift') && !c.completed) {
            c.current = 0;
          }
        });
        gameState.shiftContracts = gameState.shiftContracts.filter(c => !c.completed);
        ensureActiveContracts();
      }
      saveProgression();
      renderHomeContractsUI();

      // 1.35s Roll-Out Entrance Animation from Garage onto the Highway (Settles at vanZ = -5.4, well above the Parcel Bar!)
      gameState.entranceTimer = 1.35;
      gameState.vanZ = 9.0;
      playerVan.position.set(gameState.currentX, 0, gameState.vanZ);

      gameState.distanceMeters = 0;
      gameState.nextGateDistance = 210;
      gameState.invulnerableTimer = 1.5;
      gameState.cityIndex = 0;



      slowmoVignette.style.opacity = '0';

      applyTimeOfDay(0, true);
      applyWeatherMode(0);
      if (window.cityLeftLandmarkGroup) {
        const isCairo = (CITY_THEMES[gameState.cityIndex] && CITY_THEMES[gameState.cityIndex].id === 'cairo');
        const targetX = isCairo ? -34.0 : -28.0;
        window.cityLeftLandmarkGroup.position.set(targetX, 0, -220.0);
        window.cityLeftLandmarkGroup.visible = true;
      }
      if (typeof updateCityLeftLandmark === 'function' && CITY_THEMES[gameState.cityIndex]) {
        updateCityLeftLandmark(CITY_THEMES[gameState.cityIndex]);
      }
      updateHUD();

      if (forceTutorial || !gameState.tutorialCompletedOnce) {
        startInteractiveTutorial();
      } else {
        document.getElementById('tutorial-overlay').classList.add('hidden');
        document.getElementById('tutorial-overlay').classList.remove('flex');
        gameState.tutorialActive = false;
      }

      trafficVehicles.forEach(v => releaseTrafficVehicle(v.mesh));
      trafficVehicles.length = 0;

      flyingParcels.forEach(fp => {
        scene.remove(fp.mesh);
        fp.trailDots.forEach(td => scene.remove(td));
      });
      flyingParcels.length = 0;

      if (typeof exhaustPool !== 'undefined' && exhaustPool) {
        exhaustPool.forEach(ep => {
          ep.active = false;
          if (ep.mesh) ep.mesh.visible = false;
        });
      }
      if (typeof exhaustParticles !== 'undefined' && exhaustParticles) {
        exhaustParticles.forEach(ep => scene.remove(ep.mesh));
        exhaustParticles.length = 0;
      }
      if (typeof particles !== 'undefined' && particles) {
        particles.forEach(p => scene.remove(p.mesh));
        particles.length = 0;
      }

      flyingRagdolls.forEach(rg => scene.remove(rg.mesh));
      flyingRagdolls.length = 0;

      activePowerUps.forEach(pu => scene.remove(pu.mesh));
      activePowerUps.length = 0;
      nextPowerUpTimer = 18 + Math.random() * 14;

      activeRoadCoins.forEach(c => scene.remove(c.mesh || c));
      activeRoadCoins.length = 0;

      gameState.overdriveMeter = 0;
      gameState.overdriveActive = false;
      gameState.overdriveTimer = 0;
      gameState.droneAssistTimer = 0;
      gameState.coinMagnetTimer = 0;
      gameState.shieldBumperActive = false;
      gameState.survivalTimer = 0;
      gameState.rushHourActive = false;
      gameState.rushHourTimer = 0;
      gameState.nextRushHourAt = 60;
      gameState.handModifiers = [
        rollParcelModifier(),
        rollParcelModifier(),
        rollParcelModifier()
      ];
      if (overdriveAuraMesh) overdriveAuraMesh.visible = false;
      if (shieldBumperMesh) shieldBumperMesh.visible = false;
      if (droneGroup) droneGroup.visible = false;



      activeGates.forEach(g => scene.remove(g.mesh));
      activeGates.length = 0;

      activeCrosswalks.forEach(cw => scene.remove(cw.group));
      activeCrosswalks.length = 0;

      globalOrderCounter = 0;
      gameState.lockedTargetApt = null;
      gameState.handSlots = [0, 2, 6];
      apartments.forEach((apt) => {
        apt.hasOrder = false;
        apt.delivered = false;
      });

      // Keep initial blocks order-free so the first order appears after driving ~150m (or sooner if in tutorial mode!)
      apartments.forEach((apt, idx) => {
        const pairIdx = Math.floor(idx / 2);
        apt.group.position.z = 12 - pairIdx * BLOCK_SPACING;
        rebuildApartmentVisuals(apt, CITY_THEMES[0], idx);
        configureApartmentCustomer(apt, gameState.tutorialActive && pairIdx >= 4);
      });

      renderBottomParcelHandUI();

      const startVehicleTypes = ['cattruck', 'tuktuk', 'bankvan', 'dumptruck'];
      for (let z = -65; z >= -165; z -= 48) {
        const laneIdx = Math.floor(Math.random() * 4);
        const type = startVehicleTypes[Math.floor(Math.random() * startVehicleTypes.length)];
        const mesh = acquireTrafficVehicle(type);
        mesh.position.set(LANES[laneIdx], 0, z);
        scene.add(mesh);
        trafficVehicles.push({
          mesh,
          type,
          laneIdx,
          forwardDriveSpeed: 12 + Math.random() * 3,
          passedPlayer: false
        });
      }

      activeCrosswalks.push(createCrosswalkEvent(-125));

      document.getElementById('gameover-modal').classList.add('hidden');
      document.getElementById('gameover-modal').classList.remove('flex');
      beginPersistentShift();
      camera.fov = camera.userData.gameplayFov || 55;
      camera.updateProjectionMatrix();
    }

    document.getElementById('btn-start-play').addEventListener('click', () => {
      const spec = PLAYABLE_VANS[gameState.selectedVanIndex];
      if (gameState.ownedVans.includes(spec.id)) {
        gameState.equippedVanId = spec.id;
      }
      resetGame(false);
    });
    document.getElementById('btn-gameover-home').addEventListener('click', () => {
      document.getElementById('gameover-modal').classList.add('hidden');
      document.getElementById('gameover-modal').classList.remove('flex');
      setHomePageMode(true);
    });
    document.getElementById('btn-play-again').addEventListener('click', () => resetGame(false));

    // ============================================================================
    // 14. INITIALIZE SCENE & MAIN GAME LOOP
    // ============================================================================

    let lastTime = performance.now();
    const gameplayCameraLook = new THREE.Vector3();

    function aimGameplayCamera() {
      gameplayCameraLook.copy(PLAY_CAM_LOOK);
      gameplayCameraLook.y -= 2.5;
      camera.lookAt(gameplayCameraLook);
    }
    let trafficTimer = 0;
    let crosswalkTimer = 0;
    let atmosphereCycleTimer = 0;
    let exhaustSpawnTimer = 0;
    let nextPowerUpTimer = 18;

    function animate(now) {
      requestAnimationFrame(animate);
      try {
        if (!Number.isFinite(now)) now = performance.now();
        const elapsed = (now - lastTime) / 1000;
        const rawDt = Number.isFinite(elapsed) ? Math.min(Math.max(elapsed, 0.001), 0.05) : 0.001;
        lastTime = now;

        if (playerVan) {
          if (isNaN(playerVan.position.x) || isNaN(playerVan.position.y) || isNaN(playerVan.position.z)) {
            console.warn('[Midnight Delivery] NaN detected on playerVan position, resetting to safe coordinates');
            playerVan.position.set(0, 0, gameState.vanZ || -5.4);
            gameState.currentX = 0;
            gameState.lateralVelocity = 0;
          }
        }

      if (typeof cozyMotes !== 'undefined' && cozyMotes && cozyMotes.length > 0) {
        cozyMotes.forEach((cm) => {
          cm.mesh.position.y = cm.baseY + Math.sin(now * 0.002 + cm.phase) * 0.65;
          cm.mesh.rotation.y += rawDt * 1.2;
        });
      }

      // Home Page 3D Showroom Hero Angle with Slow Orbit (+/- 15 degrees)
      if (gameState.mode === 'home') {
        const heroOrbit = Math.sin(now * 0.0006) * 0.2618;
        if (!garageDragging) {
          garageDragOffset += garageSpinVel;
          garageSpinVel *= 0.90;
          garageDragOffset *= 0.95;
        }
        turntableGroup.rotation.y = heroOrbit + garageDragOffset;
        camera.up.set(0, 1, 0);
        camera.position.copy(SHOWROOM_CAM_POS);
        camera.lookAt(SHOWROOM_CAM_LOOK);
        renderer.render(scene, camera);
        return;
      }

      // Freeze world movement while Paused or in 3-2-1 Countdown
      if (gameState.mode === 'paused' || gameState.mode === 'countdown' || gameState.mode === 'gameover') {
        camera.up.set(0, 1, 0);
        camera.position.copy(PLAY_CAM_POS);
        aimGameplayCamera();
        renderer.render(scene, camera);
        return;
      }

      // Smoothly interpolate Sky, Fog, Road, Sun & Lamp colors over time
      updateSmoothAtmosphereTransition(rawDt);

      // Slow-Motion ONLY activates & drains Slow-Mo Energy while the player is actively dragging a parcel!
      let isDragSlowMoActive = false;

      if (gameState.dragging && gameState.slowMoEnergy > 0) {
        isDragSlowMoActive = true;
        const battLvl = getVanTuningLevel(gameState.equippedVanId, 'battery');
        const drainMult = battLvl === 5 ? 0.70 : 1.0;
        gameState.slowMoEnergy = Math.max(0, gameState.slowMoEnergy - rawDt * drainMult);
        slowmoVignette.style.opacity = '1';

      } else {
        slowmoVignette.style.opacity = '0';

      }


      const timeScale = isDragSlowMoActive ? 0.28 : (gameState.tutorialActive ? 0.68 : 1.0);
      const dt = rawDt * timeScale;

      if (gameState.immortalTimer > 0) {
        gameState.immortalTimer = Math.max(0, gameState.immortalTimer - rawDt);


        if (playerVan.userData.immortalAura) {
          playerVan.userData.immortalAura.visible = true;
          playerVan.userData.immortalAura.rotation.z = now * 0.008;
          playerVan.userData.immortalAura.material.color.setHSL((now * 0.0015) % 1, 1.0, 0.55);
        }
        if (gameState.immortalTimer <= 0) {

          if (playerVan.userData.immortalAura) playerVan.userData.immortalAura.visible = false;
        }
      }

      // Smooth Roll-Out Entrance Animation when starting a shift (Straight-ahead chase dolly matching Images 1 & 2)
      if (gameState.entranceTimer > 0) {
        gameState.entranceTimer = Math.max(0, gameState.entranceTimer - rawDt);
        const prog = 1 - (gameState.entranceTimer / 1.35);
        const easeOut = 1 - Math.pow(1 - prog, 3);
        gameState.vanZ = THREE.MathUtils.lerp(4.2, -5.4, easeOut);
        playerVan.position.z = gameState.vanZ;

        camera.up.set(0, 1, 0);
        camera.position.set(
          0,
          THREE.MathUtils.lerp(PLAY_CAM_POS.y - 2.2, PLAY_CAM_POS.y, easeOut),
          THREE.MathUtils.lerp(PLAY_CAM_POS.z + 4.5, PLAY_CAM_POS.z, easeOut)
        );
        aimGameplayCamera();
      } else {
        gameState.vanZ = -5.4;
        playerVan.position.z = gameState.vanZ;
        camera.up.set(0, 1, 0);
        camera.position.copy(PLAY_CAM_POS);
        aimGameplayCamera();
      }

      if (screenShakeTime > 0) {
        screenShakeTime = Math.max(0, screenShakeTime - rawDt);
        const shakeMag = (screenShakeTime / 0.35) * screenShakeIntensity;
        camera.position.x += (Math.random() - 0.5) * 0.55 * shakeMag;
        camera.position.y += (Math.random() - 0.5) * 0.40 * shakeMag;
      }

      // Gradual Speed Acceleration as distance & deliveries increase + Rig Engine Tune Upgrade!
      const engLvl = getVanTuningLevel(gameState.equippedVanId, 'engine');
      const engSpeedMult = 1 + (engLvl - 1) * 0.045;
      const speedProgression = Math.min(22, gameState.distanceMeters * 0.015 + gameState.deliveries * 0.65);
      const playerSpeed = gameState.mode === 'playing'
        ? (gameState.baseSpeed + speedProgression) * engSpeedMult * (gameState.overdriveActive ? 1.35 : 1)
        : 12;

      if (gameState.dragging || (gameState.mode === 'playing' && gameState.lockedTargetApt)) {
        updateProjectileArcVisuals(now);
      } else {
        projectileArcLine.visible = false;
        aimNodes.forEach(n => (n.visible = false));
        aimLandingRing.visible = false;
      }

      // Continuous Voxel Exhaust Pipe Smoke Puffs
      exhaustSpawnTimer += rawDt;
      const smokeInterval = gameState.boostTimer > 0 ? 0.035 : 0.075;
      if (exhaustSpawnTimer >= smokeInterval && gameState.mode === 'playing') {
        exhaustSpawnTimer = 0;
        spawnExhaustSmoke(gameState.boostTimer > 0);
      }
      exhaustPool.forEach(ep => {
        if (!ep.active) return;
        ep.life -= rawDt;
        if (ep.life <= 0) {
          ep.active = false;
          ep.mesh.visible = false;
          return;
        }
        ep.mesh.position.x += ep.vx * rawDt;
        ep.mesh.position.y += ep.vy * rawDt;
        ep.mesh.position.z += ep.vz * dt;
        ep.mesh.rotation.x += 3.5 * rawDt;
        ep.mesh.rotation.y += 3.5 * rawDt;
        const lifeRatio = Math.max(0, ep.life / ep.maxLife);
        ep.mesh.scale.setScalar(0.24 + (1 - lifeRatio) * 0.48);
      });

      roadLines.forEach(dash => {
        dash.position.z += playerSpeed * dt;
        if (dash.position.z > 36) dash.position.z -= 280;
      });

      // Grand Distant Left Landmark approaches smoothly in 3D perspective
      if (window.cityLeftLandmarkGroup && gameState.mode === 'playing') {
        const isCairo = (CITY_THEMES[gameState.cityIndex] && CITY_THEMES[gameState.cityIndex].id === 'cairo');
        const targetX = isCairo ? -34.0 : -28.0;
        window.cityLeftLandmarkGroup.position.x = targetX;

        if (window.cityLeftLandmarkGroup.visible) {
          window.cityLeftLandmarkGroup.position.z += playerSpeed * dt * 0.35;

          // When landmark passes behind the camera, hide it so only ONE exists per city
          if (window.cityLeftLandmarkGroup.position.z > 45.0) {
            window.cityLeftLandmarkGroup.visible = false;
          }
        }
      }

      // Scroll Streetlamps at the exact road speed so they never follow the car!
      streetLamps.forEach((lampGroup) => {
        lampGroup.position.z += playerSpeed * dt;
        if (lampGroup.position.z > 35) {
          lampGroup.position.z -= 260;
        }
      });

      sidewalkActors.forEach((act, idx) => {
        const relZ = playerSpeed - act.speed;
        act.mesh.position.z += relZ * dt;

        if (act.isCyclist) {
          if (act.mesh.userData.wheels) {
            act.mesh.userData.wheels.forEach(w => (w.rotation.x -= act.speed * dt * 0.45));
          }
        } else {
          act.mesh.position.y = 0.28 + Math.abs(Math.sin(now * 0.011 + idx)) * 0.14;
          if (act.mesh.userData.dog && act.mesh.userData.dog.userData.tail) {
            act.mesh.userData.dog.userData.tail.rotation.z = Math.sin(now * 0.025 + idx) * 0.45;
          }
        }

        if (act.mesh.position.z > 30) {
          act.mesh.position.z = -210 - Math.random() * 25;
        }
      });

      // Dynamic approaching perspective (အနားနီးရင်ကြီးလာတာ)
      // Landmark starts on distant horizon (Z = -220) and smoothly approaches player with 35% parallax speed,
      // naturally growing larger in 3D perspective until passing beside player!
      if (window.cityLeftLandmarkGroup && gameState.mode === 'playing') {
        const isCairo = (CITY_THEMES[gameState.cityIndex] && CITY_THEMES[gameState.cityIndex].id === 'cairo');
        const targetX = isCairo ? -34.0 : -28.0;
        window.cityLeftLandmarkGroup.position.x = targetX;

        if (window.cityLeftLandmarkGroup.visible) {
          window.cityLeftLandmarkGroup.position.z += playerSpeed * dt * 0.35;

          // When landmark passes behind the camera, hide it so only ONE exists per city
          if (window.cityLeftLandmarkGroup.position.z > 45.0) {
            window.cityLeftLandmarkGroup.visible = false;
          }
        }
      }

      apartments.forEach(apt => {
        apt.group.position.z += playerSpeed * dt;

        if (apt.hasOrder && apt.charMesh) {
          const dz = gameState.vanZ - apt.group.position.z;
          const meters = dz * 1.45;
          const bounce = meters <= 160 ? 0.42 : 0.14;
          apt.charMesh.position.y = Math.abs(Math.sin(now * 0.008 + apt.orderId)) * bounce;
          if (apt.charMesh.userData.waveArm) {
            apt.charMesh.userData.waveArm.rotation.z = -0.45 + Math.sin(now * 0.014 + apt.orderId) * 0.45;
          }
        }

        if (apt.group.position.z > 32 && !flyingParcels.some(parcel => parcel.targetApt === apt)) {
          apt.group.position.z -= NUM_PAIRS * BLOCK_SPACING;
          const currentTheme = CITY_THEMES[gameState.cityIndex];
          if (apt.currentThemeId !== currentTheme.id) {
            rebuildApartmentVisuals(apt, currentTheme, apt.index);
          }
          // Spawn delivery orders after ~150m warm-up (or immediately if in tutorial mode)
          configureApartmentCustomer(apt, gameState.tutorialActive || gameState.distanceMeters >= 55);
        }
      });

      weatherParticles.forEach(wp => {
        if (!wp.mesh.visible) return;
        wp.mesh.position.x += wp.vx * rawDt;
        wp.mesh.position.y += wp.vy * rawDt;
        wp.mesh.position.z += playerSpeed * dt * (wp.isRain ? 0.18 : 0.45);
        if (!wp.isRain) {
          wp.mesh.rotation.x += wp.rotSpeed * rawDt;
          wp.mesh.rotation.z += wp.rotSpeed * rawDt;
        }

        if (wp.mesh.position.y < 0.2 || wp.mesh.position.z > 24) {
          wp.mesh.position.y = 22 + Math.random() * 8;
          wp.mesh.position.x = (Math.random() - 0.5) * 44;
          wp.mesh.position.z = -95 + Math.random() * 85;
        }
      });

      updateOrderAlertsAndBubbles();

      if (gameState.mode === 'playing') {
        gameState.distanceMeters += playerSpeed * dt * 0.42;
        updateContractProgress('distance_shift', Math.round(gameState.distanceMeters), true);

        // 1. Hot Parcel Modifiers Live Countdown Update
        if (gameState.handModifiers) {
          gameState.handModifiers.forEach((m, slotIdx) => {
            if (m && m.type === 'hot') {
              m.timer -= dt;
              if (m.timer <= 0) {
                gameState.handModifiers[slotIdx] = null;
                renderBottomParcelHandUI(slotIdx);
                showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 2.5, 0)), 'PARCEL COOLED DOWN', 'text-slate-400');
              } else {
                const card = document.querySelector(`.parcel-card-slot[data-slot="${slotIdx}"]`);
                if (card) {
                  const fill = card.querySelector('.hot-countdown-fill');

                  if (fill) fill.style.width = `${Math.max(0, (m.timer / m.maxTime) * 100)}%`;

                }
              }
            }
          });
        }

        // 2. Overdrive (Fever Mode) Live Countdown, Speed Boost, Neon Aura & FOV
        if (gameState.overdriveActive) {
          gameState.overdriveTimer = Math.max(0, gameState.overdriveTimer - dt);
          gameState.overdriveMeter = Math.max(0, (gameState.overdriveTimer / 7.0) * 100);
          camera.fov = THREE.MathUtils.lerp(camera.fov, 68, dt * 4.0);
          camera.updateProjectionMatrix();

          if (overdriveAuraMesh) {
            overdriveAuraMesh.visible = true;
            overdriveAuraMesh.rotation.y += dt * 4.5;
            overdriveAuraMesh.scale.setScalar(1 + Math.sin(now * 0.02) * 0.08);
          }

          if (gameState.overdriveTimer <= 0) {
            gameState.overdriveActive = false;
            gameState.overdriveMeter = 0;
            if (overdriveAuraMesh) overdriveAuraMesh.visible = false;
          }
          updateHUD();
        } else {
          if (Math.abs(camera.fov - camera.userData.gameplayFov) > 0.1) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, camera.userData.gameplayFov, dt * 3.0);
            camera.updateProjectionMatrix();
          }
          if (overdriveAuraMesh) overdriveAuraMesh.visible = false;
        }

        // 3. Dynamic Road Event: Rush Hour Blitz every 60s
        gameState.survivalTimer = (gameState.survivalTimer || 0) + dt;
        if (!gameState.rushHourActive && gameState.survivalTimer >= gameState.nextRushHourAt) {
          gameState.rushHourActive = true;
          gameState.rushHourTimer = 15.0;
          gameState.nextRushHourAt = gameState.survivalTimer + 60.0 + 15.0;
          soundFX.playCityGateChime();
          triggerScreenShake(0.3, 1.2);
          showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3.5, 0)), '🔥 RUSH HOUR BLITZ! 15s', 'combat-text-fire');

        } else if (gameState.rushHourActive) {
          gameState.rushHourTimer -= dt;
          if (gameState.rushHourTimer <= 0) {
            gameState.rushHourActive = false;

          }
        }

        // 4. Drone Assist: Auto-throw parcels to active customers
        if (gameState.droneAssistTimer > 0) {
          gameState.droneAssistTimer = Math.max(0, gameState.droneAssistTimer - dt);
          droneGroup.visible = true;
          droneGroup.position.set(playerVan.position.x, playerVan.position.y + 3.2, playerVan.position.z - 0.4);
          droneRotors.forEach(r => (r.rotation.y += dt * 35));

          droneThrowCooldown -= dt;
          if (droneThrowCooldown <= 0) {
            const target = findTargetApartment();
            if (target) {
              droneThrowCooldown = 1.35;
              autoThrowMatchingSlot();
              showFloatingPopup(droneGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0)), '🚁 DRONE AUTO-DROP!', 'text-cyan-300 font-bold');
            }
          }
          if (gameState.droneAssistTimer <= 0) {
            droneGroup.visible = false;
          }
        } else {
          droneGroup.visible = false;
        }

        // 5. Coin Magnet & Shield Bumper Timers
        if (gameState.coinMagnetTimer > 0) {
          gameState.coinMagnetTimer = Math.max(0, gameState.coinMagnetTimer - dt);
        }
        if (shieldBumperMesh) {
          shieldBumperMesh.visible = !!gameState.shieldBumperActive;
          if (gameState.shieldBumperActive) {
            shieldRing.scale.setScalar(1 + Math.sin(now * 0.015) * 0.08);
          }
        }

        // 6. Collectible Road Coins Spawning & Attraction
        if (gameState.distanceMeters - lastCoinSpawnDist > 34) {
          lastCoinSpawnDist = gameState.distanceMeters;
          spawnRoadCoinCluster(-165);
        }

        for (let cIdx = activeRoadCoins.length - 1; cIdx >= 0; cIdx--) {
          const cMesh = activeRoadCoins[cIdx];
          cMesh.position.z += playerSpeed * dt;
          cMesh.rotation.y += rawDt * 3.5;
          cMesh.position.y = 0.75 + Math.sin(now * 0.008 + cIdx) * 0.14;

          if (gameState.coinMagnetTimer > 0) {
            const mDz = Math.abs(cMesh.position.z - playerVan.position.z);
            if (mDz < 35) {
              cMesh.position.x = THREE.MathUtils.lerp(cMesh.position.x, playerVan.position.x, rawDt * 9);
              cMesh.position.z = THREE.MathUtils.lerp(cMesh.position.z, playerVan.position.z, rawDt * 11);
            }
          }

          const distZ = Math.abs(cMesh.position.z - playerVan.position.z);
          const distX = Math.abs(cMesh.position.x - playerVan.position.x);
          if (distZ < 2.0 && distX < 1.6) {
            soundFX.playDeliverSuccess();
            gameState.coins += getRouteCoinMultiplier();
            gameState.runCoinsEarned += getRouteCoinMultiplier();
            gameState.score += 20 * (gameState.overdriveActive ? 2 : 1);
            spawnVoxelBurst(cMesh.position, 0xfacc15, 10);
            showFloatingPopup(cMesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), '+1 COIN', 'text-amber-300 font-extrabold');
            scene.remove(cMesh);
            activeRoadCoins.splice(cIdx, 1);
            updateHUD();
            updateContractProgress('yangon_coins', 1);
            continue;
          }

          if (cMesh.position.z > 35) {
            scene.remove(cMesh);
            activeRoadCoins.splice(cIdx, 1);
          }
        }

        if (gameState.distanceMeters >= gameState.nextGateDistance && activeGates.length === 0) {
          gameState.nextGateDistance = gameState.distanceMeters + 165;
          triggerNextCityGate(-135);
        }

        atmosphereCycleTimer += rawDt;
        if (atmosphereCycleTimer > 70) {
          atmosphereCycleTimer = 0;
          applyTimeOfDay(gameState.timeIndex + 1);
          if (Math.random() < 0.65) applyWeatherMode(gameState.weatherIndex + 1);
        }

        for (let i = activeGates.length - 1; i >= 0; i--) {
          const g = activeGates[i];
          g.mesh.position.z += playerSpeed * dt;

          if (!g.passed && g.mesh.position.z >= gameState.vanZ) {
            g.passed = true;
            gameState.cityIndex = g.themeIndex;
            const newTheme = CITY_THEMES[gameState.cityIndex];
            transformAllApartmentsToCity(newTheme);
            soundFX.playCityGateChime();
            showCityToast(newTheme);
            if (window.cityLeftLandmarkGroup) {
              const isCairo = (newTheme.id === 'cairo');
              const targetX = isCairo ? -34.0 : -28.0;
              window.cityLeftLandmarkGroup.position.set(targetX, 0, -220.0);
              window.cityLeftLandmarkGroup.visible = true;
            }

            if (newTheme.id === 'tokyo') applyWeatherMode(4);
            else if (newTheme.id === 'chinatown') applyWeatherMode(1);
            else if (newTheme.id === 'yangon') applyWeatherMode(1);
            else if (newTheme.id === 'littleindia') applyWeatherMode(1);
            else if (newTheme.id === 'pastel') applyWeatherMode(4);
          }

          if (g.mesh.position.z > 38) {
            scene.remove(g.mesh);
            activeGates.splice(i, 1);
          }
        }

        // Long-Interval Rare Road Power-Ups (Extra Heart, Slow-Mo Energy Refill, Rainbow Immortal)
        nextPowerUpTimer -= rawDt;
        if (nextPowerUpTimer <= 0 && activePowerUps.length === 0) {
          spawnRareRoadPowerUp();
          nextPowerUpTimer = 22 + Math.random() * 16;
        }

        for (let i = activePowerUps.length - 1; i >= 0; i--) {
          const pu = activePowerUps[i];
          pu.mesh.position.z += playerSpeed * dt;
          pu.mesh.userData.core.rotation.y += rawDt * 2.8;
          pu.mesh.userData.core.position.y = 1.45 + Math.sin(now * 0.006 + i) * 0.28;
          pu.mesh.userData.baseRing.scale.setScalar(1 + Math.sin(now * 0.01) * 0.12);

          const distZ = Math.abs(pu.mesh.position.z - playerVan.position.z);
          const distX = Math.abs(pu.mesh.position.x - playerVan.position.x);
          if (distZ < 2.3 && distX < 1.8) {
            soundFX.playCityGateChime();
            if (pu.type === 'drone') {
              gameState.droneAssistTimer = 6.0;
              droneGroup.visible = true;
              droneThrowCooldown = 0.4;
              updateHUD();
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x00f5d4, 28);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '🚁 DRONE ASSIST ACTIVE (6S)!', 'text-cyan-300 font-extrabold');
            } else if (pu.type === 'magnet') {
              gameState.coinMagnetTimer = 8.0;
              updateHUD();
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xf59e0b, 28);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '🧲 COIN MAGNET ACTIVE (8S)!', 'text-amber-300 font-extrabold');
            } else if (pu.type === 'shield') {
              gameState.shieldBumperActive = true;
              if (shieldBumperMesh) shieldBumperMesh.visible = true;
              updateHUD();
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x38bdf8, 28);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '🛡️ SHIELD BUMPER READY!', 'text-sky-300 font-extrabold');
            } else if (pu.type === 'heart') {
              gameState.hearts = Math.min(gameState.maxHearts, gameState.hearts + 1);
              updateHUD();
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xf43f5e, 24);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '+1 EXTRA LIFE HEART!', 'text-rose-400');
            } else if (pu.type === 'slowmo') {
              gameState.slowMoEnergy = gameState.maxSlowMoEnergy;

              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x00f5d4, 24);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), 'DRAG SLOW-MO RECHARGED!', 'text-cyan-300');
            } else {
              gameState.immortalTimer = 10.0;
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xfacc15, 28);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), 'RAINBOW IMMORTAL (10S)!', 'text-amber-300');
            }
            scene.remove(pu.mesh);
            activePowerUps.splice(i, 1);
            continue;
          }

          if (pu.mesh.position.z > 35) {
            scene.remove(pu.mesh);
            activePowerUps.splice(i, 1);
          }
        }

        crosswalkTimer += dt;
        if (crosswalkTimer > 11.0 && activeCrosswalks.length < 1) {
          crosswalkTimer = 0;
          activeCrosswalks.push(createCrosswalkEvent(-145));
        }

        let showCrosswalkWarning = false;
        for (let i = activeCrosswalks.length - 1; i >= 0; i--) {
          const cw = activeCrosswalks[i];
          cw.group.position.z += playerSpeed * dt;

          cw.walkerGroup.position.x += cw.dir * cw.speed * dt;
          if (cw.walkerGroup.position.x > 6.6) {
            cw.dir = -1;
            cw.walkerGroup.rotation.y = Math.PI;
          } else if (cw.walkerGroup.position.x < -6.6) {
            cw.dir = 1;
            cw.walkerGroup.rotation.y = 0;
          }

          cw.members.forEach((m, idx) => {
            m.position.y = Math.abs(Math.sin(now * 0.015 + idx * 0.9)) * 0.22;
          });

          const distZ = cw.group.position.z - gameState.vanZ;
          if (distZ > -80 && distZ < 2 && cw.members.length > 0) {
            showCrosswalkWarning = true;

          }

          if (Math.abs(distZ) < 1.8 && !cw.hitTriggered) {
            const walkerX = cw.walkerGroup.position.x;
            if (Math.abs(playerVan.position.x - walkerX) < 2.15) {
              cw.hitTriggered = true;
              soundFX.playCrash();

              // Launch the hit Pedestrian or Ducks flying through the air with 3D Ragdoll Knockback Physics!
              cw.members.forEach((m, mIdx) => {
                const worldPos = new THREE.Vector3();
                m.getWorldPosition(worldPos);
                cw.walkerGroup.remove(m);
                m.position.copy(worldPos);
                scene.add(m);
                flyingRagdolls.push({
                  mesh: m,
                  vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 14 + (walkerX - playerVan.position.x) * 4,
                    12 + Math.random() * 6 + mIdx * 1.5,
                    -24 - Math.random() * 10
                  ),
                  rotVel: new THREE.Vector3(
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 14
                  ),
                  life: 2.2
                });
              });
              cw.members.length = 0;

              if (gameState.immortalTimer > 0 || gameState.overdriveActive) {
                showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), '⚡ OVERDRIVE KNOCKBACK!', 'combat-text-gold');
              } else if (gameState.shieldBumperActive) {
                gameState.shieldBumperActive = false;
                if (shieldBumperMesh) shieldBumperMesh.visible = false;
                soundFX.playPerfectChime();
                triggerScreenShake(0.25, 0.9);
                spawnVoxelBurst(playerVan.position.clone().add(new THREE.Vector3(0, 1.2, -1.8)), 0x38bdf8, 22);
                showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), '🛡️ SHIELD SAVED IMPACT!', 'combat-text-blue');
                updateHUD();
              } else if (gameState.invulnerableTimer <= 0) {
                // Grazing obstacles or taking damage cracks fragile parcels in hand
                gameState.handModifiers.forEach(m => {
                  if (m && m.type === 'fragile' && !m.cracked) m.cracked = true;
                });
                renderBottomParcelHandUI();

                gameState.hearts -= 1;
                gameState.combo = 1;
                gameState.invulnerableTimer = 1.6;
                updateHUD();
                showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), 'CROSSWALK IMPACT!', 'text-rose-400');
                if (gameState.hearts <= 0) {
                  gameState.mode = 'gameover';
                  completePersistentShift();
                  gameState.bestDeliveries = Math.max(gameState.bestDeliveries, gameState.deliveries);
                  gameState.bestDistance = Math.max(gameState.bestDistance, gameState.distanceMeters);
                  endParcelDrag();
                  document.getElementById('final-score').textContent = gameState.score.toLocaleString();
                  document.getElementById('final-deliveries').textContent = gameState.deliveries;
                  document.getElementById('final-coins').textContent = `+${gameState.runCoinsEarned}`;
                  renderGameOverContracts();
                  saveProgression();
                  document.getElementById('gameover-modal').classList.remove('hidden');
                  document.getElementById('gameover-modal').classList.add('flex');
                }
              }
            } else if (!cw.passedBonusGiven) {
              cw.passedBonusGiven = true;
              soundFX.playDuckQuack();
              gameState.score += 100;
              updateHUD();
              showFloatingPopup(cw.group.position.clone().add(new THREE.Vector3(0, 3, 0)), 'SAFE CROSSING +100', 'text-emerald-300');
            }
          }

          if (cw.group.position.z > 35) {
            scene.remove(cw.group);
            activeCrosswalks.splice(i, 1);
          }
        }
        if (showCrosswalkWarning && !crosswalkWarningActive) showActionToast('⚠️ PEDESTRIAN CROSSING', 'info');
        crosswalkWarningActive = showCrosswalkWarning;

        // Snappy Arcade Spring-Damped Lane Switching & Body Physics
        const handLvl = getVanTuningLevel(gameState.equippedVanId, 'handling');
        const targetX = LANES[gameState.laneIndex];
        const springK = 195 + (handLvl - 1) * 45;
        const damping = 24 + (handLvl - 1) * 3.5;

        if (!Number.isFinite(gameState.currentX)) gameState.currentX = targetX;
        if (!Number.isFinite(gameState.lateralVelocity)) gameState.lateralVelocity = 0;
        const physicsSteps = Math.ceil(rawDt / (1 / 120));
        const physicsDt = rawDt / physicsSteps;
        for (let step = 0; step < physicsSteps; step++) {
          const springForce = -springK * (gameState.currentX - targetX) - damping * gameState.lateralVelocity;
          gameState.lateralVelocity += springForce * physicsDt;
          gameState.currentX += gameState.lateralVelocity * physicsDt;
        }
        const distToTarget = gameState.currentX - targetX;

        if (Math.abs(distToTarget) < 0.012 && Math.abs(gameState.lateralVelocity) < 0.04) {
          gameState.currentX = targetX;
          gameState.lateralVelocity = 0;
        }
        playerVan.position.x = gameState.currentX;
        updateRoofSway(rawDt);
        updateCargoRoad(dt, playerSpeed);

        // Dynamic Vehicle Body Physics during Lane Changes:
        // 1. Yaw rotation (steering into the target lane and straightening out)
        const targetYaw = -gameState.lateralVelocity * 0.028;
        playerVan.rotation.y = THREE.MathUtils.lerp(playerVan.rotation.y, targetYaw, rawDt * 22);

        // 2. Chassis body roll (tilting into the swerve)
        const chassis = playerVan.userData.chassis;
        const targetRoll = gameState.lateralVelocity * 0.032;
        chassis.rotation.z = THREE.MathUtils.lerp(chassis.rotation.z, targetRoll, rawDt * 18);

        // 3. Pitch dip (pitch forward slightly during braking/slow-mo, back when boosting)
        const isBraking = gameState.dragging || (gameState.slowMoEnergy > 0 && gameState.mode === 'playing' && gameState.dragging);
        const targetPitch = isBraking ? 0.042 : (gameState.boostTimer > 0 ? -0.038 : 0);
        chassis.rotation.x = THREE.MathUtils.lerp(chassis.rotation.x, targetPitch, rawDt * 14);

        chassis.position.y = Math.sin(now * 0.028) * 0.04;
        chassis.scale.lerp(new THREE.Vector3(1, 1, 1), rawDt * 12);

        // Wheels spin and front wheels steer with yaw
        playerVan.userData.wheels.forEach((w, wIdx) => {
          w.rotation.x -= playerSpeed * dt * 0.35;
          if (wIdx < 2) {
            w.rotation.y = THREE.MathUtils.lerp(w.rotation.y, targetYaw * 1.6, rawDt * 25);
          }
        });

        if (gameState.invulnerableTimer > 0) {
          gameState.invulnerableTimer -= rawDt;
          playerVan.visible = Math.floor(now / 75) % 2 === 0;
        } else {
          playerVan.visible = true;
        }

        trafficTimer += dt;
        if (trafficTimer > getRouteTrafficInterval()) {
          trafficTimer = 0;
          spawnTrafficWave();
        }

        for (let i = trafficVehicles.length - 1; i >= 0; i--) {
          const tv = trafficVehicles[i];

          // Intelligent Lane-Switch AI (25% of vehicles telegraph with turn-signals for 1.2s before changing lanes)
          if (tv.canSwitchLane && tv.leftBlinker && tv.rightBlinker) {
            const dzToPlayer = playerVan.position.z - tv.mesh.position.z;
            // When vehicle is within 45 units ahead of player
            if (tv.laneSwitchState === 'idle' && dzToPlayer > 12 && dzToPlayer <= 45) {
              const currentLane = tv.laneIdx;
              const options = [];
              if (currentLane > 0) options.push(currentLane - 1);
              if (currentLane < 3) options.push(currentLane + 1);
              if (options.length > 0) {
                tv.targetLaneIdx = options[Math.floor(Math.random() * options.length)];
                tv.signalSide = tv.targetLaneIdx < currentLane ? 'left' : 'right';
                tv.laneSwitchState = 'signaling';
                tv.signalTimer = 1.2;
              }
            }

            if (tv.laneSwitchState === 'signaling') {
              tv.signalTimer -= dt;
              const isBlinking = Math.floor(now / 110) % 2 === 0;
              if (tv.signalSide === 'left') {
                tv.leftBlinker.visible = isBlinking;
                tv.rightBlinker.visible = false;
              } else {
                tv.rightBlinker.visible = isBlinking;
                tv.leftBlinker.visible = false;
              }

              if (tv.signalTimer <= 0) {
                tv.laneSwitchState = 'switching';
                tv.leftBlinker.visible = false;
                tv.rightBlinker.visible = false;
                tv.startLaneX = tv.mesh.position.x;
                tv.switchProgress = 0;
              }
            } else if (tv.laneSwitchState === 'switching') {
              tv.switchProgress += dt / 0.85; // smooth lane transition over 0.85s
              const targetX = LANES[tv.targetLaneIdx];
              const smoothT = THREE.MathUtils.smoothstep(tv.switchProgress, 0, 1);
              tv.mesh.position.x = THREE.MathUtils.lerp(tv.startLaneX, targetX, smoothT);
              tv.mesh.rotation.y = (tv.targetLaneIdx > tv.laneIdx ? -1 : 1) * Math.sin(smoothT * Math.PI) * 0.16;
              if (tv.switchProgress >= 1) {
                tv.mesh.position.x = targetX;
                tv.mesh.rotation.y = 0;
                tv.laneIdx = tv.targetLaneIdx;
                tv.laneSwitchState = 'done';
              }
            }
          }

          // Prevent vehicles in the same lane from ever overlapping or passing through each other!
          trafficVehicles.forEach((other) => {
            if (other !== tv && other.laneIdx === tv.laneIdx) {
              const dz = other.mesh.position.z - tv.mesh.position.z;
              // If 'other' is directly behind 'tv' (larger Z) and getting closer than 15 units
              if (dz > 0 && dz < 15.5) {
                tv.forwardDriveSpeed = Math.max(tv.forwardDriveSpeed, other.forwardDriveSpeed);
                tv.mesh.position.z = Math.min(tv.mesh.position.z, other.mesh.position.z - 15.5);
              }
            }
          });

          const overtakeSpeed = Math.max(6, playerSpeed - tv.forwardDriveSpeed);
          tv.mesh.position.z += overtakeSpeed * dt;

          tv.mesh.userData.wheels.forEach(w => {
            w.rotation.x -= tv.forwardDriveSpeed * dt * 0.35;
          });

          if (tv.type === 'cattruck' && tv.mesh.userData.catBouncers) {
            tv.mesh.userData.catBouncers.forEach((cat, cIdx) => {
              cat.position.y = 1.55 + Math.abs(Math.sin(now * 0.012 + cIdx)) * 0.28;
            });
          }

          if (tv.type === 'ufo' && tv.mesh.userData.saucer) {
            tv.mesh.userData.saucer.rotation.y += dt * 3.2;
            tv.mesh.userData.saucer.position.y = 3.1 + Math.sin(now * 0.008 + i) * 0.32;
          }

          if (tv.mesh.userData.sirenRed) {
            const flash = Math.floor(now / 110) % 2 === 0;
            tv.mesh.userData.sirenRed.material.emissiveIntensity = flash ? 1.5 : 0.15;
            tv.mesh.userData.sirenBlue.material.emissiveIntensity = flash ? 0.15 : 1.5;
          }

          if (!tv.passedPlayer && tv.mesh.position.z > gameState.vanZ - 7 && tv.mesh.position.z < gameState.vanZ + 5) {
            tv.passedPlayer = true;
            soundFX.playVehiclePassBy(tv.type);
          }

          // Traffic Near-Miss Combo System (Close adjacent pass or last-second lane dodge)
          const hitHalfZ = (tv.mesh.userData.halfZ + 1.8) * 0.85;
          const hitHalfX = (tv.mesh.userData.halfX + 0.82) * 0.85;
          const distZ = Math.abs(tv.mesh.position.z - playerVan.position.z);
          const distX = Math.abs(tv.mesh.position.x - playerVan.position.x);

          if (!tv.nearMissAwarded && gameState.invulnerableTimer <= 0 && gameState.mode === 'playing') {
            const isClosePass = distZ < (hitHalfZ + 1.4) && distX >= hitHalfX && distX <= (hitHalfX + 2.5);
            const isLastSecondDodge = distZ < 7.8 && distX >= hitHalfX && distX <= (hitHalfX + 2.8) && Math.abs(gameState.lateralVelocity || 0) > 1.2;

            if (isClosePass || isLastSecondDodge) {
              tv.nearMissAwarded = true;
              increaseOverdrive(10); // +10% per traffic near-miss
              gameState.nearMissCount++;
              const bonusScore = 50 * gameState.combo;
              gameState.score += bonusScore;
              gameState.combo = Math.min(8, gameState.combo + 1);
              updateHUD();

              updateContractProgress('near_misses', 1);
              updateContractProgress('combo_max', gameState.combo, true);

              soundFX.playNearMissWhoosh();
              // Screen shake, speed-lines, and light-up overlays removed for clean, smooth near-misses

              const popupPos = playerVan.position.clone().add(new THREE.Vector3(
                tv.mesh.position.x > playerVan.position.x ? 1.6 : -1.6,
                2.7,
                -0.8
              ));
              showFloatingCombatText(popupPos, '🔥 NEAR MISS! +50', 'combat-text-fire');
              spawnVoxelBurst(popupPos, 0xf97316, 16);
            }
          }

          if (gameState.invulnerableTimer <= 0) {
            if (distZ < hitHalfZ && distX < hitHalfX) {
              if (gameState.immortalTimer > 0 || gameState.overdriveActive) {
                // Rainbow Immortal Mode or Midnight Overdrive blasts traffic out of the way without losing hearts!
                soundFX.playDeliverSuccess();
                const bonusScore = gameState.overdriveActive ? 300 : 150;
                gameState.score += bonusScore;
                updateHUD();
                spawnVoxelBurst(tv.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xfacc15, 28);
                showFloatingCombatText(tv.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)), gameState.overdriveActive ? '⚡ OVERDRIVE SMASH! +300' : 'IMMORTAL SMASH! +150', 'combat-text-gold');
                releaseTrafficVehicle(tv.mesh);
                trafficVehicles.splice(i, 1);
                continue;
              }

              if (gameState.shieldBumperActive) {
                // Shield Bumper absorbs 1 traffic collision without losing a heart or breaking combo!
                gameState.shieldBumperActive = false;
                if (shieldBumperMesh) shieldBumperMesh.visible = false;
                soundFX.playPerfectChime();
                triggerScreenShake(0.25, 0.9);
                spawnVoxelBurst(playerVan.position.clone().add(new THREE.Vector3(0, 1.2, -1.8)), 0x38bdf8, 26);
                showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), '🛡️ SHIELD DEFLECTED IMPACT!', 'combat-text-blue');
                updateHUD();
                // Knock traffic vehicle out of player's way
                tv.forwardDriveSpeed = 45;
                tv.mesh.position.x += (tv.mesh.position.x >= playerVan.position.x ? 2.8 : -2.8);
                continue;
              }

              // Taking damage or grazing obstacles cracks fragile parcels in hand!
              gameState.handModifiers.forEach((m) => {
                if (m && m.type === 'fragile' && !m.cracked) {
                  m.cracked = true;
                }
              });
              renderBottomParcelHandUI();

              soundFX.playCrash();
              gameState.hearts -= 1;
              damageHeadlight();
              gameState.combo = 1;
              gameState.invulnerableTimer = 1.65;
              updateHUD();

              spawnVoxelBurst(playerVan.position.clone().add(new THREE.Vector3(0, 1.6, -1.5)), 0xef4444, 22);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), 'COLLISION!', 'text-rose-400');

              if (gameState.hearts <= 0) {
                gameState.mode = 'gameover';
                completePersistentShift();
                gameState.bestDeliveries = Math.max(gameState.bestDeliveries, gameState.deliveries);
                gameState.bestDistance = Math.max(gameState.bestDistance, gameState.distanceMeters);
                endParcelDrag();
                document.getElementById('final-score').textContent = gameState.score.toLocaleString();
                document.getElementById('final-deliveries').textContent = gameState.deliveries;
                document.getElementById('final-coins').textContent = `+${gameState.runCoinsEarned}`;
                renderGameOverContracts();
                saveProgression();
                document.getElementById('gameover-modal').classList.remove('hidden');
                document.getElementById('gameover-modal').classList.add('flex');
              }
            }
          }

          if (tv.mesh.position.z > 38) {
            releaseTrafficVehicle(tv.mesh);
            trafficVehicles.splice(i, 1);
          }
        }

        for (let i = flyingParcels.length - 1; i >= 0; i--) {
          const fp = flyingParcels[i];
          if (!fp.targetApt) {
            fp.progress += rawDt / fp.duration;
            const t = Math.min(1, fp.progress);
            fp.mesh.position.lerpVectors(fp.startPos, fp.endPos, t);
            fp.mesh.position.y += Math.sin(t * Math.PI) * 4.8;
            fp.mesh.rotation.x += rawDt * 10;
            fp.mesh.rotation.y += rawDt * 12;

            fp.trailDots.forEach((td, idx) => {
              const tt = Math.max(0, t - (idx + 1) * 0.05);
              td.position.lerpVectors(fp.startPos, fp.endPos, tt);
              td.position.y += Math.sin(tt * Math.PI) * 4.8;
            });

            if (fp.progress >= 1) {
              spawnVoxelBurst(fp.endPos, 0x94a3b8, 6);
              removeFlyingParcel(i);
            }
            continue;
          }
          if (fp.targetApt.orderId !== fp.targetOrderId || fp.targetApt.delivered || !fp.targetApt.hasOrder) {
            removeFlyingParcel(i);
            continue;
          }
          fp.progress += rawDt / fp.duration;

          // Customer porch live position (magnetic homing tracks resident in real time)
          const liveEnd = getResidentHandPosition(fp.targetApt, fp.endPos);
          if (![liveEnd.x, liveEnd.y, liveEnd.z].every(Number.isFinite)) {
            removeFlyingParcel(i);
            continue;
          }

          const t = Math.min(1, fp.progress);
          // Parabolic trajectory with magnetic convergence
          fp.mesh.position.lerpVectors(fp.startPos, liveEnd, t);
          fp.mesh.position.y += Math.sin(t * Math.PI) * 6.2;
          fp.mesh.rotation.x += rawDt * 10;
          fp.mesh.rotation.y += rawDt * 12;

          fp.trailDots.forEach((td, idx) => {
            const tt = Math.max(0, t - (idx + 1) * 0.05);
            td.position.lerpVectors(fp.startPos, liveEnd, tt);
            td.position.y += Math.sin(tt * Math.PI) * 6.2;
          });

          if (fp.progress >= 1) {
            const apt = fp.targetApt;
            const pInfo = PARCEL_TYPES[fp.parcelType];
            if (apt.hasOrder && !apt.delivered) {
              const engLvl = getVanTuningLevel(gameState.equippedVanId, 'engine');
              const engScoreMult = 1 + (engLvl - 1) * 0.05;
              const vanSpec = PLAYABLE_VANS.find(v => v.id === gameState.equippedVanId) || PLAYABLE_VANS[0];
              const baseCoinGain = Math.round((25 + gameState.combo * 8) * (1 + vanSpec.coinBonus / 100));

              if (apt.wantedType === fp.parcelType) {
                // EXACT ORDER MATCH!
                increaseOverdrive(20); // +20% Overdrive per successful delivery

                // VIP DOUBLE ORDER (Roadside resident with golden crown requiring 2 throws)
                if (apt.isVip && (!apt.vipDelivered || apt.vipDelivered < 1)) {
                  apt.vipDelivered = 1;
                  soundFX.playDeliverSuccess();
                  triggerScreenShake(0.18, 0.7);
                  spawnVoxelBurst(liveEnd, 0xfacc15, 24);

                  const vipHalfPts = Math.round(pInfo.pts * 2 * engScoreMult * fp.cargoMultiplier * fp.nightMultiplier * (gameState.overdriveActive ? 2 : 1));
                  const vipHalfCoins = Math.round(baseCoinGain * 2 * (gameState.overdriveActive ? 2 : 1) * fp.routeCoinMultiplier);
                  gameState.score += vipHalfPts;
                  gameState.coins += vipHalfCoins;
                  gameState.runCoinsEarned += vipHalfCoins;
                  gameState.deliveries += 1;
                  updateHUD();

                  updateContractProgress('deliveries_run', 1);
                  showFloatingCombatText(liveEnd, fp.nightMultiplier > 1 ? '🌙 NIGHT VISION BONUS x1.5 • VIP 1/2' : '🎯 EXACT ORDER! x2 • VIP 1/2', 'combat-text-gold');

                  // Guarantee matching parcel for 2nd throw in player's hand!
                  ensureParcelAvailableInHand(apt.wantedType);

                  removeFlyingParcel(i);
                  continue;
                }

                // If VIP 2nd throw or Standard delivery:
                const isVipJackpot = apt.isVip && apt.vipDelivered >= 1;
                const isPerfect = !!fp.isSweetSpot;

                // SPECIAL PARCEL MODIFIERS (HOT / FRAGILE)
                let modMultiplier = 1.0;
                let modText = '';
                if (fp.modifier) {
                  if (fp.modifier.type === 'hot') {
                    if (fp.modifier.timer > 0) {
                      modMultiplier *= 1.5; // +50% Piping Hot Bonus!
                      modText = '🔥 PIPING HOT! +50%';
                    } else {
                      modText = '❄️ COOLED DOWN';
                    }
                  } else if (fp.modifier.type === 'fragile') {
                    if (!fp.modifier.cracked) {
                      modMultiplier *= 2.5; // 2.5x Intact Bonus!
                      modText = '💎 INTACT FRAGILE! x2.5';
                    } else {
                      modText = '💔 CRACKED';
                    }
                  }
                }

                const overdriveMultiplier = gameState.overdriveActive ? 2 : 1;
                const vipMultiplier = isVipJackpot ? 3.0 : 1.0;
                const matchMultiplier = 2; // +100% exact order bonus
                const multiplier = (isPerfect ? 2 : 1) * matchMultiplier * modMultiplier * vipMultiplier;
                const pts = Math.round(pInfo.pts * gameState.combo * multiplier * overdriveMultiplier * engScoreMult * fp.cargoMultiplier * fp.nightMultiplier);
                const vipCoinBonus = isVipJackpot ? 100 : 0;
                const coinGain = Math.round((baseCoinGain * 2 + vipCoinBonus + (isPerfect ? 15 : 0)) * overdriveMultiplier * fp.routeCoinMultiplier);

                apt.delivered = true;
                apt.ringGroup.visible = false;
                apt.cloudEl.classList.add('hidden');

                gameState.score += pts;
                gameState.deliveries += 1;
                gameState.coins += coinGain;
                gameState.runCoinsEarned += coinGain;
                if (isPerfect) gameState.perfectDropCount++;
                gameState.combo = Math.min(8, gameState.combo + (isPerfect || isVipJackpot ? 2 : 1));
                updateHUD();

                updateContractProgress('deliveries_run', 1);
                updateContractProgress('combo_max', gameState.combo, true);
                if (isPerfect) updateContractProgress('perfect_drops', 1);
                if (pInfo.tier === 'LEGENDARY') updateContractProgress('legendary_drop', 1);
                if (CITY_THEMES[gameState.cityIndex].id === 'yangon') {
                  updateContractProgress('yangon_coins', coinGain);
                }

                tryRandomDiscoveryOnDelivery(fp.parcelType, apt.character ? apt.character.id : null);

                if (isVipJackpot) {
                  soundFX.playPerfectChime();
                  triggerScreenShake(0.42, 1.6);
                  spawnVoxelBurst(liveEnd, 0xfacc15, 48);
                  showFloatingCombatText(liveEnd, '🎯 VIP COMPLETE! +400', 'combat-text-gold');
                } else if (isPerfect) {
                  soundFX.playPerfectChime();
                  triggerScreenShake(0.35, 1.4);
                  spawnVoxelBurst(liveEnd, 0xfacc15, 36);
                  showFloatingCombatText(liveEnd, '🎯 PERFECT! +200', 'combat-text-gold');
                } else {
                  soundFX.playDeliverSuccess();
                  triggerScreenShake(0.15, 0.6);
                  spawnVoxelBurst(liveEnd, pInfo.color, 24);
                  showFloatingCombatText(liveEnd, '🎯 EXACT ORDER! +2x', 'combat-text-gold');
                }
                if (fp.nightMultiplier > 1) showActionToast('🌙 NIGHT BONUS +1.5x', 'bonus');
              } else {
                // WRONG PARCEL! Player receives 50% points & combo resets to 1
                const pts = Math.max(10, Math.round(pInfo.pts * 0.5 * engScoreMult * fp.cargoMultiplier * fp.nightMultiplier));
                const coinGain = Math.max(5, Math.round(baseCoinGain * 0.5 * fp.routeCoinMultiplier));

                apt.delivered = true;
                apt.ringGroup.visible = false;
                apt.cloudEl.classList.add('hidden');

                gameState.score += pts;
                gameState.deliveries += 1;
                gameState.coins += coinGain;
                gameState.runCoinsEarned += coinGain;
                gameState.combo = 1; // Reset combo on wrong parcel
                updateHUD();

                updateContractProgress('deliveries_run', 1);

                soundFX.playCrash();
                triggerScreenShake(0.18, 0.6);
                spawnVoxelBurst(liveEnd, 0xf43f5e, 18);
                showFloatingCombatText(liveEnd, '📦 WRONG PARCEL! 50%', 'combat-text-rose');
              }
            } else {
              spawnVoxelBurst(liveEnd, 0x94a3b8, 12);
            }

            removeFlyingParcel(i);
          }
        }
      }

      // Update Flying Crosswalk Ragdolls (Knockback Physics with Gravity & Ground Bounce)
      for (let i = flyingRagdolls.length - 1; i >= 0; i--) {
        const rg = flyingRagdolls[i];
        rg.life -= rawDt;
        rg.vel.y -= 28 * rawDt;
        rg.mesh.position.addScaledVector(rg.vel, rawDt);
        rg.mesh.rotation.x += rg.rotVel.x * rawDt;
        rg.mesh.rotation.y += rg.rotVel.y * rawDt;
        rg.mesh.rotation.z += rg.rotVel.z * rawDt;
        if (rg.mesh.position.y < 0.3 && rg.vel.y < 0) {
          rg.mesh.position.y = 0.3;
          rg.vel.y *= -0.55;
        }
        if (rg.life <= 0) {
          scene.remove(rg.mesh);
          flyingRagdolls.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= rawDt;
        p.vel.y -= 26 * rawDt;
        p.mesh.position.addScaledVector(p.vel, rawDt);
        p.mesh.rotation.x += 7 * rawDt;
        p.mesh.rotation.y += 7 * rawDt;
        p.mesh.scale.setScalar(Math.max(0.01, p.life * 0.42));
        if (p.life <= 0) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }
      while (particles.length > 60) {
        const excess = particles.shift();
        scene.remove(excess.mesh);
      }

      updateFallenCargo(rawDt);
      updateNightSystems(rawDt, dt, playerSpeed);
      updateRivalSystems(rawDt, dt, playerSpeed);
      updateCourierPersistence(rawDt);
      renderer.render(scene, camera);
      } catch (err) {
        console.error("Game loop error:", err);
      }
    }

    window.addEventListener('resize', updateCameraForViewport);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateCameraForViewport, 120);
    });

    // Handle tab backgrounding & inactivity: Pause Web Audio & BGM to avoid buffer lag and reset lastTime
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (soundFX && soundFX.ctx && soundFX.ctx.state === 'running') {
          soundFX.ctx.suspend().catch(() => {});
        }
        if (soundFX && soundFX.pauseMusic) {
          soundFX.pauseMusic();
        }
      } else {
        lastTime = performance.now();
        if (soundFX && soundFX.ctx && soundFX.ctx.state === 'suspended' && soundFX.enabled) {
          soundFX.ctx.resume().catch(() => {});
        }
        if (soundFX && soundFX.resumeMusic) {
          soundFX.resumeMusic();
        }
      }
    });

    // Start cozy background music on first user interaction anywhere
    const startAudioOnFirstInteraction = () => {
      soundFX.init();
      if (soundFX.enabled && !soundFX.isPlayingMusic) {
        soundFX.startCozyMusic(gameState.mode === 'home' ? 'garage' : 'drive');
      }
      window.removeEventListener('pointerdown', startAudioOnFirstInteraction);
      window.removeEventListener('keydown', startAudioOnFirstInteraction);
    };
    window.addEventListener('pointerdown', startAudioOnFirstInteraction, { once: true });
    window.addEventListener('keydown', startAudioOnFirstInteraction, { once: true });

    let isLoopStarted = false;
    function startAnimationLoop() {
      if (isLoopStarted) return;
      updateCameraForViewport();
      lastTime = performance.now();
      renderer.render(scene, camera);
      isLoopStarted = true;
      requestAnimationFrame(animate);
      if (window.midnightStartup && window.midnightStartup.complete) {
        window.midnightStartup.complete();
      }
    }

    function switchCityByIndex(targetIdx) {
      gameState.cityIndex = (targetIdx + CITY_THEMES.length) % CITY_THEMES.length;
      const theme = CITY_THEMES[gameState.cityIndex];
      transformAllApartmentsToCity(theme);
      soundFX.playCityGateChime();
      showCityToast(theme);
      if (theme.id === 'tokyo') applyWeatherMode(4);
      else if (theme.id === 'chinatown') applyWeatherMode(1);
      else if (theme.id === 'yangon') applyWeatherMode(1);
      else if (theme.id === 'littleindia') applyWeatherMode(1);
      else if (theme.id === 'pastel') applyWeatherMode(4);
      else if (theme.id === 'paris') applyWeatherMode(4);
      else if (theme.id === 'rio') applyWeatherMode(1);
      else if (theme.id === 'washington') applyWeatherMode(4);
      else if (theme.id === 'dubai') applyWeatherMode(1);
      else if (theme.id === 'cairo') applyWeatherMode(1);
      renderCitySelectorUI();
    }

    function renderCitySelectorUI() {
      const container = document.getElementById('setting-city-buttons');
      const label = document.getElementById('setting-current-city');
      if (label && CITY_THEMES[gameState.cityIndex]) {
        label.textContent = CITY_THEMES[gameState.cityIndex].name.toUpperCase();
      }
      if (!container) return;
      container.innerHTML = '';
      const cityIcons = {
        tokyo: '🗼',
        chinatown: '🏮',
        littleindia: '🛕',
        yangon: '🇲🇲',
        pastel: '🌆',
        paris: '🥐',
        rio: '🌴',
        washington: '🏛️',
        dubai: '🏙️',
        cairo: '🐪'
      };
      CITY_THEMES.forEach((ct, idx) => {
        const isCur = idx === gameState.cityIndex;
        const btn = document.createElement('button');
        btn.className = 'p-2 rounded-xl text-[10px] font-extrabold text-left transition-all arcade-btn flex items-center gap-1.5 ' + (
          isCur
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-2 border-white shadow-lg'
            : 'bg-slate-900/90 text-sky-200 border border-slate-700 hover:border-sky-400 hover:text-white'
        );
        btn.innerHTML = '<span class="text-sm">' + (cityIcons[ct.id] || '📍') + '</span> <span class="truncate">' + ct.name + '</span>';
        btn.addEventListener('click', () => {
          soundFX.init();
          switchCityByIndex(idx);
        });
        container.appendChild(btn);
      });
    }

    function initializeGame() {
      try {
        initSavedProgression();
        if (window.midnightStartup && window.midnightStartup.optional) {
          window.midnightStartup.optional('parcel icons', generate3DIcons);
          window.midnightStartup.optional('weather particles', initWeatherParticles);
          window.midnightStartup.optional('ambient motes', initCozyMotes);
          window.midnightStartup.optional('sidewalk actors', initSidewalkPromenadeActors);
        } else {
          generate3DIcons();
          initWeatherParticles();
          initCozyMotes();
          initSidewalkPromenadeActors();
        }
        for (let pairIndex = 0; pairIndex < NUM_PAIRS; pairIndex++) {
          const zPos = 12 - pairIndex * BLOCK_SPACING;
          apartments.push(createApartmentBuilding('left', zPos, pairIndex * 2));
          apartments.push(createApartmentBuilding('right', zPos, pairIndex * 2 + 1));
        }
        renderBottomParcelHandUI();
        if (typeof initializeNightSystems === 'function') initializeNightSystems();
        if (typeof updateCityLeftLandmark === 'function') updateCityLeftLandmark(CITY_THEMES[gameState.cityIndex]);
        setHomePageMode(true);
        updateHomeGarageUI();
        if (typeof initializeCourierUI === 'function') initializeCourierUI();
        renderCitySelectorUI();
        startAnimationLoop();
      } catch (error) {
        if (window.midnightStartup && window.midnightStartup.fail) {
          window.midnightStartup.fail(error, 'Game initialization failed');
        } else {
          console.error('Game initialization failed:', error);
        }
      }
    }

    initializeGame();
