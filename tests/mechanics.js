const assert = require('node:assert/strict');

exports.verify = async page => {
  const night = await page.evaluate(() => {
    resetGame(false);
    gameState.distanceMeters = 1800;
    updateNightSystems(0.01, 0, 0);
    const triggered = nightState.remaining === 14;
    for (let step = 0; step < 240; step++) updateNightSystems(1 / 60, 0, 0);
    const dark = hemiLight.intensity < 0.2;
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
  const rival = await page.evaluate(() => {
    gameState.entranceTimer = 0;
    gameState.distanceMeters = 850;
    rivalState.elapsed = 44.99;
    updateRivalSystems(0.02, 0, 0);
    const spawned = rivalState.active && rivalState.remaining > 19;
    apartments.forEach(apartment => { apartment.hasOrder = false; });
    const apartment = apartments[0];
    apartment.hasOrder = true;
    apartment.delivered = false;
    apartment.orderId = ++globalOrderCounter;
    apartment.wantedType = 0;
    apartment.charMesh = createVoxelCharacter('goblin', 0.96);
    apartment.customerSlot.add(apartment.charMesh);
    apartment.group.position.z = playerVan.position.z - 20;
    updateRivalSystems(0.01, 0, 0);
    const waiting = rivalState.target === apartment && rivalState.throwTimer === 1.5;
    updateRivalSystems(1.49, 0, 0);
    const notEarly = rivalState.flight === null;
    updateRivalSystems(0.02, 0, 0);
    const launched = !!rivalState.flight && rivalParcel.visible;
    updateRivalSystems(0.43, 0, 0);
    const stolen = apartment.delivered && !rivalParcel.visible;
    apartment.delivered = false;
    apartment.isVip = false;
    apartment.orderId = ++globalOrderCounter;
    gameState.handSlots[0] = 0;
    const before = gameState.score;
    const thrown = throwParcelFromHandSlot(0, apartment);
    const sniped = thrown && gameState.score === before + 500 && !claimRivalDelivery(apartment, 0);
    resetGame(false);
    spawnRival();
    const previousLane = gameState.laneIndex;
    const nextLane = rivalState.lane;
    queueRivalRam(previousLane, nextLane);
    gameState.laneIndex = nextLane;
    playerVan.position.x = rivalMesh.position.x;
    updateRivalSystems(0.01, 0, 0);
    const rammed = rivalState.stun === 4 && gameState.roofCrates === 5;
    ramRival();
    const boundedReward = gameState.roofCrates === 5;
    updateRivalSystems(4.01, 0, 0);
    const recovered = rivalState.stun === 0;
    updateRivalSystems(20, 0, 0);
    const departed = !rivalState.active && !rivalMesh.visible;
    resetGame(false);
    gameState.distanceMeters = 950;
    updateRivalSystems(0.01, 0, 0);
    routeGate.position.z = playerVan.position.z - 0.1;
    playerVan.position.x = -1;
    updateRivalSystems(0.01, 0.1, 20);
    const express = routeState.kind === 'express' && getRouteCoinMultiplier() === 2 && getRouteTrafficCap() === 12;
    updateRivalSystems(20.1, 0, 0);
    const routeExpired = routeState.kind === 'normal' && getRouteCoinMultiplier() === 1;
    gameState.distanceMeters = 1450;
    updateRivalSystems(0.01, 0, 0);
    routeGate.position.z = playerVan.position.z - 0.1;
    playerVan.position.x = 1;
    updateRivalSystems(0.01, 0.1, 20);
    const safe = routeState.kind === 'safe' && getRouteTrafficCap() === 4 && cargoRoadEvents.some(event => event.type === 'supply' && event.laneIndex === gameState.laneIndex) && repairPads.some(pad => pad.laneIndex === gameState.laneIndex);
    resetGame(false);
    return { spawned, waiting, notEarly, launched, stolen, sniped, rammed, boundedReward, recovered, departed, express, routeExpired, safe };
  });
  for (const [name, passed] of Object.entries(rival)) assert.equal(passed, true, `Rival/routes: ${name}`);
  console.log('PASS rival timing, parcel race, +500 counterplay, side-ram/stun/reward cap, route choices and expiry');

  const touchSteer = await page.evaluate(() => {
    resetGame(false);
    gameState.entranceTimer = 0;
    gameState.laneIndex = 1;
    flyingParcels.length = 0;

    function fireTouch(type, x, y, id = 1) {
      const touchObj = { identifier: id, clientX: x, clientY: y, pageX: x, pageY: y, target: canvas };
      const evt = new Event(type, { bubbles: true, cancelable: true });
      evt.touches = (type === 'touchend' || type === 'touchcancel') ? [] : [touchObj];
      evt.targetTouches = evt.touches;
      evt.changedTouches = [touchObj];
      canvas.dispatchEvent(evt);

      const ptrMap = { touchstart: 'pointerdown', touchmove: 'pointermove', touchend: 'pointerup' };
      if (ptrMap[type]) {
        const ptrEvt = new PointerEvent(ptrMap[type], {
          bubbles: true,
          cancelable: true,
          pointerId: id,
          pointerType: 'touch',
          isPrimary: true,
          clientX: x,
          clientY: y
        });
        (type === 'touchstart' ? canvas : window).dispatchEvent(ptrEvt);
      }
    }

    // 1. Road tap must NOT throw any parcel
    fireTouch('touchstart', 90, 320, 1);
    fireTouch('touchend', 92, 321, 1);
    const noTapThrow = flyingParcels.length === 0 && gameState.laneIndex === 1;

    // 2. Single long swipe right across 180px (with simultaneous pointer+touch events) moves EXACTLY +1 lane and throws 0 parcels
    fireTouch('touchstart', 60, 320, 2);
    fireTouch('touchmove', 115, 322, 2);
    fireTouch('touchmove', 175, 324, 2);
    fireTouch('touchmove', 240, 325, 2);
    fireTouch('touchend', 240, 325, 2);
    const singleLanePerSwipe = gameState.laneIndex === 2 && flyingParcels.length === 0;

    // 3. Mid-swipe reversal moves -1 lane then +1 lane cleanly without lifting finger, and throws 0 parcels
    fireTouch('touchstart', 240, 320, 3);
    fireTouch('touchmove', 160, 320, 3);
    const afterFirstDir = gameState.laneIndex === 1;
    fireTouch('touchmove', 235, 320, 3);
    const afterReversal = gameState.laneIndex === 2;
    fireTouch('touchend', 235, 320, 3);
    const noSwipeThrow = flyingParcels.length === 0;

    // 4. Simultaneous multi-touch: while Finger 1 is actively holding/swiping lanes on road, Finger 2 (isPrimary: false) taps a parcel card to deliver mid-lane-switch!
    gameState.laneIndex = 1;
    gameState.currentX = LANES[1];
    gameState.lateralVelocity = 12.5; // actively sliding across lanes
    flyingParcels.length = 0;
    slotCooldowns[0] = 0;
    const roadTouch = { identifier: 10, clientX: 80, clientY: 320, pageX: 80, pageY: 320, target: canvas };
    const startSteerEvt = new Event('touchstart', { bubbles: true, cancelable: true });
    startSteerEvt.touches = [roadTouch];
    startSteerEvt.targetTouches = [roadTouch];
    startSteerEvt.changedTouches = [roadTouch];
    canvas.dispatchEvent(startSteerEvt);

    const movedRoadTouch = { identifier: 10, clientX: 125, clientY: 326, pageX: 125, pageY: 326, target: canvas };
    const moveSteerEvt = new Event('touchmove', { bubbles: true, cancelable: true });
    moveSteerEvt.touches = [movedRoadTouch];
    moveSteerEvt.targetTouches = [movedRoadTouch];
    moveSteerEvt.changedTouches = [movedRoadTouch];
    canvas.dispatchEvent(moveSteerEvt);
    const switchedWhileHolding = gameState.laneIndex === 2;

    // Finger 2 taps Slot 0 card while Finger 1 is STILL down on the road (isPrimary: false!)
    const card0 = document.querySelector('.parcel-card-slot[data-slot="0"]');
    const cardTouch = { identifier: 11, clientX: 90, clientY: 600, pageX: 90, pageY: 600, target: card0 };
    const cardTouchEvt = new Event('touchstart', { bubbles: true, cancelable: true });
    cardTouchEvt.touches = [movedRoadTouch, cardTouch];
    cardTouchEvt.targetTouches = [cardTouch];
    cardTouchEvt.changedTouches = [cardTouch];
    card0.dispatchEvent(cardTouchEvt);
    const deliveredWhileSwitching = flyingParcels.length === 1;

    // Finger 1 can still immediately reverse lanes right after Finger 2 delivered!
    const revRoadTouch = { identifier: 10, clientX: 75, clientY: 328, pageX: 75, pageY: 328, target: canvas };
    const revSteerEvt = new Event('touchmove', { bubbles: true, cancelable: true });
    revSteerEvt.touches = [revRoadTouch];
    revSteerEvt.targetTouches = [revRoadTouch];
    revSteerEvt.changedTouches = [revRoadTouch];
    canvas.dispatchEvent(revSteerEvt);
    const reversedWhileDelivering = gameState.laneIndex === 1;

    const endSteerEvt = new Event('touchend', { bubbles: true, cancelable: true });
    endSteerEvt.touches = [];
    endSteerEvt.targetTouches = [];
    endSteerEvt.changedTouches = [revRoadTouch];
    canvas.dispatchEvent(endSteerEvt);

    resetGame(false);
    return { noTapThrow, singleLanePerSwipe, afterFirstDir, afterReversal, noSwipeThrow, switchedWhileHolding, deliveredWhileSwitching, reversedWhileDelivering };
  });
  for (const [name, passed] of Object.entries(touchSteer)) assert.equal(passed, true, `Mobile touch steering: ${name}`);
  console.log('PASS mobile touch steering & simultaneous mid-swerve parcel delivery');
};
