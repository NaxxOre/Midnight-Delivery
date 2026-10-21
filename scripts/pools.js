const TRAFFIC_TYPES = ['cattruck', 'tuktuk', 'bankvan', 'dumptruck', 'ambulance', 'firetruck', 'police', 'ufo', 'car'];
const trafficMeshPool = TRAFFIC_TYPES.flatMap(type => Array.from({ length: 3 }, () => {
  const mesh = createTrafficVehicle(type);
  mesh.userData.poolAvailable = true;
  const halfX = mesh.userData.halfX || 1.1;
  const halfZ = mesh.userData.halfZ || 1.8;
  for (const side of [-1, 1]) {
    const blinker = new THREE.Mesh(unitBoxGeo, trafficBlinkerMat);
    blinker.scale.set(0.28, 0.22, 0.28);
    blinker.position.set(side * (halfX + 0.06), 0.75, -halfZ + 0.25);
    blinker.visible = false;
    mesh.add(blinker);
    mesh.userData[side < 0 ? 'leftBlinker' : 'rightBlinker'] = blinker;
  }
  return mesh;
}));

function acquireTrafficVehicle(type) {
  let mesh = trafficMeshPool.find(candidate => candidate.userData.poolAvailable && candidate.userData.type === type);
  if (!mesh) {
    mesh = createTrafficVehicle(type);
    const halfX = mesh.userData.halfX || 1.1;
    const halfZ = mesh.userData.halfZ || 1.8;
    for (const side of [-1, 1]) {
      const blinker = new THREE.Mesh(unitBoxGeo, trafficBlinkerMat);
      blinker.scale.set(0.28, 0.22, 0.28);
      blinker.position.set(side * (halfX + 0.06), 0.75, -halfZ + 0.25);
      blinker.visible = false;
      mesh.add(blinker);
      mesh.userData[side < 0 ? 'leftBlinker' : 'rightBlinker'] = blinker;
    }
    trafficMeshPool.push(mesh);
  }
  mesh.userData.poolAvailable = false;
  mesh.visible = true;
  mesh.rotation.set(0, 0, 0);
  if (mesh.userData.leftBlinker) mesh.userData.leftBlinker.visible = false;
  if (mesh.userData.rightBlinker) mesh.userData.rightBlinker.visible = false;
  for (const wheel of mesh.userData.wheels || []) wheel.rotation.set(0, 0, 0);
  const lightsOn = (typeof TIME_PRESETS !== 'undefined' && typeof gameState !== 'undefined' && gameState.timeIndex !== undefined) ? TIME_PRESETS[gameState.timeIndex].lightsOn : false;
  for (const beam of mesh.userData.beams || []) beam.visible = lightsOn;
  return mesh;
}

function releaseTrafficVehicle(mesh) {
  if (!mesh) return;
  scene.remove(mesh);
  mesh.visible = false;
  mesh.userData.poolAvailable = true;
}
