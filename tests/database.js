const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

exports.verify = root => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  const context = vm.createContext({ window: { localStorage: storage }, console });
  vm.runInContext(fs.readFileSync(path.join(root, 'scripts/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'scripts/database.js'), 'utf8') + '\nglobalThis.database = courierDB; globalThis.Database = CourierDB;', context);
  const database = context.database;
  assert.equal(database.data.profile.coins, 250);
  const good = database.exportJSON();
  for (const payload of ['{', JSON.stringify({ version: 9, profile: {}, history: [] }), JSON.stringify({ version: 1, profile: { coins: -1 }, history: [] }), JSON.stringify({ version: 1, profile: { callsign: {} }, history: [] }), JSON.stringify({ version: 1, profile: { shiftContracts: [null] }, history: [] }), JSON.stringify({ version: 1, profile: {}, history: [], session: { id: 'bad' } })]) {
    assert.throws(() => database.importJSON(payload));
    assert.equal(database.exportJSON(), good);
  }
  database.importJSON(good);
  const updated = JSON.parse(good);
  updated.profile.coins = 1234;
  database.importJSON(JSON.stringify(updated));
  memory.set(database.key, '{broken');
  const recovered = new context.Database(storage);
  assert.equal(recovered.data.profile.coins, 250);
  assert.ok(recovered.warning);
  const unavailable = new context.Database({ getItem() { throw new Error('disabled'); }, setItem() { throw new Error('quota'); } });
  assert.equal(unavailable.data.profile.coins, 250);
  assert.equal(unavailable.commit(unavailable.data), false);
  assert.ok(unavailable.warning);
  const injected = JSON.parse(good);
  injected.profile.callsign = '<Courier>';
  injected.profile.vanTuning.classic.engine = 99;
  assert.throws(() => database.importJSON(JSON.stringify(injected)));
  injected.profile.vanTuning.classic.engine = 5;
  database.importJSON(JSON.stringify(injected));
  assert.equal(database.data.profile.callsign, 'Courier');
  assert.equal(database.data.profile.vanTuning.classic.engine, 5);
  console.log('PASS CourierDB schema rejection, atomic validation, backup recovery, unavailable storage, upgrade bounds, and export/import');
};

exports.verifyBrowser = async page => {
  await page.evaluate(() => {
    resetGame(false);
    gameState.score = 4321;
    gameState.coins = 765;
    gameState.deliveries = 7;
    gameState.distanceMeters = 720;
    gameState.roofCrates = 5;
    gameState.maxRoofStack = 6;
    gameState.handModifiers = [{ type: 'hot', timer: 6, maxTime: 8 }, null, { type: 'fragile', cracked: true }];
    syncRoofCargo();
    startBlackout();
    damageHeadlight();
    activateRoute('express');
    gameState.mode = 'paused';
    saveActiveShift();
  });
  const saved = await page.evaluate(() => courierDB.data.session);
  assert.ok(saved && saved.state.score === 4321 && saved.night.damaged);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof isLoopStarted !== 'undefined' && isLoopStarted);
  assert.equal(await page.locator('#resume-shift-panel').isVisible(), true);
  await page.locator('#btn-resume-shift').click();
  const restored = await page.evaluate(() => ({ score: gameState.score, coins: gameState.coins, parcels: gameState.deliveries, cargo: gameState.roofCrates, distance: gameState.distanceMeters, damage: nightState.damaged, route: routeState.kind, timer: gameState.handModifiers[0].maxTime, maxRoof: gameState.maxRoofStack, mode: gameState.mode }));
  assert.deepEqual(restored, { score: 4321, coins: 765, parcels: 7, cargo: 5, distance: 720, damage: true, route: 'express', timer: 8, maxRoof: 6, mode: 'countdown' });
  await page.waitForFunction(() => gameState.mode === 'playing', null, { timeout: 6000 });
  const result = await page.evaluate(() => {
    gameState.mode = 'paused';
    const initialLifetime = gameState.lifetimeDeliveries;
    completePersistentShift();
    completePersistentShift();
    const once = gameState.lifetimeDeliveries === initialLifetime + 7;
    for (let index = 0; index < 12; index++) {
      resetGame(false);
      gameState.score = index * 100;
      completePersistentShift();
    }
    renderRunHistory();
    const history = courierDB.data.history;
    const sorted = history.every((row, index) => index === 0 || row.score <= history[index - 1].score);
    const table = document.querySelectorAll('.run-history-table tbody tr').length;
    resetGame(false);
    return { once, count: history.length, sorted, table };
  });
  assert.deepEqual(result, { once: true, count: 10, sorted: true, table: 10 });
  console.log('PASS refresh recovery, checkpoint inventory/timers/route/damage, countdown, idempotent completion, top-ten local history');
};
