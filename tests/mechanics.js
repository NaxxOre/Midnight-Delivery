const assert = require('node:assert/strict');

exports.verify = async page => {
  const night = await page.evaluate(() => {
    resetGame(false);
    gameState.distanceMeters = 350;
    updateNightSystems(0.01, 0, 0);
    const triggered = nightState.remaining === 25;
    for (let step = 0; step < 240; step++) updateNightSystems(1 / 60, 0, 0);
    const dark = hemiLight.intensity < 0.2 && playerVan.userData.beamLeft.visible;
    damageHeadlight();
    updateNightSystems(0.01, 0, 0);
    const damaged = playerVan.userData.beamRight.material.opacity <= playerVan.userData.beamLeft.material.opacity * 0.4;
    gameState.hearts = 2;
    spawnRepairPad(2, playerVan.position.z - 0.1);
    updateNightSystems(0.01, 0.1, 20);
    const repaired = !nightState.damaged && gameState.hearts === 3;
    updateNightSystems(0.01, 0.1, 20);
    const once = gameState.hearts === 3;
    nightState.nextDistance = Infinity;
    for (let step = 0; step < 1600; step++) updateNightSystems(1 / 60, 0, 0);
    const expired = nightState.remaining === 0;
    resetGame(false);
    const reset = !nightState.damaged && nightState.remaining === 0 && repairPads.length === 0 && !sosSparks.visible;
    return { triggered, dark, damaged, repaired, once, expired, reset, flares: sosFlares.length, sparks: sosSparkPositions.length / 3 };
  });
  assert.deepEqual(night, { triggered: true, dark: true, damaged: true, repaired: true, once: true, expired: true, reset: true, flares: 20, sparks: 120 });
  await page.evaluate(() => {
    gameState.entranceTimer = 0;
    gameState.vanZ = -5.4;
    playerVan.position.set(gameState.currentX, 0, -5.4);
    const vehicle = trafficVehicles[0];
    vehicle.mesh.position.copy(playerVan.position);
    gameState.invulnerableTimer = 0;
    gameState.immortalTimer = 0;
    gameState.overdriveActive = false;
  });
  await page.waitForFunction(() => nightState.damaged);
  await page.evaluate(() => resetGame(false));
  console.log('PASS blackout lifecycle, asymmetric damage, real traffic impact, single repair, bounded effects, and restart');
};
