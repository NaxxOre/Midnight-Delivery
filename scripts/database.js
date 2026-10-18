class CourierDB {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.key = 'midnight_courier_db_v1';
    this.warning = '';
    this.data = this.validate({ version: 1, profile: {}, history: [], session: null });
    this.load();
  }

  number(value, fallback = 0, maximum = 1000000000, minimum = 0) {
    if (value === undefined) return fallback;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) throw new Error('Save contains an invalid number');
    return value;
  }

  object(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Save contains an invalid record');
    return value;
  }

  profile(source) {
    this.object(source);
    const list = (value, fallback, allowed) => {
      if (value === undefined) return fallback;
      if (!Array.isArray(value) || value.length > 100) throw new Error('Save contains an invalid unlock list');
      return [...new Set([...fallback, ...value.filter(entry => allowed.includes(entry))])];
    };
    const ownedVans = list(source.ownedVans, ['classic'], PLAYABLE_VANS.map(van => van.id));
    const vanTuning = {};
    if (source.vanTuning !== undefined) this.object(source.vanTuning);
    for (const van of PLAYABLE_VANS) {
      const levels = source.vanTuning?.[van.id] || {};
      this.object(levels);
      vanTuning[van.id] = {};
      for (const stat of Object.keys(TUNING_STAT_SPECS)) vanTuning[van.id][stat] = Math.trunc(this.number(levels[stat], 1, 5, 1));
    }
    if (source.callsign !== undefined && (typeof source.callsign !== 'string' || source.callsign.length > 24)) throw new Error('Callsign must be text up to 24 characters');
    const profile = {
      callsign: (source.callsign || 'Courier').replace(/[<>\u0000-\u001f]/g, '').trim() || 'Courier',
      ownedVans, vanTuning,
      equippedVanId: ownedVans.includes(source.equippedVanId) ? source.equippedVanId : 'classic',
      unlockedItems: list(source.unlockedItems, [0, 2, 6], PARCEL_TYPES.map(parcel => parcel.id)),
      unlockedChars: list(source.unlockedChars, ['goblin', 'inlechef'], CHARACTER_TYPES.map(character => character.id)),
      tutorialCompletedOnce: source.tutorialCompletedOnce === true,
      courierRankLevel: Math.trunc(this.number(source.courierRankLevel, 1, COURIER_RANKS.length, 1)),
      shiftContracts: []
    };
    for (const field of ['coins', 'highScore', 'bestDistance', 'bestDeliveries', 'courierXP', 'lifetimeDeliveries']) profile[field] = this.number(source[field], field === 'coins' ? 250 : 0);
    if (source.shiftContracts !== undefined && !Array.isArray(source.shiftContracts)) throw new Error('Invalid contract list');
    for (const saved of (source.shiftContracts || []).slice(0, 3)) {
      this.object(saved);
      const template = CONTRACT_TEMPLATES.find(contract => contract.id === saved.id);
      if (!template) continue;
      profile.shiftContracts.push({ ...template, current: this.number(saved.current), completed: saved.completed === true, claimed: saved.claimed === true });
    }
    return profile;
  }

  session(source) {
    if (source === null || source === undefined) return null;
    this.object(source);
    if (typeof source.id !== 'string' || source.id.length > 80 || !Number.isFinite(Date.parse(source.startedAt))) throw new Error('Invalid shift identifier');
    const result = { id: source.id, startedAt: source.startedAt, savedAt: this.number(source.savedAt, 0, 8640000000000000), state: {}, night: {}, route: {}, rival: {}, cargo: [], repairs: [], customers: [] };
    const state = this.object(source.state);
    const limits = { score: 1e9, coins: 1e9, deliveries: 1e7, runCoinsEarned: 1e9, combo: 8, hearts: 5, laneIndex: 3, roofCrates: 6, maxRoofStack: 6, distanceMeters: 1e9, cityIndex: CITY_THEMES.length - 1, timeIndex: TIME_PRESETS.length - 1, weatherIndex: WEATHER_MODES.length - 1, overdriveMeter: 100, overdriveTimer: 7, nextSupplyDistance: 1e9, nextOverpassDistance: 1e9, nextGateDistance: 1e9, slowMoEnergy: 30, droneAssistTimer: 30, coinMagnetTimer: 30 };
    for (const [field, maximum] of Object.entries(limits)) result.state[field] = this.number(state[field], 0, maximum);
    for (const field of ['laneIndex', 'roofCrates', 'maxRoofStack', 'cityIndex', 'timeIndex', 'weatherIndex', 'hearts']) if (!Number.isInteger(result.state[field])) throw new Error('Invalid discrete shift value');
    if (result.state.hearts < 1) throw new Error('Cannot resume an ended shift');
    result.state.hearts = Math.min(gameState.maxHearts, result.state.hearts);
    result.state.overdriveActive = state.overdriveActive === true;
    result.state.shieldBumperActive = state.shieldBumperActive === true;
    if (!Array.isArray(state.handSlots) || state.handSlots.length !== 3 || !state.handSlots.every(slot => Number.isInteger(slot) && PARCEL_TYPES[slot])) throw new Error('Invalid parcel dock');
    result.state.handSlots = [...state.handSlots];
    result.state.handModifiers = [0, 1, 2].map(index => {
      const modifier = state.handModifiers?.[index];
      if (!modifier) return null;
      if (!['hot', 'fragile'].includes(modifier.type)) throw new Error('Invalid parcel modifier');
      return { type: modifier.type, timer: this.number(modifier.timer, 0, 10), maxTime: 8, cracked: modifier.cracked === true };
    });
    if (!PLAYABLE_VANS.some(van => van.id === source.vanId)) throw new Error('Unknown shift van');
    result.vanId = source.vanId;
    const bounded = (input, specs) => {
      this.object(input);
      return Object.fromEntries(Object.entries(specs).map(([field, maximum]) => [field, this.number(input[field], 0, maximum)]));
    };
    result.night = { ...bounded(source.night, { remaining: 25, nextDistance: 1e9, nextRepair: 1e9, blend: 1, elapsed: 1e9 }), damaged: source.night.damaged === true };
    result.route = { ...bounded(source.route, { remaining: 20, nextDistance: 1e9 }), kind: ['normal', 'safe', 'express'].includes(source.route.kind) ? source.route.kind : 'normal', gateActive: source.route.gateActive === true, gateZ: this.number(source.route.gateZ, -160, 100, -300) };
    result.rival = { ...bounded(source.rival, { elapsed: 1e9, nextAt: 1e9, remaining: 20, stun: 4, lane: 3 }), active: source.rival.active === true, rewardedRam: source.rival.rewardedRam === true };
    for (const [field, maximum] of [['cargo', 3], ['repairs', 3], ['customers', 20]]) {
      if (!Array.isArray(source[field]) || source[field].length > maximum) throw new Error(`Invalid ${field} snapshot`);
      result[field] = source[field].map(record => {
        this.object(record);
        if (field === 'customers') {
          const index = this.number(record.index, 0, 19);
          const wantedType = this.number(record.wantedType, 0, PARCEL_TYPES.length - 1);
          if (!Number.isInteger(index) || !Number.isInteger(wantedType)) throw new Error('Invalid customer');
          return { index, wantedType, position: this.number(record.position, 0, 100, -400), hasOrder: record.hasOrder === true, delivered: record.delivered === true, isVip: record.isVip === true, vipDelivered: this.number(record.vipDelivered, 0, 1), characterId: CHARACTER_TYPES.some(character => character.id === record.characterId) ? record.characterId : 'goblin' };
        }
        const lane = this.number(record.lane, 0, 3);
        if (!Number.isInteger(lane)) throw new Error('Invalid road lane');
        return { type: record.type === 'bridge' ? 'bridge' : 'supply', lane, position: this.number(record.position, -150, 100, -300), passed: record.passed === true };
      });
    }
    return result;
  }

  validate(source) {
    this.object(source);
    if (source.version !== 1) throw new Error('Unsupported save version');
    if (!Array.isArray(source.history) || source.history.length > 10) throw new Error('History must contain at most ten runs');
    const history = source.history.map(record => {
      this.object(record);
      if (typeof record.id !== 'string' || record.id.length > 80 || !Number.isFinite(Date.parse(record.date))) throw new Error('Invalid run history');
      return { id: record.id, date: record.date, district: CITY_THEMES.some(city => city.id === record.district) ? record.district : CITY_THEMES[0].id, van: PLAYABLE_VANS.some(van => van.id === record.van) ? record.van : 'classic', score: this.number(record.score), parcels: this.number(record.parcels), distance: this.number(record.distance), maxRoofStack: this.number(record.maxRoofStack, 0, 6) };
    }).sort((first, second) => second.score - first.score);
    return { version: 1, profile: this.profile(source.profile), history, session: this.session(source.session) };
  }

  load() {
    try {
      for (const key of [this.key, `${this.key}_backup`]) {
        const raw = this.storage?.getItem(key);
        if (!raw) continue;
        try { this.data = this.validate(JSON.parse(raw)); return; } catch (error) { this.warning = 'A damaged save was ignored. A backup or defaults were loaded.'; }
      }
      const legacy = this.storage?.getItem(SAVE_KEY);
      if (legacy) this.data.profile = this.profile(JSON.parse(legacy));
    } catch (error) { this.warning = 'Local saves are unavailable or invalid. Export a backup before closing.'; }
  }

  commit(data) {
    const validated = this.validate(data);
    const previous = JSON.stringify(this.data);
    this.data = validated;
    try {
      if (!this.storage) throw new Error('Local storage unavailable');
      this.storage.setItem(`${this.key}_backup`, previous);
      this.storage.setItem(this.key, JSON.stringify(validated));
      this.warning = '';
      return true;
    } catch (error) {
      this.warning = 'Save could not be written. Export a JSON backup before closing.';
      return false;
    }
  }

  exportJSON() { return JSON.stringify(this.data, null, 2); }
  importJSON(text) {
    if (typeof text !== 'string' || text.length > 1000000) throw new Error('Save file is too large');
    const data = this.validate(JSON.parse(text));
    const previous = this.data;
    if (!this.commit(data)) { this.data = previous; throw new Error(this.warning); }
  }
}

