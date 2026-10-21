const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

exports.verify = async (page, root, width, height) => {
  await page.evaluate(() => {
    gameState.mode = 'paused';
    gameState.entranceTimer = 0;
    gameState.vanZ = -5.4;
    playerVan.position.set(LANES[2], 0, -5.4);
    gameState.score = 123456789;
    gameState.coins = 987654321;
    updateHUD();
    showActionToast('NEAR MISS', 'bonus');
    showActionToast('⚡ POWER GRID BLACKOUT ZONE • 25s', 'info');
  });
  await page.waitForTimeout(100);
  const layout = await page.evaluate(() => {
    const rectangle = element => element.getBoundingClientRect().toJSON();
    const bodyBottom = new THREE.Vector3(playerVan.position.x, 0, playerVan.position.z + 2.6).project(camera);
    return { dock: rectangle(document.getElementById('parcel-dock')), cards: [...document.querySelectorAll('.parcel-card-slot')].map(rectangle), metrics: [...document.querySelectorAll('.hud-stat')].map(rectangle), hearts: rectangle(document.getElementById('armor-boxes')), toast: rectangle(document.getElementById('action-toast')), toastCount: document.querySelectorAll('#action-toast').length, toastText: document.getElementById('action-toast').textContent, clipped: [...document.querySelectorAll('.hud-stat strong')].some(element => element.scrollWidth > element.clientWidth + 1), vanBottom: (-bodyBottom.y * 0.5 + 0.5) * innerHeight, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.equal(await page.locator('#hud-score-card').isVisible(), true);
  assert.equal(layout.cards.length, 3);
  assert.ok(layout.cards.every(card => Math.abs(card.top - layout.cards[0].top) < 1));
  assert.ok(Math.abs((layout.dock.left + layout.dock.right) / 2 - width / 2) < 1);
  assert.ok(Math.abs(height - layout.dock.bottom - 12) < 1);
  assert.ok(layout.vanBottom < layout.dock.top, `Van overlaps dock: ${JSON.stringify(layout)}`);
  assert.ok(layout.metrics.every((metric, index) => !index || metric.top >= layout.metrics[index - 1].bottom));
  assert.ok(layout.hearts.top >= layout.metrics.at(-1).bottom);
  assert.equal(layout.toastCount, 1);
  assert.ok(layout.toastText.includes('BLACKOUT') && !layout.toastText.includes('NEAR MISS'));
  assert.ok(layout.metrics[0].left >= 15 && layout.metrics[0].top >= 15);
  assert.ok(layout.toast.left > layout.metrics[0].right || layout.toast.top > layout.metrics[0].bottom || layout.toast.bottom < layout.metrics[0].top);
  assert.equal(layout.clipped, false);
  assert.equal(layout.overflow, false);
  fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  await page.screenshot({ path: path.join(root, `test-results/hud-${width}.png`) });
  const modalIds = await page.locator('[id^="modal-"].fixed').evaluateAll(elements => elements.map(element => element.id));
  modalIds.push('gameover-modal');
  for (const identifier of modalIds) {
    await page.evaluate(identifier => {
      if (identifier === 'modal-tuning') renderTuningModal();
      if (identifier === 'modal-contracts') renderContractsModal();
      if (identifier === 'modal-hall') renderHallOfFameModal();
      if (identifier === 'modal-leaderboard') renderLeaderboardModal();
      openModal(identifier);
    }, identifier);
    const panel = page.locator(`#${identifier} > .arcade-panel`);
    const bounds = await panel.boundingBox();
    assert.ok(bounds && bounds.x >= -1 && bounds.y >= -1 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1, `${identifier} clipped`);
    assert.equal(await panel.evaluate(element => element.scrollWidth > element.clientWidth + 1), false, `${identifier} horizontal overflow`);
    assert.equal(await page.locator('#hud-score-card').isVisible(), false);
    if (identifier === 'modal-settings') {
      await page.locator('#setting-callsign').fill('QWE Test Courier');
      await page.locator('#setting-callsign').press('Tab');
      assert.equal(await page.evaluate(() => gameState.callsign), 'QWE Test Courier');
      await page.locator('#setting-import-save').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(root, `test-results/settings-${width}.png`) });
    }
    await page.evaluate(identifier => closeModal(identifier), identifier);
  }
  await page.evaluate(() => { startInteractiveTutorial(); gameState.mode = 'paused'; });
  const tutorial = await page.locator('#tutorial-card').boundingBox();
  assert.ok(tutorial.x >= 0 && tutorial.x + tutorial.width <= width);
  assert.ok(Math.abs(tutorial.x + tutorial.width / 2 - width / 2) < 1);
  if (width <= 640) assert.ok(tutorial.y > layout.hearts.bottom);
  await page.locator('#btn-skip-tutorial').click();
  await page.evaluate(() => resetGame(false));
  console.log(`PASS layout ${width}x${height}: horizontal dock, van clearance, spaced metrics, one toast, all ${modalIds.length} modals, editable callsign and centered tutorial`);
};
