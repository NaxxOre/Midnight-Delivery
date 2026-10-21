const nightState = { remaining: 0, nextDistance: 550, nextRepair: 550, blend: 0, damaged: false, elapsed: 0 };
const nightSky = new THREE.Color(0x0e1832);
const nightGround = new THREE.Color(0x16223e);
const nightHeadlightMaterials = [headlightBeamMat.clone(), headlightBeamMat.clone()];
const headlightGroundGeometry = new THREE.CircleGeometry(1, 24);
const headlightGroundMeshes = [0, 1].map(index => {
  const material = new THREE.MeshBasicMaterial({ color: 0xfff6cf, transparent: true, opacity: 0.52, depthWrite: false });
  const mesh = new THREE.Mesh(headlightGroundGeometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(4.2, 26, 1);
  mesh.position.set(index ? 0.85 : -0.85, 0.05, -27);
  return mesh;
});
const repairPads = [];
const repairPadPool = Array.from({ length: 3 }, () => {
  const mesh = new THREE.Group();
  addVoxelBox(mesh, 3.2, 0.06, 4.5, 0, 0.06, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 1 });
  addVoxelBox(mesh, 0.35, 0.08, 2, 0, 0.12, 0, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 });
  addVoxelBox(mesh, 1.8, 0.08, 0.35, 0, 0.12, 0, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 });
  const sign = createNativeSignboardMesh('PIT-STOP', 'REPAIR +1 HEART', '#082f49', '#7dd3fc', 3.2, 1.1, 0.2);
  sign.position.set(0, 3.2, 0);
  mesh.add(sign);
  mesh.visible = false;
  envGroup.add(mesh);
  return { mesh, active: false, passed: false, laneIndex: 0 };
});
const sosFlares = [];
const sosSparkPositions = new Float32Array(120 * 3);
const sosSparkGeometry = new THREE.BufferGeometry();
sosSparkGeometry.setAttribute('position', new THREE.BufferAttribute(sosSparkPositions, 3));
const sosSparkMaterial = new THREE.PointsMaterial({ color: 0xffce58, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false });
const sosSparks = new THREE.Points(sosSparkGeometry, sosSparkMaterial);
sosSparks.frustumCulled = false;
sosSparks.visible = false;
envGroup.add(sosSparks);

function initializeNightSystems() {
  if (sosFlares.length) return;
  for (const apartment of apartments) {
    const flare = new THREE.Group();
    addVoxelBox(flare, 0.18, 0.65, 0.18, 0, 0.35, 0, 0xff453a, { emissive: 0xff453a, emissiveIntensity: 2 });
    addVoxelBox(flare, 0.38, 0.25, 0.38, 0, 0.75, 0, 0xffce58, { emissive: 0xffce58, emissiveIntensity: 2 });
    flare.position.set(apartment.porchX - 1.1, 0.3, 1.2);
    apartment.group.add(flare);
    flare.visible = false;
    sosFlares.push({ apartment, mesh: flare });
  }
  attachNightHeadlights(playerVan);
}

function attachNightHeadlights(van) {
  [van.userData.beamLeft, van.userData.beamRight].forEach((beam, index) => {
    beam.material = nightHeadlightMaterials[index];
    van.add(headlightGroundMeshes[index]);
  });
}

function resetNightRun() {
  Object.assign(nightState, { remaining: 0, nextDistance: 550, nextRepair: 550, blend: 0, damaged: false, elapsed: 0 });
  for (const pad of repairPadPool) { pad.active = false; pad.mesh.visible = false; }
  repairPads.length = 0;
  for (const flare of sosFlares) flare.mesh.visible = false;
  sosSparks.visible = false;
  document.body.classList.remove('blackout-active');
  attachNightHeadlights(playerVan);
}

function startBlackout() {
  nightState.remaining = 25;
  nightState.nextDistance = gameState.distanceMeters + 700;
  showActionToast('⚡ BLACKOUT ZONE', 'info');
}

function damageHeadlight() { nightState.damaged = true; }

function spawnRepairPad(laneIndex = Math.floor(Math.random() * LANES.length), position = -150) {
  const pad = repairPadPool.find(candidate => !candidate.active);
  if (!pad) return null;
  Object.assign(pad, { active: true, passed: false, laneIndex });
  pad.mesh.visible = true;
  pad.mesh.position.set(LANES[laneIndex], 0, position);
  repairPads.push(pad);
  return pad;
}

function repairVan() {
  nightState.damaged = false;
  gameState.hearts = Math.min(gameState.maxHearts, gameState.hearts + 1);
  updateHUD();
  soundFX.playPerfectChime();
  showActionToast('🔧 PIT-STOP REPAIR', 'info');
}

