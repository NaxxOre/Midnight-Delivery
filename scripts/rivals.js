const routeState = { kind: 'normal', remaining: 0, nextDistance: 500, gateActive: false };
const rivalState = { active: false, elapsed: 0, nextAt: 45, remaining: 0, stun: 0, lane: 1, steerTimer: 0, target: null, orderId: 0, throwTimer: 0, ramWindow: 0, ramLane: -1, rewardedRam: false, flight: null };
const rivalMesh = new THREE.Group();
addVoxelBox(rivalMesh, 2.3, 1.4, 4.5, 0, 1.2, 0, 0x111827);
addVoxelBox(rivalMesh, 2.0, 0.55, 2.5, 0, 2.15, 0.5, 0x991b1b);
addVoxelBox(rivalMesh, 1.9, 0.7, 0.1, 0, 1.5, -2.28, 0x7dd3fc);
addVoxelBox(rivalMesh, 2.6, 0.08, 4.7, 0, 0.18, 0, 0xff1744, { emissive: 0xff1744, emissiveIntensity: 2 });
for (const side of [-1, 1]) for (const axle of [-1.4, 1.4]) addVoxelBox(rivalMesh, 0.4, 0.7, 0.7, side * 1.15, 0.45, axle, 0x080b12);
const rivalTag = createNativeSignboardMesh('[RIVAL COURIER]', 'SHADOW EXPRESS', '#1f0814', '#ff718b', 4.3, 1.1, 0.15);
rivalTag.position.y = 3.4;
rivalMesh.add(rivalTag);
rivalMesh.visible = false;
envGroup.add(rivalMesh);
const rivalParcel = new THREE.Mesh(unitBoxGeo, getMat(0x301124, { emissive: 0xef4444, emissiveIntensity: 0.6 }));
rivalParcel.scale.setScalar(0.65);
rivalParcel.visible = false;
envGroup.add(rivalParcel);
const rivalLaunchPosition = new THREE.Vector3();
const rivalTargetPosition = new THREE.Vector3();
const routeGate = new THREE.Group();
for (const side of [-1, 1]) {
  const color = side < 0 ? 0xfb923c : 0x38bdf8;
  addVoxelBox(routeGate, 0.3, 9.7, 0.5, side * 7, 4.85, 0, color, { emissive: color, emissiveIntensity: 0.7 });
  addVoxelBox(routeGate, 7, 0.25, 0.5, side * 3.5, 9.5, 0, color);
  const sign = createNativeSignboardMesh(side < 0 ? 'EXPRESS SHORTCUT' : 'SAFE BYPASS', side < 0 ? 'HIGH RISK / 2X PAY' : 'REPAIR + CARGO', side < 0 ? '#431407' : '#082f49', side < 0 ? '#fdba74' : '#7dd3fc', 6.7, 1.5, 0.2);
  sign.position.set(side * 3.5, 10.4, 0);
  routeGate.add(sign);
}
routeGate.visible = false;
envGroup.add(routeGate);

function resetRivalRun() {
  Object.assign(routeState, { kind: 'normal', remaining: 0, nextDistance: 500, gateActive: false });
  Object.assign(rivalState, { active: false, elapsed: 0, nextAt: 45, remaining: 0, stun: 0, lane: 1, steerTimer: 0, target: null, orderId: 0, throwTimer: 0, ramWindow: 0, ramLane: -1, rewardedRam: false, flight: null });
  rivalMesh.visible = false;
  rivalParcel.visible = false;
  routeGate.visible = false;
  for (const apartment of apartments) apartment.rivalClaimedOrder = -1;
}

function getRouteCoinMultiplier() { return routeState.kind === 'express' && routeState.remaining > 0 ? 2 : 1; }
function getRouteTrafficCap() { return routeState.kind === 'express' ? 12 : routeState.kind === 'safe' ? 4 : 8; }
function getRouteTrafficInterval() { return routeState.kind === 'express' ? 0.8 : routeState.kind === 'safe' ? 3.2 : 1.45; }

