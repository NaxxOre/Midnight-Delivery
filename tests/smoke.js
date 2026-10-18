const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

exports.run = async root => {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
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
  const executablePath = process.env.BROWSER_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(filename => fs.existsSync(filename));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const soakSeconds = Number(process.argv.find(argument => argument.startsWith('--soak='))?.split('=')[1] || 0);
    for (const [entry, width, height] of [['/', 1280, 720], ['/midnight_delivery.html', 360, 640]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && message.text().includes('[Midnight Delivery]')) errors.push(message.text()); });
      await page.addInitScript(() => {
        window.missingDomIds = new Set();
        const original = Document.prototype.getElementById;
        Document.prototype.getElementById = function(identifier) {
          const result = original.call(this, identifier);
          if (!result && document.readyState !== 'loading') window.missingDomIds.add(identifier);
          return result;
        };
      });
      await page.goto(`http://127.0.0.1:${server.address().port}${entry}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof isLoopStarted !== 'undefined' && isLoopStarted && getComputedStyle(document.getElementById('loading-overlay')).display === 'none');
      await page.evaluate(() => {
        for (const identifier of ['modal-settings', 'modal-leaderboard', 'modal-hall', 'modal-tuning', 'modal-contracts']) {
          const modal = document.getElementById(identifier);
          if (modal) { openModal(identifier); closeModal(identifier); }
        }
        gameState.tutorialCompletedOnce = true;
      });
      await page.locator('#btn-start-play').click();
      await require('./mechanics.js').verify(page);
      await page.evaluate(() => {
        window.smokeFrames = [];
        let previous = performance.now();
        const renderOriginal = renderer.render.bind(renderer);
        renderer.render = (...args) => {
          const current = performance.now();
          if (window.smokeFrames.length < 100000) window.smokeFrames.push(current - previous);
          previous = current;
          return renderOriginal(...args);
        };
        window.smokeDriver = setInterval(() => {
          gameState.immortalTimer = 1000;
          gameState.hearts = 3;
          const events = cargoRoadEvents.filter(event => !event.passed).sort((first, second) => second.mesh.position.z - first.mesh.position.z);
          if (events[0]) {
            const lane = events[0].type === 'bridge' ? events[0].safeLaneIndex : events[0].laneIndex;
            if (Number.isInteger(lane) && lane !== gameState.laneIndex) moveLane(Math.sign(lane - gameState.laneIndex));
          }
          const target = findTargetApartment();
          if (target && gameState.roofCrates > 1) {
            const slot = gameState.handSlots.indexOf(target.wantedType);
            if (slot >= 0) throwFromSlot(slot);
          }
        }, 600);
      });
      const duration = soakSeconds || 6;
      let previousDistance = 0;
      const memory = [];
      for (let elapsed = 0; elapsed < duration; elapsed += 5) {
        await page.waitForTimeout(Math.min(5, duration - elapsed) * 1000);
        const snapshot = await page.evaluate(() => {
          let invalid = 0;
          scene.traverse(object => { if (![object.position.x, object.position.y, object.position.z].every(Number.isFinite)) invalid++; });
          return { mode: gameState.mode, distance: gameState.distanceMeters, invalid, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, voices: soundFX.activeVoices.size, particles: particles.length, cards: document.querySelectorAll('.parcel-card-slot').length, overflow: document.documentElement.scrollWidth > innerWidth, missing: [...window.missingDomIds] };
        });
        assert.equal(snapshot.mode, 'playing');
        assert.ok(snapshot.distance > previousDistance);
        assert.equal(snapshot.invalid, 0);
        assert.ok(snapshot.voices <= 32 && snapshot.particles <= 256);
        assert.equal(snapshot.cards, 3);
        assert.equal(snapshot.overflow, false);
        assert.deepEqual(snapshot.missing, []);
        assert.deepEqual(errors, []);
        previousDistance = snapshot.distance;
        memory.push(snapshot);
        if (soakSeconds && (elapsed + 5) % 30 === 0) console.log(`SOAK ${entry} ${elapsed + 5}s ${JSON.stringify(snapshot)}`);
      }
      const frameStats = await page.evaluate(() => {
        const frames = window.smokeFrames.slice(30).sort((first, second) => first - second);
        return { fps: Math.round(1000 / (frames.reduce((sum, value) => sum + value, 0) / frames.length)), p95: Number(frames[Math.floor(frames.length * 0.95)].toFixed(1)) };
      });
      assert.ok(frameStats.fps >= Number(process.env.MIN_FPS || 55), `Frame rate below target: ${JSON.stringify(frameStats)}`);
      fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
      fs.writeFileSync(path.join(root, `test-results/${width}.json`), JSON.stringify({ duration, frameStats, memory, errors }, null, 2));
      await page.screenshot({ path: path.join(root, `test-results/${width}.png`) });
      console.log(`PASS browser ${entry} ${width}x${height}: ${duration}s, ${frameStats.fps} FPS, p95 ${frameStats.p95}ms, no boot/runtime/DOM errors`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
};
