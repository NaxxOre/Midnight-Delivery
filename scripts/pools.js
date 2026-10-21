const TRAFFIC_TYPES = ['cattruck', 'tuktuk', 'bankvan', 'dumptruck', 'ambulance', 'firetruck', 'police', 'ufo', 'car'];

function attachTrafficBlinkers(mesh) {
  const halfX = mesh.userData.halfX || 1.15;
  const halfZ = mesh.userData.halfZ || 1.9;
  for (const side of [-1, 1]) {
    const blinkerGroup = new THREE.Group();
    blinkerGroup.visible = false;

    // 1. Prominent Rear Indicator Lamp (facing directly backwards at the player!)
    const rearLamp = new THREE.Mesh(unitBoxGeo, trafficBlinkerMat);
    rearLamp.scale.set(0.44, 0.32, 0.22);
    rearLamp.position.set(side * (halfX * 0.82), 0.95, halfZ + 0.08);
    blinkerGroup.add(rearLamp);

    // 2. High-Mount Upper Corner Indicator (High visibility on roof/van rear corner)
    const upperLamp = new THREE.Mesh(unitBoxGeo, trafficBlinkerMat);
    upperLamp.scale.set(0.26, 0.22, 0.18);
    upperLamp.position.set(side * (halfX * 0.88), 1.95, halfZ + 0.06);
    blinkerGroup.add(upperLamp);

    // 3. Side & Front Fender Indicator (Visible when overtaking or beside)
    const sideLamp = new THREE.Mesh(unitBoxGeo, trafficBlinkerMat);
    sideLamp.scale.set(0.18, 0.28, 0.42);
    sideLamp.position.set(side * (halfX + 0.08), 0.88, -halfZ + 0.50);
    blinkerGroup.add(sideLamp);

    mesh.add(blinkerGroup);
    mesh.userData[side < 0 ? 'leftBlinker' : 'rightBlinker'] = blinkerGroup;
  }
}

const trafficMeshPool = TRAFFIC_TYPES.flatMap(type => Array.from({ length: 3 }, () => {
  const mesh = createTrafficVehicle(type);
  mesh.userData.poolAvailable = true;
  attachTrafficBlinkers(mesh);
  return mesh;
}));

function acquireTrafficVehicle(type) {
  let mesh = trafficMeshPool.find(candidate => candidate.userData.poolAvailable && candidate.userData.type === type);
  if (!mesh) {
    mesh = createTrafficVehicle(type);
    attachTrafficBlinkers(mesh);
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
  if (mesh.userData.leftBlinker) mesh.userData.leftBlinker.visible = false;
  if (mesh.userData.rightBlinker) mesh.userData.rightBlinker.visible = false;
  mesh.userData.poolAvailable = true;
}