function activateRoute(kind) {
  routeState.kind = kind;
  routeState.remaining = 20;
  if (kind === 'express') {
    gameState.nextOverpassDistance = Math.min(gameState.nextOverpassDistance, gameState.distanceMeters + 1);
    for (const apartment of apartments) {
      if (!apartment.hasOrder || apartment.delivered || apartment.isVip) continue;
      apartment.isVip = true;
      apartment.vipNeeded = 2;
      apartment.vipDelivered = 0;
      apartment.crownMesh = createVoxelCrownMesh();
      apartment.customerSlot.add(apartment.crownMesh);
      apartment.cloudEl.dataset.renderKey = '';
    }
    showActionToast('🔥 EXPRESS SHORTCUT • 20s • 2X PAY + VIP ORDERS', 'danger');
  } else {
    for (let index = cargoRoadEvents.length - 1; index >= 0; index--) {
      if (cargoRoadEvents[index].type !== 'supply') continue;
      cargoRoadGroup.remove(cargoRoadEvents[index].mesh);
      cargoRoadEvents.splice(index, 1);
    }
    spawnSupplyDepot(gameState.laneIndex, -45);
    const repair = spawnRepairPad(gameState.laneIndex, -75) || repairPads[0];
    if (repair) {
      repair.mesh.position.set(LANES[gameState.laneIndex], 0, -75);
      repair.laneIndex = gameState.laneIndex;
      repair.passed = false;
    }
    showActionToast('🛡️ SAFE BYPASS • 20s • PIT STOP + CARGO REFILL', 'info');
  }
  if (typeof soundFX !== 'undefined' && soundFX.playCityGateChime) soundFX.playCityGateChime();
}

function spawnRival() {
  Object.assign(rivalState, { active: true, remaining: 20, stun: 0, lane: gameState.laneIndex === 3 ? 2 : gameState.laneIndex + 1, steerTimer: 1.5, target: null, flight: null, rewardedRam: false, ramWindow: 0 });
  rivalState.nextAt = rivalState.elapsed + 45;
  rivalMesh.position.set(LANES[rivalState.lane], 0, playerVan.position.z - 1);
  rivalMesh.visible = true;
  showActionToast('🔴 RIVAL APPROACHING • SHADOW EXPRESS', 'danger');
}

function queueRivalRam(previousLane, nextLane) {
  if (!rivalState.active || rivalState.stun > 0 || nextLane !== rivalState.lane || Math.abs(previousLane - nextLane) !== 1 || Math.abs(rivalMesh.position.z - playerVan.position.z) > 4) return;
  rivalState.ramWindow = 0.65;
  rivalState.ramLane = nextLane;
}

function ramRival() {
  rivalState.stun = 4;
  rivalState.target = null;
  rivalState.flight = null;
  rivalParcel.visible = false;
  rivalState.ramWindow = 0;
  const direction = rivalMesh.position.x >= playerVan.position.x ? 1 : -1;
  rivalState.lane = THREE.MathUtils.clamp(rivalState.lane + direction, 0, 3);
  const loaded = rivalState.rewardedRam ? 0 : loadRoofCargo(2);
  rivalState.rewardedRam = true;
  triggerScreenShake(0.2, 0.7);
  soundFX.playCrash();
  showActionToast(`💥 SIDE-RAM • RIVAL STUNNED 4s • +${loaded} CRATES`, 'bonus');
}

function claimRivalDelivery(apartment, parcelType) {
  if (!rivalState.active || rivalState.stun > 0 || apartment.wantedType !== parcelType || apartment.rivalClaimedOrder === apartment.orderId || (rivalState.flight && rivalState.flight.apartment === apartment)) return false;
  apartment.rivalClaimedOrder = apartment.orderId;
  if (rivalState.target === apartment) rivalState.target = null;
  gameState.score += 500;
  updateHUD();
  if (typeof soundFX !== 'undefined' && soundFX.playRivalSnipe) soundFX.playRivalSnipe();
  showActionToast('⚡ SNIPED RIVAL! +500', 'bonus');
  return true;
}

