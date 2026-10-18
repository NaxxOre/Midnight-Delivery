    const roofCargoRoot = new THREE.Group();
    const roofCrateMeshes = Array.from({ length: CARGO_CONFIG.capacity }, (unused, index) => {
      const crate = createCargoCrateMesh();
      crate.position.y = (index + 0.5) * CARGO_CONFIG.spacing;
      roofCargoRoot.add(crate);
      return crate;
    });
    const cargoRoadGroup = new THREE.Group();
    envGroup.add(cargoRoadGroup);
    const cargoRoadEvents = [];
    const cargoWorldPosition = new THREE.Vector3();
    const cargoSpawnPosition = new THREE.Vector3();
    const fallenCargoPool = Array.from({ length: CARGO_CONFIG.capacity }, () => {
      const mesh = createCargoCrateMesh();
      mesh.visible = false;
      cargoRoadGroup.add(mesh);
      return { mesh, velocity: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 };
    });

    function getRoofScoreMultiplier(count = gameState.roofCrates) {
      return 1 + Math.max(0, Math.min(CARGO_CONFIG.capacity, count) - 1) * 0.4;
    }

    function updateCargoHud() {
      const status = document.getElementById('cargo-status');
      const label = document.getElementById('cargo-count');
      const fill = document.getElementById('cargo-sway-fill');
      if (!status || !label || !fill) return;
      const text = `📦 ${gameState.roofCrates}/6 · ×${getRoofScoreMultiplier().toFixed(1)}`;
      const stockChanged = label.textContent !== text;
      if (stockChanged) label.textContent = text;
      const danger = Math.round(gameState.cargoDanger * 100);
      if (fill.dataset.danger !== String(danger)) {
        fill.dataset.danger = String(danger);
        fill.style.width = `${danger}%`;
        status.dataset.danger = danger >= 70 ? 'high' : 'low';
      }
      if (stockChanged || status.dataset.announcement !== `${gameState.roofCrates}:${danger}`) {
        status.dataset.announcement = `${gameState.roofCrates}:${danger}`;
        status.setAttribute('aria-label', `${gameState.roofCrates} roof crates, ${danger}% sway danger`);
      }
      const cards = document.getElementById('parcel-hand-horizontal').children;
      const disabled = gameState.roofCrates <= 0 ? 'true' : 'false';
      for (const card of cards) {
        if (card.getAttribute('aria-disabled') !== disabled) card.setAttribute('aria-disabled', disabled);
      }
    }

    function syncRoofCargo() {
      gameState.roofCrates = Math.max(0, Math.min(CARGO_CONFIG.capacity, Math.trunc(gameState.roofCrates) || 0));
      roofCrateMeshes.forEach((crate, index) => { crate.visible = index < gameState.roofCrates; });
      updateCargoHud();
    }

    function attachRoofCargoToVan(van) {
      if (van.userData.roofGift) van.userData.roofGift.visible = false;
      roofCargoRoot.position.set(0, van.userData.rackY + 0.09, van.userData.rackZ);
      van.userData.chassis.add(roofCargoRoot);
      syncRoofCargo();
    }

    function loadRoofCargo(count = 2) {
      const previousCount = gameState.roofCrates;
      gameState.roofCrates = Math.min(CARGO_CONFIG.capacity, previousCount + count);
      syncRoofCargo();
      return gameState.roofCrates - previousCount;
    }

    function getRoofThrowPosition(position) {
      const index = Math.max(0, gameState.roofCrates - 1);
      return roofCrateMeshes[index].getWorldPosition(position);
    }

    function dropTopRoofCrate() {
      if (gameState.roofCrates <= 0) return false;
      const crate = roofCrateMeshes[gameState.roofCrates - 1];
      crate.getWorldPosition(cargoSpawnPosition);
      let falling = fallenCargoPool.find(parcel => parcel.life <= 0);
      if (!falling) falling = fallenCargoPool[0];
      falling.mesh.position.copy(cargoSpawnPosition);
      falling.mesh.rotation.set(0, 0, gameState.vanSwayAngle);
      falling.mesh.visible = true;
      const side = gameState.vanSwayAngle < 0 ? 1 : -1;
      falling.velocity.set(side * 4 + (gameState.lateralVelocity || 0) * 0.15, 3, 7);
      falling.spin.set(3, side * 4, side * 5);
      falling.life = 1.6;
      gameState.roofCrates--;
      syncRoofCargo();
      return true;
    }

    function registerCargoSteer(direction) {
      if (gameState.roofCrates <= 0) return;
      const now = performance.now() / 1000;
      const reversal = direction !== gameState.lastCargoSteerDir && now - gameState.lastCargoSteerTime < 0.75;
      const height = gameState.roofCrates / CARGO_CONFIG.capacity;
      gameState.cargoStress = Math.min(1.4, gameState.cargoStress + (reversal ? 0.4 : 0.04) * height);
      gameState.cargoSwayVelocity -= direction * (reversal ? 0.65 : 0.12) * height;
      gameState.lastCargoSteerTime = now;
      gameState.lastCargoSteerDir = direction;
    }

    function updateRoofSway(dt) {
      if (!Number.isFinite(gameState.vanSwayAngle) || !Number.isFinite(gameState.cargoSwayVelocity)) {
        gameState.vanSwayAngle = 0;
        gameState.cargoSwayVelocity = 0;
      }
      const velocity = gameState.lateralVelocity || 0;
      const acceleration = THREE.MathUtils.clamp((velocity - gameState.lastCargoVelocity) / dt, -120, 120);
      gameState.lastCargoVelocity = velocity;
      gameState.cargoStress = Math.max(0, gameState.cargoStress - dt * 0.18);
      gameState.cargoLossCooldown = Math.max(0, gameState.cargoLossCooldown - dt);
      const height = gameState.roofCrates / CARGO_CONFIG.capacity;
      const steps = Math.ceil(dt * 120);
      const stepDt = dt / steps;
      for (let step = 0; step < steps; step++) {
        const force = -18 * gameState.vanSwayAngle - 4.5 * gameState.cargoSwayVelocity - acceleration * 0.018 * height;
        gameState.cargoSwayVelocity += force * stepDt;
        gameState.vanSwayAngle = THREE.MathUtils.clamp(gameState.vanSwayAngle + gameState.cargoSwayVelocity * stepDt, -0.65, 0.65);
      }
      gameState.cargoDanger = gameState.roofCrates > 0 ? Math.min(1, Math.abs(gameState.vanSwayAngle) / CARGO_CONFIG.swayLimit + gameState.cargoStress) : 0;
      roofCargoRoot.rotation.z = gameState.vanSwayAngle;
      if (gameState.cargoDanger >= 1 && gameState.cargoLossCooldown <= 0 && gameState.roofCrates > 0) {
        dropTopRoofCrate();
        gameState.vanSwayAngle *= 0.5;
        gameState.cargoSwayVelocity *= 0.3;
        gameState.cargoStress *= 0.4;
        gameState.cargoLossCooldown = 0.8;
        showActionToast('Cargo lost • ease off the swerves', 'danger');
      }
      updateCargoHud();
    }

    function spawnSupplyDepot(laneIndex = Math.floor(Math.random() * LANES.length), zPosition = -150) {
      if (cargoRoadEvents.filter(event => event.type === 'supply').length >= 2) return null;
      const mesh = createSupplyDepotMesh(laneIndex);
      mesh.position.z = zPosition;
      cargoRoadGroup.add(mesh);
      const depot = { type: 'supply', mesh, laneIndex, passed: false };
      cargoRoadEvents.push(depot);
      return depot;
    }

    function spawnCargoOverpass(safeLaneIndex = Math.floor(Math.random() * LANES.length), zPosition = -165) {
      if (cargoRoadEvents.some(event => event.type === 'bridge')) return null;
      const mesh = createCargoOverpassMesh(safeLaneIndex, playerVan.userData.rackY);
      mesh.position.z = zPosition;
      cargoRoadGroup.add(mesh);
      const bridge = { type: 'bridge', mesh, safeLaneIndex, passed: false };
      cargoRoadEvents.push(bridge);
      return bridge;
    }

    function shearRoofCargo(bridge) {
      let firstHit = gameState.roofCrates;
      for (let index = 0; index < gameState.roofCrates; index++) {
        roofCrateMeshes[index].getWorldPosition(cargoWorldPosition);
        for (let laneIndex = 0; laneIndex < LANES.length; laneIndex++) {
          const clearance = bridge.mesh.userData.clearances[laneIndex];
          if (cargoWorldPosition.x + 0.54 > LANES[laneIndex] - 1.7 && cargoWorldPosition.x - 0.54 < LANES[laneIndex] + 1.7 &&
              cargoWorldPosition.y + CARGO_CONFIG.crateHeight / 2 > clearance) firstHit = Math.min(firstHit, index);
        }
      }
      const lost = gameState.roofCrates - firstHit;
      for (let index = 0; index < lost; index++) dropTopRoofCrate();
      if (lost > 0) {
        soundFX.playCrash();
        triggerScreenShake(0.2, 0.6);
        showActionToast(`Low clearance • ${lost} crate${lost === 1 ? '' : 's'} sheared off`, 'danger');
      } else if (gameState.roofCrates > 0) showActionToast('Clearance cleared • cargo secure', 'info');
      return lost;
    }

    function updateCargoRoad(dt, playerSpeed) {
      if (gameState.distanceMeters >= gameState.nextSupplyDistance) {
        if (spawnSupplyDepot()) gameState.nextSupplyDistance = gameState.distanceMeters + 65;
      }
      if (!gameState.tutorialActive && gameState.distanceMeters >= gameState.nextOverpassDistance) {
        if (spawnCargoOverpass()) gameState.nextOverpassDistance = gameState.distanceMeters + (routeState.kind === 'express' ? 50 : 110);
      }
      roofCargoRoot.getWorldPosition(cargoWorldPosition);
      const roofZ = cargoWorldPosition.z;
      for (let index = cargoRoadEvents.length - 1; index >= 0; index--) {
        const event = cargoRoadEvents[index];
        event.mesh.position.z += playerSpeed * dt;
        if (!event.passed && event.mesh.position.z >= roofZ) {
          event.passed = true;
          if (event.type === 'supply' && Math.abs(playerVan.position.x - LANES[event.laneIndex]) <= 1.55) {
            const loaded = loadRoofCargo(2);
            soundFX.playCityGateChime();
            showActionToast(loaded > 0 ? `Supply depot • +${loaded} crates` : 'Cargo full • 6/6', 'info');
          } else if (event.type === 'bridge') shearRoofCargo(event);
        }
        if (event.mesh.position.z > 38) {
          cargoRoadGroup.remove(event.mesh);
          cargoRoadEvents.splice(index, 1);
        }
      }
    }

    function updateFallenCargo(dt) {
      for (const parcel of fallenCargoPool) {
        if (parcel.life <= 0) continue;
        parcel.life -= dt;
        parcel.velocity.y -= dt * 24;
        parcel.mesh.position.addScaledVector(parcel.velocity, dt);
        parcel.mesh.rotation.x += parcel.spin.x * dt;
        parcel.mesh.rotation.y += parcel.spin.y * dt;
        parcel.mesh.rotation.z += parcel.spin.z * dt;
        if (parcel.mesh.position.y < 0.4 && parcel.velocity.y < 0) {
          parcel.mesh.position.y = 0.4;
          parcel.velocity.y *= -0.25;
        }
        if (parcel.life <= 0) parcel.mesh.visible = false;
      }
    }

    function resetCargoRun() {
      cargoRoadEvents.forEach(event => cargoRoadGroup.remove(event.mesh));
      cargoRoadEvents.length = 0;
      fallenCargoPool.forEach(parcel => { parcel.life = 0; parcel.mesh.visible = false; });
      gameState.roofCrates = 3;
      gameState.vanSwayAngle = 0;
      gameState.cargoSwayVelocity = 0;
      gameState.cargoStress = 0;
      gameState.cargoDanger = 0;
      gameState.cargoLossCooldown = 0;
      gameState.lastCargoVelocity = 0;
      gameState.lastCargoSteerTime = -Infinity;
      gameState.lastCargoSteerDir = 0;
      gameState.nextSupplyDistance = 65;
      gameState.nextOverpassDistance = 100;
      roofCargoRoot.rotation.z = 0;
      attachRoofCargoToVan(playerVan);
      spawnSupplyDepot(gameState.laneIndex, -70);
    }
