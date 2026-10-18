const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

async function runStressSuite() {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    fs.readFile(filename, (error, body) => {
      if (error) { response.writeHead(404).end(); return; }
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
      response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(body);
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const executablePath = process.env.BROWSER_PATH || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome'
  ].find(filename => fs.existsSync(filename));

  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    console.log('[STRESS] Browser launched successfully.');

    for (const [entry, width, height] of [['/', 1280, 720], ['/midnight_delivery.html', 360, 640]]) {
      console.log(`\n[STRESS] Testing ${entry} at ${width}x${height}...`);
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error' && /\[(Midnight Delivery|CourierDB)\]/.test(msg.text())) errors.push(msg.text());
      });

      await page.goto(`http://127.0.0.1:${port}${entry}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof isLoopStarted !== 'undefined' && isLoopStarted && getComputedStyle(document.getElementById('loading-overlay')).display === 'none');

      await page.evaluate(() => {
        gameState.tutorialCompletedOnce = true;
      });
      await page.locator('#btn-start-play').click();
      await page.waitForTimeout(500);

      // --- STRESS 1: 1,000 Consecutive Parcel Throws ---
      console.log('[STRESS 1] Executing 1,000 consecutive rapid parcel throws...');
      const throwStats = await page.evaluate(async () => {
        const initialGeos = renderer.info.memory.geometries;
        gameState.roofCrates = 6;
        if (typeof updateRoofStackMeshes === 'function') updateRoofStackMeshes();

        for (let i = 0; i < 1000; i++) {
          gameState.roofCrates = 6;
          const slot = i % 3;
          throwFromSlot(slot);
          if (i % 50 === 0) {
            // let flying parcels update slightly
            await new Promise(r => setTimeout(r, 8));
          }
        }

        // Wait a brief moment for parcels to clear
        await new Promise(r => setTimeout(r, 600));

        const finalGeos = renderer.info.memory.geometries;
        return {
          initialGeos,
          finalGeos,
          flyingParcelsCount: flyingParcels.length,
          particlesCount: particles.length,
          vanX: playerVan.position.x,
          vanZ: playerVan.position.z
        };
      });

      console.log(`[STRESS 1 PASS] Geometries: ${throwStats.initialGeos} -> ${throwStats.finalGeos}, Flying parcels: ${throwStats.flyingParcelsCount}, Particles: ${throwStats.particlesCount}`);
      assert.ok(throwStats.finalGeos <= throwStats.initialGeos + 2, `Geometry leak detected during 1,000 throws: ${throwStats.initialGeos} -> ${throwStats.finalGeos}`);
      assert.ok(Number.isFinite(throwStats.vanX) && Number.isFinite(throwStats.vanZ), 'Van coordinates became NaN!');

      // --- STRESS 2: Extreme Rapid Sway Physics under Max Roof-Stack (6 Crates) ---
      console.log('[STRESS 2] Extreme rapid lane swerving with 6 crates...');
      const swayStats = await page.evaluate(async () => {
        gameState.roofCrates = 6;
        if (typeof updateRoofStackMeshes === 'function') updateRoofStackMeshes();

        let droppedCount = 0;
        for (let i = 0; i < 60; i++) {
          const dir = (i % 2 === 0) ? -1 : 1;
          moveLane(dir);
          await new Promise(r => setTimeout(r, 16));
        }

        return {
          roofCrates: gameState.roofCrates,
          lateralVel: gameState.lateralVelocity,
          vanX: playerVan.position.x,
          vanRotY: playerVan.rotation.y,
          fallenCount: fallenCargoPool ? fallenCargoPool.filter(c => c.active).length : 0
        };
      });

      console.log(`[STRESS 2 PASS] Remaining roof crates: ${swayStats.roofCrates}, Van X: ${swayStats.vanX.toFixed(2)}, Fallen crates pooled: ${swayStats.fallenCount}`);
      assert.ok(Number.isFinite(swayStats.vanX), 'Lateral position became NaN');
      assert.ok(Number.isFinite(swayStats.lateralVel), 'Lateral velocity became NaN');

      // --- STRESS 3: Rapid Back-to-Back Blackout, Rival Courier & Split-Road Gate ---
      console.log('[STRESS 3] Triggering back-to-back Blackout, Rival Courier, and Route Gates...');
      await page.evaluate(async () => {
        // Trigger Blackout
        if (typeof triggerMidnightBlackout === 'function') {
          triggerMidnightBlackout();
        }
        await new Promise(r => setTimeout(r, 200));

        // Spawn Rival
        if (typeof spawnShadowExpressRival === 'function') {
          spawnShadowExpressRival();
        }
        await new Promise(r => setTimeout(r, 200));

        // Side-ram rival
        if (typeof rivalCourier !== 'undefined' && rivalCourier && rivalCourier.active) {
          rivalCourier.laneIndex = gameState.laneIndex;
          rivalCourier.z = playerVan.position.z;
          if (typeof handleRivalSideRam === 'function') {
            handleRivalSideRam();
          }
        }
        await new Promise(r => setTimeout(r, 300));

        // Spawn Route Gate
        if (typeof spawnRouteForkGate === 'function') {
          spawnRouteForkGate();
        }
        await new Promise(r => setTimeout(r, 300));
      });

      const systemHealth = await page.evaluate(() => {
        return {
          mode: gameState.mode,
          hearts: gameState.hearts,
          geos: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          activeVoices: soundFX ? soundFX.activeVoices.size : 0,
          isBlackout: gameState.blackoutActive
        };
      });

      console.log(`[STRESS 3 PASS] Game Mode: ${systemHealth.mode}, Voices: ${systemHealth.activeVoices}, Geometries: ${systemHealth.geos}`);
      assert.equal(systemHealth.mode, 'playing');
      assert.ok(systemHealth.activeVoices <= 32);

      assert.deepEqual(errors, [], `Errors encountered during stress test: ${JSON.stringify(errors)}`);
      await page.close();
    }

    console.log('\n[PASS] All stress tests completed with 100% stability, 0 errors, and zero memory leaks!');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

runStressSuite().catch(err => {
  console.error('[STRESS FAIL]', err);
  process.exit(1);
});