function updateRivalSystems(rawDt, roadDt, speed) {
  if (gameState.mode !== 'playing') return;
  routeState.remaining = Math.max(0, routeState.remaining - rawDt);
  if (routeState.remaining === 0) routeState.kind = 'normal';
  if (!routeState.gateActive && !gameState.tutorialActive && gameState.distanceMeters >= routeState.nextDistance) {
    routeState.gateActive = true;
    routeGate.position.z = -160;
    routeGate.visible = true;
    routeState.nextDistance = gameState.distanceMeters + 500;
  }
  if (routeState.gateActive) {
    routeGate.position.z += speed * roadDt;
    if (routeGate.position.z >= playerVan.position.z) {
      activateRoute(playerVan.position.x < 0 ? 'express' : 'safe');
      routeState.gateActive = false;
      routeGate.visible = false;
    }
  }
  rivalState.elapsed += rawDt;
  if (!rivalState.active && !gameState.tutorialActive && rivalState.elapsed >= rivalState.nextAt) spawnRival();
  if (!rivalState.active) return;
  rivalState.remaining -= rawDt;
  if (rivalState.remaining <= 0) {
    rivalState.active = false;
    rivalState.target = null;
    rivalState.flight = null;
    rivalMesh.visible = false;
    rivalParcel.visible = false;
    return;
  }
  rivalState.stun = Math.max(0, rivalState.stun - rawDt);
  rivalState.ramWindow = Math.max(0, rivalState.ramWindow - rawDt);
  if (rivalState.ramWindow > 0 && rivalState.stun === 0 && gameState.laneIndex === rivalState.ramLane && Math.abs(playerVan.position.x - rivalMesh.position.x) < 1.9 && Math.abs(playerVan.position.z - rivalMesh.position.z) < 4) ramRival();
  rivalState.steerTimer -= rawDt;
  if (rivalState.steerTimer <= 0 && rivalState.stun === 0 && rivalState.ramWindow === 0) {
    const lanes = [0, 1, 2, 3].filter(lane => lane !== gameState.laneIndex && !trafficVehicles.some(vehicle => Math.abs(vehicle.mesh.position.x - LANES[lane]) < 2 && Math.abs(vehicle.mesh.position.z - rivalMesh.position.z) < 14));
    if (lanes.length) rivalState.lane = lanes[Math.floor(Math.random() * lanes.length)];
    rivalState.steerTimer = 1.8;
  }
  rivalMesh.position.x = THREE.MathUtils.damp(rivalMesh.position.x, LANES[rivalState.lane], 4, rawDt);
  rivalMesh.position.z = THREE.MathUtils.damp(rivalMesh.position.z, playerVan.position.z + (rivalState.stun > 0 ? 13 : -1), 2, rawDt);
  rivalMesh.rotation.z = rivalState.stun > 0 ? Math.sin(rivalState.elapsed * 15) * 0.1 : 0;
  if (rivalState.stun > 0) return;
  if (rivalState.flight) {
    const flight = rivalState.flight;
    flight.progress += rawDt / 0.42;
    getResidentHandPosition(flight.apartment, rivalTargetPosition);
    rivalParcel.position.lerpVectors(rivalLaunchPosition, rivalTargetPosition, Math.min(1, flight.progress));
    rivalParcel.position.y += Math.sin(Math.min(1, flight.progress) * Math.PI) * 4;
    if (flight.progress >= 1) {
      const apartment = flight.apartment;
      if (apartment.orderId === flight.orderId && apartment.hasOrder && !apartment.delivered) {
        apartment.delivered = true;
        apartment.ringGroup.visible = false;
        apartment.cloudEl.classList.add('hidden');
        showActionToast('SHADOW EXPRESS TOOK THE ORDER • throw sooner!', 'danger');
      }
      rivalState.flight = null;
      rivalParcel.visible = false;
    }
    return;
  }
  if (rivalState.target && (!isResidentInThrowRange(rivalState.target) || rivalState.target.orderId !== rivalState.orderId || rivalState.target.rivalClaimedOrder === rivalState.orderId)) rivalState.target = null;
  if (!rivalState.target) {
    rivalState.target = apartments.find(apartment => isResidentInThrowRange(apartment) && apartment.rivalClaimedOrder !== apartment.orderId) || null;
    if (rivalState.target) { rivalState.orderId = rivalState.target.orderId; rivalState.throwTimer = 1.5; }
  } else {
    rivalState.throwTimer -= rawDt;
    if (rivalState.throwTimer <= 0) {
      rivalState.flight = { apartment: rivalState.target, orderId: rivalState.orderId, progress: 0 };
      rivalLaunchPosition.copy(rivalMesh.position);
      rivalLaunchPosition.y = 2.4;
      rivalParcel.position.copy(rivalLaunchPosition);
      rivalParcel.visible = true;
      rivalState.target = null;
    }
  }
}