function updateNightSystems(rawDt, roadDt, speed) {
  if (gameState.mode === 'playing') {
    nightState.elapsed += rawDt;
    nightState.remaining = Math.max(0, nightState.remaining - rawDt);
    if (!gameState.tutorialActive && nightState.remaining === 0 && gameState.distanceMeters >= nightState.nextDistance) startBlackout();
    if (gameState.distanceMeters >= nightState.nextRepair && spawnRepairPad()) nightState.nextRepair = gameState.distanceMeters + 250;
    for (let index = repairPads.length - 1; index >= 0; index--) {
      const pad = repairPads[index];
      pad.mesh.position.z += speed * roadDt;
      if (!pad.passed && pad.mesh.position.z >= playerVan.position.z) {
        pad.passed = true;
        if (Math.abs(playerVan.position.x - pad.mesh.position.x) < 1.6) repairVan();
      }
      if (pad.mesh.position.z > 38) { pad.active = false; pad.mesh.visible = false; repairPads.splice(index, 1); }
    }
  }
  const active = gameState.mode !== 'home' && nightState.remaining > 0;
  nightState.blend = THREE.MathUtils.damp(nightState.blend, active ? 1 : 0, 1.5, rawDt);
  document.body.classList.toggle('blackout-active', active);
  if (nightState.blend > 0.001 && gameState.mode !== 'home') {
    const targetPresetHemi = (typeof targetHemiInt !== 'undefined') ? targetHemiInt : 0.74;
    const targetPresetDir = (typeof targetDirInt !== 'undefined') ? targetDirInt : 0.88;
    const blackoutHemi = 0.185;
    const blackoutDir = 0.15;
    hemiLight.intensity = THREE.MathUtils.lerp(targetPresetHemi, blackoutHemi, nightState.blend);
    dirLight.intensity = THREE.MathUtils.lerp(targetPresetDir, blackoutDir, nightState.blend);

    scene.background.lerp(nightSky, nightState.blend);
    scene.fog.color.lerp(nightSky, nightState.blend);
    if (scene.fog) scene.fog.density = 0.0016;
    hemiLight.color.lerp(nightSky, nightState.blend);
    hemiLight.groundColor.lerp(nightGround, nightState.blend);
    for (const apartment of apartments) for (const windowMesh of apartment.windowMeshes || []) {
      if (windowMesh.material) windowMesh.material.emissiveIntensity = Math.max(windowMesh.material.emissiveIntensity, nightState.blend * 1.8);
    }
  }
  const lightsOn = gameState.mode !== 'home' && (active || nightState.blend > 0.05 || TIME_PRESETS[gameState.timeIndex].lightsOn);
  [playerVan.userData.beamLeft, playerVan.userData.beamRight].forEach((beam, index) => {
    const flicker = index === 1 && nightState.damaged ? 0.35 * (Math.sin(nightState.elapsed * 37) > -0.7 ? 1 : 0.2) : 1;
    beam.visible = lightsOn;
    beam.material.opacity = 0.38 * flicker;
    headlightGroundMeshes[index].visible = lightsOn;
    const reach = 26 + (getVanTuningLevel(gameState.equippedVanId, 'headlights') - 1) * 3;
    headlightGroundMeshes[index].scale.set(4.2, reach, 1);
    headlightGroundMeshes[index].position.set(index ? 0.85 : -0.85, 0.05, -reach);
    headlightGroundMeshes[index].material.opacity = 0.52 * flicker;
  });
  let sparkIndex = 0;
  for (const flare of sosFlares) {
    const apartment = flare.apartment;
    const relativeZ = apartment.group.position.z - playerVan.position.z;
    flare.mesh.visible = active && apartment.hasOrder && !apartment.delivered && relativeZ >= -100 && relativeZ <= 16;
    if (!flare.mesh.visible) continue;
    flare.mesh.scale.setScalar(1 + Math.sin(nightState.elapsed * 8 + apartment.index) * 0.15);
    for (let particle = 0; particle < 6 && sparkIndex < 120; particle++, sparkIndex++) {
      const rise = (nightState.elapsed * 1.4 + particle / 3) % 2;
      const offset = sparkIndex * 3;
      sosSparkPositions[offset] = apartment.group.position.x + flare.mesh.position.x + Math.sin(particle * 2 + nightState.elapsed) * rise * 0.25;
      sosSparkPositions[offset + 1] = 0.9 + rise;
      sosSparkPositions[offset + 2] = apartment.group.position.z + 1.2 + Math.cos(particle) * rise * 0.2;
    }
  }
  sosSparkGeometry.setDrawRange(0, sparkIndex);
  sosSparkGeometry.attributes.position.needsUpdate = sparkIndex > 0;
  sosSparks.visible = sparkIndex > 0;
}