let courierStorage = null;
try { courierStorage = window.localStorage; } catch (error) { console.warn('Local storage is unavailable', error); }
const courierDB = new CourierDB(courierStorage);
const courierRun = { id: null, startedAt: null, completed: true, saveTimer: 0, restoring: false };

function saveCourierProfile() {
  const profile = courierDB.profile(gameState);
  courierDB.commit({ ...courierDB.data, profile });
}

function beginPersistentShift() {
  courierRun.id = window.crypto?.randomUUID ? crypto.randomUUID() : `shift-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  courierRun.startedAt = new Date().toISOString();
  courierRun.completed = false;
  courierRun.saveTimer = 0;
  gameState.maxRoofStack = gameState.roofCrates;
  if (!courierRun.restoring) saveActiveShift();
}

function saveActiveShift() {
  if (!courierRun.id || courierRun.completed || !['playing', 'paused', 'countdown'].includes(gameState.mode) || gameState.hearts <= 0) return;
  const fields = ['score', 'coins', 'deliveries', 'runCoinsEarned', 'combo', 'hearts', 'laneIndex', 'roofCrates', 'maxRoofStack', 'distanceMeters', 'cityIndex', 'timeIndex', 'weatherIndex', 'overdriveMeter', 'overdriveTimer', 'overdriveActive', 'nextSupplyDistance', 'nextOverpassDistance', 'nextGateDistance', 'slowMoEnergy', 'droneAssistTimer', 'coinMagnetTimer', 'shieldBumperActive', 'handSlots', 'handModifiers'];
  const state = Object.fromEntries(fields.map(field => [field, gameState[field]]));
  state.roofCrates = Math.min(6, state.roofCrates + flyingParcels.length);
  const session = {
    id: courierRun.id, startedAt: courierRun.startedAt, savedAt: Date.now(), vanId: gameState.equippedVanId, state,
    night: { ...nightState }, route: { ...routeState, gateZ: routeGate.position.z },
    rival: { elapsed: rivalState.elapsed, nextAt: rivalState.nextAt, remaining: Math.max(0, rivalState.remaining), stun: rivalState.stun, lane: rivalState.lane, active: rivalState.active, rewardedRam: rivalState.rewardedRam },
    cargo: cargoRoadEvents.map(event => ({ type: event.type, lane: event.type === 'bridge' ? event.safeLaneIndex : event.laneIndex, position: event.mesh.position.z, passed: event.passed })),
    repairs: repairPads.map(pad => ({ lane: pad.laneIndex, position: pad.mesh.position.z, passed: pad.passed })),
    customers: apartments.map(apartment => ({ index: apartment.index, wantedType: apartment.wantedType, position: apartment.group.position.z, hasOrder: apartment.hasOrder, delivered: apartment.delivered, isVip: apartment.isVip, vipDelivered: apartment.vipDelivered || 0, characterId: apartment.character.id }))
  };
  try { courierDB.commit({ ...courierDB.data, profile: courierDB.profile(gameState), session }); }
  catch (error) { console.error('[CourierDB] Checkpoint validation failed', error); }
}

function completePersistentShift() {
  if (!courierRun.id || courierRun.completed || courierRun.restoring) return;
  courierRun.completed = true;
  gameState.highScore = Math.max(gameState.highScore || 0, gameState.score);
  gameState.lifetimeDeliveries = (gameState.lifetimeDeliveries || 0) + gameState.deliveries;
  const record = { id: courierRun.id, date: new Date().toISOString(), district: CITY_THEMES[gameState.cityIndex].id, van: gameState.equippedVanId, score: gameState.score, parcels: gameState.deliveries, distance: gameState.distanceMeters, maxRoofStack: gameState.maxRoofStack || 3 };
  const history = [record, ...courierDB.data.history.filter(run => run.id !== record.id)].sort((first, second) => second.score - first.score).slice(0, 10);
  courierDB.commit({ version: 1, profile: courierDB.profile(gameState), history, session: null });
}

function updateCourierPersistence(dt) {
  if (gameState.mode !== 'playing') return;
  gameState.maxRoofStack = Math.max(gameState.maxRoofStack || 0, gameState.roofCrates);
  courierRun.saveTimer += dt;
  if (courierRun.saveTimer >= 5) { courierRun.saveTimer = 0; saveActiveShift(); }
}

function resumePersistentShift() {
  const session = courierDB.session(courierDB.data.session);
  if (!session) return;
  courierRun.restoring = true;
  gameState.equippedVanId = session.vanId;
  gameState.tutorialCompletedOnce = true;
  try {
    resetGame(false);
    Object.assign(gameState, session.state);
    Object.assign(courierRun, { id: session.id, startedAt: session.startedAt, completed: false, saveTimer: 0 });
    gameState.currentX = LANES[gameState.laneIndex];
    gameState.vanZ = -5.4;
    gameState.entranceTimer = 0;
    gameState.invulnerableTimer = 2;
    playerVan.position.set(gameState.currentX, 0, gameState.vanZ);
    transformAllApartmentsToCity(CITY_THEMES[gameState.cityIndex]);
    applyTimeOfDay(gameState.timeIndex, true);
    applyWeatherMode(gameState.weatherIndex);
    Object.assign(nightState, session.night);
    Object.assign(routeState, session.route);
    routeGate.position.z = session.route.gateZ;
    routeGate.visible = routeState.gateActive;
    Object.assign(rivalState, session.rival);
    rivalMesh.visible = rivalState.active;
    rivalMesh.position.set(LANES[rivalState.lane], 0, playerVan.position.z - 1);
    for (const event of cargoRoadEvents) cargoRoadGroup.remove(event.mesh);
    cargoRoadEvents.length = 0;
    for (const record of session.cargo) {
      const event = record.type === 'bridge' ? spawnCargoOverpass(record.lane, record.position) : spawnSupplyDepot(record.lane, record.position);
      if (event) event.passed = record.passed;
    }
    for (const record of session.repairs) { const pad = spawnRepairPad(record.lane, record.position); if (pad) pad.passed = record.passed; }
    for (const record of session.customers) {
      const apartment = apartments[record.index];
      apartment.group.position.z = record.position;
      apartment.customerSlot.clear();
      Object.assign(apartment, { hasOrder: record.hasOrder, delivered: record.delivered, wantedType: record.wantedType, isVip: record.isVip, vipDelivered: record.vipDelivered, vipNeeded: record.isVip ? 2 : 1, orderId: ++globalOrderCounter, character: CHARACTER_TYPES.find(character => character.id === record.characterId), charMesh: null });
      if (record.hasOrder) {
        apartment.charMesh = createVoxelCharacter(record.characterId, 0.96);
        apartment.customerSlot.add(apartment.charMesh);
        if (record.isVip) { apartment.crownMesh = createVoxelCrownMesh(); apartment.customerSlot.add(apartment.crownMesh); }
      }
      apartment.cloudEl.dataset.renderKey = '';
    }
    syncRoofCargo();
    renderBottomParcelHandUI();
    updateHUD();
    document.getElementById('resume-shift-panel').hidden = true;
    gameState.mode = 'paused';
    resumeShiftWithCountdown();
  } finally { courierRun.restoring = false; }
}

function renderRunHistory(sortBy = 'score') {
  const list = document.getElementById('leaderboard-list');
  list.replaceChildren();
  const history = [...courierDB.data.history].sort((first, second) => sortBy === 'distance' ? second.distance - first.distance : sortBy === 'delivered' ? second.parcels - first.parcels : second.score - first.score);
  if (!history.length) { list.textContent = 'Complete a shift to record your first local run.'; return; }
  const table = document.createElement('table');
  table.className = 'run-history-table';
  const heading = table.createTHead().insertRow();
  for (const label of ['Date', 'District / Van', 'Score', 'Parcels', 'Roof']) { const cell = document.createElement('th'); cell.textContent = label; heading.appendChild(cell); }
  const body = table.createTBody();
  for (const run of history) {
    const row = body.insertRow();
    for (const value of [new Date(run.date).toLocaleDateString(), `${run.district} / ${run.van}`, Math.round(run.score).toLocaleString(), run.parcels, run.maxRoofStack]) row.insertCell().textContent = String(value);
  }
  list.appendChild(table);
}

function initializeCourierUI() {
  const status = document.getElementById('save-status');
  const callsign = document.getElementById('setting-callsign');
  callsign.value = gameState.callsign || 'Courier';
  status.textContent = courierDB.warning || 'Progress is stored on this device. Export a backup to keep it safe.';
  callsign.addEventListener('change', () => { gameState.callsign = callsign.value.slice(0, 24); saveProgression(); callsign.value = courierDB.data.profile.callsign; });
  document.getElementById('setting-export-save').addEventListener('click', () => {
    saveProgression();
    const url = URL.createObjectURL(new Blob([courierDB.exportJSON()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'midnight-delivery-save.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('setting-import-save').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Save file is too large');
      courierDB.importJSON(await file.text());
      initSavedProgression();
      updateHomeGarageUI();
      callsign.value = gameState.callsign;
      status.textContent = 'Save imported successfully.';
      document.getElementById('resume-shift-panel').hidden = !courierDB.data.session;
    } catch (error) { status.textContent = `Import rejected: ${error.message}`; }
    event.target.value = '';
  });
  document.getElementById('resume-shift-panel').hidden = !courierDB.data.session;
  document.getElementById('btn-resume-shift').addEventListener('click', resumePersistentShift);
  document.getElementById('btn-discard-shift').addEventListener('click', () => { courierDB.commit({ ...courierDB.data, session: null }); document.getElementById('resume-shift-panel').hidden = true; });
  window.addEventListener('pagehide', saveActiveShift);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveActiveShift(); });
}
