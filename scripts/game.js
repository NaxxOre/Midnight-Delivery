    // ============================================================================
    // 10. GAME STATE, 3D SHOWROOM GARAGE STAGE & ANIMATED PRIZE MACHINE
    // ============================================================================
    let playerVan = createPlayerDeliveryVan();
    playerVan.position.set(gameState.currentX, 0, gameState.vanZ);
    scene.add(playerVan);

    // 3D Architectural Blueprint Showroom Stage (Visible when gameState.mode === 'home')
    const blueprintGarageGroup = new THREE.Group();
    scene.add(blueprintGarageGroup);

    // Rich Blueprint Studio Floor Plane with Subtle Reflection
    const studioFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({ color: 0x0b2559, roughness: 0.65, metalness: 0.15 })
    );
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.36;
    studioFloor.receiveShadow = true;
    blueprintGarageGroup.add(studioFloor);

    // Crisp Dual-Layer Technical CAD Blueprint Grids
    const blueprintGridMajor = new THREE.GridHelper(90, 30, 0x38bdf8, 0x1e40af);
    blueprintGridMajor.position.y = -0.34;
    blueprintGarageGroup.add(blueprintGridMajor);

    const blueprintGridMinor = new THREE.GridHelper(36, 36, 0x7dd3fc, 0x1d4ed8);
    blueprintGridMinor.position.y = -0.33;
    blueprintGarageGroup.add(blueprintGridMinor);

    // Surrounding Voxel Showroom Skyline Pillars pushed far back (dist = 38+) so they NEVER block the 360° camera!
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 38 + (i % 3) * 5;
      const h = 6 + (i % 4) * 3.5;
      const w = 3.2 + (i % 2) * 1.5;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      const block = addVoxelBox(blueprintGarageGroup, w, h, w, bx, h / 2 - 0.35, bz, 0x102e6b);
      decorateGroupWithCADEdges(block, false);
    }

    // Multi-Tiered Mechanical Turntable Podium
    const turntableGroup = new THREE.Group();
    blueprintGarageGroup.add(turntableGroup);

    const outerPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.85, 5.25, 0.32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.45 })
    );
    outerPodium.position.y = -0.20;
    outerPodium.receiveShadow = true;
    turntableGroup.add(outerPodium);

    const innerPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.15, 4.35, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.3 })
    );
    innerPodium.position.y = -0.05;
    innerPodium.receiveShadow = true;
    turntableGroup.add(innerPodium);

    // 16 Mechanical Voxel Gear Teeth around Turntable Rim
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
        g % 2 === 0 ? 0xfacc15 : 0x38bdf8,
        { emissive: g % 2 === 0 ? 0xf59e0b : 0x0284c7, emissiveIntensity: 0.55 }
      );
      tooth.rotation.y = -a;
    }

    const outerGlowRing = new THREE.Mesh(
      new THREE.RingGeometry(4.02, 4.22, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    outerGlowRing.rotation.x = -Math.PI / 2;
    outerGlowRing.position.y = 0.05;
    turntableGroup.add(outerGlowRing);

    const innerGlowRing = new THREE.Mesh(
      new THREE.RingGeometry(2.75, 2.90, 48),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    innerGlowRing.rotation.x = -Math.PI / 2;
    innerGlowRing.position.y = 0.05;
    turntableGroup.add(innerGlowRing);

    // Display Van Container on the Turntable
    const garageVanHolder = new THREE.Group();
    turntableGroup.add(garageVanHolder);

    // Always-On Glowing Blue Holographic Scan Ring that sweeps up & down in the Showroom!
    const holoScanRing = new THREE.Mesh(
      new THREE.RingGeometry(2.45, 4.05, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    holoScanRing.rotation.x = -Math.PI / 2;
    turntableGroup.add(holoScanRing);

    function rebuildGarageTurntableVan() {
      while (garageVanHolder.children.length > 0) {
        garageVanHolder.remove(garageVanHolder.children[0]);
      }
      const vanSpec = PLAYABLE_VANS[gameState.selectedVanIndex];
      const mesh = createPlayableVanMesh(vanSpec.id, true);
      mesh.position.set(0, 0.04, 0);
      if (mesh.userData.beamLeft) mesh.userData.beamLeft.visible = true;
      if (mesh.userData.beamRight) mesh.userData.beamRight.visible = true;

      garageVanHolder.add(mesh);
      updateHomeGarageUI();
    }
    function resetBlindDrawModalStage() {
      const mysteryCrate = document.getElementById('draw-mystery-crate');
      const vehicleImg = document.getElementById('draw-vehicle-img');
      const tierPill = document.getElementById('draw-tier-pill');
      const titleEl = document.getElementById('draw-result-title');
      const subEl = document.getElementById('draw-result-sub');
      const stageBox = document.getElementById('draw-stage-box');

      if (mysteryCrate) mysteryCrate.classList.remove('hidden');
      if (vehicleImg) vehicleImg.classList.add('hidden');
      if (tierPill) tierPill.textContent = 'SUPPLY CRATE';
      if (titleEl) titleEl.textContent = 'FLEET SUPPLY REQUISITION';
      if (subEl) subEl.textContent = 'Unlock 3D delivery vehicles with coins earned in-game • Fleet Scrap Value +60 Coins';
      if (stageBox) {
        stageBox.classList.remove('prize-reveal-anim', 'capsule-tumbling');
        stageBox.classList.add('blind-crate-idle');
      }
    }

    let isSpinningDraw = false;
    function spinMysteryVehicleDraw() {
      if (isSpinningDraw) return;
      const stageBox = document.getElementById('draw-stage-box');
      const mysteryCrate = document.getElementById('draw-mystery-crate');
      const vehicleImg = document.getElementById('draw-vehicle-img');
      const tierPill = document.getElementById('draw-tier-pill');
      const titleEl = document.getElementById('draw-result-title');
      const subEl = document.getElementById('draw-result-sub');
      const sunburst = document.getElementById('draw-sunburst');

      if (gameState.coins < 100) {
        soundFX.playCrash();
        titleEl.textContent = 'INSUFFICIENT COINS (NEED 100)';
        subEl.textContent = 'Deliver wishes on the road or claim the +300 Coins grant in Options!';
        return;
      }

      soundFX.init();
      isSpinningDraw = true;
      gameState.coins -= 100;
      updateHomeGarageUI();

      // Determine target winning vehicle (82% bias toward unowned vehicles!)
      const lockedVans = PLAYABLE_VANS.filter(v => !gameState.ownedVans.includes(v.id));
      let wonVan;
      if (lockedVans.length > 0 && Math.random() < 0.82) {
        wonVan = lockedVans[Math.floor(Math.random() * lockedVans.length)];
      } else {
        wonVan = PLAYABLE_VANS[Math.floor(Math.random() * PLAYABLE_VANS.length)];
      }

      // Keep the vehicle image 100% HIDDEN during the blind draw shake!
      mysteryCrate.classList.remove('hidden');
      vehicleImg.classList.add('hidden');
      stageBox.classList.remove('prize-reveal-anim', 'blind-crate-idle');
      stageBox.classList.add('capsule-tumbling');
      sunburst.style.opacity = '0.9';
      titleEl.textContent = 'OPENING SUPPLY CRATE...';
      subEl.textContent = 'Requisitioning vehicle for your courier fleet...';

      const mysteryBadges = ['SUPPLY', 'RARE', 'EPIC', 'LEGENDARY', 'FLEET RIG', 'UNLOCKED!'];
      const totalSteps = 16;
      let step = 0;

      function nextBlindShakeTick() {
        tierPill.textContent = mysteryBadges[step % mysteryBadges.length];
        soundFX.playReelTick(320 + step * 32);

        step++;
        if (step < totalSteps) {
          const delay = 55 + Math.pow(step / totalSteps, 2.0) * 165;
          setTimeout(nextBlindShakeTick, delay);
        } else {
          // Supply Crate Opens to Deploy the Requisitioned Vehicle!
          stageBox.classList.remove('capsule-tumbling');
          mysteryCrate.classList.add('hidden');
          vehicleImg.src = vanIconDataURLs[wonVan.id];
          vehicleImg.classList.remove('hidden');
          tierPill.textContent = wonVan.tier;

          void stageBox.offsetWidth;
          stageBox.classList.add('prize-reveal-anim');

          const wasNew = !gameState.ownedVans.includes(wonVan.id);
          if (wasNew) {
            gameState.ownedVans.push(wonVan.id);
            soundFX.playCityGateChime();
            triggerPrizeConfetti();
            titleEl.textContent = `UNLOCKED NEW RIG: ${wonVan.name.toUpperCase()}`;
            subEl.textContent = `${wonVan.tier} • Deployed directly to your 3D Fleet Showroom!`;
          } else {
            gameState.coins += 60;
            soundFX.playDeliverSuccess();
            triggerPrizeConfetti();
            titleEl.textContent = `FLEET DUPLICATE: ${wonVan.name.toUpperCase()}`;
            subEl.textContent = `Scrapped into +60 Earned Delivery Coins!`;
          }

          gameState.selectedVanIndex = PLAYABLE_VANS.findIndex(v => v.id === wonVan.id);
          gameState.equippedVanId = wonVan.id;
          rebuildGarageTurntableVan();
          isSpinningDraw = false;
        }
      }

      nextBlindShakeTick();
    }

    // ============================================================================
    // RETENTION & PROGRESSION LOOP: CONTRACTS, COURIER RANKS & RIG TUNING
    // ============================================================================
    function initSavedProgression() {
      const saved = loadSavedProgression();
      if (saved) {
        if (typeof saved.coins === 'number') gameState.coins = saved.coins;
        if (typeof saved.bestDistance === 'number') gameState.bestDistance = saved.bestDistance;
        if (typeof saved.bestDeliveries === 'number') gameState.bestDeliveries = saved.bestDeliveries;
        if (Array.isArray(saved.ownedVans) && saved.ownedVans.length > 0) gameState.ownedVans = saved.ownedVans;
        if (saved.equippedVanId) gameState.equippedVanId = saved.equippedVanId;
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
        const rankBadge = document.getElementById('home-rank-badge');
        if (rankBadge) {
          rankBadge.classList.remove('level-up-anim');
          void rankBadge.offsetWidth;
          rankBadge.classList.add('level-up-anim');
        }
      }
      updateRankUI();
      saveProgression();
    }

    function updateContractProgress(type, amount = 1, isMaxCheck = false) {
      if (!gameState.shiftContracts) return;
      let updated = false;
      gameState.shiftContracts.forEach((c) => {
        if (c.type === type && !c.completed) {
          if (isMaxCheck) {
            c.current = Math.max(c.current, amount);
          } else {
            c.current = Math.min(c.target, c.current + amount);
          }
          if (c.current >= c.target) {
            c.completed = true;
            c.claimed = true;
            gameState.coins += c.rewardCoins;
            gameState.runCoinsEarned += c.rewardCoins;
            soundFX.playCityGateChime();
            showFloatingCombatText(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), `MISSION COMPLETE! +${c.rewardCoins}`, 'combat-text-gold');
            showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 4.4, 0)), `+${c.rewardXP} COURIER XP`, 'text-cyan-300 font-extrabold');
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

      const homeBadge = document.getElementById('home-rank-badge');
      const homeTitle = document.getElementById('home-rank-title');
      const homeBar = document.getElementById('home-rank-bar');

      if (homeBadge) {
        homeBadge.textContent = `R${rankSpec.level}`;
        homeBadge.className = `w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${rankSpec.badgeBg} border-2 border-white flex items-center justify-center font-extrabold text-xs arcade-font shadow flex-shrink-0`;
      }
      if (homeTitle) homeTitle.textContent = rankSpec.title;

      const prevXpNeeded = rankSpec.level === 1 ? 0 : (COURIER_RANKS[rankSpec.level - 2]?.xpNeeded || 0);
      const targetXp = rankSpec.xpNeeded;
      const progressPercent = nextRankSpec
        ? Math.min(100, Math.max(0, ((gameState.courierXP - prevXpNeeded) / (targetXp - prevXpNeeded)) * 100))
        : 100;

      if (homeBar) homeBar.style.width = `${progressPercent}%`;

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
      const container = document.getElementById('home-contracts-list');
      if (!container) return;
      if (!gameState.shiftContracts || gameState.shiftContracts.length === 0) {
        ensureActiveContracts();
      }
      container.innerHTML = gameState.shiftContracts.map((c) => {
        const pct = Math.min(100, Math.round((c.current / c.target) * 100));
        const isDone = c.completed;
        return `
          <div class="contract-card ${isDone ? 'contract-card-completed' : ''}">
            <div class="flex items-center justify-between text-[9px] mb-1">
              <span class="font-extrabold text-white truncate max-w-[145px]">${c.title}</span>
              <span class="${isDone ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-bold'} flex-shrink-0">
                ${isDone ? '✓ DONE' : `${c.current}/${c.target}`}
              </span>
            </div>
            <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/20">
              <div class="h-full ${isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-cyan-300'} transition-all duration-200" style="width: ${pct}%"></div>
            </div>
            <div class="flex items-center justify-between text-[8px] text-sky-200 font-semibold mt-1">
              <span>Reward: +${c.rewardCoins} 🪙</span>
              <span class="text-cyan-300 font-bold">+${c.rewardXP} XP</span>
            </div>
          </div>
        `;
      }).join('');
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
      if (tierEl) tierEl.textContent = isOwned ? vanSpec.tier : 'LOCKED RIG';
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
      document.getElementById('home-unlocked-count').textContent = `${totalUnlocked} / ${totalPossible}`;
      document.getElementById('hall-subtitle').textContent = `${totalUnlocked}/${totalPossible} Discovered`;

      document.getElementById('home-van-name').textContent = spec.name;
      document.getElementById('home-van-sub').textContent =
        `Owned Fleet: ${gameState.ownedVans.length} / ${PLAYABLE_VANS.length} Vehicles`;

      const dotsEl = document.getElementById('home-van-dots');
      if (dotsEl) {
        dotsEl.innerHTML = PLAYABLE_VANS.map((v, idx) => {
          const owned = gameState.ownedVans.includes(v.id);
          const active = idx === gameState.selectedVanIndex;
          return `<button data-van-idx="${idx}" class="h-2.5 rounded-full transition-all ${
            active ? 'w-7 bg-amber-400' : (owned ? 'w-2.5 bg-emerald-400/80' : 'w-2.5 bg-slate-600')
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
      const quickDrawBtn = document.getElementById('btn-home-quick-draw');

      if (isOwned) {
        gameState.equippedVanId = spec.id;
        statusBadge.textContent = 'EQUIPPED';
        statusBadge.className = 'px-2.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-extrabold text-[10px] uppercase';
        quickDrawBtn.classList.add('hidden');
        quickDrawBtn.classList.remove('flex');
      } else {
        statusBadge.textContent = 'LOCKED';
        statusBadge.className = 'px-2.5 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[10px] uppercase';
        quickDrawBtn.classList.remove('hidden');
        quickDrawBtn.classList.add('flex');
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
        homeScreen.classList.remove('hidden');
        homeScreen.classList.add('flex');
        uiLayer.classList.add('hidden');
        uiLayer.classList.remove('flex');

        blueprintGarageGroup.visible = true;
        envGroup.visible = false;
        playerVan.visible = false;
        trafficVehicles.forEach(tv => (tv.mesh.visible = false));
        activeGates.forEach(g => (g.mesh.visible = false));
        activeCrosswalks.forEach(cw => (cw.group.visible = false));
        apartments.forEach(apt => apt.cloudEl.classList.add('hidden'));

        // Vibrant Blueprint Showroom Cobalt Sky & Lighting
        scene.background.setHex(0x0d2b6b);
        scene.fog.color.setHex(0x0d2b6b);
        hemiLight.color.setHex(0xe0f2fe);
        hemiLight.groundColor.setHex(0x1e3a8a);
        hemiLight.intensity = 1.05;
        dirLight.color.setHex(0xffffff);
        dirLight.intensity = 1.35;
        dirLight.position.set(14, 24, 16);

        rebuildGarageTurntableVan();
        updateCameraForViewport();
      } else {
        homeScreen.classList.add('hidden');
        homeScreen.classList.remove('flex');
        uiLayer.classList.remove('hidden');
        uiLayer.classList.add('flex');

        blueprintGarageGroup.visible = false;
        envGroup.visible = true;
        replaceActivePlayerVan(gameState.equippedVanId);
        playerVan.visible = true;
        updateCameraForViewport();
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
      const toast = document.getElementById('unlock-toast');
      document.getElementById('unlock-toast-name').textContent = title;
      document.getElementById('unlock-toast-img').src = iconSrc || '';
      document.getElementById('hall-new-dot').classList.remove('hidden');
      toast.classList.remove('hidden', 'city-toast-anim');
      void toast.offsetWidth;
      toast.classList.add('city-toast-anim');
      setTimeout(() => toast.classList.add('hidden'), 3100);
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

    function renderLeaderboardModal(sortBy = 'delivered') {
      const listEl = document.getElementById('leaderboard-list');
      const playerVanSpec = PLAYABLE_VANS.find(v => v.id === gameState.equippedVanId) || PLAYABLE_VANS[0];
      const playerEntry = {
        name: 'YOU (Active Courier)',
        vanId: playerVanSpec.id,
        van: playerVanSpec.name,
        delivered: Math.max(gameState.deliveries, gameState.bestDeliveries),
        distance: Math.round(Math.max(gameState.distanceMeters, gameState.bestDistance)),
        isPlayer: true
      };

      const rows = [...STATIC_LEADERBOARD, playerEntry].sort((a, b) =>
        sortBy === 'delivered' ? b.delivered - a.delivered : b.distance - a.distance
      );

      listEl.innerHTML = rows.map((r, idx) => {
        const rankColors = [
          'bg-amber-400 text-slate-950 border-white',
          'bg-slate-300 text-slate-950 border-white',
          'bg-amber-600 text-white border-amber-200'
        ];
        const rankClass = rankColors[idx] || 'bg-slate-800 text-sky-200 border-slate-600';
        const thumbSrc = vanIconDataURLs[r.vanId] || vanIconDataURLs['classic'] || '';

        return `
          <div class="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border-2 ${
            r.isPlayer ? 'bg-sky-500/25 border-emerald-400 shadow-lg' : 'bg-slate-950/85 border-sky-500/25'
          }">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-8 h-8 rounded-xl border-2 flex items-center justify-center font-extrabold text-xs arcade-font flex-shrink-0 ${rankClass}">
                #${idx + 1}
              </span>
              <div class="w-11 h-11 rounded-xl bg-slate-900 border border-sky-400/40 p-0.5 flex items-center justify-center flex-shrink-0">
                <img src="${thumbSrc}" alt="${r.van}" class="w-full h-full object-contain" />
              </div>
              <div class="min-w-0">
                <div class="arcade-font text-sm ${r.isPlayer ? 'text-emerald-300' : 'text-white'} truncate">${r.name}</div>
                <div class="text-[10px] text-sky-300 font-bold truncate">${r.van}</div>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="arcade-font text-base text-amber-300">
                ${sortBy === 'delivered' ? `${r.delivered} PARCELS` : `${r.distance.toLocaleString()}M`}
              </div>
              <div class="text-[9px] text-slate-400 font-bold">
                ${sortBy === 'delivered' ? `${r.distance}m Best Run` : `${r.delivered} Delivered`}
              </div>
            </div>
          </div>
        `;
      }).join('');
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
        .filter(a => a.hasOrder && !a.delivered && (gameState.vanZ - a.group.position.z) >= -4)
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

    function ensureParcelAvailableInHand(wantedType) {
      if (!gameState.handSlots.includes(wantedType)) {
        const candidates = [0, 1, 2].filter(i => i !== gameState.selectedSlotIndex);
        const replaceIdx = candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : 1;
        gameState.handSlots[replaceIdx] = wantedType;
        renderBottomParcelHandUI(replaceIdx);
      }
    }

    function refillHandSlot(slotIndex) {
      gameState.handSlots[slotIndex] = pickSmartParcelType();
      renderBottomParcelHandUI(slotIndex);
      selectHandSlot(gameState.selectedSlotIndex);
    }

    function renderBottomParcelHandUI(animatedSlotIdx = -1) {
      const container = document.getElementById('parcel-hand-horizontal');
      if (!container) return;
      container.innerHTML = '';

      const slotKeyLabels = ['[Q / 1]', '[W / 2]', '[E / 3]'];

      gameState.handSlots.forEach((parcelTypeId, slotIdx) => {
        const p = PARCEL_TYPES[parcelTypeId];
        const card = document.createElement('div');
        card.dataset.slot = slotIdx;
        card.className = `parcel-card-slot ${p.tierClass} w-[60px] sm:w-[78px] select-none cursor-pointer transition-transform ${
          slotIdx === animatedSlotIdx ? 'deal-anim' : ''
        }`;

        card.innerHTML = `
          <div class="parcel-card-inner py-1 px-1 sm:px-1.5 flex flex-col items-center justify-center relative">
            <div class="w-full flex items-center justify-between mb-0.5 pointer-events-none">
              <span class="px-1.5 py-0.2 rounded bg-slate-950/95 text-amber-300 border border-amber-400 font-black text-[7px] sm:text-[8.5px] arcade-font shadow">
                ${slotKeyLabels[slotIdx]}
              </span>
              <span class="px-1 py-0.2 rounded-full ${p.badgeBg} font-extrabold text-[6px] sm:text-[7px] shadow">
                +${p.pts}
              </span>
            </div>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-950/90 border border-slate-700/80 flex items-center justify-center p-0.5 my-0.5 shadow-inner pointer-events-none">
              <img src="${parcelIconDataURLs[p.id]}" alt="${p.name}" class="w-full h-full object-contain pointer-events-none" />
            </div>
            <span class="text-[6px] sm:text-[7.5px] font-extrabold text-white uppercase tracking-tight leading-none pointer-events-none truncate max-w-full mt-0.5">${p.short}</span>
          </div>
        `;

        let pointerDownX = 0;
        let pointerDownY = 0;
        let isPotentialDrag = false;

        card.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          soundFX.init();
          pointerDownX = e.clientX;
          pointerDownY = e.clientY;
          isPotentialDrag = true;
          selectHandSlot(slotIdx);
        });

        card.addEventListener('pointermove', (e) => {
          if (isPotentialDrag && !gameState.dragging) {
            const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
            if (dist > 14) {
              startParcelDrag(slotIdx, e.clientX, e.clientY, e.pointerId);
            }
          }
        });

        card.addEventListener('pointerup', (e) => {
          if (isPotentialDrag) {
            isPotentialDrag = false;
            if (!gameState.dragging) {
              // Single-tap / click! Immediately throw from this slot!
              throwFromSlot(slotIdx);
            }
          }
        });

        card.addEventListener('pointercancel', () => {
          isPotentialDrag = false;
        });

        container.appendChild(card);
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
      let bestApt = null;
      let bestScore = Infinity;
      apartments.forEach((apt) => {
        if (apt.side === side && apt.hasOrder && !apt.delivered) {
          const dz = apt.group.position.z - gameState.vanZ;
          if (dz < 14 && dz > -135) {
            const dist = Math.abs(dz + 18);
            if (dist < bestScore) {
              bestScore = dist;
              bestApt = apt;
            }
          }
        }
      });
      if (!bestApt) {
        apartments.forEach((apt) => {
          if (apt.side === side) {
            const dz = apt.group.position.z - gameState.vanZ;
            if (dz < 10 && dz > -60) {
              const dist = Math.abs(dz + 16);
              if (dist < bestScore) {
                bestScore = dist;
                bestApt = apt;
              }
            }
          }
        });
      }
      return bestApt;
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
      const startPos = new THREE.Vector3(playerVan.position.x, 2.9, playerVan.position.z);
      const endPos = new THREE.Vector3(
        targetApt.group.position.x + targetApt.porchX,
        1.45,
        targetApt.group.position.z + 1.2
      );

      const isMatch = targetApt && targetApt.hasOrder && targetApt.wantedType === parcelId;
      const arcColor = isMatch ? 0x00f5d4 : (isAutoLock ? 0xfacc15 : 0xf43f5e);

      const posAttr = projectileArcLine.geometry.attributes.position;
      for (let i = 0; i < ARC_POINTS; i++) {
        const t = i / (ARC_POINTS - 1);
        const px = THREE.MathUtils.lerp(startPos.x, endPos.x, t);
        const py = THREE.MathUtils.lerp(startPos.y, endPos.y, t) + Math.sin(t * Math.PI) * 5.8;
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

    // 3 Sculpted 3D Voxel Road Power-Ups: Extra Heart, Chrono Slow-Mo Clock, Rainbow Immortal Star
    function createRoadPowerUpMesh(powerType) {
      const group = new THREE.Group();

      // Glowing pedestal ring on road
      const ringCol = powerType === 'heart' ? 0xf43f5e : (powerType === 'slowmo' ? 0x00f5d4 : 0xfacc15);
      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1.35, 24),
        new THREE.MeshBasicMaterial({ color: ringCol, side: THREE.DoubleSide })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.12;
      group.add(baseRing);

      const core = new THREE.Group();
      core.position.y = 1.45;
      group.add(core);

      if (powerType === 'heart') {
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
      const types = ['heart', 'slowmo', 'immortal'];
      // Weight slightly toward slowmo/immortal if player already has full hearts
      const chosenType = (gameState.hearts >= gameState.maxHearts && Math.random() < 0.7)
        ? (Math.random() < 0.5 ? 'slowmo' : 'immortal')
        : types[Math.floor(Math.random() * types.length)];

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

    function throwParcelFromHandSlot(slotIndex, apt, isMagneticHoming = true) {
      if (gameState.mode !== 'playing' || !apt) return;
      const parcelTypeId = gameState.handSlots[slotIndex];
      soundFX.playThrow();

      const mesh = createParcelVoxelMesh(parcelTypeId, 0.92);
      const startPos = new THREE.Vector3(playerVan.position.x, 2.8, playerVan.position.z);
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

      flyingParcels.push({
        mesh,
        trailDots,
        startPos,
        targetApt: apt,
        parcelType: parcelTypeId,
        progress: 0,
        duration: 0.42,
        isSweetSpot,
        magneticHoming: isMagneticHoming
      });

      playerVan.userData.chassis.scale.set(1.12, 0.88, 1.06);
      refillHandSlot(slotIndex);
    }

    function findTargetApartment(targetSide = 'auto') {
      const effectiveSide = targetSide === 'auto'
        ? (playerVan.position.x < 0 ? 'left' : 'right')
        : targetSide;

      // 1. First priority: locked target if valid
      if (targetSide === 'auto' && gameState.lockedTargetApt && !gameState.lockedTargetApt.delivered) {
        return gameState.lockedTargetApt;
      }

      // 2. Second priority: active customer order on targetSide within comfortable throw range
      let bestOrderApt = null;
      let bestOrderDist = Infinity;
      apartments.forEach(apt => {
        if ((targetSide === 'auto' || apt.side === targetSide) && apt.hasOrder && !apt.delivered) {
          const dz = gameState.vanZ - apt.group.position.z;
          if (dz >= -14 && dz <= 75) {
            const dist = Math.abs(dz - 18);
            if (dist < bestOrderDist) {
              bestOrderDist = dist;
              bestOrderApt = apt;
            }
          }
        }
      });
      if (bestOrderApt) return bestOrderApt;

      // 3. Third priority: ANY active customer order on either side within range
      if (targetSide === 'auto') {
        apartments.forEach(apt => {
          if (apt.hasOrder && !apt.delivered) {
            const dz = gameState.vanZ - apt.group.position.z;
            if (dz >= -14 && dz <= 75) {
              const dist = Math.abs(dz - 18);
              if (dist < bestOrderDist) {
                bestOrderDist = dist;
                bestOrderApt = apt;
              }
            }
          }
        });
        if (bestOrderApt) return bestOrderApt;
      }

      // 4. Fourth priority: closest roadside apartment ahead on effectiveSide so the throw ALWAYS launches
      let bestNearbyApt = null;
      let bestNearbyDist = Infinity;
      apartments.forEach(apt => {
        if (apt.side === effectiveSide) {
          const dz = gameState.vanZ - apt.group.position.z;
          if (dz >= -16 && dz <= 75) {
            const dist = Math.abs(dz - 18);
            if (dist < bestNearbyDist) {
              bestNearbyDist = dist;
              bestNearbyApt = apt;
            }
          }
        }
      });
      if (bestNearbyApt) return bestNearbyApt;

      // 5. Ultimate fallback: any apartment on effectiveSide or any apartment in scene
      return apartments.find(a => a.side === effectiveSide) || apartments[0] || null;
    }

    function throwFromSlot(slotIndex) {
      if (gameState.mode !== 'playing') return;
      if (slotIndex < 0 || slotIndex >= gameState.handSlots.length) return;

      const chosenParcelType = gameState.handSlots[slotIndex];

      // Prioritize the in-range resident (-14 <= dz <= 75)
      // If multiple residents are in range, prioritize the one whose requested parcel matches this slot!
      let targetApt = null;
      let matchingApt = null;
      let closestOrderApt = null;
      let bestDist = Infinity;

      apartments.forEach(apt => {
        if (apt.hasOrder && !apt.delivered) {
          const dz = gameState.vanZ - apt.group.position.z;
          if (dz >= -14 && dz <= 75) {
            const dist = Math.abs(dz - 18);
            if (apt.wantedType === chosenParcelType && !matchingApt) {
              matchingApt = apt;
            }
            if (dist < bestDist) {
              bestDist = dist;
              closestOrderApt = apt;
            }
          }
        }
      });

      targetApt = matchingApt || closestOrderApt;

      // If no customer order in range, aim at nearest roadside building porch on player's side
      if (!targetApt) {
        const effectiveSide = playerVan.position.x < 0 ? 'left' : 'right';
        let bestNearbyApt = null;
        let bestNearbyDist = Infinity;
        apartments.forEach(apt => {
          if (apt.side === effectiveSide) {
            const dz = gameState.vanZ - apt.group.position.z;
            if (dz >= -16 && dz <= 75) {
              const dist = Math.abs(dz - 18);
              if (dist < bestNearbyDist) {
                bestNearbyDist = dist;
                bestNearbyApt = apt;
              }
            }
          }
        });
        targetApt = bestNearbyApt || apartments.find(a => a.side === effectiveSide) || apartments[0] || null;
      }

      if (!targetApt) return;

      selectHandSlot(slotIndex);
      throwParcelFromHandSlot(slotIndex, targetApt, true);

      if (gameState.tutorialActive && gameState.tutorialStep === 2) {
        completeInteractiveTutorial();
      }
    }

    function autoThrowMatchingSlot() {
      if (gameState.mode !== 'playing') return;

      let bestOrderApt = null;
      let bestDist = Infinity;
      apartments.forEach(apt => {
        if (apt.hasOrder && !apt.delivered) {
          const dz = gameState.vanZ - apt.group.position.z;
          if (dz >= -14 && dz <= 75) {
            const dist = Math.abs(dz - 18);
            if (dist < bestDist) {
              bestDist = dist;
              bestOrderApt = apt;
            }
          }
        }
      });

      if (bestOrderApt) {
        const matchIdx = gameState.handSlots.indexOf(bestOrderApt.wantedType);
        if (matchIdx !== -1) {
          throwFromSlot(matchIdx);
          return;
        }
      }

      throwFromSlot(gameState.selectedSlotIndex || 0);
    }

    function quickThrowParcel(side = 'auto') {
      if (side === 'left' || side === 'slot0') throwFromSlot(0);
      else if (side === 'right' || side === 'slot2') throwFromSlot(2);
      else if (side === 'slot1') throwFromSlot(1);
      else autoThrowMatchingSlot();
    }

    function updateOrderAlertsAndBubbles() {
      let activeOrderApt = null;
      let closestMeters = Infinity;
      const now = performance.now();

      apartments.forEach((apt) => {
        if (!apt.hasOrder || apt.delivered) {
          apt.cloudEl.classList.add('hidden');
          if (apt.ringGroup) apt.ringGroup.visible = false;
          return;
        }
        const dz = gameState.vanZ - apt.group.position.z;
        const meters = Math.round(dz * 1.45);

        // If the player drove past the customer without delivering, expire the order and refresh its slot in the 3-slot bar!
        if (meters < -6) {
          const missedType = apt.wantedType;
          apt.hasOrder = false;
          apt.ringGroup.visible = false;
          apt.cloudEl.classList.add('hidden');
          const missedSlotIdx = gameState.handSlots.indexOf(missedType);
          if (missedSlotIdx !== -1) {
            refillHandSlot(missedSlotIdx);
          }
          return;
        }

        // Dynamic Sweet-Spot Shrinking 3D Ring & Target Indicator as Player Van approaches
        if (dz >= -6 && dz <= 75) {
          apt.ringGroup.visible = true;
          const sweetDist = Math.abs(dz - 18.0);
          const isSweet = sweetDist <= 6.5;

          if (isSweet) {
            // Sweet-spot pulsing gold aura & target bullseye
            const pulse = 1.0 + Math.sin(now * 0.02) * 0.16;
            if (apt.shrinkRing) {
              apt.shrinkRing.scale.set(pulse, 1, pulse);
              apt.shrinkRing.visible = true;
            }
            if (apt.centerMarker) {
              apt.centerMarker.material.color.setHex(0xfacc15);
              apt.centerMarker.material.emissive.setHex(0xfacc15);
              apt.centerMarker.material.emissiveIntensity = 1.9;
            }
            apt.ringBars.forEach(b => {
              b.material.color.setHex(0xfacc15);
              b.material.emissive.setHex(0xfacc15);
              b.material.emissiveIntensity = 1.6;
            });
          } else {
            // Approaching: dynamic shrinking ring scales down towards target pad
            const scale = 1.0 + Math.max(0, Math.min(1.8, (dz - 18.0) / 28.0));
            if (apt.shrinkRing) {
              apt.shrinkRing.scale.set(scale, 1, scale);
              apt.shrinkRing.visible = true;
            }
            if (apt.centerMarker) {
              apt.centerMarker.material.color.setHex(0x00f5d4);
              apt.centerMarker.material.emissive.setHex(0x00f5d4);
              apt.centerMarker.material.emissiveIntensity = 0.8;
            }
            apt.ringBars.forEach(b => {
              b.material.color.setHex(0x00f5d4);
              b.material.emissive.setHex(0x00f5d4);
              b.material.emissiveIntensity = 0.85;
            });
          }
        }

        if (meters >= -6 && meters <= 185 && meters < closestMeters) {
          closestMeters = meters;
          activeOrderApt = apt;
        } else {
          apt.cloudEl.classList.add('hidden');
        }
      });

      // Guarantee that the active approaching order's wanted item is always in one of the 3 hand slots!
      if (activeOrderApt && !gameState.handSlots.includes(activeOrderApt.wantedType)) {
        ensureParcelAvailableInHand(activeOrderApt.wantedType);
      }

      // If in Tutorial Step 2 and an order is approaching, update the instruction text with the side
      if (gameState.tutorialActive && gameState.tutorialStep === 2 && activeOrderApt && closestMeters <= 150) {
        updateTutorialStep2Prompt(activeOrderApt);
      }

      const matchingSlotIdx = activeOrderApt ? gameState.handSlots.indexOf(activeOrderApt.wantedType) : -1;

      // Dynamically highlight matching slot in the bottom dock with pulsing gold border
      document.querySelectorAll('.parcel-card-slot').forEach(card => {
        const s = parseInt(card.dataset.slot, 10);
        if (matchingSlotIdx !== -1 && s === matchingSlotIdx) {
          card.classList.add('slot-matched-pulse');
        } else {
          card.classList.remove('slot-matched-pulse');
        }
      });

      if (!activeOrderApt || gameState.mode !== 'playing') {
        gameState.lockedTargetApt = null;
        updateProjectileArcVisuals();
        return;
      }

      const apt = activeOrderApt;
      const pInfo = PARCEL_TYPES[apt.wantedType];
      const charImg = charIconDataURLs[apt.character.id] || '';
      const parcelImg = parcelIconDataURLs[apt.wantedType] || '';
      const sideLabel = apt.side === 'left' ? 'LEFT' : 'RIGHT';

      // Lock-On active when customer is within throwable delivery window
      const aptDz = gameState.vanZ - apt.group.position.z;
      const inThrowableRange = (aptDz >= -6 && aptDz <= 45);
      gameState.lockedTargetApt = inThrowableRange ? apt : null;
      updateProjectileArcVisuals();

      const slotKeyPrompt = matchingSlotIdx === 0 ? '⚡ [PRESS Q]' : (matchingSlotIdx === 1 ? '⚡ [PRESS W]' : (matchingSlotIdx === 2 ? '⚡ [PRESS E]' : '⚡ [SPACE]'));

      if (apt.renderedOrderId !== apt.orderId) {
        apt.renderedOrderId = apt.orderId;
        apt.cloudEl.innerHTML = `
          <div class="thought-cloud-pill">
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 border-2 border-slate-950 overflow-hidden flex-shrink-0 p-0.5">
              <img src="${charImg}" class="w-full h-full object-contain" alt="char" />
            </div>
            <div class="flex flex-col text-left min-w-0 flex-1">
              <div class="pixel-font text-[8px] sm:text-[9px] text-slate-900 truncate">${apt.character.phrase}</div>
              <div class="text-[10px] sm:text-xs font-extrabold text-slate-800 truncate">${pInfo.name}</div>
              <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span class="cloud-distance-badge inline-block px-2 py-0.5 rounded-full bg-sky-600 text-white font-extrabold text-[8px] sm:text-[9px] tracking-wider">
                  ${Math.max(0, closestMeters)}m &bull; ${sideLabel}
                </span>
                <button type="button" class="quick-throw-cloud-btn px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[8px] sm:text-[9px] arcade-font shadow-[0_0_12px_rgba(250,204,21,0.95)] border border-white cursor-pointer active:scale-95 animate-pulse" title="Quick Throw matching parcel">
                  ${slotKeyPrompt}
                </button>
              </div>
            </div>
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${pInfo.boxTierClass} flex flex-col items-center justify-center p-1 flex-shrink-0">
              <img src="${parcelImg}" class="w-7 h-7 sm:w-8 sm:h-8 object-contain" alt="item" />
              <span class="text-[6px] font-extrabold text-slate-900 uppercase leading-none mt-0.5">${pInfo.tier.split(' ')[0]}</span>
            </div>
          </div>
        `;
        apt.cloudDistBadge = apt.cloudEl.querySelector('.cloud-distance-badge');
        apt.cloudBtn = apt.cloudEl.querySelector('.quick-throw-cloud-btn');
        if (apt.cloudBtn) {
          apt.cloudBtn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            soundFX.init();
            if (matchingSlotIdx !== -1) {
              throwFromSlot(matchingSlotIdx);
            } else {
              autoThrowMatchingSlot();
            }
          });
        }
      } else {
        if (apt.cloudDistBadge) {
          apt.cloudDistBadge.innerHTML = `${Math.max(0, closestMeters)}m &bull; ${sideLabel}`;
        }
        if (apt.cloudBtn) {
          apt.cloudBtn.textContent = slotKeyPrompt;
        }
      }

      const worldPos = new THREE.Vector3(
        apt.group.position.x + apt.porchX,
        4.6,
        apt.group.position.z + 1.2
      );
      worldPos.project(camera);

      if (worldPos.z < 1.0) {
        const rawX = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
        const rawY = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
        const padX = Math.min(155, window.innerWidth * 0.36);
        const clampedX = Math.max(padX, Math.min(window.innerWidth - padX, rawX));
        const clampedY = Math.max(92, Math.min(window.innerHeight - 165, rawY));
        apt.cloudEl.style.left = `${clampedX}px`;
        apt.cloudEl.style.top = `${clampedY}px`;
        apt.cloudEl.classList.remove('hidden');
      } else {
        apt.cloudEl.classList.add('hidden');
      }
    }

    // ============================================================================
    // 13. HUD WITH VOXEL HEART SVGS, VIRTUAL JOYSTICK, KEYBOARD & SHOWCASE CONTROLS
    // ============================================================================
    function updateHUD() {
      document.getElementById('score-val').textContent = gameState.score.toLocaleString();
      document.getElementById('delivered-val').textContent = gameState.deliveries;
      document.getElementById('hud-coins-val').textContent = gameState.coins.toLocaleString();
      document.getElementById('combo-val').textContent = `x${gameState.combo}`;

      const armorContainer = document.getElementById('armor-boxes');
      const totalSlots = Math.max(3, gameState.hearts);
      armorContainer.innerHTML = Array.from({ length: totalSlots }, (_, i) => {
        const active = i < gameState.hearts;
        const isBonusHeart = i >= 3;
        const fillCol = active ? (isBonusHeart ? '#facc15' : '#f43f5e') : '#1e293b';
        const strokeCol = active ? '#ffffff' : '#475569';
        return `
          <svg class="w-4 h-4 sm:w-5 sm:h-5 ${active ? 'voxel-heart-icon' : 'opacity-40'}" viewBox="0 0 24 24" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
      }).join('');
    }

    function spawnVoxelBurst(pos, colorHex, count = 18) {
      for (let i = 0; i < count; i++) {
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
      const overlay = document.getElementById('speed-lines-overlay');
      if (overlay) {
        overlay.classList.remove('active-speed-lines');
        void overlay.offsetWidth;
        overlay.classList.add('active-speed-lines');
        setTimeout(() => {
          overlay.classList.remove('active-speed-lines');
        }, 380);
      }
    }

    function showFloatingCombatText(worldPos, text, extraClass = 'combat-text-gold') {
      const v = worldPos.clone().project(camera);
      const x = (v.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-v.y * 0.5 + 0.5) * window.innerHeight;

      const el = document.createElement('div');
      el.className = `floating-combat-banner arcade-font ${extraClass}`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.textContent = text;
      document.getElementById('popups-layer').appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }

    function showFloatingPopup(worldPos, text, colorClass = 'text-amber-300') {
      const v = worldPos.clone().project(camera);
      const x = (v.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-v.y * 0.5 + 0.5) * window.innerHeight;

      const el = document.createElement('div');
      el.className = `floating-pop arcade-font font-extrabold text-base sm:text-xl drop-shadow-[0_3px_0_#000] ${colorClass}`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.textContent = text;
      document.getElementById('popups-layer').appendChild(el);
      setTimeout(() => el.remove(), 1250);
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
      targetMoteOpacity = t.moteOpacity;
      moteMat.color.setHex(t.moteColor);

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
        moteMat.opacity = targetMoteOpacity;
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
      const blendRate = Math.min(1, rawDt * 0.45);
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
      moteMat.opacity = THREE.MathUtils.lerp(moteMat.opacity, targetMoteOpacity, blendRate);

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
      }
    }

    function showCityToast(cityTheme) {
      const toast = document.getElementById('city-toast');
      document.getElementById('city-toast-title').textContent = cityTheme.banner;
      toast.classList.remove('hidden', 'city-toast-anim');
      void toast.offsetWidth;
      toast.classList.add('city-toast-anim');
      setTimeout(() => toast.classList.add('hidden'), 3200);
    }

    function spawnTrafficWave() {
      if (trafficVehicles.length >= 8) return;
      const laneIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      const count = Math.random() < 0.30 ? 2 : 1;
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
        const mesh = createTrafficVehicle(type);
        mesh.position.set(laneX, 0, spawnZ);
        scene.add(mesh);

        // Match speed to any vehicle ahead in the same lane so they never collide or pass through each other!
        let forwardDriveSpeed = type === 'tuktuk' ? 10.5 : (12.0 + Math.random() * 3.5);
        if (sameLaneVehicles.length > 0) {
          const nearest = sameLaneVehicles[0];
          forwardDriveSpeed = nearest.forwardDriveSpeed;
        }

        trafficVehicles.push({
          mesh,
          type,
          laneIdx,
          forwardDriveSpeed,
          passedPlayer: false
        });
      }
    }

    function moveLane(dir) {
      if (gameState.mode !== 'playing') return;
      const prevLane = gameState.laneIndex;
      gameState.laneIndex = Math.max(0, Math.min(3, gameState.laneIndex + dir));
      if (gameState.laneIndex !== prevLane) {
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
      document.getElementById('tutorial-title').textContent = 'CHECK THOUGHT CLOUD & DRAG PARCEL!';
      document.getElementById('tutorial-desc').textContent = 'Look at the customer\'s Thought Cloud ahead, grab the matching item from your 3-slot bar below, and drag it LEFT or RIGHT to throw (or DOWN to cancel)!';
    }

    function updateTutorialStep2Prompt(apt) {
      const sideText = apt.side === 'left' ? 'LEFT' : 'RIGHT';
      document.getElementById('tutorial-step-badge').textContent = 'STEP 2 OF 2 • PARCEL THROW';
      document.getElementById('tutorial-title').textContent = `MATCH & DRAG PARCEL ${sideText}!`;
      document.getElementById('tutorial-desc').textContent = `Find the item shown in the customer's Thought Cloud, drag it from the bottom bar toward the ${sideText} sidewalk, and release (or drag DOWN to cancel)!`;
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
        turntableGroup.rotation.y += deltaX * 0.011;
        garageSpinVel = deltaX * 0.004;
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

    // Wire up On-Screen Quick-Throw Action Buttons (Dual pointerdown + click with debounce)
    function bindQuickThrowBtn(btnId, side) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      let lastTrigger = 0;
      const trigger = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const now = performance.now();
        if (now - lastTrigger < 140) return;
        lastTrigger = now;
        soundFX.init();
        quickThrowParcel(side);
      };
      btn.addEventListener('pointerdown', trigger);
      btn.addEventListener('click', trigger);
    }
    bindQuickThrowBtn('btn-quick-throw-left', 'slot0');
    bindQuickThrowBtn('btn-quick-throw-auto', 'slot1');
    bindQuickThrowBtn('btn-quick-throw-right', 'slot2');

    window.addEventListener('keydown', (e) => {
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
    }

    document.getElementById('btn-audio').addEventListener('click', () => {
      soundFX.init();
      soundFX.enabled = !soundFX.enabled;
      syncAudioButtonsUI();
      if (soundFX.enabled && !soundFX.isPlayingMusic) soundFX.startCozyMusic();
    });

    // Pause & 3-Second Countdown Resume Logic
    let activeCountdownTimer = null;
    function pauseShift() {
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

    document.getElementById('menu-btn-draw').addEventListener('click', () => {
      updateHomeGarageUI();
      resetBlindDrawModalStage();
      openModal('modal-draw');
    });
    document.getElementById('btn-home-quick-draw').addEventListener('click', () => {
      updateHomeGarageUI();
      resetBlindDrawModalStage();
      openModal('modal-draw');
    });
    document.getElementById('btn-spin-draw').addEventListener('click', spinMysteryVehicleDraw);

    document.getElementById('menu-btn-tutorial').addEventListener('click', () => {
      const spec = PLAYABLE_VANS[gameState.selectedVanIndex];
      if (gameState.ownedVans.includes(spec.id)) {
        gameState.equippedVanId = spec.id;
      }
      resetGame(true);
    });

    document.getElementById('menu-btn-settings').addEventListener('click', () => {
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

    const topbarRankBtn = document.getElementById('topbar-rank-btn');
    if (topbarRankBtn) {
      topbarRankBtn.addEventListener('click', () => {
        renderContractsModal();
        openModal('modal-contracts');
      });
    }

    const btnContractsExpand = document.getElementById('btn-contracts-expand');
    if (btnContractsExpand) {
      btnContractsExpand.addEventListener('click', () => {
        renderContractsModal();
        openModal('modal-contracts');
      });
    }

    function resetGame(forceTutorial = false) {
      soundFX.init();
      soundFX.startCozyMusic();

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
      gameState.invulnerableTimer = 0;
      gameState.cityIndex = 0;
      document.getElementById('immortal-hud-pill').classList.add('hidden');
      document.getElementById('slowmo-hud-pill').classList.remove('hidden');
      document.getElementById('slowmo-bar-fill').style.width = `${(gameState.slowMoEnergy / gameState.maxSlowMoEnergy) * 100}%`;
      slowmoVignette.style.opacity = '0';

      applyTimeOfDay(0, true);
      applyWeatherMode(0);
      updateHUD();

      if (forceTutorial || !gameState.tutorialCompletedOnce) {
        startInteractiveTutorial();
      } else {
        document.getElementById('tutorial-overlay').classList.add('hidden');
        document.getElementById('tutorial-overlay').classList.remove('flex');
        gameState.tutorialActive = false;
      }

      trafficVehicles.forEach(v => scene.remove(v.mesh));
      trafficVehicles.length = 0;

      flyingParcels.forEach(fp => {
        scene.remove(fp.mesh);
        fp.trailDots.forEach(td => scene.remove(td));
      });
      flyingParcels.length = 0;

      exhaustPool.forEach(p => {
        p.active = false;
        p.mesh.visible = false;
      });

      flyingRagdolls.forEach(rg => scene.remove(rg.mesh));
      flyingRagdolls.length = 0;

      activePowerUps.forEach(pu => scene.remove(pu.mesh));
      activePowerUps.length = 0;
      nextPowerUpTimer = 18 + Math.random() * 14;

      activeGates.forEach(g => scene.remove(g.mesh));
      activeGates.length = 0;

      activeCrosswalks.forEach(cw => scene.remove(cw.group));
      activeCrosswalks.length = 0;

      globalOrderCounter = 0;
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

      gameState.handSlots = [0, 2, 6];
      renderBottomParcelHandUI();

      const startVehicleTypes = ['cattruck', 'tuktuk', 'bankvan', 'dumptruck'];
      for (let z = -65; z >= -165; z -= 48) {
        const laneIdx = Math.floor(Math.random() * 4);
        const type = startVehicleTypes[Math.floor(Math.random() * startVehicleTypes.length)];
        const mesh = createTrafficVehicle(type);
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
    initSavedProgression();
    generate3DIcons();
    initWeatherParticles();
    initCozyMotes();
    initSidewalkPromenadeActors();

    for (let i = 0; i < NUM_PAIRS; i++) {
      const zPos = 12 - i * BLOCK_SPACING;
      apartments.push(createApartmentBuilding('left', zPos, i * 2));
      apartments.push(createApartmentBuilding('right', zPos, i * 2 + 1));
    }
    renderBottomParcelHandUI();
    setHomePageMode(true);
    updateHomeGarageUI();

    let lastTime = performance.now();
    let trafficTimer = 0;
    let crosswalkTimer = 0;
    let atmosphereCycleTimer = 0;
    let exhaustSpawnTimer = 0;
    let nextPowerUpTimer = 18;

    function animate(now) {
      requestAnimationFrame(animate);
      if (!now) now = performance.now();
      const rawDt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      cozyMotes.forEach((cm) => {
        cm.mesh.position.y = cm.baseY + Math.sin(now * 0.002 + cm.phase) * 0.65;
        cm.mesh.rotation.y += rawDt * 1.2;
      });

      // Home Page 3D Blueprint Turntable Rotation & Always-On Blue Holographic Scan Ring
      if (gameState.mode === 'home') {
        if (!garageDragging) {
          turntableGroup.rotation.y += rawDt * 0.38 + garageSpinVel;
          garageSpinVel *= 0.92;
        }
        holoScanRing.position.y = 0.18 + ((Math.sin(now * 0.0028) + 1) * 0.5) * 3.45;
        camera.up.set(0, 1, 0);
        camera.position.copy(SHOWROOM_CAM_POS);
        camera.lookAt(SHOWROOM_CAM_LOOK);
        renderer.render(scene, camera);
        return;
      }

      // Freeze world movement while Paused or in 3-2-1 Countdown
      if (gameState.mode === 'paused' || gameState.mode === 'countdown') {
        camera.up.set(0, 1, 0);
        camera.position.copy(PLAY_CAM_POS);
        camera.lookAt(PLAY_CAM_LOOK);
        renderer.render(scene, camera);
        return;
      }

      // Smoothly interpolate Sky, Fog, Road, Sun & Lamp colors over time
      updateSmoothAtmosphereTransition(rawDt);

      // Slow-Motion ONLY activates & drains Slow-Mo Energy while the player is actively dragging a parcel!
      let isDragSlowMoActive = false;
      const slowmoDot = document.getElementById('slowmo-dot');
      if (gameState.dragging && gameState.slowMoEnergy > 0) {
        isDragSlowMoActive = true;
        const battLvl = getVanTuningLevel(gameState.equippedVanId, 'battery');
        const drainMult = battLvl === 5 ? 0.70 : 1.0;
        gameState.slowMoEnergy = Math.max(0, gameState.slowMoEnergy - rawDt * drainMult);
        slowmoVignette.style.opacity = '1';
        if (slowmoDot) slowmoDot.className = 'w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping';
      } else {
        slowmoVignette.style.opacity = '0';
        if (slowmoDot) slowmoDot.className = 'w-2.5 h-2.5 rounded-full bg-cyan-400';
      }
      document.getElementById('slowmo-bar-fill').style.width = `${(gameState.slowMoEnergy / gameState.maxSlowMoEnergy) * 100}%`;

      const timeScale = isDragSlowMoActive ? 0.28 : (gameState.tutorialActive ? 0.68 : 1.0);
      const dt = rawDt * timeScale;

      if (gameState.immortalTimer > 0) {
        gameState.immortalTimer = Math.max(0, gameState.immortalTimer - rawDt);
        document.getElementById('immortal-hud-pill').classList.remove('hidden');
        document.getElementById('immortal-bar-fill').style.width = `${(gameState.immortalTimer / 10) * 100}%`;
        if (playerVan.userData.immortalAura) {
          playerVan.userData.immortalAura.visible = true;
          playerVan.userData.immortalAura.rotation.z = now * 0.008;
          playerVan.userData.immortalAura.material.color.setHSL((now * 0.0015) % 1, 1.0, 0.55);
        }
        if (gameState.immortalTimer <= 0) {
          document.getElementById('immortal-hud-pill').classList.add('hidden');
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
        camera.lookAt(PLAY_CAM_LOOK);
      } else {
        gameState.vanZ = -5.4;
        playerVan.position.z = gameState.vanZ;
        camera.up.set(0, 1, 0);
        camera.position.copy(PLAY_CAM_POS);
        camera.lookAt(PLAY_CAM_LOOK);
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
        ? (gameState.baseSpeed + speedProgression) * engSpeedMult
        : 12;

      if (gameState.dragging) {
        updateProjectileArcVisuals(now);
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

        if (apt.group.position.z > 32) {
          apt.group.position.z -= NUM_PAIRS * BLOCK_SPACING;
          rebuildApartmentVisuals(apt, CITY_THEMES[gameState.cityIndex], apt.index);
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

        if (gameState.distanceMeters >= gameState.nextGateDistance && activeGates.length === 0) {
          gameState.nextGateDistance = gameState.distanceMeters + 165;
          triggerNextCityGate(-135);
        }

        atmosphereCycleTimer += rawDt;
        if (atmosphereCycleTimer > 38) {
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

            if (newTheme.id === 'tokyo') applyWeatherMode(4);
            else if (newTheme.id === 'chinatown') applyWeatherMode(1);
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
            if (pu.type === 'heart') {
              gameState.hearts = Math.min(gameState.maxHearts, gameState.hearts + 1);
              updateHUD();
              spawnVoxelBurst(pu.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xf43f5e, 24);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '+1 EXTRA LIFE HEART!', 'text-rose-400');
            } else if (pu.type === 'slowmo') {
              gameState.slowMoEnergy = gameState.maxSlowMoEnergy;
              document.getElementById('slowmo-bar-fill').style.width = '100%';
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
            const alertTxt = document.getElementById('crosswalk-alert-text');
            if (alertTxt) {
              alertTxt.textContent = cw.isDuckCrossing
                ? 'CAUTION: DUCK FAMILY CROSSING AHEAD'
                : 'CAUTION: INLE CHEF CROSSING AHEAD';
            }
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

              if (gameState.immortalTimer > 0) {
                showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), 'IMMORTAL KNOCKBACK!', 'text-amber-300');
              } else if (gameState.invulnerableTimer <= 0) {
                gameState.hearts -= 1;
                gameState.combo = 1;
                gameState.invulnerableTimer = 1.6;
                updateHUD();
                showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), 'CROSSWALK IMPACT!', 'text-rose-400');
                if (gameState.hearts <= 0) {
                  gameState.mode = 'gameover';
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
        document.getElementById('crosswalk-alert').classList.toggle('hidden', !showCrosswalkWarning);

        // Snappy Arcade Spring-Damped Lane Switching & Body Physics
        const handLvl = getVanTuningLevel(gameState.equippedVanId, 'handling');
        const targetX = LANES[gameState.laneIndex];
        const springK = 195 + (handLvl - 1) * 45;
        const damping = 24 + (handLvl - 1) * 3.5;

        const distToTarget = gameState.currentX - targetX;
        const springForce = -springK * distToTarget - damping * (gameState.lateralVelocity || 0);
        gameState.lateralVelocity = (gameState.lateralVelocity || 0) + springForce * rawDt;
        gameState.currentX += gameState.lateralVelocity * rawDt;

        if (Math.abs(distToTarget) < 0.012 && Math.abs(gameState.lateralVelocity) < 0.04) {
          gameState.currentX = targetX;
          gameState.lateralVelocity = 0;
        }
        playerVan.position.x = gameState.currentX;

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
        if (trafficTimer > 1.45) {
          trafficTimer = 0;
          spawnTrafficWave();
        }

        for (let i = trafficVehicles.length - 1; i >= 0; i--) {
          const tv = trafficVehicles[i];

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
              gameState.nearMissCount++;
              const bonusScore = 50 * gameState.combo;
              gameState.score += bonusScore;
              gameState.combo = Math.min(8, gameState.combo + 1);
              updateHUD();

              updateContractProgress('near_misses', 1);
              updateContractProgress('combo_max', gameState.combo, true);

              soundFX.playNearMissWhoosh();
              triggerSpeedLines();
              triggerScreenShake(0.18, 0.85);

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
              if (gameState.immortalTimer > 0) {
                // Rainbow Immortal Mode blasts traffic out of the way without losing hearts!
                soundFX.playDeliverSuccess();
                gameState.score += 150;
                updateHUD();
                spawnVoxelBurst(tv.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xfacc15, 24);
                showFloatingPopup(tv.mesh.position.clone().add(new THREE.Vector3(0, 3, 0)), 'IMMORTAL SMASH +150!', 'text-amber-300');
                scene.remove(tv.mesh);
                trafficVehicles.splice(i, 1);
                continue;
              }

              soundFX.playCrash();
              gameState.hearts -= 1;
              gameState.combo = 1;
              gameState.invulnerableTimer = 1.65;
              updateHUD();

              spawnVoxelBurst(playerVan.position.clone().add(new THREE.Vector3(0, 1.6, -1.5)), 0xef4444, 22);
              showFloatingPopup(playerVan.position.clone().add(new THREE.Vector3(0, 3, 0)), 'COLLISION!', 'text-rose-400');

              if (gameState.hearts <= 0) {
                gameState.mode = 'gameover';
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
            scene.remove(tv.mesh);
            trafficVehicles.splice(i, 1);
          }
        }

        for (let i = flyingParcels.length - 1; i >= 0; i--) {
          const fp = flyingParcels[i];
          fp.progress += rawDt / fp.duration;

          // Customer porch live position (magnetic homing tracks resident in real time)
          const liveEnd = new THREE.Vector3(
            fp.targetApt.group.position.x + fp.targetApt.porchX,
            1.45,
            fp.targetApt.group.position.z + 1.2
          );

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
                const isPerfect = !!fp.isSweetSpot;
                const matchMultiplier = 2; // +100% exact order bonus
                const multiplier = (isPerfect ? 2 : 1) * matchMultiplier;
                const pts = Math.round(pInfo.pts * gameState.combo * multiplier * engScoreMult);
                const coinGain = baseCoinGain * 2 + (isPerfect ? 15 : 0);

                apt.delivered = true;
                apt.ringGroup.visible = false;
                apt.cloudEl.classList.add('hidden');

                gameState.score += pts;
                gameState.deliveries += 1;
                gameState.coins += coinGain;
                gameState.runCoinsEarned += coinGain;
                if (isPerfect) gameState.perfectDropCount++;
                gameState.combo = Math.min(8, gameState.combo + (isPerfect ? 2 : 1));
                updateHUD();

                updateContractProgress('deliveries_run', 1);
                updateContractProgress('combo_max', gameState.combo, true);
                if (isPerfect) updateContractProgress('perfect_drops', 1);
                if (pInfo.tier === 'LEGENDARY') updateContractProgress('legendary_drop', 1);
                if (CITY_THEMES[gameState.cityIndex].id === 'yangon') {
                  updateContractProgress('yangon_coins', coinGain);
                }

                tryRandomDiscoveryOnDelivery(fp.parcelType, apt.character ? apt.character.id : null);

                if (isPerfect) {
                  soundFX.playPerfectChime();
                  triggerScreenShake(0.35, 1.4);
                  spawnVoxelBurst(liveEnd, 0xfacc15, 36);
                  showFloatingCombatText(liveEnd, '⚡ PERFECT EXACT DROP! x2', 'combat-text-gold');
                  showFloatingPopup(liveEnd, `🎯 EXACT MATCH! +${pts} PTS (+${coinGain} COINS)`, 'text-amber-300 font-extrabold');
                } else {
                  soundFX.playDeliverSuccess();
                  triggerScreenShake(0.15, 0.6);
                  spawnVoxelBurst(liveEnd, pInfo.color, 24);
                  showFloatingCombatText(liveEnd, '🎯 EXACT ORDER! +100% BONUS', 'combat-text-gold');
                  showFloatingPopup(liveEnd, `+${pts} PTS (+${coinGain} COINS)`, 'text-emerald-300 font-bold');
                }
              } else {
                // WRONG PARCEL! Player receives 50% points & combo resets to 1
                const pts = Math.max(10, Math.round(pInfo.pts * 0.5 * engScoreMult));
                const coinGain = Math.max(5, Math.round(baseCoinGain * 0.5));

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
                showFloatingCombatText(liveEnd, '📦 WRONG PARCEL! (50% PTS)', 'combat-text-rose');
                showFloatingPopup(liveEnd, `+${pts} PTS (+${coinGain} COINS)`, 'text-rose-400 font-bold');
              }
            } else {
              spawnVoxelBurst(liveEnd, 0x94a3b8, 12);
            }

            scene.remove(fp.mesh);
            fp.trailDots.forEach(td => scene.remove(td));
            flyingParcels.splice(i, 1);
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

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', updateCameraForViewport);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateCameraForViewport, 120);
    });

    // Handle tab backgrounding & inactivity: Pause Web Audio to avoid buffer lag and reset lastTime
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (soundFX && soundFX.ctx && soundFX.ctx.state === 'running') {
          soundFX.ctx.suspend().catch(() => {});
        }
      } else {
        lastTime = performance.now();
        if (soundFX && soundFX.ctx && soundFX.ctx.state === 'suspended' && soundFX.enabled) {
          soundFX.ctx.resume().catch(() => {});
        }
      }
    });

    function hideLoadingOverlay() {
      const loader = document.getElementById('loading-overlay');
      if (loader && !loader.classList.contains('fade-out')) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 550);
      }
    }

    let isLoopStarted = false;
    function startAnimationLoop() {
      if (isLoopStarted) return;
      isLoopStarted = true;
      updateCameraForViewport();
      lastTime = performance.now();
      requestAnimationFrame(animate);
      hideLoadingOverlay();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startAnimationLoop();
    } else {
      document.addEventListener('DOMContentLoaded', startAnimationLoop);
      window.addEventListener('load', startAnimationLoop);
    }
