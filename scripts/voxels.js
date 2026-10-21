    const matCache = {};
    function getMat(colorHex, opts = {}) {
      const key = `${colorHex}_${opts.emissive || 0}_${opts.emissiveIntensity || 0}_${opts.opacity ?? 1}_${opts.roughness ?? 0.5}_${opts.metalness ?? 0.08}`;
      if (!matCache[key]) {
        matCache[key] = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: opts.roughness !== undefined ? opts.roughness : 0.5,
          metalness: opts.metalness !== undefined ? opts.metalness : 0.08,
          emissive: opts.emissive || 0x000000,
          emissiveIntensity: opts.emissiveIntensity || 0,
          transparent: opts.opacity !== undefined,
          opacity: opts.opacity ?? 1.0
        });
      }
      return matCache[key];
    }

    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const trafficBlinkerMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    function addVoxelBox(parent, sx, sy, sz, px, py, pz, colorHex, opts = {}) {
      const mesh = new THREE.Mesh(unitBoxGeo, getMat(colorHex, opts));
      mesh.scale.set(sx, sy, sz);
      mesh.position.set(px, py, pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function batchStaticVoxelBoxes(group) {
      const materialGroups = new Map();
      group.children.forEach(child => {
        if (!child.isMesh || child.geometry !== unitBoxGeo || child.children.length > 0) return;
        if (!materialGroups.has(child.material)) materialGroups.set(child.material, []);
        materialGroups.get(child.material).push(child);
      });
      materialGroups.forEach((meshes, material) => {
        if (meshes.length < 2) return;
        const batch = new THREE.InstancedMesh(unitBoxGeo, material, meshes.length);
        batch.castShadow = true;
        batch.receiveShadow = true;
        batch.frustumCulled = false;
        meshes.forEach((mesh, index) => {
          mesh.updateMatrix();
          batch.setMatrixAt(index, mesh.matrix);
          group.remove(mesh);
        });
        batch.instanceMatrix.needsUpdate = true;
        group.add(batch);
      });
    }

    // Native Script 3D Signboard Generator for Authentic Local Shops & Stalls
    const signTexCache = {};
    const signGeoCache = {};
    const signMatCache = {};
    function createNativeSignboardMesh(topText, bottomText, bgHex, fgHex, w, h, d) {
      const key = `${topText}_${bottomText}_${bgHex}_${fgHex}`;
      if (!signTexCache[key]) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = fgHex;
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 244, 116);
        ctx.fillStyle = fgHex;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(topText, 128, 46);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(bottomText, 128, 96);
        signTexCache[key] = new THREE.CanvasTexture(c);
      }
      const geoKey = `${w}_${h}_${d}`;
      if (!signGeoCache[geoKey]) {
        signGeoCache[geoKey] = new THREE.BoxGeometry(w, h, d);
      }
      if (!signMatCache[key]) {
        signMatCache[key] = new THREE.MeshBasicMaterial({ map: signTexCache[key] });
      }
      return new THREE.Mesh(signGeoCache[geoKey], signMatCache[key]);
    }

    // ============================================================================
    // 3. THREE.JS SCENE & CAMERA POSITIONING VAN AT ~35% UP FROM BOTTOM
    // ============================================================================
    const canvas = document.getElementById('game-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x6bf2c6);
    scene.fog = new THREE.FogExp2(0x162447, 0.0016);

    const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.5, 310);
    // Horizon Chase-Cam Perspective matching Reference Images 1 & 2 (Sky visible at top, buildings framing street, full van above bar)
    const PLAY_CAM_POS = new THREE.Vector3(0, 9.2, 12.2);
    const PLAY_CAM_LOOK = new THREE.Vector3(0, 2.3, -42.0);
    const SHOWROOM_CAM_POS = new THREE.Vector3(5.8, 2.3, -7.2);
    const SHOWROOM_CAM_LOOK = new THREE.Vector3(0, 1.15, -0.2);

    function updateCameraForViewport() {
      const w = window.innerWidth || 375;
      const h = window.innerHeight || 667;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.userData.gameplayFov = aspect < 0.65 ? 58 : 55;

      if (aspect < 0.65) {
        // Tall Portrait Mobile (Matches Screenshots 1 & 2: sky at top, full van centered above parcel bar)
        camera.fov = 58;
        PLAY_CAM_POS.set(0, 10.4, 15.2);
        PLAY_CAM_LOOK.set(0, 2.4, -42.0);
      } else if (aspect < 1.0) {
        // Tablet Portrait / Wide Phone Portrait
        camera.fov = 52;
        PLAY_CAM_POS.set(0, 9.8, 13.8);
        PLAY_CAM_LOOK.set(0, 2.3, -42.0);
      } else if (aspect < 1.45) {
        // iPad Landscape / Compact Laptop
        camera.fov = 46;
        PLAY_CAM_POS.set(0, 9.4, 12.8);
        PLAY_CAM_LOOK.set(0, 2.3, -42.0);
      } else {
        // Widescreen Desktop / Mobile Landscape
        camera.fov = 44;
        PLAY_CAM_POS.set(0, 9.0, 12.0);
        PLAY_CAM_LOOK.set(0, 2.3, -42.0);
      }

      if (gameState.mode !== 'home') camera.fov = camera.userData.gameplayFov;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      if (gameState.mode === 'home') {
        const distMult = aspect < 0.75 ? 1.25 : (aspect < 1.0 ? 1.12 : 1.0);
        const targetY = aspect < 0.75 ? 1.05 : 1.15;
        SHOWROOM_CAM_POS.set(5.8 * distMult, 2.3 * distMult, -7.2 * distMult);
        SHOWROOM_CAM_LOOK.set(0, targetY, -0.2);
        camera.up.set(0, 1, 0);
        camera.position.copy(SHOWROOM_CAM_POS);
        camera.lookAt(SHOWROOM_CAM_LOOK);
      } else {
        camera.up.set(0, 1, 0);
        camera.position.copy(PLAY_CAM_POS);
        camera.lookAt(PLAY_CAM_LOOK);
      }
    }

    updateCameraForViewport();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.74);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.94);
    dirLight.position.set(36, 52, 24);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    const d = 58;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 180;
    scene.add(dirLight);

    const cozyMotes = [];
    const moteGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const moteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
    function initCozyMotes() {
      // Legacy stub preserved for compatibility
    }

    // ============================================================================
    // 3B. DELICATE DIM CELESTIAL NIGHT STARFIELD & GLOWING VOXEL MOON
    // ============================================================================
    const STAR_COUNT = 320;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    let starFieldPoints = null;
    let starFieldMaterial = null;
    let celestialMoonGroup = null;

    function initCelestialStars() {
      if (starFieldPoints) return;

      const palette = [
        new THREE.Color(0xcbd5e1), // Soft moonlight silver
        new THREE.Color(0xa5b4fc), // Faint violet starlight
        new THREE.Color(0x93c5fd), // Soft cyan blue
        new THREE.Color(0xfde68a), // Dim warm golden starlight
        new THREE.Color(0x94a3b8)  // Atmospheric starlight
      ];

      // Distribute delicate starfield across the camera's visible night sky dome
      for (let i = 0; i < STAR_COUNT; i++) {
        const x = (Math.random() - 0.5) * 270;
        const y = 12.0 + Math.random() * 46.0;
        const z = -85.0 - Math.random() * 145.0;

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        const color = palette[Math.floor(Math.random() * palette.length)];
        starColors[i * 3] = color.r;
        starColors[i * 3 + 1] = color.g;
        starColors[i * 3 + 2] = color.b;
      }

      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      // Delicate soft starlight sprite (subtle, dim, non-glaring)
      const starCanvas = document.createElement('canvas');
      starCanvas.width = 16;
      starCanvas.height = 16;
      const sCtx = starCanvas.getContext('2d');
      const grad = sCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.70)');
      grad.addColorStop(0.35, 'rgba(210, 230, 255, 0.40)');
      grad.addColorStop(0.70, 'rgba(180, 210, 255, 0.12)');
      grad.addColorStop(1.0, 'rgba(150, 200, 255, 0.0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 16, 16);

      const starTexture = new THREE.CanvasTexture(starCanvas);

      starFieldMaterial = new THREE.PointsMaterial({
        size: 2.0,
        sizeAttenuation: false,
        map: starTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
      });

      starFieldPoints = new THREE.Points(starGeometry, starFieldMaterial);
      starFieldPoints.frustumCulled = false;
      scene.add(starFieldPoints);
      window.starFieldPoints = starFieldPoints;
      window.starFieldMaterial = starFieldMaterial;

      // Glowing Stylized Voxel Crescent Moon high in the upper right sky
      celestialMoonGroup = new THREE.Group();
      celestialMoonGroup.position.set(48, 56, -170);

      const moonGlow = { emissive: 0xfef08a, emissiveIntensity: 1.4 };
      addVoxelBox(celestialMoonGroup, 6.2, 7.8, 1.2, 0, 0, 0, 0xfef08a, moonGlow);
      addVoxelBox(celestialMoonGroup, 5.0, 9.4, 1.2, 0.6, 0, 0, 0xfef08a, moonGlow);
      addVoxelBox(celestialMoonGroup, 3.4, 10.6, 1.2, 1.2, 0, 0, 0xfffbeb, { emissive: 0xfffbeb, emissiveIntensity: 1.6 });
      addVoxelBox(celestialMoonGroup, 4.4, 8.2, 1.3, -1.8, 0, 0.05, 0x121d3b, { opacity: 0.95 });

      scene.add(celestialMoonGroup);
      window.celestialMoonGroup = celestialMoonGroup;
    }
    window.initCelestialStars = initCelestialStars;

    // ============================================================================
    // 4. 8 JAW-DROPPING MEME & SURPRISE VOXEL ITEMS
    // ============================================================================
    function createParcelVoxelMesh(typeId, scale = 1.0) {
      const group = new THREE.Group();

      if (typeId === 0) {
        // 0: LEGENDARY — COOL SHADES MOAI STATUE (🗿) WITH GOLD CHAIN & DEAL-WITH-IT SUNGLASSES
        addVoxelBox(group, 1.38, 0.24, 1.28, 0, -0.72, 0, 0x334155);
        addVoxelBox(group, 1.24, 0.18, 1.14, 0, -0.52, 0.04, 0xfacc15, { metalness: 0.6, roughness: 0.2 });
        addVoxelBox(group, 1.12, 1.48, 1.02, 0,  0.12, -0.04, 0x64748b);
        addVoxelBox(group, 1.24, 0.32, 1.12, 0,  0.66,  0.10, 0x475569);
        addVoxelBox(group, 0.36, 0.68, 0.36, 0,  0.18,  0.54, 0x94a3b8);
        addVoxelBox(group, 0.76, 0.18, 0.24, 0, -0.32,  0.48, 0x334155);
        addVoxelBox(group, 0.22, 0.72, 0.36, -0.64, 0.12, -0.05, 0x475569);
        addVoxelBox(group, 0.22, 0.72, 0.36,  0.64, 0.12, -0.05, 0x475569);
        addVoxelBox(group, 1.34, 0.12, 0.18, 0, 0.48, 0.56, 0x090d16);
        addVoxelBox(group, 0.48, 0.28, 0.18, -0.34, 0.40, 0.56, 0x090d16);
        addVoxelBox(group, 0.48, 0.28, 0.18,  0.34, 0.40, 0.56, 0x090d16);
        addVoxelBox(group, 0.12, 0.18, 0.20, -0.40, 0.42, 0.58, 0xffffff);
        addVoxelBox(group, 0.12, 0.18, 0.20,  0.28, 0.42, 0.58, 0xffffff);
      } else if (typeId === 1) {
        // 1: LEGENDARY — 24K SOLID GOLD TOILET WITH SPARKLING WATER
        const goldOpt = { metalness: 0.58, roughness: 0.2, emissive: 0x78350f, emissiveIntensity: 0.25 };
        addVoxelBox(group, 0.90, 0.36, 1.10, 0, -0.60, 0.08, 0xd97706, goldOpt);
        addVoxelBox(group, 1.12, 0.48, 1.22, 0, -0.22, 0.16, 0xf59e0b, goldOpt);
        addVoxelBox(group, 1.18, 0.14, 1.26, 0,  0.04, 0.18, 0xfacc15, goldOpt);
        addVoxelBox(group, 0.82, 0.10, 0.86, 0,  0.08, 0.24, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.9 });
        addVoxelBox(group, 1.12, 0.92, 0.50, 0,  0.40, -0.38, 0xd97706, goldOpt);
        addVoxelBox(group, 1.22, 0.16, 0.58, 0,  0.88, -0.38, 0xfacc15, goldOpt);
        addVoxelBox(group, 0.98, 0.84, 0.14, 0,  0.44, -0.08, 0xfde047, goldOpt);
        addVoxelBox(group, 0.30, 0.12, 0.16, -0.66, 0.70, -0.32, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.8 });
      } else if (typeId === 2) {
        // 2: GOLD TIER — DIGITBOX 7 PRO CONSOLE
        addVoxelBox(group, 1.15, 0.16, 1.02, 0, -0.72, 0, 0x0f172a);
        addVoxelBox(group, 0.46, 1.54, 0.90, 0,  0.04, 0, 0x090d16);
        addVoxelBox(group, 0.50, 1.42, 0.10, 0,  0.06,  0.44, 0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 1.1 });
        addVoxelBox(group, 0.50, 1.42, 0.10, 0,  0.06, -0.44, 0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 1.1 });
        addVoxelBox(group, 0.16, 1.58, 1.00, -0.30, 0.06, 0, 0xf8fafc);
        addVoxelBox(group, 0.16, 1.58, 1.00,  0.30, 0.06, 0, 0xf8fafc);
        addVoxelBox(group, 0.18, 0.30, 1.08, -0.34, 0.74, 0.04, 0xffffff);
        addVoxelBox(group, 0.18, 0.30, 1.08,  0.34, 0.74, 0.04, 0xffffff);
        addVoxelBox(group, 0.72, 0.28, 0.28, 0, -0.52, 0.60, 0xef4444);
      } else if (typeId === 3) {
        // 3: GOLD TIER — GOLDEN KING DURIAN
        addVoxelBox(group, 1.42, 1.18, 1.32, 0, -0.05, 0, 0x4d7c0f);
        addVoxelBox(group, 0.24, 0.48, 0.24, 0, 0.72, 0, 0x78350f);
        [[-0.75, 0], [0.75, 0], [0, -0.70], [-0.55, -0.55], [0.55, -0.55], [-0.55, 0.45], [0.55, 0.45]].forEach(([sx, sz]) => {
          addVoxelBox(group, 0.28, 0.28, 0.28, sx, 0.15, sz, 0x65a30d);
          addVoxelBox(group, 0.24, 0.24, 0.24, sx * 0.9, -0.25, sz * 0.9, 0x3f6212);
        });
        addVoxelBox(group, 0.96, 0.86, 0.28, 0, -0.06, 0.58, 0xfef9c3);
        addVoxelBox(group, 0.38, 0.62, 0.32, -0.22, -0.06, 0.68, 0xfacc15, { emissive: 0xd97706, emissiveIntensity: 0.35 });
        addVoxelBox(group, 0.38, 0.62, 0.32,  0.22, -0.06, 0.68, 0xfacc15, { emissive: 0xd97706, emissiveIntensity: 0.35 });
      } else if (typeId === 4) {
        // 4: EPIC TIER — OPEN SARDINE FISH CAN WITH 3 SILVER FISH & LEMON
        addVoxelBox(group, 1.56, 0.66, 1.14, 0, -0.26, 0, 0x64748b, { metalness: 0.5 });
        addVoxelBox(group, 1.60, 0.36, 1.18, 0, -0.26, 0, 0xfacc15);
        addVoxelBox(group, 1.00, 0.18, 1.20, 0, -0.26, 0, 0xef4444);
        addVoxelBox(group, 1.38, 0.12, 0.96, 0,  0.06, 0, 0xd97706);
        addVoxelBox(group, 0.36, 0.44, 0.96, -0.68, 0.34, 0, 0xcbd5e1);
        [-0.28, 0.04, 0.36].forEach((zOff, idx) => {
          const xOff = idx * 0.12;
          addVoxelBox(group, 0.80, 0.26, 0.22, xOff, 0.22, zOff, 0x0284c7);
          addVoxelBox(group, 0.22, 0.34, 0.14, xOff - 0.42, 0.36, zOff, 0x38bdf8);
        });
      } else if (typeId === 5) {
        // 5: EPIC TIER — MEOWING ORANGE TABBY CAT IN A CARDBOARD DELIVERY BOX
        addVoxelBox(group, 1.44, 0.88, 1.34, 0, -0.28, 0, 0xb45309);
        addVoxelBox(group, 1.48, 0.22, 1.38, 0, -0.28, 0, 0xfef3c7);
        addVoxelBox(group, 0.14, 0.42, 1.34, -0.78, 0.24, 0, 0xd97706);
        addVoxelBox(group, 0.14, 0.42, 1.34,  0.78, 0.24, 0, 0xd97706);
        addVoxelBox(group, 0.88, 0.72, 0.82, 0, 0.42, 0.06, 0xf97316);
        addVoxelBox(group, 0.26, 0.30, 0.22, -0.28, 0.86, 0.08, 0xf97316);
        addVoxelBox(group, 0.26, 0.30, 0.22,  0.28, 0.86, 0.08, 0xf97316);
        addVoxelBox(group, 0.16, 0.16, 0.12, -0.22, 0.46, 0.46, 0x090d16);
        addVoxelBox(group, 0.16, 0.16, 0.12,  0.22, 0.46, 0.46, 0x090d16);
        addVoxelBox(group, 0.16, 0.12, 0.12,  0,    0.34, 0.48, 0xf472b6);
        addVoxelBox(group, 0.26, 0.22, 0.26, -0.28, 0.16, 0.68, 0xffffff);
        addVoxelBox(group, 0.26, 0.22, 0.26,  0.28, 0.16, 0.68, 0xffffff);
      } else if (typeId === 6) {
        // 6: RARE TIER — WRAPPED VOXEL BICYCLE
        addVoxelBox(group, 0.68, 0.68, 0.22, -0.58, -0.28, 0, 0x0f172a);
        addVoxelBox(group, 0.34, 0.34, 0.26, -0.58, -0.28, 0, 0x38bdf8);
        addVoxelBox(group, 0.68, 0.68, 0.22,  0.58, -0.28, 0, 0x0f172a);
        addVoxelBox(group, 0.34, 0.34, 0.26,  0.58, -0.28, 0, 0x38bdf8);
        addVoxelBox(group, 1.18, 0.20, 0.20, 0, 0.02, 0, 0xef4444);
        addVoxelBox(group, 0.20, 0.65, 0.20, -0.44, 0.26, 0, 0xfacc15);
        addVoxelBox(group, 0.24, 0.24, 0.68, -0.44, 0.56, 0, 0x0f172a);
        addVoxelBox(group, 0.42, 0.18, 0.36,  0.34, 0.28, 0, 0x1e293b);
        addVoxelBox(group, 0.38, 0.38, 0.38,  0,    0.34, 0, 0xec4899);
      } else if (typeId === 7) {
        // 7: RARE TIER — STEAMING MIDNIGHT SHAN NOODLE XL
        addVoxelBox(group, 1.62, 0.16, 1.62, 0, -0.52, 0, 0x0f172a);
        addVoxelBox(group, 1.50, 0.56, 1.50, 0,  0.04, 0, 0xdc2626);
        addVoxelBox(group, 1.58, 0.16, 1.58, 0,  0.34, 0, 0x18181b);
        addVoxelBox(group, 1.34, 0.12, 1.34, 0,  0.32, 0, 0xd97706);
        addVoxelBox(group, 0.42, 0.16, 0.42, 0.32, 0.42, -0.20, 0xffffff);
        addVoxelBox(group, 0.24, 0.20, 0.24, 0.32, 0.46, -0.20, 0xf97316);
        addVoxelBox(group, 0.38, 0.16, 0.38, -0.32, 0.42, -0.24, 0xfce7f3);
        addVoxelBox(group, 1.72, 0.10, 0.10, 0, 0.62, 0.30, 0x92400e);
      } else if (typeId === 8) {
        // 8: LEGENDARY — CYBER NEON KATANA ON DISPLAY STAND
        addVoxelBox(group, 1.48, 0.20, 0.72, 0, -0.62, 0, 0x0f172a);
        addVoxelBox(group, 0.18, 0.68, 0.24, -0.45, -0.22, 0, 0x1e293b);
        addVoxelBox(group, 0.18, 0.68, 0.24,  0.45, -0.22, 0, 0x1e293b);
        addVoxelBox(group, 1.85, 0.16, 0.14, 0, 0.18, 0, 0x090d16);
        addVoxelBox(group, 1.80, 0.10, 0.16, 0.12, 0.24, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.2 });
        addVoxelBox(group, 0.12, 0.44, 0.38, -0.42, 0.20, 0, 0xfacc15);
        addVoxelBox(group, 0.52, 0.20, 0.20, -0.72, 0.20, 0, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 0.7 });
      } else if (typeId === 9) {
        // 9: GOLD TIER — GOLDEN LUCKY MANEKI-NEKO CAT
        const gOpt = { metalness: 0.6, roughness: 0.2, emissive: 0x78350f, emissiveIntensity: 0.25 };
        addVoxelBox(group, 1.36, 0.22, 1.18, 0, -0.64, 0, 0xdc2626);
        addVoxelBox(group, 1.06, 0.84, 0.92, 0, -0.12, 0, 0xfacc15, gOpt);
        addVoxelBox(group, 0.98, 0.76, 0.86, 0,  0.54, 0, 0xfacc15, gOpt);
        addVoxelBox(group, 0.26, 0.32, 0.24, -0.32, 0.98, 0, 0xf59e0b, gOpt);
        addVoxelBox(group, 0.26, 0.32, 0.24,  0.32, 0.98, 0, 0xf59e0b, gOpt);
        addVoxelBox(group, 1.04, 0.14, 0.92, 0, 0.22, 0, 0xef4444);
        addVoxelBox(group, 0.26, 0.58, 0.26, -0.62, 0.45, 0.22, 0xfde047, gOpt);
        addVoxelBox(group, 0.48, 0.64, 0.16, 0, -0.10, 0.48, 0xfef08a);
      } else if (typeId === 10) {
        // 10: EPIC TIER — GALACTIC LAVA LAMP ROCKET
        addVoxelBox(group, 1.02, 0.32, 1.02, 0, -0.64, 0, 0x334155, { metalness: 0.6 });
        addVoxelBox(group, 0.86, 1.12, 0.86, 0,  0.06, 0, 0x4c1d95);
        addVoxelBox(group, 0.56, 0.42, 0.56, 0, -0.12, 0.18, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 1.0 });
        addVoxelBox(group, 0.44, 0.36, 0.44, 0.10, 0.32, 0.20, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
        addVoxelBox(group, 0.64, 0.38, 0.64, 0,  0.78, 0, 0x334155, { metalness: 0.6 });
      } else {
        // 11: RARE TIER — BROWN SUGAR BOBA MILK TEA XL
        addVoxelBox(group, 1.04, 1.24, 1.04, 0, -0.08, 0, 0xfde68a);
        addVoxelBox(group, 1.08, 0.32, 1.08, 0, -0.52, 0, 0x451a03);
        [[-0.28, 0.52], [0.05, 0.52], [0.30, 0.52], [-0.15, -0.52], [0.22, -0.52]].forEach(([bx, bz]) => {
          addVoxelBox(group, 0.18, 0.18, 0.12, bx, -0.54, bz, 0x090d16);
        });
        addVoxelBox(group, 1.18, 0.18, 1.18, 0, 0.58, 0, 0xf472b6);
        addVoxelBox(group, 0.24, 0.72, 0.24, 0.16, 0.82, 0, 0x00f5d4);
      }

      group.scale.setScalar(scale);
      return group;
    }

    // ============================================================================
    // 5. 8 EXPRESSIVE VOXEL CHARACTERS (INCLUDING PANDA & NEON SAMURAI)
    // ============================================================================
    function createVoxelCharacter(charTypeId, scale = 1.0) {
      const group = new THREE.Group();

      if (charTypeId === 'goblin') {
        addVoxelBox(group, 0.34, 0.44, 0.34, -0.24, 0.22, 0, 0x65a30d);
        addVoxelBox(group, 0.34, 0.44, 0.34,  0.24, 0.22, 0, 0x65a30d);
        addVoxelBox(group, 0.96, 0.72, 0.68, 0, 0.76, 0, 0x84cc16);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.62, 1.0, 0);
        addVoxelBox(rightArmPivot, 0.28, 0.56, 0.28, 0, 0.22, 0, 0x84cc16);
        rightArmPivot.rotation.z = -0.5;
        group.add(rightArmPivot);
        group.userData.waveArm = rightArmPivot;

        addVoxelBox(group, 1.48, 1.26, 1.18, 0, 1.82, 0, 0x84cc16);
        addVoxelBox(group, 1.06, 0.34, 0.42, 0, 1.46, 0.42, 0x581c87);
        [-0.34, -0.12, 0.12, 0.34].forEach((tx) => {
          addVoxelBox(group, 0.16, 0.12, 0.14, tx, 1.34, 0.56, 0xffffff);
          addVoxelBox(group, 0.16, 0.12, 0.14, tx, 1.60, 0.56, 0xffffff);
        });
        addVoxelBox(group, 0.46, 0.54, 0.24, -0.40, 2.08, 0.56, 0xffffff);
        addVoxelBox(group, 0.46, 0.54, 0.24,  0.40, 2.08, 0.56, 0xffffff);
        addVoxelBox(group, 0.14, 0.32, 0.28, -0.38, 2.08, 0.58, 0x090d16);
        addVoxelBox(group, 0.14, 0.32, 0.28,  0.38, 2.08, 0.58, 0x090d16);
        addVoxelBox(group, 0.32, 0.42, 0.34, 0, 1.88, 0.62, 0x00f5d4);
        addVoxelBox(group, 0.52, 0.14, 0.28, -0.40, 2.44, 0.58, 0x090d16);
        addVoxelBox(group, 0.52, 0.14, 0.28,  0.40, 2.44, 0.58, 0x090d16);

        group.scale.setScalar(scale);
        return group;
      }

      if (charTypeId === 'panda') {
        addVoxelBox(group, 0.36, 0.46, 0.38, -0.24, 0.23, 0, 0x090d16);
        addVoxelBox(group, 0.36, 0.46, 0.38,  0.24, 0.23, 0, 0x090d16);
        addVoxelBox(group, 0.98, 0.84, 0.68, 0, 0.88, 0, 0xffffff);
        addVoxelBox(group, 1.02, 0.22, 0.72, 0, 0.58, 0, 0xfacc15); // Gold sash belt
        addVoxelBox(group, 1.00, 0.28, 0.70, 0, 1.18, 0, 0x090d16);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.62, 1.14, 0);
        addVoxelBox(rightArmPivot, 0.28, 0.58, 0.28, 0, 0.20, 0, 0x090d16);
        rightArmPivot.rotation.z = -0.45;
        group.add(rightArmPivot);
        group.userData.waveArm = rightArmPivot;

        addVoxelBox(group, 1.24, 1.02, 1.06, 0, 1.86, 0, 0xffffff);
        addVoxelBox(group, 0.34, 0.34, 0.24, -0.46, 2.44, 0, 0x090d16);
        addVoxelBox(group, 0.34, 0.34, 0.24,  0.46, 2.44, 0, 0x090d16);
        addVoxelBox(group, 0.36, 0.34, 0.14, -0.30, 1.90, 0.50, 0x090d16);
        addVoxelBox(group, 0.36, 0.34, 0.14,  0.30, 1.90, 0.50, 0x090d16);
        addVoxelBox(group, 0.14, 0.14, 0.18, -0.28, 1.92, 0.54, 0xffffff);
        addVoxelBox(group, 0.14, 0.14, 0.18,  0.28, 1.92, 0.54, 0xffffff);
        addVoxelBox(group, 0.24, 0.16, 0.20, 0, 1.72, 0.56, 0x090d16);
        // Conical Bamboo Hat
        addVoxelBox(group, 1.62, 0.18, 1.62, 0, 2.48, 0, 0xfacc15);
        addVoxelBox(group, 0.96, 0.26, 0.96, 0, 2.68, 0, 0xd97706);

        group.scale.setScalar(scale);
        return group;
      }

      if (charTypeId === 'cyberpunk') {
        addVoxelBox(group, 0.32, 0.48, 0.34, -0.22, 0.24, 0, 0x0f172a);
        addVoxelBox(group, 0.32, 0.48, 0.34,  0.22, 0.24, 0, 0x0f172a);
        addVoxelBox(group, 0.92, 0.82, 0.58, 0, 0.88, 0, 0x1e293b);
        addVoxelBox(group, 0.98, 0.28, 0.64, 0, 1.24, -0.06, 0xfacc15); // High tech yellow collar

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.58, 1.14, 0);
        addVoxelBox(rightArmPivot, 0.26, 0.58, 0.26, 0, 0.20, 0, 0x00f5d4);
        rightArmPivot.rotation.z = -0.45;
        group.add(rightArmPivot);
        group.userData.waveArm = rightArmPivot;

        addVoxelBox(group, 1.18, 0.98, 1.02, 0, 1.84, 0, 0xf4be92);
        // Glowing Neon Magenta/Cyan Visor
        addVoxelBox(group, 1.24, 0.28, 0.22, 0, 1.90, 0.48, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 1.1 });
        addVoxelBox(group, 1.24, 0.34, 1.08, 0, 2.38, 0, 0x00f5d4);

        group.scale.setScalar(scale);
        return group;
      }

      if (charTypeId === 'banana') {
        addVoxelBox(group, 0.30, 0.44, 0.30, -0.22, 0.22, 0, 0x1e293b);
        addVoxelBox(group, 0.30, 0.44, 0.30,  0.22, 0.22, 0, 0x1e293b);
        addVoxelBox(group, 0.96, 1.65, 0.86, 0, 1.25, 0, 0xfacc15);
        addVoxelBox(group, 0.76, 0.55, 0.68, 0, 2.30, -0.05, 0xfde047);
        addVoxelBox(group, 0.38, 0.38, 0.38, 0, 2.72, -0.12, 0x65a30d);
        addVoxelBox(group, 0.28, 0.52, 0.48, -0.58, 1.35, 0, 0xfef08a);
        addVoxelBox(group, 0.28, 0.52, 0.48,  0.58, 1.35, 0, 0xfef08a);
        addVoxelBox(group, 1.04, 0.24, 0.18, 0, 1.88, 0.42, 0x090d16);
        addVoxelBox(group, 0.16, 0.14, 0.20, -0.26, 1.90, 0.44, 0xffffff);
        addVoxelBox(group, 0.16, 0.14, 0.20,  0.26, 1.90, 0.44, 0xffffff);
        addVoxelBox(group, 0.52, 0.18, 0.16, 0, 1.56, 0.42, 0xffffff);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.58, 1.4, 0);
        addVoxelBox(rightArmPivot, 0.24, 0.56, 0.24, 0, 0.22, 0, 0xfacc15);
        rightArmPivot.rotation.z = -0.5;
        group.add(rightArmPivot);
        group.userData.waveArm = rightArmPivot;

        group.scale.setScalar(scale);
        return group;
      }

      if (charTypeId === 'ledbot') {
        addVoxelBox(group, 0.28, 0.52, 0.28, -0.22, 0.26, 0, 0x94a3b8);
        addVoxelBox(group, 0.28, 0.52, 0.28,  0.22, 0.26, 0, 0x94a3b8);
        addVoxelBox(group, 0.88, 0.78, 0.58, 0, 0.90, 0, 0xe2e8f0);
        addVoxelBox(group, 0.42, 0.24, 0.62, 0, 0.95, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.8 });

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.56, 1.15, 0);
        addVoxelBox(rightArmPivot, 0.24, 0.56, 0.24, 0, 0.22, 0, 0x38bdf8);
        rightArmPivot.rotation.z = -0.45;
        group.add(rightArmPivot);
        group.userData.waveArm = rightArmPivot;

        addVoxelBox(group, 1.28, 1.18, 1.04, 0, 1.92, 0, 0xf8fafc);
        addVoxelBox(group, 0.98, 0.84, 0.16, 0, 1.92, 0.48, 0x0f172a);
        addVoxelBox(group, 0.24, 0.38, 0.18, -0.22, 1.92, 0.50, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.1 });
        addVoxelBox(group, 0.24, 0.38, 0.18,  0.22, 1.92, 0.50, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.1 });
        addVoxelBox(group, 1.56, 0.18, 0.42, 0, 2.66, 0, 0x38bdf8);
        addVoxelBox(group, 0.26, 0.76, 0.56, -0.74, 1.96, 0, 0x38bdf8);
        addVoxelBox(group, 0.26, 0.76, 0.56,  0.74, 1.96, 0, 0x38bdf8);

        group.scale.setScalar(scale);
        return group;
      }

      const skin = charTypeId === 'inlechef' ? 0xf59e0b : 0xf4be92;
      addVoxelBox(group, 0.32, 0.44, 0.34, -0.22, 0.22, 0, 0x1e293b);
      addVoxelBox(group, 0.32, 0.44, 0.34,  0.22, 0.22, 0, 0x1e293b);

      const coatCol = charTypeId === 'wizard' ? 0x6d28d9 : (charTypeId === 'inlechef' ? 0xffffff : 0xec4899);
      addVoxelBox(group, 0.84, 0.78, 0.52, 0, 0.88, 0, coatCol);

      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.56, 1.14, 0);
      addVoxelBox(rightArmPivot, 0.26, 0.58, 0.26, 0, 0.20, 0, skin);
      rightArmPivot.rotation.z = -0.45;
      group.add(rightArmPivot);
      group.userData.waveArm = rightArmPivot;

      addVoxelBox(group, 1.18, 0.98, 1.02, 0, 1.84, 0, skin);
      addVoxelBox(group, 0.26, 0.26, 0.12, -0.28, 1.86, 0.48, 0xffffff);
      addVoxelBox(group, 0.26, 0.26, 0.12,  0.28, 1.86, 0.48, 0xffffff);
      addVoxelBox(group, 0.14, 0.20, 0.14, -0.26, 1.86, 0.51, 0x090d16);
      addVoxelBox(group, 0.14, 0.20, 0.14,  0.26, 1.86, 0.51, 0x090d16);

      if (charTypeId === 'inlechef') {
        addVoxelBox(group, 0.54, 0.34, 0.32, 0, 1.66, 0.54, 0xfef3c7);
        addVoxelBox(group, 0.20, 0.16, 0.16, 0, 1.76, 0.68, 0x090d16);
        addVoxelBox(group, 0.28, 0.36, 0.24, -0.38, 2.46, 0.08, 0xd97706);
        addVoxelBox(group, 0.28, 0.36, 0.24,  0.38, 2.46, 0.08, 0xd97706);
        addVoxelBox(group, 0.86, 0.52, 0.86, 0, 2.58, -0.05, 0xffffff);
        addVoxelBox(group, 0.92, 0.16, 0.58, 0, 1.26, 0.04, 0xef4444);
      } else if (charTypeId === 'wizard') {
        addVoxelBox(group, 0.76, 0.68, 0.28, 0, 1.42, 0.46, 0xf8fafc);
        addVoxelBox(group, 1.56, 0.18, 1.46, 0, 2.34, 0, 0x4c1d95);
        addVoxelBox(group, 1.06, 0.46, 1.06, 0, 2.64, 0, 0x6d28d9);
        addVoxelBox(group, 1.10, 0.14, 1.10, 0, 2.46, 0, 0xfacc15);
        addVoxelBox(group, 0.62, 0.48, 0.62, 0, 3.06, -0.06, 0x7c3aed);
      } else {
        // Neko-Chan with 3D White Cat on Head
        addVoxelBox(group, 1.24, 0.36, 1.08, 0, 2.30, 0, 0x1e1b4b);
        addVoxelBox(group, 0.72, 0.46, 0.64, 0, 2.66, 0.04, 0xffffff);
        addVoxelBox(group, 0.18, 0.22, 0.16, -0.22, 2.94, 0.10, 0xec4899);
        addVoxelBox(group, 0.18, 0.22, 0.16,  0.22, 2.94, 0.10, 0xec4899);
      }

      group.scale.setScalar(scale);
      return group;
    }

    // ============================================================================
    // 6. CUTE VOXEL DOG, FORWARD-FACING CYCLIST & NATIVE STREET STALLS
    // ============================================================================
    function createVoxelDog(coatHex = 0xd97706) {
      const dog = new THREE.Group();
      addVoxelBox(dog, 0.52, 0.44, 0.88, 0, 0.46, 0, coatHex);
      addVoxelBox(dog, 0.54, 0.36, 0.36, 0, 0.52, -0.34, 0xfef3c7);
      addVoxelBox(dog, 0.48, 0.44, 0.46, 0, 0.82, -0.44, coatHex);
      addVoxelBox(dog, 0.28, 0.22, 0.28, 0, 0.74, -0.72, 0xfef3c7);
      addVoxelBox(dog, 0.14, 0.12, 0.12, 0, 0.80, -0.86, 0x090d16);
      addVoxelBox(dog, 0.14, 0.28, 0.20, -0.28, 0.82, -0.42, 0x78350f);
      addVoxelBox(dog, 0.14, 0.28, 0.20,  0.28, 0.82, -0.42, 0x78350f);
      addVoxelBox(dog, 0.52, 0.12, 0.48, 0, 0.62, -0.40, 0xef4444);
      [[-0.16, -0.32], [0.16, -0.32], [-0.16, 0.32], [0.16, 0.32]].forEach(([lx, lz]) => {
        addVoxelBox(dog, 0.16, 0.32, 0.16, lx, 0.16, lz, coatHex);
      });
      const tail = addVoxelBox(dog, 0.14, 0.36, 0.14, 0, 0.74, 0.46, coatHex);
      tail.rotation.x = 0.45;
      dog.userData.tail = tail;
      return dog;
    }

    function createSidewalkDogWalker(charId, dogColor) {
      const group = new THREE.Group();
      const human = createVoxelCharacter(charId, 0.74);
      human.rotation.y = Math.PI;
      group.add(human);

      const dog = createVoxelDog(dogColor);
      dog.position.set(0.82, 0, -0.95);
      group.add(dog);

      const leash = addVoxelBox(group, 0.06, 0.06, 1.15, 0.40, 0.78, -0.48, 0xef4444);
      leash.rotation.y = -0.55;
      leash.rotation.x = -0.25;

      group.userData = { human, dog };
      return group;
    }

    function createVoxelCyclist(frameColor = 0x00f5d4) {
      const group = new THREE.Group();
      const frontWheel = createWheelGroup(0, 0.40, -0.72);
      frontWheel.scale.set(0.45, 0.92, 0.92);
      const rearWheel = createWheelGroup(0, 0.40,  0.72);
      rearWheel.scale.set(0.45, 0.92, 0.92);
      group.add(frontWheel, rearWheel);

      addVoxelBox(group, 0.16, 0.16, 1.40, 0, 0.72, 0, frameColor);
      addVoxelBox(group, 0.16, 0.72, 0.16, 0, 0.88, -0.62, frameColor);
      addVoxelBox(group, 0.88, 0.14, 0.14, 0, 1.24, -0.62, 0xfacc15);
      addVoxelBox(group, 0.32, 0.14, 0.38, 0, 0.92,  0.25, 0x0f172a);

      const rider = createVoxelCharacter('ledbot', 0.65);
      rider.position.set(0, 0.56, 0.18);
      rider.rotation.y = Math.PI;
      group.add(rider);

      group.userData = { wheels: [frontWheel, rearWheel] };
      return group;
    }

    const parcelIconDataURLs = {};
    const charIconDataURLs = {};
    const vanIconDataURLs = {};

    function generate3DIcons() {
      const iconRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      iconRenderer.setSize(160, 160);
      iconRenderer.outputEncoding = THREE.sRGBEncoding;

      const iconScene = new THREE.Scene();
      iconScene.add(new THREE.AmbientLight(0xffffff, 0.95));
      const dir = new THREE.DirectionalLight(0xffffff, 1.3);
      dir.position.set(6, 10, 8);
      iconScene.add(dir);

      const iconCam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

      PARCEL_TYPES.forEach((p) => {
        const mesh = createParcelVoxelMesh(p.id, 1.12);
        iconScene.add(mesh);
        iconCam.position.set(2.3, 1.95, 2.55);
        iconCam.lookAt(0, 0.05, 0);
        iconRenderer.render(iconScene, iconCam);
        parcelIconDataURLs[p.id] = iconRenderer.domElement.toDataURL('image/png');
        iconScene.remove(mesh);
      });

      CHARACTER_TYPES.forEach((c) => {
        const mesh = createVoxelCharacter(c.id, 1.0);
        iconScene.add(mesh);
        iconCam.position.set(1.15, 2.25, 2.85);
        iconCam.lookAt(0, 1.85, 0);
        iconRenderer.render(iconScene, iconCam);
        charIconDataURLs[c.id] = iconRenderer.domElement.toDataURL('image/png');
        iconScene.remove(mesh);
      });

      PLAYABLE_VANS.forEach((v) => {
        const mesh = createPlayableVanMesh(v.id, false);
        if (mesh.userData.beamLeft) mesh.userData.beamLeft.visible = false;
        if (mesh.userData.beamRight) mesh.userData.beamRight.visible = false;
        iconScene.add(mesh);
        iconCam.position.set(5.4, 4.1, -6.2);
        iconCam.lookAt(0, 1.45, 0);
        iconRenderer.render(iconScene, iconCam);
        vanIconDataURLs[v.id] = iconRenderer.domElement.toDataURL('image/png');
        iconScene.remove(mesh);
      });

      iconRenderer.dispose();
      iconRenderer.forceContextLoss();
    }

    const gateSignGeo = new THREE.BoxGeometry(12.6, 2.4, 0.45);
    const gateSignMatCache = {};

    function createCityWelcomeGate(cityTheme) {
      const group = new THREE.Group();
      const pillarX = 8.8;

      addVoxelBox(group, 1.35, 11.5, 1.35, -pillarX, 5.75, 0, cityTheme.gatePrimary);
      addVoxelBox(group, 1.35, 11.5, 1.35,  pillarX, 5.75, 0, cityTheme.gatePrimary);
      addVoxelBox(group, 1.95, 1.2, 1.95, -pillarX, 0.6, 0, cityTheme.gateSecondary);
      addVoxelBox(group, 1.95, 1.2, 1.95,  pillarX, 0.6, 0, cityTheme.gateSecondary);

      addVoxelBox(group, 21.5, 1.1, 1.8, 0, 9.6, 0, cityTheme.gatePrimary);
      addVoxelBox(group, 23.2, 0.75, 2.6, 0, 10.6, 0, cityTheme.gateSecondary);
      addVoxelBox(group, 16.5, 0.85, 2.2, 0, 12.1, 0, cityTheme.gateSecondary);

      addVoxelBox(group, 1.4, 1.1, 2.6, -11.4, 11.2, 0, cityTheme.gatePrimary);
      addVoxelBox(group, 1.4, 1.1, 2.6,  11.4, 11.2, 0, cityTheme.gatePrimary);

      [-6.2, -3.2, 3.2, 6.2].forEach((lx) => {
        addVoxelBox(group, 0.75, 0.95, 0.75, lx, 8.3, 0, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.95 });
      });

      if (!gateSignMatCache[cityTheme.id]) {
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 10;
        ctx.strokeRect(6, 6, 500, 116);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cityTheme.banner, 256, 64);

        const signTex = new THREE.CanvasTexture(signCanvas);
        gateSignMatCache[cityTheme.id] = new THREE.MeshBasicMaterial({ map: signTex });
      }
      const signMesh = new THREE.Mesh(gateSignGeo, gateSignMatCache[cityTheme.id]);
      signMesh.position.set(0, 9.8, 0.95);
      group.add(signMesh);

      return group;
    }

    function createCrosswalkEvent(zPos) {
      const group = new THREE.Group();
      group.position.set(0, 0, zPos);

      for (let i = -4; i <= 4; i++) {
        addVoxelBox(group, 0.96, 0.09, 3.4, i * 1.8, 0.05, 0, 0xffffff);
      }

      const walkerGroup = new THREE.Group();
      walkerGroup.position.set(-6.2, 0.15, 0);
      group.add(walkerGroup);

      const isDuckCrossing = Math.random() < 0.65;
      const members = [];

      if (isDuckCrossing) {
        for (let d = 0; d < 4; d++) {
          const duck = new THREE.Group();
          const s = d === 0 ? 1.0 : 0.62;
          addVoxelBox(duck, 0.75 * s, 0.55 * s, 0.55 * s, 0, 0.35 * s, 0, d === 0 ? 0xffffff : 0xfacc15);
          addVoxelBox(duck, 0.45 * s, 0.48 * s, 0.45 * s, 0.32 * s, 0.72 * s, 0, d === 0 ? 0x16a34a : 0xfde047);
          addVoxelBox(duck, 0.32 * s, 0.16 * s, 0.28 * s, 0.58 * s, 0.68 * s, 0, 0xf97316);
          duck.position.set(-d * 1.05, 0, 0);
          walkerGroup.add(duck);
          members.push(duck);
        }
      } else {
        const walker = createVoxelCharacter('inlechef', 0.78);
        walker.rotation.y = Math.PI / 2;
        walkerGroup.add(walker);
        members.push(walker);
      }

      scene.add(group);
      return {
        group,
        walkerGroup,
        members,
        isDuckCrossing,
        dir: 1,
        speed: 4.2,
        passedBonusGiven: false
      };
    }

    // ============================================================================
    // 7. PLAYER VAN & MEME TRAFFIC VEHICLES (50+ MICRO-VOXEL SCULPTED RIGS)
    // ============================================================================
    function createWheelGroup(x, y, z) {
      const wg = new THREE.Group();
      wg.position.set(x, y, z);
      // Multi-layered detailed voxel tire, alloy rim & center hubcap
      addVoxelBox(wg, 0.48, 0.88, 0.88, 0, 0, 0, 0x090d16);
      addVoxelBox(wg, 0.52, 0.62, 0.62, 0, 0, 0, 0x1e293b);
      addVoxelBox(wg, 0.56, 0.42, 0.42, 0, 0, 0, 0xfacc15);
      addVoxelBox(wg, 0.60, 0.18, 0.18, 0, 0, 0, 0xf8fafc);
      return wg;
    }

    const cadEdgeGeo = new THREE.EdgesGeometry(unitBoxGeo);
    const cadEdgeMatLight = new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.42 });
    const cadEdgeMatSchematic = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 });
    const cadFillMatSchematic = new THREE.MeshStandardMaterial({
      color: 0x0a224e,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    function decorateGroupWithCADEdges(rootGroup, schematicMode = false) {
      const meshes = [];
      rootGroup.traverse((child) => {
        if (child.isMesh && child.geometry === unitBoxGeo) {
          meshes.push(child);
        }
      });
      meshes.forEach((m) => {
        if (schematicMode) {
          m.material = cadFillMatSchematic;
        }
        const edgeLines = new THREE.LineSegments(cadEdgeGeo, schematicMode ? cadEdgeMatSchematic : cadEdgeMatLight);
        m.add(edgeLines);
      });
    }

    const headlightBeamGeo = new THREE.ConeGeometry(1.5, 9.0, 14, 1, true);
    const headlightBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    function attachVehicleHeadlightBeams(parent, yPos, zFront) {
      const bL = new THREE.Mesh(headlightBeamGeo, headlightBeamMat);
      bL.rotation.x = Math.PI / 2;
      bL.position.set(-0.75, yPos, zFront - 4.4);
      const isNight = (typeof gameState !== 'undefined' && gameState) ? TIME_PRESETS[gameState.timeIndex].lightsOn : false;
      bL.visible = isNight;
      parent.add(bL);

      const bR = new THREE.Mesh(headlightBeamGeo, headlightBeamMat);
      bR.rotation.x = Math.PI / 2;
      bR.position.set(0.75, yPos, zFront - 4.4);
      bR.visible = isNight;
      parent.add(bR);

      return [bL, bR];
    }

    const immortalAuraGeometry = new THREE.RingGeometry(2.5, 3.2, 32);
    const immortalAuraMaterial = new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

    function createPlayableVanMesh(vanId = 'classic', includeCargoGift = true) {
      const spec = PLAYABLE_VANS.find(v => v.id === vanId) || PLAYABLE_VANS[0];
      const root = new THREE.Group();
      const chassis = new THREE.Group();
      root.add(chassis);

      // Shared Heavy Undercarriage & 4 Sculpted Fender Wheel Arches
      addVoxelBox(chassis, 2.30, 0.36, 4.70, 0, 0.52, 0, 0x090d16);
      [[-1.18, -1.48], [1.18, -1.48], [-1.18, 1.42], [1.18, 1.42]].forEach(([wx, wz]) => {
        addVoxelBox(chassis, 0.42, 0.68, 1.16, wx, 0.78, wz, 0x0f172a);
      });

      // Vehicle-specific flush roof rack height & Z position so ZERO parts float!
      let rackY = 3.24;
      let rackZ = 0.55;

      if (vanId === 'classic') {
        // 1. EXPRESS COURIER GTI
        addVoxelBox(chassis, 2.66, 0.34, 0.38, 0, 0.56, -2.44, 0xe2e8f0, { metalness: 0.6, roughness: 0.2 });
        addVoxelBox(chassis, 0.68, 0.22, 0.14, 0, 0.56, -2.62, 0xfacc15);
        addVoxelBox(chassis, 2.66, 0.34, 0.38, 0, 0.56,  2.44, 0xe2e8f0, { metalness: 0.6, roughness: 0.2 });
        addVoxelBox(chassis, 0.32, 0.18, 0.35, -0.78, 0.38, 2.52, 0x94a3b8);
        addVoxelBox(chassis, 0.32, 0.18, 0.35, -0.42, 0.38, 2.52, 0x94a3b8);

        addVoxelBox(chassis, 2.38, 0.92, 1.15, 0, 1.14, -1.92, spec.bodyHex);
        addVoxelBox(chassis, 1.42, 0.58, 0.16, 0, 1.12, -2.46, 0x090d16);
        [-0.16, 0, 0.16].forEach((gy) => {
          addVoxelBox(chassis, 1.28, 0.08, 0.18, 0, 1.12 + gy, -2.48, 0xcbd5e1);
        });
        addVoxelBox(chassis, 0.26, 0.22, 0.20, 0, 1.14, -2.50, 0xfacc15);

        addVoxelBox(chassis, 2.44, 2.05, 3.65, 0, 1.88, 0.38, spec.bodyHex);
        addVoxelBox(chassis, 2.50, 0.34, 3.72, 0, 1.38, 0.38, spec.stripeHex);
        addVoxelBox(chassis, 2.48, 0.24, 3.68, 0, 0.82, 0.38, 0x1e293b);
        addVoxelBox(chassis, 2.36, 0.36, 3.55, 0, 3.04, 0.38, spec.roofHex);
        addVoxelBox(chassis, 2.08, 0.20, 2.95, 0, 3.28, 0.45, 0xe2e8f0);

        addVoxelBox(chassis, 2.12, 0.86, 0.18, 0, 2.22, -1.42, 0x38bdf8, { roughness: 0.12 });
        addVoxelBox(chassis, 0.12, 0.86, 0.22, 0, 2.22, -1.44, 0x0f172a);
        addVoxelBox(chassis, 2.38, 0.18, 0.42, 0, 2.72, -1.52, 0x0f172a);
        addVoxelBox(chassis, 2.50, 0.78, 0.96, 0, 2.22, -0.78, 0x38bdf8, { roughness: 0.12 });

        // Flush Side Wing Mirrors & Door Handles
        [-1, 1].forEach((dir) => {
          addVoxelBox(chassis, 0.32, 0.14, 0.14, dir * 1.24, 2.08, -1.25, 0x0f172a);
          addVoxelBox(chassis, 0.18, 0.40, 0.26, dir * 1.36, 2.16, -1.25, 0xfacc15);
        });

        addVoxelBox(chassis, 0.10, 1.85, 0.12, 0, 1.92, 2.22, 0x0f172a);
        addVoxelBox(chassis, 1.35, 0.24, 0.38, 0, 3.32, -0.82, 0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 0.8 });
        rackY = 3.42;
        rackZ = 0.65;

      } else if (vanId === 'ramen') {
        // 2. HARAJUKU RAMEN TRUCK (All roof bowls & chopsticks 100% attached!)
        addVoxelBox(chassis, 2.62, 0.34, 0.38, 0, 0.56, -2.42, 0xffffff);
        addVoxelBox(chassis, 2.62, 0.34, 0.38, 0, 0.56,  2.42, 0xffffff);

        addVoxelBox(chassis, 2.36, 1.85, 1.45, 0, 1.62, -1.58, spec.bodyHex);
        addVoxelBox(chassis, 2.08, 0.82, 0.18, 0, 1.98, -2.28, 0x38bdf8, { roughness: 0.12 });
        [-0.72, 0.72].forEach((ex) => {
          addVoxelBox(chassis, 0.46, 0.44, 0.32, ex, 2.68, -1.65, 0xf472b6);
          addVoxelBox(chassis, 0.26, 0.26, 0.36, ex, 2.66, -1.68, 0xfef08a);
        });

        addVoxelBox(chassis, 2.44, 2.15, 3.25, 0, 1.78, 0.62, 0xfff1f2);
        addVoxelBox(chassis, 2.48, 0.48, 3.30, 0, 1.02, 0.62, 0xf472b6);
        addVoxelBox(chassis, 2.74, 0.18, 2.25, 0, 1.52, 0.65, 0x92400e);
        addVoxelBox(chassis, 2.50, 0.72, 2.05, 0, 1.95, 0.65, 0x1e293b);
        [-0.65, 0, 0.65].forEach((cz, idx) => {
          addVoxelBox(chassis, 2.56, 0.36, 0.52, 0, 2.42, 0.65 + cz, idx % 2 === 0 ? 0xe11d48 : 0xfef08a);
        });

        addVoxelBox(chassis, 2.48, 0.28, 3.35, 0, 2.94, 0.62, 0xbe185d);
        // Sculpted Ramen Bowl mounted flush on front half of roof
        addVoxelBox(chassis, 1.45, 0.48, 1.45, 0, 3.28, -0.35, 0xdc2626);
        addVoxelBox(chassis, 1.56, 0.16, 1.56, 0, 3.54, -0.35, 0x18181b);
        addVoxelBox(chassis, 1.32, 0.10, 1.32, 0, 3.58, -0.35, 0xfacc15);
        addVoxelBox(chassis, 1.65, 0.10, 0.12, 0, 3.66, -0.25, 0x78350f);
        rackY = 3.12;
        rackZ = 1.25;

      } else if (vanId === 'cyber') {
        // 3. CYBER-BLADE 2099 (Fixed flush cabin, attached GT spoiler struts & flush low-profile cargo deck!)
        addVoxelBox(chassis, 2.68, 0.18, 4.95, 0, 0.42, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.95 });
        addVoxelBox(chassis, 2.52, 0.88, 4.75, 0, 0.94, 0, 0x0f172a);
        addVoxelBox(chassis, 2.56, 0.20, 4.65, 0, 1.38, 0, 0xd946ef, { emissive: 0xd946ef, emissiveIntensity: 1.0 });

        // Sloped Wedge Nose & Full-Width Cyan Laser Visor
        addVoxelBox(chassis, 2.42, 0.64, 1.65, 0, 1.48, -1.45, 0x1e293b);
        addVoxelBox(chassis, 2.48, 0.24, 0.24, 0, 1.28, -2.34, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.4 });

        // Main Gull-Wing Cabin (Top of cabin is at y = 2.34)
        addVoxelBox(chassis, 2.24, 0.92, 2.75, 0, 1.88, 0.18, 0x1e293b);
        addVoxelBox(chassis, 2.02, 0.68, 0.22, 0, 1.90, -1.18, 0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.5 });

        // Flush Rear Window Slats / Louvers sitting directly on the cabin roof (y = 2.38)
        [-0.25, 0.30, 0.85].forEach((lz) => {
          addVoxelBox(chassis, 1.96, 0.14, 0.34, 0, 2.38, lz, 0x090d16);
        });

        // Attached GT Spoiler Wing with struts anchored directly into the rear deck (y = 1.38 to 2.25)
        addVoxelBox(chassis, 0.20, 0.92, 0.36, -0.88, 1.80, 2.02, 0x00f5d4);
        addVoxelBox(chassis, 0.20, 0.92, 0.36,  0.88, 1.80, 2.02, 0x00f5d4);
        addVoxelBox(chassis, 2.72, 0.16, 0.68, 0, 2.26, 2.06, 0x090d16);
        addVoxelBox(chassis, 2.76, 0.08, 0.72, 0, 2.34, 2.06, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.1 });

        // Dual Rear Plasma Thrusters
        [-0.68, 0.68].forEach((tx) => {
          addVoxelBox(chassis, 0.68, 0.52, 0.42, tx, 1.02, 2.42, 0x090d16);
          addVoxelBox(chassis, 0.52, 0.36, 0.48, tx, 1.02, 2.48, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.4 });
        });

        // Flush roof rack right on top of the Cyber-Blade cabin!
        rackY = 2.46;
        rackZ = 0.25;

      } else if (vanId === 'goldtuktuk') {
        // 4. ROYAL BANGKOK TUK-TUK (All pillars & canopy tiers 100% connected!)
        addVoxelBox(chassis, 2.28, 0.42, 3.95, 0, 0.66, 0.20, 0x16a34a);
        addVoxelBox(chassis, 1.56, 1.45, 1.25, 0, 1.45, -1.35, 0x15803d);
        addVoxelBox(chassis, 1.38, 0.68, 0.18, 0, 1.82, -1.96, 0x38bdf8);
        addVoxelBox(chassis, 0.58, 0.58, 0.26, 0, 1.08, -2.02, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.2 });
        addVoxelBox(chassis, 0.68, 0.36, 0.85, 0, 0.72, -1.85, 0xfacc15);

        addVoxelBox(chassis, 2.34, 1.12, 2.65, 0, 1.28, 0.78, 0x16a34a);
        addVoxelBox(chassis, 2.40, 0.28, 2.72, 0, 1.25, 0.78, 0xfacc15);
        [[-1.06, -1.25], [1.06, -1.25], [-1.06, 1.92], [1.06, 1.92]].forEach(([px, pz]) => {
          addVoxelBox(chassis, 0.20, 1.75, 0.20, px, 2.08, pz, 0xfacc15);
        });
        addVoxelBox(chassis, 2.46, 0.32, 3.75, 0, 2.92, 0.35, 0xfacc15);
        addVoxelBox(chassis, 2.08, 0.26, 3.25, 0, 3.18, 0.35, 0xd97706);
        [-0.95, 0.95].forEach((ex) => {
          addVoxelBox(chassis, 0.24, 0.95, 0.24, ex, 1.25, 2.22, 0xe2e8f0, { metalness: 0.7 });
        });
        rackY = 3.34;
        rackZ = 0.35;

      } else if (vanId === 'bullion') {
        // 5. FORT KNOX BULLION RIG
        addVoxelBox(chassis, 2.78, 0.88, 0.48, 0, 0.88, -2.42, 0xfacc15, { metalness: 0.65, roughness: 0.2 });
        [-0.95, -0.35, 0.35, 0.95].forEach((bx) => {
          addVoxelBox(chassis, 0.18, 0.96, 0.56, bx, 0.92, -2.46, 0x090d16);
        });
        addVoxelBox(chassis, 2.52, 2.22, 3.75, 0, 1.85, 0.38, 0x334155, { metalness: 0.45 });
        addVoxelBox(chassis, 2.58, 0.38, 3.82, 0, 1.42, 0.38, 0xfacc15, { metalness: 0.65 });
        addVoxelBox(chassis, 2.40, 1.68, 1.38, 0, 1.58, -1.68, 0x1e293b);
        addVoxelBox(chassis, 2.12, 0.48, 0.22, 0, 1.96, -2.32, 0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.5 });
        addVoxelBox(chassis, 1.48, 1.48, 0.22, 0, 1.85, 2.28, 0xe2e8f0, { metalness: 0.7 });
        addVoxelBox(chassis, 0.72, 0.72, 0.30, 0, 1.85, 2.34, 0xfacc15);
        addVoxelBox(chassis, 2.38, 0.26, 3.45, 0, 3.02, 0.38, 0x090d16);
        rackY = 3.18;
        rackZ = 0.45;

      } else {
        // 6. MECHA-MOAI INTERCEPTOR
        addVoxelBox(chassis, 2.68, 0.42, 0.42, 0, 0.58, -2.42, 0xfacc15);
        addVoxelBox(chassis, 2.38, 1.15, 1.45, 0, 1.18, -1.68, 0x475569);
        addVoxelBox(chassis, 0.96, 0.56, 0.96, 0, 1.88, -1.68, 0xe2e8f0, { metalness: 0.75 });
        addVoxelBox(chassis, 1.06, 0.28, 0.24, 0, 2.02, -2.14, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.9 });
        addVoxelBox(chassis, 2.46, 2.25, 3.35, 0, 1.92, 0.52, 0x64748b);
        addVoxelBox(chassis, 2.62, 0.42, 1.25, 0, 2.78, -0.68, 0x475569);
        addVoxelBox(chassis, 0.68, 0.95, 0.48, 0, 2.05, -1.22, 0x94a3b8);
        addVoxelBox(chassis, 2.56, 0.22, 0.32, 0, 2.46, -1.16, 0x090d16);
        [-0.66, 0.66].forEach((sx) => {
          addVoxelBox(chassis, 0.78, 0.44, 0.32, sx, 2.32, -1.16, 0x090d16);
          addVoxelBox(chassis, 0.22, 0.26, 0.36, sx - 0.14, 2.36, -1.18, 0xffffff);
        });
        addVoxelBox(chassis, 2.28, 0.28, 2.85, 0, 3.14, 0.55, 0xfacc15);
        [-0.72, 0.72].forEach((tx) => {
          addVoxelBox(chassis, 0.78, 0.78, 0.85, tx, 1.55, 2.32, 0x090d16);
          addVoxelBox(chassis, 0.58, 0.58, 0.92, tx, 1.55, 2.38, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.5 });
        });
        rackY = 3.30;
        rackZ = 0.60;
      }

      // Universal Bright Headlights & Taillights
      addVoxelBox(chassis, 0.48, 0.34, 0.16, -0.84, 1.08, -2.36, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.1 });
      addVoxelBox(chassis, 0.48, 0.34, 0.16,  0.84, 1.08, -2.36, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.1 });
      addVoxelBox(chassis, 0.48, 0.34, 0.16, -0.86, 1.08,  2.30, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
      addVoxelBox(chassis, 0.48, 0.34, 0.16,  0.86, 1.08,  2.30, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });

      // Flush Roof Rack + Equipped Parcel Preview (Anchored directly to rackY & rackZ!)
      addVoxelBox(chassis, 1.78, 0.16, 1.85, 0, rackY, rackZ, 0x090d16);

      // Apply Crisp Technical CAD Architectural Edge Outlines to the Chassis
      decorateGroupWithCADEdges(chassis, false);

      const [beamLeft, beamRight] = attachVehicleHeadlightBeams(chassis, 0.92, -2.38);

      let roofGift = null;
      if (includeCargoGift) {
        roofGift = createParcelVoxelMesh(gameState.handSlots ? gameState.handSlots[0] : 0, 0.74);
        roofGift.position.set(0, rackY + 0.56, rackZ);
        roofGift.rotation.y = 0.35;
        chassis.add(roofGift);
      }

      // Rainbow Immortal Aura Shield Ring around the vehicle (Visible when Immortal Power-Up is active)
      const immortalAura = new THREE.Mesh(
        immortalAuraGeometry,
        immortalAuraMaterial
      );
      immortalAura.rotation.x = -Math.PI / 2;
      immortalAura.position.y = 0.18;
      immortalAura.visible = false;
      root.add(immortalAura);

      const wheels = [
        createWheelGroup(-1.24, 0.45, -1.48),
        createWheelGroup( 1.24, 0.45, -1.48),
        createWheelGroup(-1.24, 0.45,  1.42),
        createWheelGroup( 1.24, 0.45,  1.42)
      ];
      wheels.forEach((w) => {
        decorateGroupWithCADEdges(w, false);
        root.add(w);
      });

      root.userData = { chassis, wheels, roofGift, rackY, rackZ, beamLeft, beamRight, immortalAura, vanId };
      return root;
    }

    function createPlayerDeliveryVan() {
      return createPlayableVanMesh(gameState.equippedVanId || 'classic');
    }

    function replaceActivePlayerVan(vanId) {
      gameState.equippedVanId = vanId;
      const currentVan = (typeof playerVan !== 'undefined' ? playerVan : (typeof window !== 'undefined' ? window.playerVan : null));
      if (currentVan) {
        scene.remove(currentVan);
      }
      playerVan = createPlayableVanMesh(vanId, true);
      playerVan.position.set(gameState.currentX, 0, gameState.vanZ);
      const isLightsOn = TIME_PRESETS[gameState.timeIndex].lightsOn;
      if (playerVan.userData.beamLeft) playerVan.userData.beamLeft.visible = isLightsOn;
      if (playerVan.userData.beamRight) playerVan.userData.beamRight.visible = isLightsOn;
      scene.add(playerVan);
      playerVan.add(overdriveAuraMesh);
      playerVan.add(shieldBumperMesh);
      attachRoofCargoToVan(playerVan);
    }

    function createCargoCrateMesh() {
      const crate = new THREE.Group();
      addVoxelBox(crate, 1.05, CARGO_CONFIG.crateHeight, 1.05, 0, 0, 0, 0xc58b4a);
      addVoxelBox(crate, 0.14, CARGO_CONFIG.crateHeight + 0.02, 1.07, 0, 0, 0, 0xffedba);
      addVoxelBox(crate, 1.07, CARGO_CONFIG.crateHeight + 0.02, 0.14, 0, 0, 0, 0xffedba);
      addVoxelBox(crate, 0.28, 0.22, 0.02, 0.27, 0.02, 0.54, 0xffffff);
      return crate;
    }

    function createSupplyDepotMesh(laneIndex) {
      const depot = new THREE.Group();
      const laneX = LANES[laneIndex];
      const glow = { emissive: 0x22c55e, emissiveIntensity: 0.9 };
      for (const side of [-1, 1]) {
        addVoxelBox(depot, 0.24, 9.2, 0.5, laneX + side * 1.65, 4.6, 0, 0x22c55e, glow);
      }
      addVoxelBox(depot, 3.55, 0.35, 0.6, laneX, 9.1, 0, 0x22c55e, glow);
      addVoxelBox(depot, 3.15, 0.04, 4.0, laneX, 0.06, 0, 0x22c55e, glow);
      const sign = createNativeSignboardMesh('SUPPLY', '+2 CRATES', '#064e3b', '#86efac', 3.2, 1.1, 0.2);
      sign.position.set(laneX, 9.9, 0.4);
      depot.add(sign);
      return depot;
    }

    function createCargoOverpassMesh(safeLaneIndex, rackHeight) {
      const bridge = new THREE.Group();
      const clearances = LANES.map((laneX, laneIndex) => {
        const allowedCrates = laneIndex === safeLaneIndex ? CARGO_CONFIG.capacity : 1 + laneIndex % 3;
        const clearance = rackHeight + 0.18 + allowedCrates * CARGO_CONFIG.spacing;
        const safe = laneIndex === safeLaneIndex;
        const color = safe ? 0x22c55e : 0xef4444;
        const glow = { emissive: color, emissiveIntensity: 0.85 };
        for (const side of [-1, 1]) {
          addVoxelBox(bridge, 0.18, safe ? 9 : clearance, 0.55, laneX + side * 1.7, (safe ? 9 : clearance) / 2, 0, safe ? 0x166534 : 0x475569);
        }
        if (!safe) {
          addVoxelBox(bridge, 3.4, 0.35, 1.0, laneX, clearance + 0.15, 0, 0xef4444, glow);
          addVoxelBox(bridge, 3.4, 0.08, 1.04, laneX, clearance, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        } else {
          addVoxelBox(bridge, 3.4, 0.3, 0.8, laneX, 9.1, 0, 0x22c55e, glow);
        }
        const sign = createNativeSignboardMesh(
          safe ? '✅ OPEN' : '❌ LOW',
          safe ? 'OPEN LANE' : `MAX ${allowedCrates} CRATES`,
          safe ? '#064e3b' : '#450a0a',
          safe ? '#4ade80' : '#fecaca',
          3.1, 1.0, 0.2
        );
        sign.position.set(laneX, safe ? 9.3 : clearance + 0.95, 0.65);
        bridge.add(sign);
        return safe ? Infinity : clearance;
      });
      bridge.userData.clearances = clearances;
      return bridge;
    }

    function createTrafficVehicle(type) {
      const group = new THREE.Group();
      const wheels = [];

      if (type === 'ufo') {
        const saucer = new THREE.Group();
        saucer.position.y = 3.1;
        group.add(saucer);
        addVoxelBox(saucer, 3.3, 0.32, 3.3, 0, 0, 0, 0x94a3b8, { metalness: 0.6, roughness: 0.25 });
        addVoxelBox(saucer, 1.5, 0.88, 1.5, 0, 0.58, 0, 0x38bdf8, { opacity: 0.45, emissive: 0x0284c7, emissiveIntensity: 0.4 });
        addVoxelBox(group, 1.4, 2.5, 1.4, 0, 1.4, 0, 0x4ade80, { opacity: 0.22, emissive: 0x22c55e, emissiveIntensity: 0.8 });
        group.userData = { type: 'ufo', wheels: [], saucer, beams: [], halfZ: 1.8, halfX: 1.45 };
        return group;
      }

      if (type === 'tuktuk') {
        const wFront = createWheelGroup(0, 0.38, -1.55);
        const wBackL = createWheelGroup(-1.02, 0.38, 1.15);
        const wBackR = createWheelGroup( 1.02, 0.38, 1.15);
        wheels.push(wFront, wBackL, wBackR);
        group.add(wFront, wBackL, wBackR);

        addVoxelBox(group, 1.96, 0.42, 3.3, 0, 0.58, -0.1, 0x16a34a);
        addVoxelBox(group, 1.55, 1.25, 1.0, 0, 1.32, -1.15, 0x15803d);
        addVoxelBox(group, 1.38, 0.58, 0.16, 0, 1.58, -1.66, 0x38bdf8);
        addVoxelBox(group, 0.55, 0.36, 0.16, 0, 0.92, -1.68, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.1 });
        [[-0.92, -1.1], [0.92, -1.1], [-0.92, 1.35], [0.92, 1.35]].forEach(([px, pz]) => {
          addVoxelBox(group, 0.16, 1.5, 0.16, px, 1.5, pz, 0x0f172a);
        });
        addVoxelBox(group, 2.08, 0.32, 3.1, 0, 2.32, 0.1, 0xfacc15);
        addVoxelBox(group, 1.75, 0.22, 2.7, 0, 2.54, 0.1, 0xf59e0b);
        const beams = attachVehicleHeadlightBeams(group, 0.80, -1.7);
        group.userData = { type, wheels, beams, halfZ: 1.75, halfX: 1.05 };
        return group;
      }

      [[-1.12, 0.42, -1.35], [1.12, 0.42, -1.35], [-1.12, 0.42, 1.35], [1.12, 0.42, 1.35]].forEach(([x, y, z]) => {
        const w = createWheelGroup(x, y, z);
        wheels.push(w);
        group.add(w);
      });

      addVoxelBox(group, 0.42, 0.26, 0.14, -0.72, 0.92, -2.05, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.1 });
      addVoxelBox(group, 0.42, 0.26, 0.14,  0.72, 0.92, -2.05, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.1 });
      addVoxelBox(group, 0.42, 0.26, 0.14, -0.72, 0.92,  2.02, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
      addVoxelBox(group, 0.42, 0.26, 0.14,  0.72, 0.92,  2.02, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
      const beams = attachVehicleHeadlightBeams(group, 0.82, -2.05);

      if (type === 'cattruck') {
        addVoxelBox(group, 2.28, 0.42, 4.6, 0, 0.62, 0, 0x1e293b);
        addVoxelBox(group, 2.20, 1.72, 1.45, 0, 1.62, -1.48, 0xf8fafc);
        addVoxelBox(group, 1.98, 0.72, 0.16, 0, 1.92, -2.22, 0x38bdf8);
        addVoxelBox(group, 2.26, 0.68, 2.95, 0, 1.12, 0.75, 0x0284c7);
        const catBouncers = [];
        const catCols = [0xf97316, 0xffffff, 0x18181b, 0xfacc15, 0xf472b6, 0x94a3b8];
        [[-0.56, 0.0], [0.56, 0.0], [-0.56, 0.92], [0.56, 0.92], [-0.52, 1.75], [0.52, 1.75]].forEach(([cx, cz], idx) => {
          const cat = new THREE.Group();
          cat.position.set(cx, 1.55, cz);
          const cc = catCols[idx % catCols.length];
          addVoxelBox(cat, 0.82, 0.78, 0.82, 0, 0.35, 0, cc);
          addVoxelBox(cat, 0.24, 0.28, 0.20, -0.26, 0.84, 0, cc);
          addVoxelBox(cat, 0.24, 0.28, 0.20,  0.26, 0.84, 0, cc);
          addVoxelBox(cat, 0.14, 0.14, 0.12, -0.18, 0.44, 0.42, 0x22c55e);
          addVoxelBox(cat, 0.14, 0.14, 0.12,  0.18, 0.44, 0.42, 0x22c55e);
          addVoxelBox(cat, 0.14, 0.46, 0.14, 0, 0.65, 0.48, cc);
          group.add(cat);
          catBouncers.push(cat);
        });
        group.userData = { type, wheels, beams, catBouncers, halfZ: 2.3, halfX: 1.16 };
      } else if (type === 'bankvan') {
        addVoxelBox(group, 2.42, 0.48, 4.75, 0, 0.65, 0, 0x090d16);
        addVoxelBox(group, 2.38, 2.08, 3.45, 0, 1.88, 0.48, 0x1e293b, { metalness: 0.5, roughness: 0.3 });
        addVoxelBox(group, 2.44, 0.36, 3.50, 0, 1.65, 0.48, 0xfacc15, { metalness: 0.6 });
        addVoxelBox(group, 2.26, 1.56, 1.32, 0, 1.58, -1.62, 0x0f172a);
        addVoxelBox(group, 1.25, 1.25, 0.18, 0, 1.88, 2.24, 0xcbd5e1, { metalness: 0.7 });
        addVoxelBox(group, 0.55, 0.55, 0.24, 0, 1.88, 2.28, 0xfacc15);
        [[-0.45, 0.1], [0.45, 0.1], [0, 0.85]].forEach(([gx, gz]) => {
          addVoxelBox(group, 0.65, 0.34, 0.95, gx, 3.08, gz, 0xfacc15, { metalness: 0.65, roughness: 0.18 });
        });
        const sirenRed = addVoxelBox(group, 0.56, 0.26, 0.34, -0.48, 3.04, -0.8, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
        const sirenBlue = addVoxelBox(group, 0.56, 0.26, 0.34, 0.48, 3.04, -0.8, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 1.1 });
        group.userData = { type, wheels, beams, sirenRed, sirenBlue, halfZ: 2.38, halfX: 1.22 };
      } else if (type === 'dumptruck') {
        addVoxelBox(group, 2.46, 0.48, 4.95, 0, 0.66, 0, 0x1e293b);
        addVoxelBox(group, 2.34, 1.72, 1.45, 0, 1.68, -1.68, 0xf59e0b);
        addVoxelBox(group, 2.48, 1.48, 3.25, 0, 1.65,  0.68, 0xfacc15);
        addVoxelBox(group, 2.52, 0.26, 1.60, 0, 2.62, -1.25, 0xfacc15);
        addVoxelBox(group, 2.10, 0.65, 2.75, 0, 2.45, 0.68, 0x78350f);
        addVoxelBox(group, 0.85, 0.55, 0.85, -0.4, 2.85, 0.4, 0x64748b);
        addVoxelBox(group, 0.45, 0.72, 0.45,  0.5, 2.95, 1.1, 0xf97316);
        const sirenRed = addVoxelBox(group, 0.55, 0.30, 0.35, 0, 2.88, -1.65, 0xf97316, { emissive: 0xf97316, emissiveIntensity: 1.2 });
        const sirenBlue = addVoxelBox(group, 0.55, 0.30, 0.35, 0, 2.88, -1.65, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.2 });
        group.userData = { type, wheels, beams, sirenRed, sirenBlue, halfZ: 2.48, halfX: 1.24 };
      } else if (type === 'ambulance') {
        addVoxelBox(group, 2.35, 0.4, 4.5, 0, 0.6, 0, 0x334155);
        addVoxelBox(group, 2.28, 2.0, 3.2, 0, 1.8, 0.45, 0xf8fafc);
        addVoxelBox(group, 2.34, 0.36, 3.26, 0, 1.32, 0.45, 0xef4444);
        addVoxelBox(group, 2.18, 1.45, 1.25, 0, 1.52, -1.6, 0xf8fafc);
        const sirenRed = addVoxelBox(group, 0.62, 0.28, 0.34, -0.48, 2.95, -0.7, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.0 });
        const sirenBlue = addVoxelBox(group, 0.62, 0.28, 0.34, 0.48, 2.95, -0.7, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 1.0 });
        group.userData = { type, wheels, beams, sirenRed, sirenBlue, halfZ: 2.3, halfX: 1.18 };
      } else if (type === 'firetruck') {
        addVoxelBox(group, 2.42, 0.45, 5.0, 0, 0.62, 0, 0x1e293b);
        addVoxelBox(group, 2.38, 1.85, 3.5, 0, 1.72, 0.6, 0xdc2626);
        addVoxelBox(group, 2.42, 0.28, 3.55, 0, 1.30, 0.6, 0xfacc15);
        addVoxelBox(group, 0.82, 0.22, 3.8, 0, 2.82, 0.35, 0xf8fafc);
        const sirenRed = addVoxelBox(group, 0.68, 0.28, 0.36, -0.52, 2.62, -1.9, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
        const sirenBlue = addVoxelBox(group, 0.68, 0.28, 0.36,  0.52, 2.62, -1.9, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
        group.userData = { type, wheels, beams, sirenRed, sirenBlue, halfZ: 2.5, halfX: 1.22 };
      } else if (type === 'police') {
        addVoxelBox(group, 2.15, 0.68, 4.0, 0, 0.78, 0, 0x0f172a);
        addVoxelBox(group, 1.85, 0.66, 2.0, 0, 1.42, 0.1, 0xf8fafc);
        const sirenRed = addVoxelBox(group, 0.58, 0.24, 0.30, -0.42, 1.88, 0.1, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
        const sirenBlue = addVoxelBox(group, 0.58, 0.24, 0.30,  0.42, 1.88, 0.1, 0x3b82f6, { emissive: 0x3b82f6, emissiveIntensity: 1.1 });
        group.userData = { type, wheels, beams, sirenRed, sirenBlue, halfZ: 2.0, halfX: 1.1 };
      } else {
        const carCols = [0xd946ef, 0x06b6d4, 0xfacc15, 0x10b981, 0xf43f5e];
        const col = carCols[Math.floor(Math.random() * carCols.length)];
        addVoxelBox(group, 2.12, 0.68, 3.85, 0, 0.76, 0, col);
        addVoxelBox(group, 1.82, 0.65, 1.95, 0, 1.40, 0.15, col);
        addVoxelBox(group, 1.66, 0.50, 0.18, 0, 1.38,  1.12, 0x38bdf8);
        addVoxelBox(group, 1.66, 0.50, 0.18, 0, 1.38, -0.82, 0x38bdf8);
        group.userData = { type, wheels, beams, halfZ: 1.92, halfX: 1.06 };
      }

      return group;
    }

    // ============================================================================
    // 8. LIVING SIDEWALK PROMENADE, STREETLAMPS & CULTURAL CITY ARCHITECTURE
    // ============================================================================
    const envGroup = new THREE.Group();
    scene.add(envGroup);

    // Singular Grand City Landmark placed in the background on the left side
    const cityLeftLandmarkGroup = new THREE.Group();
    cityLeftLandmarkGroup.position.set(-30.0, 0, -65.0);
    scene.add(cityLeftLandmarkGroup);
    window.cityLeftLandmarkGroup = cityLeftLandmarkGroup;

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x3b4254, roughness: 0.86 });
    const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH, 0.4, 340), roadMat);
    roadMesh.position.set(0, -0.2, -95);
    roadMesh.receiveShadow = true;
    envGroup.add(roadMesh);

    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xcfd8e3, roughness: 0.9 });
    const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(36, 0.55, 340), sidewalkMat);
    sideLeft.position.set(-26.25, -0.05, -95);
    sideLeft.receiveShadow = true;
    envGroup.add(sideLeft);

    const sideRight = new THREE.Mesh(new THREE.BoxGeometry(36, 0.55, 340), sidewalkMat);
    sideRight.position.set(26.25, -0.05, -95);
    sideRight.receiveShadow = true;
    envGroup.add(sideRight);

    // Dedicated Green Bicycle Lanes on Both Sidewalks
    addVoxelBox(envGroup, 1.35, 0.06, 340, -9.3, 0.24, -95, 0x10b981, { emissive: 0x10b981, emissiveIntensity: 0.40 });
    addVoxelBox(envGroup, 1.35, 0.06, 340,  9.3, 0.24, -95, 0x10b981, { emissive: 0x10b981, emissiveIntensity: 0.40 });

    const roadLines = [];
    for (let z = 35; z > -245; z -= 8) {
      [-3.6, 0, 3.6].forEach((lx, idx) => {
        const col = idx === 1 ? 0xfacc15 : 0xf8fafc;
        const dash = addVoxelBox(envGroup, 0.28, 0.06, 3.8, lx, 0.03, z, col, {
          emissive: col,
          emissiveIntensity: 0.65
        });
        roadLines.push(dash);
      });
    }

    const streetLampBulbs = [];
    const streetLampPools = [];
    const streetLamps = [];
    const windowMeshes = [];
    const sidewalkActors = [];

    const streetLampPoolGeometry = new THREE.CircleGeometry(3.2, 16);
    const streetLampPoolMaterial = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.40, depthWrite: false });
    function initSidewalkPromenadeActors() {
      // Cozy Warm Gooseneck Streetlamps on the outer road curb edge (x = ±7.95)
      for (let z = 25; z > -235; z -= 26) {
        [-7.95, 7.95].forEach((lx) => {
          const sign = lx < 0 ? 1 : -1;
          const lampGroup = new THREE.Group();
          lampGroup.position.set(lx, 0, z);
          envGroup.add(lampGroup);

          // Cast-iron base plinth and column
          addVoxelBox(lampGroup, 0.45, 0.35, 0.45, 0, 0.18, 0, 0x0f172a);
          addVoxelBox(lampGroup, 0.22, 4.6, 0.22, 0, 2.5, 0, 0x1e293b);
          addVoxelBox(lampGroup, 0.36, 0.25, 0.36, 0, 4.85, 0, 0x0f172a);
          // Curved overhanging gooseneck arm
          addVoxelBox(lampGroup, 1.15, 0.18, 0.22, sign * 0.48, 5.05, 0, 0x1e293b);
          addVoxelBox(lampGroup, 0.72, 0.14, 0.62, sign * 0.95, 5.12, 0, 0x0f172a);
          // Warm incandescent glowing lantern head
          const bulb = addVoxelBox(lampGroup, 0.52, 0.44, 0.48, sign * 0.95, 4.78, 0, 0xfffbeb, {
            emissive: 0xfde047,
            emissiveIntensity: 1.6
          });
          streetLampBulbs.push(bulb);

          // Warm soft ambient golden light puddle on sidewalk
          const pool = new THREE.Mesh(
            streetLampPoolGeometry,
            streetLampPoolMaterial
          );
          pool.rotation.x = -Math.PI / 2;
          pool.position.set(sign * 0.95, 0.26, 0);
          pool.visible = true;
          lampGroup.add(pool);
          streetLampPools.push(pool);

          streetLamps.push(lampGroup);
        });
      }

      // Cyclists ride in the green bike lane (x = ±9.15) and Dog-Walkers stroll on a dedicated clear path
      // (x = ±10.95) while trees & porch pads are positioned so nobody ever walks through a tree!
      const charIds = ['goblin', 'inlechef', 'banana', 'neko', 'wizard', 'panda', 'cyberpunk'];
      const dogCols = [0xd97706, 0xfef3c7, 0x78350f, 0xf97316];
      for (let i = 0; i < 12; i++) {
        const isLeft = i % 2 === 0;
        const isCyclist = i % 3 === 0;
        const zPos = 10 - i * 19;
        if (isCyclist) {
          const cyc = createVoxelCyclist(isLeft ? 0x00f5d4 : 0xfacc15);
          cyc.position.set(isLeft ? -9.15 : 9.15, 0.26, zPos);
          envGroup.add(cyc);
          sidewalkActors.push({ mesh: cyc, speed: 9.5 + (i % 3), isCyclist: true });
        } else {
          const walker = createSidewalkDogWalker(charIds[i % charIds.length], dogCols[i % dogCols.length]);
          walker.position.set(isLeft ? -11.45 : 11.45, 0.26, zPos);
          envGroup.add(walker);
          sidewalkActors.push({ mesh: walker, speed: 4.2 + (i % 2), isCyclist: false });
        }
      }
    }

    // ============================================================================
    // ============================================================================
    // 8B. 10 GRAND REAL-LIFE CITY LANDMARKS (Towering authentic architecture)
    // ============================================================================

    // 1. TOKYO - Grand Tokyo Tower (Minato, Tokyo)
// Authentic 7 alternating bands of International Orange & Aviation White
// 2-story glass-walled Main Deck with glowing observation lights & red aviation beacon spire
function createGrandTokyoTower(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);

  const orange = 0xef4444; // International Orange
  const white = 0xf8fafc;  // Aviation White
  const darkNavy = 0x1e293b;
  const glowGlass = 0x38bdf8;
  const beaconRed = 0xff0000;

  // 4 Massive Foundation Blocks in Corners
  const legCoords = [[-4.6, -4.6], [4.6, -4.6], [-4.6, 4.6], [4.6, 4.6]];
  legCoords.forEach(([lx, lz]) => {
    addVoxelBox(root, 1.8, 1.2, 1.8, lx, 0.6, lz, darkNavy);
  });

  // BAND 1: International Orange Sweeping Inward-Curving Lattice Pylons (height 1.2 to 7.8)
  legCoords.forEach(([lx, lz]) => {
    const sx = Math.sign(lx);
    const sz = Math.sign(lz);
    addVoxelBox(root, 1.2, 3.6, 1.2, sx * 4.0, 3.0, sz * 4.0, orange);
    addVoxelBox(root, 1.1, 3.8, 1.1, sx * 3.1, 6.0, sz * 3.1, orange);
  });

  // Sweeping lattice arch trusses between the 4 legs (height 5.2 to 6.8)
  addVoxelBox(root, 5.2, 0.7, 0.7, 0, 5.8, -3.1, orange);
  addVoxelBox(root, 5.2, 0.7, 0.7, 0, 5.8,  3.1, orange);
  addVoxelBox(root, 0.7, 0.7, 5.2, -3.1, 5.8, 0, orange);
  addVoxelBox(root, 0.7, 0.7, 5.2,  3.1, 5.8, 0, orange);

  // BAND 2: Aviation White Converging Lower Shaft (height 7.8 to 11.0)
  legCoords.forEach(([lx, lz]) => {
    const sx = Math.sign(lx);
    const sz = Math.sign(lz);
    addVoxelBox(root, 0.9, 3.2, 0.9, sx * 2.3, 9.4, sz * 2.3, white);
  });
  addVoxelBox(root, 3.8, 0.6, 3.8, 0, 10.6, 0, white);

  // MAIN OBSERVATION DECK (2-Story Observatory, height 11.0 to 14.5)
  addVoxelBox(root, 6.8, 0.6, 6.8, 0, 11.2, 0, darkNavy);
  addVoxelBox(root, 5.8, 1.5, 5.8, 0, 12.2, 0, darkNavy);
  addVoxelBox(root, 6.2, 1.1, 6.2, 0, 12.2, 0, glowGlass, { emissive: glowGlass, emissiveIntensity: 0.85 });
  addVoxelBox(root, 5.2, 1.3, 5.2, 0, 13.5, 0, darkNavy);
  addVoxelBox(root, 5.5, 0.9, 5.5, 0, 13.5, 0, glowGlass, { emissive: glowGlass, emissiveIntensity: 0.75 });
  addVoxelBox(root, 5.8, 0.4, 5.8, 0, 14.3, 0, orange);

  // BAND 3: International Orange Mid Shaft (height 14.5 to 17.5)
  addVoxelBox(root, 2.6, 3.0, 2.6, 0, 15.9, 0, orange);

  // BAND 4: Aviation White Upper Shaft (height 17.5 to 20.2)
  addVoxelBox(root, 2.0, 2.8, 2.0, 0, 18.8, 0, white);

  // BAND 5: Top Deck (Special Observatory at 250m, height 20.2 to 22.2)
  addVoxelBox(root, 3.2, 0.4, 3.2, 0, 20.4, 0, orange);
  addVoxelBox(root, 2.8, 1.2, 2.8, 0, 21.1, 0, darkNavy);
  addVoxelBox(root, 3.0, 0.8, 3.0, 0, 21.1, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.9 });
  addVoxelBox(root, 2.6, 0.4, 2.6, 0, 21.8, 0, orange);

  // BAND 6: Aviation White Broadcast Antenna Mast (height 22.2 to 24.8)
  addVoxelBox(root, 1.2, 2.6, 1.2, 0, 23.4, 0, white);
  addVoxelBox(root, 2.8, 0.25, 0.25, 0, 24.0, 0, white);
  addVoxelBox(root, 0.25, 0.25, 2.8, 0, 24.0, 0, white);

  // BAND 7: International Orange Pinnacle Spire (height 24.8 to 27.2)
  addVoxelBox(root, 0.6, 2.4, 0.6, 0, 25.8, 0, orange);
  addVoxelBox(root, 0.9, 0.9, 0.9, 0, 27.3, 0, beaconRed, { emissive: beaconRed, emissiveIntensity: 3.0 });

  parent.add(root);
  return root;
}

// 2. YANGON
// 2. YANGON - Grand Shwedagon Pagoda (ရွှေတိဂုံစေတီတော်)
// Colossal golden stupa on Singuttara Hill: 4 cardinal Pyatthat prayer halls (Tazaungs),
// corner guardian Chinthes, stepped octagonal plinth, Khaunglaung-pon bell with relief rings,
// Kyar-hmauk & Kyar-hlan lotus petals, Hnget-pyaw-bu banana bud, 7-tier filigree Hti umbrella,
// and radiant Sein-bu diamond orb pinnacle!
function createGrandShwedagonPagoda(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);

  const richGold = 0xf59e0b;   // Deep 24K Burmese temple gold
  const brightGold = 0xfacc15; // Gleaming golden leaf
  const radiantGold = 0xfef08a;// Shimmering lotus & umbrella gold
  const hillStone = 0xfef3c7;  // Marble terrace paving
  const teakWood = 0x78350f;   // Carved teakwood shrines
  const lacquerRed = 0x991b1b; // Burmese royal crimson lacquer
  const rubyGlow = 0xef4444;

  // 1. SINGUTTARA HILL & GRAND MARBLE TERRACE (ရင်ပြင်တော် ပစ္စယံ, w=30, h=3.0)
  addVoxelBox(root, 30.0, 2.4, 30.0, 0, 1.2, 0, hillStone);
  addVoxelBox(root, 30.8, 0.6, 30.8, 0, 2.7, 0, richGold);

  // 2. FOUR CARDINAL PRAYER SHRINES (တန်ဆောင်းများ - Tazaungs with Pyatthat Multi-Tier Roofs)
  const tazaungCoords = [
    { x: 0, z: -13.8, rot: 0 },
    { x: 0, z: 13.8, rot: Math.PI },
    { x: -13.8, z: 0, rot: Math.PI / 2 },
    { x: 13.8, z: 0, rot: -Math.PI / 2 }
  ];
  tazaungCoords.forEach(tz => {
    // Teakwood colonnade hall
    addVoxelBox(root, 5.4, 4.2, 4.4, tz.x, 4.8, tz.z, teakWood);
    addVoxelBox(root, 4.4, 3.2, 3.6, tz.x, 4.6, tz.z, radiantGold, { emissive: richGold, emissiveIntensity: 0.6 });
    // 4-tier Burmese Pyatthat multi-roof with golden eaves
    addVoxelBox(root, 6.4, 0.6, 5.4, tz.x, 7.2, tz.z, lacquerRed);
    addVoxelBox(root, 5.0, 0.6, 4.2, tz.x, 8.2, tz.z, lacquerRed);
    addVoxelBox(root, 3.6, 0.6, 3.0, tz.x, 9.2, tz.z, lacquerRed);
    addVoxelBox(root, 2.2, 0.6, 1.8, tz.x, 10.2, tz.z, lacquerRed);
    addVoxelBox(root, 0.8, 2.6, 0.8, tz.x, 11.8, tz.z, brightGold, { emissive: radiantGold, emissiveIntensity: 1.1 });
  });

  // 3. FOUR CORNER GUARDIAN CHINTHES & SATELLITE STUPAS (ခြင်္သေ့ နှင့် အရံစေတီများ)
  const cornerCoords = [[-12.2, -12.2], [12.2, -12.2], [-12.2, 12.2], [12.2, 12.2]];
  cornerCoords.forEach(([cx, cz]) => {
    // Guardian Chinthe Lion
    addVoxelBox(root, 2.4, 3.2, 2.4, cx, 4.6, cz, brightGold);
    addVoxelBox(root, 1.6, 1.8, 1.6, cx, 6.8, cz, richGold);
    // Miniature Satellite Stupa (အရံစေတီ) next to corner
    const sx = cx * 0.72;
    const sz = cz * 0.72;
    addVoxelBox(root, 3.4, 1.5, 3.4, sx, 3.7, sz, richGold);
    addVoxelBox(root, 2.6, 2.8, 2.6, sx, 5.8, sz, brightGold);
    addVoxelBox(root, 1.8, 2.8, 1.8, sx, 8.4, sz, radiantGold, { emissive: richGold, emissiveIntensity: 0.5 });
    addVoxelBox(root, 0.7, 2.6, 0.7, sx, 10.9, sz, radiantGold, { emissive: radiantGold, emissiveIntensity: 1.0 });
  });

  // 4. STEPPED OCTAGONAL PLINTH (ရှစ်မြှောင့် ပစ္စယံ ၄ ဆင့်, height 3.0 to 12.5)
  addVoxelBox(root, 21.5, 2.4, 21.5, 0, 4.2, 0, richGold);
  addVoxelBox(root, 18.8, 2.4, 18.8, 0, 6.6, 0, brightGold);
  addVoxelBox(root, 16.2, 2.4, 16.2, 0, 9.0, 0, richGold);
  addVoxelBox(root, 14.0, 2.2, 14.0, 0, 11.3, 0, brightGold);

  // 5. THE BELL (ခေါင်းလောင်းပုံ - Khaunglaung-pon, height 12.5 to 19.5)
  // Stepped embossed waist bands (Hpaung-yit)
  addVoxelBox(root, 12.6, 2.4, 12.6, 0, 13.6, 0, brightGold, { metalness: 0.85, roughness: 0.15, emissive: richGold, emissiveIntensity: 0.38 });
  addVoxelBox(root, 11.4, 2.4, 11.4, 0, 16.0, 0, brightGold, { metalness: 0.85, roughness: 0.15, emissive: richGold, emissiveIntensity: 0.48 });
  addVoxelBox(root, 10.2, 2.2, 10.2, 0, 18.2, 0, brightGold, { metalness: 0.85, roughness: 0.15, emissive: richGold, emissiveIntensity: 0.58 });

  // 6. INVERTED BOWL & LOTUS PETALS (သပိတ်မှောက် နှင့် ကြာမှောက် ကြာလှန်, height 19.3 to 26.0)
  // Downward-turned lotus (Kyar-hmauk)
  addVoxelBox(root, 9.2, 2.2, 9.2, 0, 20.3, 0, radiantGold, { metalness: 0.88, roughness: 0.12, emissive: brightGold, emissiveIntensity: 0.68 });
  // Glass bead molding rim (Hpan-khar-thee)
  addVoxelBox(root, 9.8, 0.6, 9.8, 0, 21.7, 0, richGold);
  // Upward-turned lotus (Kyar-hlan)
  addVoxelBox(root, 8.0, 2.2, 8.0, 0, 23.0, 0, radiantGold, { metalness: 0.88, roughness: 0.12, emissive: brightGold, emissiveIntensity: 0.78 });

  // 7. BANANA BUD SPIRE (ငှက်ပျောဖူး - Hnget-pyaw-bu, height 24.5 to 35.0)
  addVoxelBox(root, 6.6, 2.5, 6.6, 0, 25.2, 0, brightGold, { metalness: 0.9, emissive: brightGold, emissiveIntensity: 0.72 });
  addVoxelBox(root, 5.2, 2.8, 5.2, 0, 27.7, 0, radiantGold, { metalness: 0.92, emissive: brightGold, emissiveIntensity: 0.82 });
  addVoxelBox(root, 3.9, 2.8, 3.9, 0, 30.4, 0, radiantGold, { metalness: 0.92, emissive: brightGold, emissiveIntensity: 0.88 });
  addVoxelBox(root, 2.6, 3.0, 2.6, 0, 33.2, 0, radiantGold, { metalness: 0.95, emissive: radiantGold, emissiveIntensity: 0.98 });

  // 8. SEVEN-TIER GILDED ROYAL HTI UMBRELLA (ထီးတော် - Hti-daw, height 34.8 to 41.5)
  [
    { w: 6.4, h: 0.45, y: 35.0 },
    { w: 5.6, h: 0.45, y: 36.0 },
    { w: 4.7, h: 0.45, y: 37.0 },
    { w: 3.8, h: 0.45, y: 38.0 },
    { w: 3.0, h: 0.45, y: 39.0 },
    { w: 2.2, h: 0.45, y: 40.0 },
    { w: 1.5, h: 0.45, y: 41.0 }
  ].forEach(hti => {
    addVoxelBox(root, hti.w, hti.h, hti.w, 0, hti.y, 0, radiantGold, { emissive: radiantGold, emissiveIntensity: 1.5 });
  });

  // 9. VANE & SEIN-BU DIAMOND ORB (ငှက်မြတ်နား နှင့် စိန်ဖူးတော်, height 41.5 to 47.5)
  // Golden central mast & jewel vane
  addVoxelBox(root, 0.9, 3.8, 0.9, 0, 42.8, 0, radiantGold, { emissive: 0xffffff, emissiveIntensity: 2.0 });
  addVoxelBox(root, 0.4, 1.8, 2.4, 0, 44.5, 0.8, richGold, { emissive: rubyGlow, emissiveIntensity: 1.8 });
  // Dazzling diamond orb radiating supreme spiritual white light
  addVoxelBox(root, 1.8, 1.8, 1.8, 0, 46.5, 0, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 4.2 });

  parent.add(root);
  return root;
}

// 3. LITTLE INDIA
function createGrandTajMahal(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  const whiteMarble = 0xf8fafc;
  const cream = 0xfef9c3;
  const gold = 0xfacc15;
  addVoxelBox(root, 17.5, 2.4, 15.5, 0, 1.2, 0, 0xe2e8f0);
  addVoxelBox(root, 18.0, 0.4, 16.0, 0, 2.5, 0, whiteMarble);
  [[-7.8, -6.8], [7.8, -6.8], [-7.8, 6.8], [7.8, 6.8]].forEach(([mx, mz]) => {
    addVoxelBox(root, 1.8, 1.8, 1.8, mx, 1.5, mz, 0xcbd5e1);
    addVoxelBox(root, 1.2, 7.5, 1.2, mx, 6.0, mz, whiteMarble);
    addVoxelBox(root, 1.6, 0.4, 1.6, mx, 9.8, mz, cream);
    addVoxelBox(root, 1.0, 6.5, 1.0, mx, 13.2, mz, whiteMarble);
    addVoxelBox(root, 1.4, 0.4, 1.4, mx, 16.6, mz, cream);
    addVoxelBox(root, 0.8, 5.5, 0.8, mx, 19.5, mz, whiteMarble);
    addVoxelBox(root, 1.2, 1.4, 1.2, mx, 22.8, mz, whiteMarble);
    addVoxelBox(root, 0.3, 1.8, 0.3, mx, 24.3, mz, gold, { emissive: gold, emissiveIntensity: 0.8 });
  });
  addVoxelBox(root, 11.5, 11.5, 11.5, 0, 8.4, 0, whiteMarble);
  addVoxelBox(root, 5.5, 7.8, 1.2, 0, 7.2, 5.6, 0x1e293b);
  addVoxelBox(root, 6.5, 0.6, 0.4, 0, 11.2, 5.8, cream);
  addVoxelBox(root, 0.6, 8.2, 0.4, -3.2, 7.0, 5.8, cream);
  addVoxelBox(root, 0.6, 8.2, 0.4,  3.2, 7.0, 5.8, cream);
  [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]].forEach(([cx, cz]) => {
    addVoxelBox(root, 1.8, 2.2, 1.8, cx, 15.2, cz, whiteMarble);
    addVoxelBox(root, 2.2, 1.6, 2.2, cx, 17.0, cz, cream);
    addVoxelBox(root, 0.3, 1.4, 0.3, cx, 18.4, cz, gold);
  });
  addVoxelBox(root, 7.5, 2.2, 7.5, 0, 15.2, 0, cream);
  addVoxelBox(root, 8.6, 4.5, 8.6, 0, 18.4, 0, whiteMarble, { emissive: 0xffffff, emissiveIntensity: 0.4 });
  addVoxelBox(root, 6.8, 3.2, 6.8, 0, 22.0, 0, whiteMarble, { emissive: 0xffffff, emissiveIntensity: 0.5 });
  addVoxelBox(root, 4.2, 2.2, 4.2, 0, 24.5, 0, whiteMarble);
  addVoxelBox(root, 1.2, 3.2, 1.2, 0, 27.0, 0, gold, { emissive: gold, emissiveIntensity: 1.2 });
  addVoxelBox(root, 0.4, 2.4, 0.4, 0, 29.5, 0, gold, { emissive: 0xfef08a, emissiveIntensity: 1.8 });
  parent.add(root);
  return root;
}

// 4. CHINATOWN
function createImperialTempleOfHeaven(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  const crimson = 0x991b1b;
  const imperialBlue = 0x1d4ed8;
  const gold = 0xf59e0b;
  const marble = 0xf8fafc;
  addVoxelBox(root, 16.5, 1.5, 16.5, 0, 0.75, 0, marble);
  addVoxelBox(root, 17.2, 0.4, 17.2, 0, 1.7, 0, 0xe2e8f0);
  addVoxelBox(root, 13.5, 1.4, 13.5, 0, 2.5, 0, marble);
  addVoxelBox(root, 14.2, 0.4, 14.2, 0, 3.3, 0, 0xe2e8f0);
  addVoxelBox(root, 10.5, 5.5, 10.5, 0, 6.2, 0, crimson);
  [-4.8, 4.8].forEach(pxx => {
    addVoxelBox(root, 0.9, 5.5, 0.9, pxx, 6.2, 4.8, gold);
    addVoxelBox(root, 0.9, 5.5, 0.9, pxx, 6.2, -4.8, gold);
  });
  addVoxelBox(root, 13.2, 1.2, 13.2, 0, 9.5, 0, imperialBlue);
  addVoxelBox(root, 14.6, 0.5, 14.6, 0, 9.9, 0, gold);
  addVoxelBox(root, 8.2, 4.8, 8.2, 0, 12.6, 0, crimson);
  addVoxelBox(root, 10.5, 1.2, 10.5, 0, 15.5, 0, imperialBlue);
  addVoxelBox(root, 11.6, 0.5, 11.6, 0, 15.9, 0, gold);
  addVoxelBox(root, 6.2, 4.2, 6.2, 0, 18.5, 0, crimson);
  addVoxelBox(root, 8.2, 1.2, 8.2, 0, 21.2, 0, imperialBlue);
  addVoxelBox(root, 9.2, 0.5, 9.2, 0, 21.6, 0, gold);
  addVoxelBox(root, 5.5, 3.2, 5.5, 0, 23.5, 0, imperialBlue);
  addVoxelBox(root, 3.5, 2.6, 3.5, 0, 26.2, 0, imperialBlue);
  addVoxelBox(root, 1.8, 2.2, 1.8, 0, 28.4, 0, gold, { emissive: gold, emissiveIntensity: 1.0 });
  addVoxelBox(root, 2.2, 2.2, 2.2, 0, 30.2, 0, gold, { emissive: 0xfef08a, emissiveIntensity: 1.8 });
  parent.add(root);
  return root;
}

// 5. PASTEL METRO
function createCyberSpaceNeedleAndWheel(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  const cyan = 0x00f5d4;
  const pink = 0xff007f;
  const violet = 0x7c3aed;
  const dark = 0x0f172a;
  addVoxelBox(root, 9.5, 1.5, 9.5, 0, 0.75, -2.5, dark);
  [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2]].forEach(([tx, tz]) => {
    addVoxelBox(root, 1.2, 14.5, 1.2, tx * 0.7, 7.8, -2.5 + tz * 0.7, violet);
  });
  addVoxelBox(root, 2.4, 26.0, 2.4, 0, 13.0, -2.5, 0x1e1b4b);
  addVoxelBox(root, 1.6, 26.0, 1.6, 0, 13.0, -2.5, cyan, { emissive: cyan, emissiveIntensity: 0.65 });
  addVoxelBox(root, 11.5, 1.2, 11.5, 0, 20.8, -2.5, dark);
  addVoxelBox(root, 12.8, 1.6, 12.8, 0, 22.0, -2.5, pink, { emissive: pink, emissiveIntensity: 1.1 });
  addVoxelBox(root, 10.2, 1.2, 10.2, 0, 23.3, -2.5, cyan, { emissive: cyan, emissiveIntensity: 0.85 });
  addVoxelBox(root, 7.5, 1.2, 7.5, 0, 24.4, -2.5, dark);
  addVoxelBox(root, 1.6, 4.5, 1.6, 0, 27.0, -2.5, pink);
  addVoxelBox(root, 0.9, 4.5, 0.9, 0, 31.0, -2.5, cyan);
  addVoxelBox(root, 0.5, 3.5, 0.5, 0, 34.5, -2.5, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 2.5 });

  const wheelZ = 4.8;
  addVoxelBox(root, 0.8, 14.0, 0.8, -2.0, 7.0, wheelZ, dark);
  addVoxelBox(root, 0.8, 14.0, 0.8,  2.0, 7.0, wheelZ, dark);
  addVoxelBox(root, 0.6, 12.5, 12.5, 0, 14.0, wheelZ, cyan, { emissive: cyan, emissiveIntensity: 0.95 });
  addVoxelBox(root, 0.6, 8.5, 8.5, 0, 14.0, wheelZ, pink, { emissive: pink, emissiveIntensity: 0.95 });
  for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 4) {
    const gz = wheelZ + Math.cos(ang) * 5.8;
    const gy = 14.0 + Math.sin(ang) * 5.8;
    addVoxelBox(root, 1.2, 1.2, 1.2, 0, gy, gz, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.2 });
  }
  parent.add(root);
  return root;
}

// 6. PARIS - Grand Eiffel Tower (Champ de Mars, Paris)
// Authentic 3-tier puddle iron lattice tower with sweeping semicircular arches,
// double-deck observation platforms, and summit beacon spotlight
// 6. PARIS - Grand Eiffel Tower (Champ de Mars, Paris)
// Masterclass 3-tier puddle iron lattice tower: authentic exponential curved pylon legs,
// monumental semicircular arches spanning the 4 piers, double-deck 1st platform with
// illuminated galleries, 2nd platform restaurant deck, soaring converged lattice shaft,
// summit dome lantern, and le Phare revolving double-beam spotlight!
function createGrandEiffelTower(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);

  // Classic Eiffel bronze palette with puddle iron gradients
  const stoneBase = 0x334155; // Masonry foundation blocks
  const baseIron  = 0x423224; // Deep antique bronze puddle iron
  const midIron   = 0x614a34; // Warm architectural lattice bronze
  const topIron   = 0x82674b; // Golden summit bronze
  const warmGlow  = 0xfef08a; // Golden floodlighting
  const archGlow  = 0xfacc15;
  const beaconCol = 0xffffff;

  // 1. FOUR MASSIVE CORNER FOUNDATION PIERS (Piles de la Tour, w=14x14)
  const pierCoords = [[-5.6, -5.6], [5.6, -5.6], [-5.6, 5.6], [5.6, 5.6]];
  pierCoords.forEach(([pxx, pzz]) => {
    addVoxelBox(root, 2.6, 1.2, 2.6, pxx, 0.6, pzz, stoneBase);
    addVoxelBox(root, 2.2, 0.6, 2.2, pxx, 1.5, pzz, baseIron);
  });

  // 2. TIER 1: SWEEPING CURVED PYLON LEGS (Height 1.5 to 8.8)
  // Lower sloping pylon segments
  pierCoords.forEach(([pxx, pzz]) => {
    const sx = Math.sign(pxx);
    const sz = Math.sign(pzz);
    // Lower heavy diagonal truss
    addVoxelBox(root, 1.8, 3.8, 1.8, sx * 4.8, 3.4, sz * 4.8, baseIron);
    // Mid curved taper
    addVoxelBox(root, 1.5, 4.2, 1.5, sx * 3.8, 6.8, sz * 3.8, baseIron);
    // Diagonal brace struts
    addVoxelBox(root, 0.8, 3.0, 0.8, sx * 4.3, 4.8, sz * 4.3, midIron);
  });

  // 3. MONUMENTAL SEMICIRCULAR LATTICE ARCHES (Height 5.4 to 8.6)
  // Stepped arched vaults connecting each pair of legs beneath the 1st platform
  const archOffsets = [
    { x: 0, z: -3.8, dx: 6.2, dz: 0.9 },
    { x: 0, z:  3.8, dx: 6.2, dz: 0.9 },
    { x: -3.8, z: 0, dx: 0.9, dz: 6.2 },
    { x:  3.8, z: 0, dx: 0.9, dz: 6.2 }
  ];
  archOffsets.forEach(arc => {
    // Outer arch rim
    addVoxelBox(root, arc.dx, 0.9, arc.dz, arc.x, 6.2, arc.z, baseIron);
    // Mid arch curve
    addVoxelBox(root, arc.dx * 0.75, 0.75, arc.dz * 0.85, arc.x, 7.1, arc.z, midIron);
    // Arch crown keystones with warm architectural illumination
    addVoxelBox(root, arc.dx * 0.5, 0.6, arc.dz * 0.7, arc.x, 7.8, arc.z, archGlow, { emissive: archGlow, emissiveIntensity: 0.75 });
  });

  // 4. FIRST PLATFORM (La Première Plate-forme, w=10.8x10.8, Height 8.6 to 10.8)
  addVoxelBox(root, 10.4, 0.7, 10.4, 0, 8.8, 0, baseIron);
  addVoxelBox(root, 11.2, 0.6, 11.2, 0, 9.4, 0, midIron);
  // Double-deck gallery with glowing panoramic pavilions & frieze
  addVoxelBox(root, 9.8, 0.9, 9.8, 0, 10.0, 0, warmGlow, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
  addVoxelBox(root, 11.4, 0.45, 11.4, 0, 10.6, 0, midIron);

  // 5. TIER 2: INTERMEDIATE CONVERGING LEGS (Height 10.8 to 17.0)
  pierCoords.forEach(([pxx, pzz]) => {
    const sx = Math.sign(pxx);
    const sz = Math.sign(pzz);
    addVoxelBox(root, 1.3, 3.5, 1.3, sx * 2.8, 12.4, sz * 2.8, midIron);
    addVoxelBox(root, 1.1, 3.5, 1.1, sx * 2.0, 15.4, sz * 2.0, midIron);
  });
  // Intermediate cross-brace ring
  addVoxelBox(root, 5.8, 0.5, 5.8, 0, 14.0, 0, midIron);

  // 6. SECOND PLATFORM (La Deuxième Plate-forme, w=7.6x7.6, Height 17.0 to 19.2)
  addVoxelBox(root, 7.2, 0.6, 7.2, 0, 17.3, 0, midIron);
  addVoxelBox(root, 7.8, 0.5, 7.8, 0, 17.8, 0, topIron);
  // Le Jules Verne restaurant deck with warm illumination
  addVoxelBox(root, 6.4, 0.8, 6.4, 0, 18.3, 0, warmGlow, { emissive: 0xfef08a, emissiveIntensity: 1.2 });
  addVoxelBox(root, 8.0, 0.4, 8.0, 0, 18.9, 0, topIron);

  // 7. TIER 3: SOARING CONVERGED VERTICAL LATTICE TOWER (Height 19.2 to 27.0)
  addVoxelBox(root, 3.2, 3.8, 3.2, 0, 21.0, 0, midIron);
  addVoxelBox(root, 2.5, 4.0, 2.5, 0, 24.5, 0, topIron);
  // Lattice side ribs
  addVoxelBox(root, 3.4, 0.4, 0.5, 0, 22.5, 0, topIron);
  addVoxelBox(root, 0.5, 0.4, 3.4, 0, 22.5, 0, topIron);

  // 8. SUMMIT OBSERVATORY, LANTERN DOME & ANTENNA (Height 27.0 to 32.8)
  // Double-deck summit gallery (Gustave Eiffel's private office)
  addVoxelBox(root, 3.0, 1.2, 3.0, 0, 27.6, 0, topIron);
  addVoxelBox(root, 2.6, 0.8, 2.6, 0, 28.4, 0, warmGlow, { emissive: 0xfef08a, emissiveIntensity: 1.8 });
  // Dome cupola
  addVoxelBox(root, 2.2, 0.9, 2.2, 0, 29.2, 0, topIron);
  addVoxelBox(root, 1.4, 0.8, 1.4, 0, 30.0, 0, topIron);
  // TV & Radio antenna mast
  addVoxelBox(root, 0.6, 2.4, 0.6, 0, 31.4, 0, 0xf8fafc);
  // Revolving summit beacon (le Phare) with brilliant spotlight
  addVoxelBox(root, 1.1, 1.1, 1.1, 0, 32.8, 0, beaconCol, { emissive: beaconCol, emissiveIntensity: 3.8 });

  parent.add(root);
  return root;
}

// 7. RIO DE JANEIRO - Christ the Redeemer on Mount Corcovado
// Calibrated height (~16.0 units) so head, serene face & golden halo are 100% visible on screen!
// 7. RIO DE JANEIRO - Christ the Redeemer on Mount Corcovado (Cristo Redentor)
// Monumental scale (height ~40.0 units, arm span 23.5 units): towering Mount Corcovado peak,
// octagonal chapel pedestal, soapstone mosaic robes, heroic outstretched blessing arms,
// serene face tilted towards Rio, and radiant golden halo!
function createGrandChristTheRedeemer(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  // Angled gently towards the player's road for dramatic view
  root.rotation.y = -Math.PI * 0.16;

  const soapstone   = 0xf1f5f9; // Pale soapstone mosaic tiles
  const soapDark    = 0xcbd5e1; // Robe shadow folds
  const chapelBase  = 0x1e293b; // Octagonal chapel pedestal
  const granite     = 0x64748b; // Granite cliff rock
  const darkCliff   = 0x334155; // Weathered basalt
  const jungleGreen = 0x15803d; // Lush Tijuca rainforest slopes
  const haloGold    = 0xfef08a;

  // 1. MOUNT CORCOVADO PEAK (Tijuca rainforest & granite cliffs, height 0 to 15.0)
  addVoxelBox(root, 26.0, 4.2, 26.0, 0, 2.1, 0, jungleGreen);
  addVoxelBox(root, 20.0, 3.8, 20.0, 0, 5.9, 0, darkCliff);
  addVoxelBox(root, 15.0, 3.8, 15.0, 0, 9.6, 0, granite);
  addVoxelBox(root, 11.5, 3.2, 11.5, 0, 13.0, 0, darkCliff);
  // Circular panoramic viewing terrace with tourist safety railings
  addVoxelBox(root, 12.4, 0.6, 12.4, 0, 14.8, 0, 0xe2e8f0);

  // 2. OCTAGONAL CHAPEL PEDESTAL (Base do Pedestal, height 15.0 to 20.2)
  addVoxelBox(root, 6.4, 3.6, 6.4, 0, 16.8, 0, chapelBase);
  addVoxelBox(root, 6.8, 0.7, 6.8, 0, 18.9, 0, granite);
  addVoxelBox(root, 5.4, 1.0, 5.4, 0, 19.7, 0, soapDark);

  // 3. MONUMENTAL ROBED BODY (Cristo Redentor, height 20.2 to 34.0)
  // Stepped flowing tunic robes
  addVoxelBox(root, 4.4, 4.8, 3.0, 0, 22.5, 0, soapstone);
  addVoxelBox(root, 4.6, 4.4, 2.8, 0, 26.9, 0, soapstone);
  addVoxelBox(root, 4.8, 3.8, 2.5, 0, 30.8, 0, soapstone);
  // Robe central vertical pleats
  addVoxelBox(root, 0.9, 10.5, 0.5, 0, 26.5, 1.4, soapDark);
  // Broad heroic shoulders
  addVoxelBox(root, 6.2, 2.8, 2.4, 0, 34.0, 0, soapstone);

  // 4. WORLD-FAMOUS OUTSTRETCHED CROSS ARMS (23.5 units wide span!)
  // Main horizontal arm span beam
  addVoxelBox(root, 23.5, 1.8, 1.5, 0, 34.6, 0, soapstone);
  // Flowing robe sleeve drapes beneath the arms
  addVoxelBox(root, 4.8, 3.0, 1.4, -5.6, 32.4, 0, soapstone);
  addVoxelBox(root, 4.8, 3.0, 1.4,  5.6, 32.4, 0, soapstone);
  addVoxelBox(root, 2.6, 2.0, 1.2, -9.0, 33.0, 0, soapDark);
  addVoxelBox(root, 2.6, 2.0, 1.2,  9.0, 33.0, 0, soapDark);
  // Outstretched hands blessing the city & bay
  addVoxelBox(root, 1.8, 1.4, 1.3, -12.2, 34.6, 0, soapstone);
  addVoxelBox(root, 1.8, 1.4, 1.3,  12.2, 34.6, 0, soapstone);

  // 5. SERENE HEAD, BEARD & DIGNIFIED FACE (Height 35.4 to 38.6)
  addVoxelBox(root, 2.4, 2.8, 2.2, 0, 36.6, 0, soapstone);
  // Hair & facial tilt slightly forward/downward
  addVoxelBox(root, 2.6, 1.4, 2.4, 0, 37.4, -0.2, soapDark);
  addVoxelBox(root, 1.6, 1.2, 0.6, 0, 35.8, 1.1, soapstone);

  // 6. RADIANT GOLDEN HALO (Height 38.6 to 39.5)
  addVoxelBox(root, 2.2, 0.45, 2.2, 0, 38.8, 0, haloGold, { emissive: haloGold, emissiveIntensity: 3.0 });

  parent.add(root);
  return root;
}

// 8. WASHINGTON
function createGrandUSCapitolAndMonument(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  const whiteMarble = 0xf8fafc;
  const cream = 0xf1f5f9;

  addVoxelBox(root, 17.5, 1.8, 15.5, 0, 0.9, 0, 0xe2e8f0);
  addVoxelBox(root, 18.0, 0.4, 16.0, 0, 2.0, 0, whiteMarble);

  addVoxelBox(root, 12.5, 6.5, 10.5, 0, 5.5, -2.5, whiteMarble);
  addVoxelBox(root, 6.5, 0.8, 2.2, 0, 8.8, 2.5, whiteMarble);
  [-2.4, -0.8, 0.8, 2.4].forEach(cx => {
    addVoxelBox(root, 0.5, 5.5, 0.5, cx, 5.6, 2.5, cream);
  });
  addVoxelBox(root, 5.2, 1.4, 0.6, 0, 9.8, 2.5, whiteMarble);

  addVoxelBox(root, 8.5, 5.5, 8.5, 0, 11.5, -2.5, whiteMarble);
  [-3.8, 3.8].forEach(pxx => {
    addVoxelBox(root, 0.5, 5.5, 0.5, pxx, 11.5, -2.5, cream);
    addVoxelBox(root, 0.5, 5.5, 0.5, 0, 11.5, -2.5 + pxx, cream);
  });

  addVoxelBox(root, 7.5, 3.5, 7.5, 0, 16.0, -2.5, whiteMarble);
  addVoxelBox(root, 6.2, 3.2, 6.2, 0, 19.2, -2.5, whiteMarble);
  addVoxelBox(root, 4.5, 2.4, 4.5, 0, 21.8, -2.5, whiteMarble);

  addVoxelBox(root, 2.4, 3.2, 2.4, 0, 24.5, -2.5, cream);
  addVoxelBox(root, 0.8, 1.8, 0.8, 0, 27.0, -2.5, 0xb45309);

  const obX = 0;
  const obZ = 4.8;
  addVoxelBox(root, 3.2, 12.0, 3.2, obX, 6.0, obZ, whiteMarble);
  addVoxelBox(root, 2.6, 12.0, 2.6, obX, 18.0, obZ, whiteMarble);
  addVoxelBox(root, 2.0, 7.0, 2.0, obX, 27.5, obZ, cream);
  addVoxelBox(root, 1.4, 2.5, 1.4, obX, 32.0, obZ, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.2 });
  addVoxelBox(root, 0.5, 0.5, 0.5, obX, 33.8, obZ, 0xef4444, { emissive: 0xff0000, emissiveIntensity: 2.2 });

  parent.add(root);
  return root;
}

// 9. DUBAI
function createGrandBurjKhalifaAndArab(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  const cyanGlass = 0x38bdf8;
  const deepNavy = 0x0f172a;
  const mirrorWhite = 0xf8fafc;
  const gold = 0xfacc15;

  const bkZ = -2.2;
  addVoxelBox(root, 8.5, 9.5, 8.5, 0, 4.75, bkZ, deepNavy);
  addVoxelBox(root, 7.2, 9.5, 7.2, 0, 4.75, bkZ, cyanGlass, { emissive: cyanGlass, emissiveIntensity: 0.65 });

  addVoxelBox(root, 6.2, 9.0, 6.2, 0, 14.0, bkZ, deepNavy);
  addVoxelBox(root, 5.2, 9.0, 5.2, 0, 14.0, bkZ, cyanGlass, { emissive: cyanGlass, emissiveIntensity: 0.75 });

  addVoxelBox(root, 4.2, 8.0, 4.2, 0, 22.5, bkZ, deepNavy);
  addVoxelBox(root, 3.4, 8.0, 3.4, 0, 22.5, bkZ, cyanGlass, { emissive: cyanGlass, emissiveIntensity: 0.85 });

  addVoxelBox(root, 2.4, 7.0, 2.4, 0, 30.0, bkZ, mirrorWhite);
  addVoxelBox(root, 1.8, 7.0, 1.8, 0, 30.0, bkZ, cyanGlass, { emissive: cyanGlass, emissiveIntensity: 1.0 });

  addVoxelBox(root, 1.0, 3.5, 1.0, 0, 35.2, bkZ, mirrorWhite);
  addVoxelBox(root, 0.5, 3.5, 0.5, 0, 38.5, bkZ, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 2.8 });

  const sailZ = 4.8;
  addVoxelBox(root, 6.5, 1.5, 6.5, 0, 0.75, sailZ, deepNavy);
  addVoxelBox(root, 1.4, 21.0, 7.5, 0, 11.5, sailZ, mirrorWhite);
  addVoxelBox(root, 1.6, 18.0, 5.5, 0, 10.0, sailZ + 0.8, cyanGlass, { emissive: cyanGlass, emissiveIntensity: 0.55 });
  addVoxelBox(root, 4.2, 0.5, 4.2, -1.8, 19.5, sailZ - 2.2, gold, { emissive: gold, emissiveIntensity: 0.8 });
  addVoxelBox(root, 0.5, 4.5, 0.5, 0, 23.5, sailZ - 2.5, mirrorWhite);

  parent.add(root);
  return root;
}

// 10. CAIRO - Authentic Giza Plateau with Colossal 4-Sided Geometric Pyramids (Smooth, Non-Blocky)
// Safe desert positioning: all components kept strictly away from road with >20 units clearance!
function createGrandPyramidAndSphinx(parent, px, py, pz) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);

  // Warm ancient sandstone materials with flatShading for crisp triangular faces
  const khufuMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: true
  });

  const khafreMat = new THREE.MeshStandardMaterial({
    color: 0xc89658,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: true
  });

  const casingMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    roughness: 0.75,
    flatShading: true,
    emissive: 0xfef08a,
    emissiveIntensity: 0.25
  });

  const goldApexMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
    flatShading: true
  });

  const sandBaseMat = new THREE.MeshStandardMaterial({
    color: 0xb8864f,
    roughness: 0.95,
    flatShading: true
  });

  // -------------------------------------------------------------
  // 1. THE GREAT PYRAMID OF KHUFU (Colossal 4-Sided Smooth Pyramid)
  // Centered at x = -8, well clear of the road with base radius 30 and height 36
  // -------------------------------------------------------------
  const khufuGroup = new THREE.Group();
  khufuGroup.position.set(-8, 0, 0);

  // Desert Plateau foundation slab
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(46, 2.0, 46), sandBaseMat);
  base1.position.set(0, 1.0, 0);
  base1.receiveShadow = true;
  khufuGroup.add(base1);

  // Main 4-Sided Geometric Pyramid (ConeGeometry with 4 radial segments)
  const khufuGeo = new THREE.ConeGeometry(30, 36, 4);
  const khufuMesh = new THREE.Mesh(khufuGeo, khufuMat);
  khufuMesh.position.set(0, 18.0 + 2.0, 0);
  khufuMesh.rotation.y = Math.PI / 4; // Align 4 triangular faces squarely with axes
  khufuMesh.castShadow = true;
  khufuMesh.receiveShadow = true;
  khufuGroup.add(khufuMesh);

  // Golden Pyramidion (Electrum capstone at apex)
  const khufuCapGeo = new THREE.ConeGeometry(5.2, 5.5, 4);
  const khufuCap = new THREE.Mesh(khufuCapGeo, goldApexMat);
  khufuCap.position.set(0, 36.0 + 2.0 - 2.75, 0);
  khufuCap.rotation.y = Math.PI / 4;
  khufuGroup.add(khufuCap);

  // Ancient Tomb Entrance Passage (cut into the front face)
  const entMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.8, 3.6), new THREE.MeshBasicMaterial({ color: 0x1c1208 }));
  entMesh.position.set(19.2, 3.8, 0);
  khufuGroup.add(entMesh);

  // Heavy stone chevron lintels above the entrance
  const lintelMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.6, 4.8), sandBaseMat);
  lintelMesh.position.set(18.8, 6.8, 0);
  khufuGroup.add(lintelMesh);

  root.add(khufuGroup);

  // -------------------------------------------------------------
  // 2. THE SECOND PYRAMID OF KHAFRE (With Signature Preserved Casing Cap)
  // Set back deeper in the desert (offset: x = -38, z = -32)
  // -------------------------------------------------------------
  const khafreGroup = new THREE.Group();
  khafreGroup.position.set(-38, 0, -32);

  const base2 = new THREE.Mesh(new THREE.BoxGeometry(36, 1.6, 36), sandBaseMat);
  base2.position.set(0, 0.8, 0);
  khafreGroup.add(base2);

  const khafreGeo = new THREE.ConeGeometry(23, 28, 4);
  const khafreMesh = new THREE.Mesh(khafreGeo, khafreMat);
  khafreMesh.position.set(0, 14.0 + 1.6, 0);
  khafreMesh.rotation.y = Math.PI / 4;
  khafreMesh.castShadow = true;
  khafreMesh.receiveShadow = true;
  khafreGroup.add(khafreMesh);

  // Signature White Limestone Casing Stones at Khafre's Summit
  const casingGeo = new THREE.ConeGeometry(8.2, 9.0, 4);
  const casingMesh = new THREE.Mesh(casingGeo, casingMat);
  casingMesh.position.set(0, 28.0 + 1.6 - 4.5, 0);
  casingMesh.rotation.y = Math.PI / 4;
  khafreGroup.add(casingMesh);

  root.add(khafreGroup);

  // -------------------------------------------------------------
  // 3. THE THIRD PYRAMID OF MENKAURE (Completing the Giza Triad)
  // Offset: x = -62, z = -58
  // -------------------------------------------------------------
  const menkaureGroup = new THREE.Group();
  menkaureGroup.position.set(-62, 0, -58);

  const base3 = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 22), sandBaseMat);
  base3.position.set(0, 0.6, 0);
  menkaureGroup.add(base3);

  const menkaureGeo = new THREE.ConeGeometry(14, 18, 4);
  const menkaureMesh = new THREE.Mesh(menkaureGeo, khufuMat);
  menkaureMesh.position.set(0, 9.0 + 1.2, 0);
  menkaureMesh.rotation.y = Math.PI / 4;
  menkaureMesh.castShadow = true;
  menkaureMesh.receiveShadow = true;
  menkaureGroup.add(menkaureMesh);

  root.add(menkaureGroup);

  // -------------------------------------------------------------
  // 4. THE GREAT SPHINX OF GIZA
  // Guarding in front of Khufu (offset: x = -4, z = 20, well clear of road)
  // -------------------------------------------------------------
  const sphGroup = new THREE.Group();
  sphGroup.position.set(-4, 0, 20);

  // Raised stone causeway plinth
  const sphPlinth = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.2, 15.0), sandBaseMat);
  sphPlinth.position.set(0, 0.6, 0);
  sphGroup.add(sphPlinth);

  // Couchant Lion Body
  const lionBody = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.0, 9.2), khufuMat);
  lionBody.position.set(0, 2.8, -1.2);
  sphGroup.add(lionBody);

  // Lion Paws extending forward
  [-1.7, 1.7].forEach(pxx => {
    const paw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 5.0), khufuMat);
    paw.position.set(pxx, 1.5, 4.8);
    sphGroup.add(paw);
  });

  // Pharaoh Head with Royal Nemes Headdress
  const sphHead = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 2.8), khufuMat);
  sphHead.position.set(0, 6.2, 1.4);
  sphGroup.add(sphHead);

  // Nemes royal headcloth (blue lapis wings)
  const nemesMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  [-1.8, 1.8].forEach(nx => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.8, 2.5), nemesMat);
    wing.position.set(nx, 5.5, 1.2);
    sphGroup.add(wing);
  });

  // Nemes crown top & beard
  const nemesCrown = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 3.2), nemesMat);
  nemesCrown.position.set(0, 8.2, 1.4);
  sphGroup.add(nemesCrown);

  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), nemesMat);
  beard.position.set(0, 4.2, 2.5);
  sphGroup.add(beard);

  root.add(sphGroup);

  // -------------------------------------------------------------
  // 5. DESERT SAND DUNES ACROSS THE HORIZON
  // Rolling desert dunes anchoring the pyramids into the backdrop
  // -------------------------------------------------------------
  const duneMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.95 });
  [
    { x: -18, z: 24, w: 32, h: 2.8, d: 20 },
    { x: -12, z: -24, w: 34, h: 2.8, d: 22 },
    { x: -45, z: 8,  w: 30, h: 2.5, d: 20 },
    { x: -75, z: -35, w: 40, h: 3.2, d: 26 }
  ].forEach(d => {
    const dune = new THREE.Mesh(new THREE.BoxGeometry(d.w, d.h, d.d), duneMat);
    dune.position.set(d.x, d.h / 2, d.z);
    root.add(dune);
  });

  parent.add(root);
  return root;
}

// -------------------------------------------------------------
// SINGULAR GRAND CITY LANDMARK MANAGER
// Each city has ONLY ONE unique national landmark in the left background!
// -------------------------------------------------------------
function updateCityLeftLandmark(cityTheme) {
  if (!window.cityLeftLandmarkGroup) return;
  while (window.cityLeftLandmarkGroup.children.length > 0) {
    const child = window.cityLeftLandmarkGroup.children[0];
    child.traverse(c => {
      if (c.isMesh) {
        if (c.geometry && c.geometry !== unitBoxGeo) c.geometry.dispose();
        if (c.material) { if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material.dispose(); }
      }
    });
    window.cityLeftLandmarkGroup.remove(child);
  }
  if (!cityTheme) return;

  const root = new THREE.Group();
  root.scale.set(1.0, 1.0, 1.0); // Exact 1:1 scale so summit is always visible

  if (cityTheme.id === 'tokyo') {
    createGrandTokyoTower(root, 0, 0, 0);
  } else if (cityTheme.id === 'yangon') {
    createGrandShwedagonPagoda(root, 0, 0, 0);
  } else if (cityTheme.id === 'littleindia') {
    createGrandTajMahal(root, 0, 0, 0);
  } else if (cityTheme.id === 'chinatown') {
    createImperialTempleOfHeaven(root, 0, 0, 0);
  } else if (cityTheme.id === 'pastel') {
    createCyberSpaceNeedleAndWheel(root, 0, 0, 0);
  } else if (cityTheme.id === 'paris') {
    createGrandEiffelTower(root, 0, 0, 0);
  } else if (cityTheme.id === 'rio') {
    createGrandChristTheRedeemer(root, 0, 0, 0);
  } else if (cityTheme.id === 'washington') {
    createGrandUSCapitolAndMonument(root, 0, 0, 0);
  } else if (cityTheme.id === 'dubai') {
    createGrandBurjKhalifaAndArab(root, 0, 0, 0);
  } else if (cityTheme.id === 'cairo') {
    createGrandPyramidAndSphinx(root, 0, 0, 0);
  }

  window.cityLeftLandmarkGroup.add(root);

  // Position on the left side of the street (well clear of the road)
  // Starts far on the horizon at Z = -220, moving closer as the player drives!
  const isCairo = (cityTheme.id === 'cairo');
  const targetX = isCairo ? -36.0 : -28.0;
  window.cityLeftLandmarkGroup.position.set(targetX, 0, -220.0);
  window.cityLeftLandmarkGroup.visible = true;
}
window.updateCityLeftLandmark = updateCityLeftLandmark;

// CULTURAL PROPS
function createHachikoStatue(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0xd97706); }
function createChintheStatue(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0xfacc15); }
function createFooDogStatue(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x94a3b8); }
function createRoyalElephantStatue(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x475569); }
function createCyberMascotStatue(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x00f5d4); }
function createJapaneseVendingMachine(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 2, 1, px, py, pz, 0xef4444); }
function createSakuraTreeWithBench(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 2, 3, 2, px, py, pz, 0xf472b6); }
function createBurmeseTeashopSetup(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x78350f); }
function createDimSumTeaStall(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x991b1b); }
function createMasalaChaiCart(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x0284c7); }
function createCozyCafePatio(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 1, 1, px, py, pz, 0x78350f); }
function createRetroArcadeCabinet(parent, px, py, pz, rotY = 0) { addVoxelBox(parent, 1, 2, 1, px, py, pz, 0x0f172a); }

function createParisianCafeBistro(parent, px, py, pz, rotY = 0) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  root.rotation.y = rotY;
  addVoxelBox(root, 1.1, 0.08, 1.1, 0, 0.78, 0, 0xf8fafc);
  addVoxelBox(root, 0.12, 0.78, 0.12, 0, 0.39, 0, 0x1e293b);
  addVoxelBox(root, 0.65, 0.06, 0.65, 0, 0.03, 0, 0x1e293b);
  addVoxelBox(root, 0.15, 0.16, 0.15, -0.22, 0.86, -0.15, 0xffffff);
  addVoxelBox(root, 0.24, 0.12, 0.16,  0.22, 0.84,  0.15, 0xd97706);
  [-0.75, 0.75].forEach(cx => {
    addVoxelBox(root, 0.48, 0.06, 0.48, cx, 0.45, 0, 0x78350f);
    addVoxelBox(root, 0.08, 0.55, 0.48, cx + (cx < 0 ? -0.22 : 0.22), 0.72, 0, 0x15803d);
    [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
      addVoxelBox(root, 0.06, 0.45, 0.06, cx + lx, 0.22, lz, 0x1e293b);
    });
  });
  const colX = 1.35;
  addVoxelBox(root, 0.85, 0.45, 0.85, colX, 0.22, 0, 0x166534);
  addVoxelBox(root, 0.72, 2.2, 0.72, colX, 1.55, 0, 0xfacc15, { emissive: 0xfde047, emissiveIntensity: 0.4 });
  addVoxelBox(root, 0.95, 0.35, 0.95, colX, 2.75, 0, 0x166534);
  addVoxelBox(root, 0.45, 0.45, 0.45, colX, 3.12, 0, 0x14532d);
  parent.add(root);
  return root;
}

function createCopacabanaCoconutKiosk(parent, px, py, pz, rotY = 0) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  root.rotation.y = rotY;
  addVoxelBox(root, 1.45, 0.85, 0.95, 0, 0.48, 0, 0x78350f);
  addVoxelBox(root, 1.55, 0.08, 1.05, 0, 0.92, 0, 0xfef08a);
  for (let c = -1; c <= 1; c++) {
    addVoxelBox(root, 0.28, 0.28, 0.28, c * 0.32, 1.08, 0, 0x22c55e);
  }
  addVoxelBox(root, 0.08, 2.4, 0.08, 0, 1.2, 0, 0x1e293b);
  addVoxelBox(root, 2.4, 0.35, 2.4, 0, 2.45, 0, 0xfacc15);
  addVoxelBox(root, 1.8, 0.25, 1.8, 0, 2.70, 0, 0x16a34a);
  addVoxelBox(root, 0.45, 1.9, 0.08, 1.15, 0.95, 0.25, 0x06b6d4);
  addVoxelBox(root, 0.22, 0.16, 0.22, 0.65, 0.98, 0.25, 0x701a75);
  parent.add(root);
  return root;
}

function createAmericanHotDogCart(parent, px, py, pz, rotY = 0) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  root.rotation.y = rotY;
  addVoxelBox(root, 1.35, 0.85, 0.95, 0, 0.55, 0, 0x94a3b8);
  addVoxelBox(root, 1.45, 0.08, 1.05, 0, 0.98, 0, 0xe2e8f0);
  [-0.65, 0.65].forEach(wx => {
    addVoxelBox(root, 0.12, 0.65, 0.65, wx, 0.35, 0, 0x1e293b);
  });
  addVoxelBox(root, 0.12, 0.35, 0.12, -0.25, 1.18, 0.15, 0xef4444);
  addVoxelBox(root, 0.12, 0.35, 0.12, -0.05, 1.18, 0.15, 0xfacc15);
  addVoxelBox(root, 0.45, 0.45, 0.45,  0.35, 1.20, 0, 0xd97706);
  addVoxelBox(root, 0.08, 2.2, 0.08, 0, 1.45, 0, 0x1e293b);
  addVoxelBox(root, 2.2, 0.32, 2.2, 0, 2.45, 0, 0xef4444);
  addVoxelBox(root, 1.5, 0.25, 1.5, 0, 2.70, 0, 0xfacc15);
  addVoxelBox(root, 0.55, 0.95, 0.55, 1.25, 0.48, 0, 0x1d4ed8);
  parent.add(root);
  return root;
}

function createDubaiGahwaMajlis(parent, px, py, pz, rotY = 0) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  root.rotation.y = rotY;
  addVoxelBox(root, 2.2, 0.08, 2.2, 0, 0.04, 0, 0x991b1b);
  addVoxelBox(root, 2.4, 0.04, 2.4, 0, 0.02, 0, 0xfacc15);
  addVoxelBox(root, 1.05, 0.42, 1.05, 0, 0.25, 0, 0xd97706);
  addVoxelBox(root, 0.28, 0.55, 0.28, 0, 0.68, 0, 0xfacc15, { metalness: 0.8, emissive: 0xf59e0b, emissiveIntensity: 0.6 });
  addVoxelBox(root, 0.12, 0.22, 0.12, 0, 0.98, 0, 0xfef08a);
  addVoxelBox(root, 0.35, 0.08, 0.35, 0.32, 0.48, 0, 0x451a03);
  addVoxelBox(root, 0.10, 0.12, 0.10, -0.28, 0.50, 0.15, 0xffffff);
  [-0.85, 0.85].forEach(cx => {
    addVoxelBox(root, 0.55, 0.25, 1.15, cx, 0.15, 0, 0x0284c7);
  });
  addVoxelBox(root, 0.45, 0.45, 0.25, -0.65, 0.45, 0.85, 0xfacc15);
  parent.add(root);
  return root;
}

function createCairoAhwaTeahouse(parent, px, py, pz, rotY = 0) {
  const root = new THREE.Group();
  root.position.set(px, py, pz);
  root.rotation.y = rotY;
  addVoxelBox(root, 1.15, 0.08, 1.15, 0, 0.55, 0, 0xf59e0b);
  addVoxelBox(root, 0.12, 0.55, 0.12, 0, 0.28, 0, 0x78350f);
  addVoxelBox(root, 0.24, 0.45, 0.24, -0.28, 0.82, -0.15, 0x0284c7);
  addVoxelBox(root, 0.08, 0.52, 0.08, -0.28, 1.25, -0.15, 0xd97706);
  addVoxelBox(root, 0.18, 0.18, 0.18, -0.28, 1.55, -0.15, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
  addVoxelBox(root, 0.14, 0.22, 0.14, 0.25, 0.68, 0.15, 0x15803d, { emissive: 0x22c55e, emissiveIntensity: 0.6 });
  [-0.68, 0.68].forEach(sx => {
    addVoxelBox(root, 0.42, 0.32, 0.42, sx, 0.18, 0, 0x92400e);
    addVoxelBox(root, 0.46, 0.06, 0.46, sx, 0.35, 0, 0xd97706);
  });
  addVoxelBox(root, 0.08, 2.2, 0.08, -0.65, 1.2, 0, 0x1e293b);
  addVoxelBox(root, 0.08, 2.2, 0.08,  0.65, 1.2, 0, 0x1e293b);
  addVoxelBox(root, 1.65, 0.12, 1.25, 0, 2.25, 0, 0xb91c1c);
  parent.add(root);
  return root;
}

function addBackgroundSkyline(parent, xSign, index, cityTheme) {
  // Disabled: removed repeating skyscraper monoliths that were crowding the horizon
  // and giving the illusion of dozens of duplicate landmarks.
}

// FULL REBUILD APARTMENT VISUALS WITH AUTHENTIC MULTI-PART ARCHITECTURE
function rebuildApartmentVisuals(apt, cityTheme, index) {
  apt.currentThemeId = cityTheme.id;
  while (apt.archGroup.children.length > 0) {
    const child = apt.archGroup.children[0];
    if (child.isInstancedMesh) child.dispose();
    apt.archGroup.remove(child);
  }
  apt.windowMeshes = [];

  const xSign = apt.side === 'left' ? -1 : 1;
  const bType = index % 6;
  const width = 8.4;
  const depth = 13.5;
  const faceX = -xSign * (width / 2 + 0.08);
  const rotFacingStreet = apt.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  const frontX = faceX - xSign * 1.5;
  const frontZ = -3.2;

  // =============================================================
  // 1. TOKYO (JAPAN)
  // =============================================================
  if (cityTheme.id === 'tokyo') {
    if (bType === 0) {
      // Cyberpunk Neon Commercial Mid-Rise (h=13.5)
      const h = 13.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x1e293b);
      // Recessed glass ground floor shop
      addVoxelBox(apt.archGroup, 1.2, 3.2, depth * 0.75, faceX - xSign * 0.3, 1.6, 0, 0x0f172a);
      addVoxelBox(apt.archGroup, 0.4, 2.6, depth * 0.7, faceX - xSign * 0.6, 1.6, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.65 });
      // Red storefront canopy
      addVoxelBox(apt.archGroup, 2.0, 0.35, depth * 0.8, faceX - xSign * 0.8, 3.3, 0, 0xef4444);
      // Upper floor illuminated ribbon windows
      [6.2, 9.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.5, depth * 0.75, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.8 });
        addVoxelBox(apt.archGroup, 0.6, 0.25, depth * 0.8, faceX - xSign * 0.15, wy - 0.9, 0, 0xf8fafc);
      });
      // Vertical neon blade sign
      addVoxelBox(apt.archGroup, 0.6, 7.5, 0.8, faceX - xSign * 0.7, 8.5, depth * 0.35, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.2 });
      // Roof parapet & HVAC cooling units
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0x334155);
      addVoxelBox(apt.archGroup, 3.2, 1.6, 2.8, -1.2, h + 0.8, 1.5, 0x64748b);
      addVoxelBox(apt.archGroup, 0.3, 3.2, 0.3, 1.5, h + 1.6, -2.0, 0x94a3b8);
      createHachikoStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Traditional Japanese Machiya Townhouse (h=8.5)
      addVoxelBox(apt.archGroup, width, 7.2, depth, 0, 3.6, 0, 0x271e18); // Dark timber
      // Cream plaster upper facade
      addVoxelBox(apt.archGroup, 0.4, 3.2, depth * 0.85, faceX - xSign * 0.1, 5.0, 0, 0xfef9c3);
      // Traditional wooden lattice shoji sliding windows
      addVoxelBox(apt.archGroup, 0.3, 2.2, depth * 0.65, faceX - xSign * 0.2, 5.0, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      addVoxelBox(apt.archGroup, 0.5, 0.2, depth * 0.7, faceX - xSign * 0.25, 3.8, 0, 0x78350f);
      // Sloping dark tiled kawara eaves over ground floor
      addVoxelBox(apt.archGroup, 2.2, 0.45, depth + 0.4, faceX - xSign * 0.6, 3.6, 0, 0x334155);
      // Tiled roof ridge
      addVoxelBox(apt.archGroup, width * 0.85, 1.6, depth * 0.85, 0, 8.0, 0, 0x334155);
      addVoxelBox(apt.archGroup, width * 0.6, 0.6, depth * 0.88, 0, 8.9, 0, 0x1e293b);
      createJapaneseVendingMachine(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Akihabara Commercial Electric High-Rise (h=18.5)
      const h = 18.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x09090b);
      // Floor slabs
      [4.5, 9.0, 13.5].forEach(fy => {
        addVoxelBox(apt.archGroup, width + 0.6, 0.5, depth + 0.6, 0, fy, 0, 0x334155);
      });
      // Giant glowing cyber billboard panel
      addVoxelBox(apt.archGroup, 0.4, 5.5, depth * 0.55, faceX - xSign * 0.1, 11.5, 0, 0xec4899, { emissive: 0xec4899, emissiveIntensity: 0.85 });
      // Illuminated windows
      [6.5, 15.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.6, depth * 0.65, faceX - xSign * 0.1, wy, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.7 });
      });
      // Roof penthouse & antenna
      addVoxelBox(apt.archGroup, 4.5, 2.5, 5.5, 0, h + 1.25, 0, 0x1e293b);
      addVoxelBox(apt.archGroup, 0.3, 4.2, 0.3, 1.2, h + 2.5, 1.5, 0xef4444);
      createJapaneseVendingMachine(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Ramen & Izakaya Alley Tavern (h=7.5)
      addVoxelBox(apt.archGroup, width, 7.0, depth, 0, 3.5, 0, 0x27272a);
      // Red chochin lanterns and wooden entry awning
      addVoxelBox(apt.archGroup, 1.8, 0.4, depth * 0.75, faceX - xSign * 0.6, 3.2, 0, 0x78350f);
      [-2.5, 0, 2.5].forEach(lz => {
        addVoxelBox(apt.archGroup, 0.6, 0.8, 0.6, faceX - xSign * 1.2, 2.6, lz, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.2 });
      });
      // 2nd floor balcony with warm shoji windows
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, 5.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.8 });
      addVoxelBox(apt.archGroup, 1.4, 0.8, depth * 0.7, faceX - xSign * 0.5, 4.3, 0, 0x3f3f46);
      // Traditional roof
      addVoxelBox(apt.archGroup, width + 0.8, 1.2, depth + 0.8, 0, 7.5, 0, 0x18181b);
      createSakuraTreeWithBench(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Modern Minimalist Shibuya Boutique (h=14.5)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xf8fafc);
      // Dark cantilevered geometric box volume protruding forward
      addVoxelBox(apt.archGroup, 2.2, 5.5, depth * 0.6, faceX - xSign * 0.8, 9.5, -1.0, 0x09090b);
      // Floor-to-ceiling glass display windows
      addVoxelBox(apt.archGroup, 0.4, 4.2, depth * 0.5, faceX - xSign * 1.8, 9.5, -1.0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.6 });
      // Ground floor glass storefront
      addVoxelBox(apt.archGroup, 0.4, 2.6, depth * 0.75, faceX - xSign * 0.2, 1.8, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.75 });
      // Roof parapet
      addVoxelBox(apt.archGroup, width + 0.4, 0.6, depth + 0.4, 0, h + 0.3, 0, 0x09090b);
      createJapaneseVendingMachine(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Showa Retro Mid-Rise with Rooftop Water Tower (h=13.0)
      const h = 13.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x334155);
      // Window bands with white concrete frames
      [4.2, 8.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.5, depth * 0.75, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
        addVoxelBox(apt.archGroup, 0.6, 0.25, depth * 0.8, faceX - xSign * 0.15, wy - 0.85, 0, 0xe2e8f0);
      });
      // Rooftop water tower on stilts
      addVoxelBox(apt.archGroup, 2.6, 2.8, 2.6, -1.2, h + 2.5, 0, 0x78350f);
      addVoxelBox(apt.archGroup, 0.4, 2.0, 0.4, -2.0, h + 1.0, -1.0, 0x475569);
      addVoxelBox(apt.archGroup, 0.4, 2.0, 0.4, -0.4, h + 1.0, -1.0, 0x475569);
      addVoxelBox(apt.archGroup, 0.4, 2.0, 0.4, -2.0, h + 1.0,  1.0, 0x475569);
      addVoxelBox(apt.archGroup, 0.4, 2.0, 0.4, -0.4, h + 1.0,  1.0, 0x475569);
      createSakuraTreeWithBench(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 2. YANGON (MYANMAR)
  // =============================================================
  } else if (cityTheme.id === 'yangon') {
    if (bType === 0) {
      // British-Colonial Heritage Arcade (h=11.5)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b); // Red brick
      // Ground floor arched colonnade
      addVoxelBox(apt.archGroup, 1.4, 3.8, depth * 0.85, faceX - xSign * 0.5, 1.9, 0, 0xfef3c7);
      [-3.0, 0, 3.0].forEach(az => {
        addVoxelBox(apt.archGroup, 1.6, 2.8, 1.2, faceX - xSign * 0.55, 1.4, az, 0x1e293b);
      });
      // 2nd floor shuttered teak French windows
      [-2.8, 0, 2.8].forEach(wz => {
        addVoxelBox(apt.archGroup, 0.4, 2.2, 1.4, faceX - xSign * 0.1, 7.2, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
        addVoxelBox(apt.archGroup, 0.5, 2.2, 0.35, faceX - xSign * 0.15, 7.2, wz - 0.85, 0x78350f);
        addVoxelBox(apt.archGroup, 0.5, 2.2, 0.35, faceX - xSign * 0.15, 7.2, wz + 0.85, 0x78350f);
      });
      // Classical roof cornice & urn finials
      addVoxelBox(apt.archGroup, width + 0.8, 0.8, depth + 0.8, 0, h + 0.4, 0, 0xfef3c7);
      addVoxelBox(apt.archGroup, width * 0.8, 1.4, depth * 0.8, 0, h + 1.2, 0, 0xfacc15);
      createChintheStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Golden Teak Multi-Tier Townhouse (h=10.5)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0x5c2c16);
      // Carved teakwood veranda & golden eaves trim
      addVoxelBox(apt.archGroup, 1.8, 0.5, depth * 0.85, faceX - xSign * 0.6, 4.2, 0, 0xfacc15);
      addVoxelBox(apt.archGroup, 1.6, 1.2, depth * 0.8, faceX - xSign * 0.5, 4.8, 0, 0x78350f);
      // Shaded green canvas teashop awning
      addVoxelBox(apt.archGroup, 2.2, 0.35, depth * 0.75, faceX - xSign * 0.8, 2.8, 0, 0x065f46);
      // Multi-pitch Burmese roof with golden spire finial
      addVoxelBox(apt.archGroup, width * 0.9, 1.4, depth * 0.85, 0, 9.2, 0, 0x78350f);
      addVoxelBox(apt.archGroup, width * 0.65, 1.2, depth * 0.65, 0, 10.4, 0, 0xfacc15);
      addVoxelBox(apt.archGroup, 0.6, 2.2, 0.6, 0, 11.8, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.5 });
      createBurmeseTeashopSetup(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Pansodan Heritage Colonial Mid-Rise (h=13.5)
      const h = 13.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfde68a); // Warm ochre
      // White stucco window quoins and arched lintels
      [4.5, 9.0].forEach(wy => {
        [-3.2, 0, 3.2].forEach(wz => {
          addVoxelBox(apt.archGroup, 0.4, 2.0, 1.6, faceX - xSign * 0.1, wy, wz, 0x1e3a8a);
          addVoxelBox(apt.archGroup, 0.5, 0.4, 2.0, faceX - xSign * 0.15, wy + 1.1, wz, 0xf8fafc);
          addVoxelBox(apt.archGroup, 0.7, 0.8, 1.8, faceX - xSign * 0.25, wy - 0.7, wz, 0x1e293b); // Wrought-iron railing
        });
      });
      // Classical triangular pediment roof
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, 1.2, 2.0, depth * 0.5, faceX - xSign * 0.2, h + 1.2, 0, 0xf8fafc);
      createChintheStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Golden Burmese Gable Shophouse (h=9.5)
      addVoxelBox(apt.archGroup, width, 8.0, depth, 0, 4.0, 0, 0x78350f);
      // Gilded fretwork frieze
      addVoxelBox(apt.archGroup, 0.4, 1.0, depth * 0.8, faceX - xSign * 0.15, 7.5, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.6 });
      // Shaded ground floor teashop veranda
      addVoxelBox(apt.archGroup, 2.0, 0.35, depth * 0.8, faceX - xSign * 0.7, 3.2, 0, 0xd97706);
      addVoxelBox(apt.archGroup, width * 0.85, 1.5, depth * 0.85, 0, 8.8, 0, 0xfacc15);
      createBurmeseTeashopSetup(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Downtown Rangoon Pastel Turquoise Shophouse (h=11.5)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x38bdf8);
      // White decorative moldings and shuttered arched windows
      [4.2, 8.2].forEach(wy => {
        [-2.8, 2.8].forEach(wz => {
          addVoxelBox(apt.archGroup, 0.4, 2.0, 1.5, faceX - xSign * 0.1, wy, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
          addVoxelBox(apt.archGroup, 0.5, 2.0, 0.35, faceX - xSign * 0.15, wy, wz - 0.9, 0x065f46);
          addVoxelBox(apt.archGroup, 0.5, 2.0, 0.35, faceX - xSign * 0.15, wy, wz + 0.9, 0x065f46);
        });
      });
      // Year plaque pediment on roof
      addVoxelBox(apt.archGroup, width + 0.6, 0.6, depth + 0.6, 0, h + 0.3, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, 0.8, 1.6, depth * 0.45, faceX - xSign * 0.2, h + 0.9, 0, 0xf8fafc);
      createChintheStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Grand Colonial Heritage Apartment (h=14.5)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b);
      // Continuous wooden balcony veranda on 2nd and 3rd floors
      [5.5, 10.5].forEach(vy => {
        addVoxelBox(apt.archGroup, 1.8, 0.4, depth * 0.85, faceX - xSign * 0.6, vy, 0, 0x78350f);
        addVoxelBox(apt.archGroup, 1.6, 1.0, depth * 0.8, faceX - xSign * 0.5, vy + 0.6, 0, 0xfacc15);
      });
      // Rooftop water tank
      addVoxelBox(apt.archGroup, 2.5, 2.5, 2.5, -1.5, h + 1.4, 0, 0x0284c7);
      createBurmeseTeashopSetup(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 3. CHINATOWN
  // =============================================================
  } else if (cityTheme.id === 'chinatown') {
    if (bType === 0) {
      // Traditional Flying Eaves Pavilion Shophouse (h=11)
      addVoxelBox(apt.archGroup, width, 7.5, depth, 0, 3.75, 0, 0x991b1b); // Crimson
      // Sweeping jade green tiled eaves over ground floor
      addVoxelBox(apt.archGroup, 2.2, 0.5, depth + 0.6, faceX - xSign * 0.6, 3.8, 0, 0x059669);
      // Upper floor carved wooden lattice windows
      [-2.8, 2.8].forEach(wz => {
        addVoxelBox(apt.archGroup, 0.4, 1.8, 1.6, faceX - xSign * 0.1, 5.6, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      });
      // Traditional sweeping hip-and-gable roof with upturned eaves
      addVoxelBox(apt.archGroup, width * 0.95, 1.6, depth * 0.95, 0, 8.2, 0, 0x059669);
      addVoxelBox(apt.archGroup, width * 0.7, 0.6, depth * 0.98, 0, 9.2, 0, 0xfacc15); // Gold ridge
      // Hanging red lanterns
      [-3.0, 3.0].forEach(lz => {
        addVoxelBox(apt.archGroup, 0.7, 0.9, 0.7, faceX - xSign * 1.2, 3.0, lz, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.2 });
      });
      createFooDogStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Heritage Lingnan Shophouse with Five-Foot-Way (h=12.5)
      const h = 12.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x78716c);
      // Sheltered pedestrian arcade walkway
      addVoxelBox(apt.archGroup, 1.8, 3.6, depth * 0.8, faceX - xSign * 0.5, 1.8, 0, 0x1c1917);
      // 2nd and 3rd floor green ceramic balustrades
      [5.2, 9.2].forEach(by => {
        addVoxelBox(apt.archGroup, 1.4, 0.9, depth * 0.75, faceX - xSign * 0.5, by, 0, 0x059669);
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, by + 1.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      });
      // Pediment gable with Chinese character plaque
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xb91c1c);
      addVoxelBox(apt.archGroup, 0.8, 1.6, depth * 0.4, faceX - xSign * 0.2, h + 1.2, 0, 0xfacc15);
      createFooDogStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Red Lantern Tea Merchant Mansion (h=14.5)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b);
      // Golden dougong bracket cornices under each floor
      [4.8, 9.5].forEach(dy => {
        addVoxelBox(apt.archGroup, 2.0, 0.4, depth * 0.85, faceX - xSign * 0.6, dy, 0, 0xfacc15);
        addVoxelBox(apt.archGroup, 1.6, 0.5, depth * 0.9, faceX - xSign * 0.5, dy + 0.4, 0, 0x059669);
      });
      // Windows with gold lattice frames
      [7.2, 12.0].forEach(wy => {
        [-2.8, 2.8].forEach(wz => {
          addVoxelBox(apt.archGroup, 0.4, 1.8, 1.6, faceX - xSign * 0.1, wy, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
        });
      });
      // Pagoda roof
      addVoxelBox(apt.archGroup, width + 0.8, 1.4, depth + 0.8, 0, h + 0.7, 0, 0x059669);
      createDimSumTeaStall(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Traditional Herbal Medicine Apothecary (h=9.0)
      addVoxelBox(apt.archGroup, width, 7.5, depth, 0, 3.75, 0, 0x7f1d1d);
      // Carved gold apothecary signboard and wooden screens
      addVoxelBox(apt.archGroup, 0.5, 1.2, depth * 0.75, faceX - xSign * 0.2, 3.2, 0, 0xfacc15);
      // Green glazed tile roof ridge
      addVoxelBox(apt.archGroup, width * 0.9, 1.5, depth * 0.9, 0, 8.2, 0, 0x059669);
      addVoxelBox(apt.archGroup, width * 0.6, 0.6, depth * 0.92, 0, 9.1, 0, 0xfacc15);
      createDimSumTeaStall(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Canton Merchant Guild Hall (h=12.0)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b);
      // Two-tier upturned tiled eaves
      addVoxelBox(apt.archGroup, 2.2, 0.5, depth * 0.85, faceX - xSign * 0.6, 5.5, 0, 0x059669);
      addVoxelBox(apt.archGroup, width + 0.8, 1.4, depth + 0.8, 0, h + 0.7, 0, 0x059669);
      // Gold fretwork balconies
      addVoxelBox(apt.archGroup, 1.4, 0.9, depth * 0.7, faceX - xSign * 0.5, 6.2, 0, 0xfacc15);
      createFooDogStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Modern High-Rise Chinatown Tower (h=18.5)
      const h = 18.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x44403c);
      // Gold structural pagoda framework
      [5.5, 11.5, 16.5].forEach(by => {
        addVoxelBox(apt.archGroup, width + 0.6, 0.5, depth + 0.6, 0, by, 0, 0xfacc15);
      });
      // Illuminated windows
      [8.0, 14.0].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 2.2, depth * 0.7, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      });
      // Pagoda tiered crown
      addVoxelBox(apt.archGroup, width * 0.8, 1.5, depth * 0.8, 0, h + 0.75, 0, 0xb91c1c);
      addVoxelBox(apt.archGroup, width * 0.5, 1.2, depth * 0.5, 0, h + 2.0, 0, 0xfacc15);
      createDimSumTeaStall(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 4. LITTLE INDIA
  // =============================================================
  } else if (cityTheme.id === 'littleindia') {
    if (bType === 0) {
      // Peacock-Blue Heritage Shophouse (h=11.0)
      const h = 10.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0284c7);
      // Ground-floor arched colonnade in cream marble
      addVoxelBox(apt.archGroup, 1.4, 3.6, depth * 0.85, faceX - xSign * 0.5, 1.8, 0, 0xf8fafc);
      // Ornate carved jharokha bay balconies with golden brackets
      [-2.8, 2.8].forEach(bz => {
        addVoxelBox(apt.archGroup, 1.6, 2.2, 1.8, faceX - xSign * 0.6, 6.2, bz, 0xf59e0b);
        addVoxelBox(apt.archGroup, 0.4, 1.4, 1.2, faceX - xSign * 1.3, 6.2, bz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      });
      // Tiered roof parapet with miniature decorative chhatri pavilions
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, 1.8, 1.4, 1.8, faceX - xSign * 0.2, h + 1.2, 0, 0xfacc15);
      createRoyalElephantStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Saffron Spice Merchant Haveli (h=13.0)
      const h = 12.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfde68a); // Saffron sandstone
      // Projecting multi-bay jharokha oriel windows
      addVoxelBox(apt.archGroup, 1.6, 3.5, depth * 0.65, faceX - xSign * 0.5, 7.5, 0, 0xd97706);
      addVoxelBox(apt.archGroup, 0.4, 2.2, depth * 0.55, faceX - xSign * 1.2, 7.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      // Striped textile fabric sun-canopy over ground floor
      addVoxelBox(apt.archGroup, 2.2, 0.35, depth * 0.8, faceX - xSign * 0.8, 3.2, 0, 0xef4444);
      // Fluted sandstone pilasters and carved floral friezes
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xf59e0b);
      createRoyalElephantStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Rose-Pink Sandstone Palace Mid-Rise (h=14.5)
      const h = 14.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfb7185); // Jaipur pink
      // 2 tiers of cusped Mughal horseshoe arches framing windows
      [4.8, 9.5].forEach(wy => {
        [-2.8, 2.8].forEach(wz => {
          addVoxelBox(apt.archGroup, 0.4, 2.2, 1.6, faceX - xSign * 0.1, wy, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
          addVoxelBox(apt.archGroup, 0.6, 0.4, 1.8, faceX - xSign * 0.15, wy + 1.2, wz, 0xf8fafc);
        });
      });
      // Rooftop corner chhatri cupolas
      [-2.8, 2.8].forEach(cz => {
        addVoxelBox(apt.archGroup, 1.8, 2.0, 1.8, faceX - xSign * 0.2, h + 1.2, cz, 0xf8fafc);
        addVoxelBox(apt.archGroup, 1.4, 1.0, 1.4, faceX - xSign * 0.2, h + 2.4, cz, 0xfacc15);
      });
      createMasalaChaiCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Sari & Spice Merchant Bazaar (h=9.5)
      addVoxelBox(apt.archGroup, width, 8.0, depth, 0, 4.0, 0, 0xfde047);
      // Colorful fabric shop awnings
      addVoxelBox(apt.archGroup, 2.2, 0.35, depth * 0.85, faceX - xSign * 0.8, 3.2, 0, 0xef4444);
      addVoxelBox(apt.archGroup, 2.0, 0.25, depth * 0.75, faceX - xSign * 0.7, 3.5, 0, 0x06b6d4);
      // Carved wooden brackets & decorative parapet
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, 5.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, 8.4, 0, 0xd97706);
      createMasalaChaiCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Amber Gold Sandstone Haveli (h=11.5)
      addVoxelBox(apt.archGroup, width, 10.0, depth, 0, 5.0, 0, 0xf59e0b);
      // Projecting bay balconies with carved brackets
      addVoxelBox(apt.archGroup, 1.6, 1.2, depth * 0.65, faceX - xSign * 0.5, 5.5, 0, 0xd97706);
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.55, faceX - xSign * 1.1, 6.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      // Stepped parapet with brass pinnacles
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, 10.4, 0, 0xd97706);
      addVoxelBox(apt.archGroup, 1.2, 1.2, 1.2, 0, 11.2, 0, 0xfacc15);
      createRoyalElephantStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Grand Indian Heritage Residence (h=16.0)
      const h = 15.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x06b6d4);
      // Continuous wrap-around verandas
      [5.5, 10.5].forEach(vy => {
        addVoxelBox(apt.archGroup, 1.8, 0.4, depth * 0.85, faceX - xSign * 0.6, vy, 0, 0xf8fafc);
        addVoxelBox(apt.archGroup, 1.6, 1.0, depth * 0.8, faceX - xSign * 0.5, vy + 0.6, 0, 0xfacc15);
      });
      // Polished brass corner cupola
      addVoxelBox(apt.archGroup, 2.4, 2.2, 2.4, -xSign * 1.5, h + 1.1, 0, 0xfacc15);
      createMasalaChaiCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 5. PASTEL METRO (CYBERPUNK)
  // =============================================================
  } else if (cityTheme.id === 'pastel') {
    if (bType === 0) {
      // Cyberpunk Neon Capsule Modular (h=12.5)
      const h = 12.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x1e1b4b);
      // Glowing neon edge strips
      addVoxelBox(apt.archGroup, 0.3, h, 0.3, faceX - xSign * 0.1, h / 2, -depth * 0.48, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 1.2 });
      addVoxelBox(apt.archGroup, 0.3, h, 0.3, faceX - xSign * 0.1, h / 2,  depth * 0.48, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 1.2 });
      // Stacked living pods with glowing viewports
      [3.8, 8.2].forEach(py => {
        addVoxelBox(apt.archGroup, 1.4, 2.2, 3.2, faceX - xSign * 0.5, py, 0, 0x0f172a);
        addVoxelBox(apt.archGroup, 0.4, 1.2, 2.2, faceX - xSign * 1.1, py, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.8 });
      });
      createCyberMascotStatue(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Holographic High-Rise (h=18.5)
      const h = 18.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0f172a);
      // Holographic billboard frame & glowing glass
      addVoxelBox(apt.archGroup, 0.4, 6.5, depth * 0.6, faceX - xSign * 0.1, 10.5, 0, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 0.95 });
      // Illuminated windows
      [5.5, 15.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.7, faceX - xSign * 0.1, wy, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.75 });
      });
      addVoxelBox(apt.archGroup, 0.3, 4.5, 0.3, 1.2, h + 2.2, 0, 0x00f5d4);
      createCozyCafePatio(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Retro Arcade Cyber Center (h=14.5)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x1e1b4b);
      // Glowing neon marquee canopy
      addVoxelBox(apt.archGroup, 2.2, 0.4, depth * 0.85, faceX - xSign * 0.8, 3.8, 0, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 1.0 });
      // Illuminated arcade windows
      addVoxelBox(apt.archGroup, 0.4, 2.2, depth * 0.7, faceX - xSign * 0.1, 1.8, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.85 });
      [7.5, 11.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.6, depth * 0.6, faceX - xSign * 0.1, wy, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.8 });
      });
      createRetroArcadeCabinet(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Minimalist Glass Penthouse (h=15.0)
      const h = 15.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x18181b);
      // Cyan glowing wrap-around glass curtain walls
      [4.5, 9.5, 13.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 2.0, depth * 0.7, faceX - xSign * 0.1, wy, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.7 });
      });
      // Rooftop sky-lounge terrace with glass rail
      addVoxelBox(apt.archGroup, width + 0.4, 0.6, depth + 0.4, 0, h + 0.3, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.4 });
      createCozyCafePatio(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Cantilevered Poly-Cube Mid-Rise (h=13.5)
      const h = 13.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0f172a);
      addVoxelBox(apt.archGroup, 2.2, 4.5, depth * 0.55, faceX - xSign * 0.8, 8.5, 1.0, 0x7c3aed);
      addVoxelBox(apt.archGroup, 0.4, 2.8, depth * 0.45, faceX - xSign * 1.8, 8.5, 1.0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.8 });
      // Ground floor lounge
      addVoxelBox(apt.archGroup, 0.4, 2.5, depth * 0.75, faceX - xSign * 0.2, 1.8, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.7 });
      createRetroArcadeCabinet(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Sky-Bridge Cyber Skyscraper (h=19.5)
      const h = 19.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x09090b);
      // Neon structural bands
      [5.5, 11.5, 16.5].forEach(by => {
        addVoxelBox(apt.archGroup, width + 0.4, 0.4, depth + 0.4, 0, by, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.8 });
      });
      // Cantilevered glowing skybridge pod
      addVoxelBox(apt.archGroup, 2.0, 3.2, 4.5, faceX - xSign * 0.8, 13.0, 0, 0xff007f, { emissive: 0xff007f, emissiveIntensity: 0.9 });
      createCozyCafePatio(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 6. PARIS (FRANCE)
  // =============================================================
  } else if (cityTheme.id === 'paris') {
    if (bType === 0) {
      // Haussmannian Corner Rotunda (h=13.5)
      addVoxelBox(apt.archGroup, width, 10.0, depth, 0, 5.0, 0, 0xfef3c7);
      // Charcoal zinc mansard roof with dormers
      addVoxelBox(apt.archGroup, width - 0.8, 3.2, depth - 0.8, 0, 11.6, 0, 0x334155);
      [-2.5, 2.5].forEach(dz => {
        addVoxelBox(apt.archGroup, 1.2, 1.5, 1.2, faceX - xSign * 0.4, 11.5, dz, 0xfef3c7);
      });
      // Continuous wrought-iron balconies on 2nd floor
      addVoxelBox(apt.archGroup, 1.2, 0.7, depth * 0.85, faceX - xSign * 0.6, 5.2, 0, 0x1e293b);
      // Windows with warm illumination
      [4.2, 7.8].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.6, depth * 0.65, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      });
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Grand Boulevard Cut-Limestone Residence (h=15.5)
      const h = 15.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfef3c7);
      addVoxelBox(apt.archGroup, width - 0.8, 3.2, depth - 0.8, 0, h + 1.6, 0, 0x475569);
      [6.0, 12.0].forEach(by => {
        addVoxelBox(apt.archGroup, 1.2, 0.7, depth * 0.85, faceX - xSign * 0.6, by, 0, 0x1e293b);
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.75, faceX - xSign * 0.1, by + 1.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      });
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Montmartre Atelier (h=13.5)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0xf8fafc);
      // Large artists' glass atelier window
      addVoxelBox(apt.archGroup, 0.4, 3.8, depth * 0.6, faceX - xSign * 0.1, 5.0, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.6 });
      // Zinc mansard roof with terracotta chimney pots
      addVoxelBox(apt.archGroup, width - 0.6, 3.5, depth - 0.6, 0, 10.25, 0, 0x334155);
      addVoxelBox(apt.archGroup, 0.8, 1.8, 0.8, 1.5, 12.8, -2.0, 0xb45309);
      addVoxelBox(apt.archGroup, 1.4, 0.35, depth * 0.7, faceX - xSign * 0.6, 3.0, 0, 0x1e3a8a);
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Latin Quarter Boulangerie Shophouse (h=9.5)
      const h = 8.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfef3c7);
      addVoxelBox(apt.archGroup, width + 0.8, 0.8, depth + 0.8, 0, h + 0.4, 0, 0x1e293b);
      addVoxelBox(apt.archGroup, 1.6, 0.35, depth * 0.75, faceX - xSign * 0.8, 3.2, 0, 0x1e3a8a);
      // Upper casement windows with warm glow
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, 5.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Beaux-Arts Grand Apartment (h=15.5)
      const h = 15.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, width + 0.6, 1.0, depth + 0.6, 0, h + 0.5, 0, 0x334155);
      // Windows with wrought-iron railings
      [5.5, 10.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
        addVoxelBox(apt.archGroup, 0.6, 0.5, depth * 0.7, faceX - xSign * 0.2, wy - 0.7, 0, 0x1e293b);
      });
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Seine Riverside Palace (h=14.5)
      const h = 13.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfef3c7);
      addVoxelBox(apt.archGroup, width + 1.2, 1.2, depth + 1.2, 0, h + 0.6, 0, 0xd4a373);
      // Windows and roof pavilion
      addVoxelBox(apt.archGroup, 0.4, 2.0, depth * 0.7, faceX - xSign * 0.1, 7.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      addVoxelBox(apt.archGroup, 4.5, 2.5, 5.5, 0, h + 1.8, 0, 0x475569);
      createParisianCafeBistro(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 7. RIO DE JANEIRO (BRASIL)
  // =============================================================
  } else if (cityTheme.id === 'rio') {
    if (bType === 0) {
      // Ipanema Coastal Apartment (h=11.5)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x67e8f9); // Ocean turquoise
      // Sun-shading horizontal brise-soleil louvers & open balconies
      [4.2, 8.2].forEach(by => {
        addVoxelBox(apt.archGroup, 1.6, 0.35, depth * 0.8, faceX - xSign * 0.6, by, 0, 0xfacc15);
        addVoxelBox(apt.archGroup, 1.4, 0.9, depth * 0.75, faceX - xSign * 0.5, by + 0.5, 0, 0xf8fafc);
        addVoxelBox(apt.archGroup, 0.4, 1.4, depth * 0.65, faceX - xSign * 0.1, by + 1.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      });
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Santa Teresa Bohemian Villa (h=12.0)
      const h = 12.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xfef08a);
      // Emerald green shuttered windows & terracotta roof
      [4.5, 8.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
        addVoxelBox(apt.archGroup, 0.5, 1.8, 0.4, faceX - xSign * 0.15, wy, -2.5, 0x15803d);
        addVoxelBox(apt.archGroup, 0.5, 1.8, 0.4, faceX - xSign * 0.15, wy,  2.5, 0x15803d);
      });
      addVoxelBox(apt.archGroup, width + 0.8, 0.8, depth + 0.8, 0, h + 0.4, 0, 0xb45309);
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Multilevel Staggered Favela Terraces (h=14)
      const favCols = [0xf59e0b, 0xec4899, 0x06b6d4, 0x10b981, 0x8b5cf6];
      for (let f = 0; f < 5; f++) {
        const fw = 4.5;
        const fh = 3.2;
        const fd = 5.2;
        const fx = ((f % 2) - 0.5) * 3.5;
        const fy = 1.6 + f * 2.8;
        const fz = ((f % 3) - 1.0) * 3.8;
        addVoxelBox(apt.archGroup, fw, fh, fd, fx, fy, fz, favCols[f % favCols.length]);
        // Windows on favela blocks
        addVoxelBox(apt.archGroup, 0.3, 1.0, 1.2, fx + (apt.side === 'left' ? -fw/2 : fw/2), fy, fz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
        // Blue rooftop water tank (caixa d'água)
        addVoxelBox(apt.archGroup, 1.1, 0.8, 1.1, fx, fy + fh / 2 + 0.4, fz, 0x0284c7);
      }
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Copacabana Art Deco Ziggurat (h=11.5)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xf8fafc);
      // Rounded corner balconies & blue accents
      addVoxelBox(apt.archGroup, 1.6, 0.8, depth * 0.7, faceX - xSign * 0.6, 5.5, 0, 0x0284c7);
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.6, faceX - xSign * 0.1, 8.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      addVoxelBox(apt.archGroup, width * 0.7, 2.0, depth * 0.7, 0, h + 1.0, 0, 0xfacc15);
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Tropical Modernist Villa with Cobogó Breeze-Blocks (h=11.0)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0x334155);
      // White cobogó breeze-block decorative wall
      addVoxelBox(apt.archGroup, 0.4, 4.0, depth * 0.65, faceX - xSign * 0.2, 5.5, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, 0.3, 3.2, depth * 0.55, faceX - xSign * 0.1, 5.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      // Cantilevered roof garden terrace
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, 8.8, 0, 0x16a34a);
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Carnaval Coastal High-Rise (h=15.5)
      const h = 15.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0f172a);
      // Wave-shaped balconies
      [4.5, 9.0, 13.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 1.6, 0.4, depth * 0.8, faceX - xSign * 0.6, wy, 0, 0x06b6d4);
        addVoxelBox(apt.archGroup, 1.4, 0.8, depth * 0.75, faceX - xSign * 0.5, wy + 0.5, 0, 0xf8fafc);
        addVoxelBox(apt.archGroup, 0.4, 1.4, depth * 0.65, faceX - xSign * 0.1, wy + 1.2, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.7 });
      });
      createCopacabanaCoconutKiosk(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 8. WASHINGTON D.C. (USA)
  // =============================================================
  } else if (cityTheme.id === 'washington') {
    if (bType === 0) {
      // Georgetown Federal Red-Brick Rowhouse (h=11.5)
      const h = 11.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b); // Red brick
      // White limestone entrance stoop staircase & black iron railings
      addVoxelBox(apt.archGroup, 1.8, 1.2, 2.2, faceX - xSign * 0.8, 0.6, -1.0, 0xe2e8f0);
      addVoxelBox(apt.archGroup, 0.2, 1.4, 2.2, faceX - xSign * 1.6, 1.2, -1.0, 0x1e293b);
      // Sash windows with contrasting white stone lintels and shutters
      [4.5, 8.5].forEach(wy => {
        [-2.8, 2.8].forEach(wz => {
          addVoxelBox(apt.archGroup, 0.4, 1.8, 1.4, faceX - xSign * 0.1, wy, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
          addVoxelBox(apt.archGroup, 0.5, 0.35, 1.8, faceX - xSign * 0.15, wy + 1.0, wz, 0xf8fafc);
        });
      });
      // Dentil roof cornice
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xf8fafc);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Neoclassical Limestone Mid-Rise (h=14.5)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xe2e8f0); // Indiana limestone
      // Classical fluted pilasters on facade
      [-3.5, -1.2, 1.2, 3.5].forEach(pz => {
        addVoxelBox(apt.archGroup, 0.4, h, 0.6, faceX - xSign * 0.1, h / 2, pz, 0xf8fafc);
      });
      // Windows with warm illumination
      [5.2, 10.2].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.65, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      });
      // Classical triangular pediment roof
      addVoxelBox(apt.archGroup, width + 0.8, 0.8, depth + 0.8, 0, h + 0.4, 0, 0xf8fafc);
      addVoxelBox(apt.archGroup, 1.2, 1.8, depth * 0.5, faceX - xSign * 0.2, h + 1.2, 0, 0xf8fafc);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Victorian Brownstone Rowhouse with Bay Windows (h=12.0)
      const h = 12.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x6e3c23); // Brownstone
      // Projecting 3-story polygonal bay window
      addVoxelBox(apt.archGroup, 1.6, 8.5, 3.8, faceX - xSign * 0.6, 5.5, 0, 0x542d1a);
      [3.5, 7.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.6, 2.6, faceX - xSign * 1.4, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      });
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0x3e2012);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Capitol Hill Federal Townhouse (h=10.5)
      const h = 10.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x1e3a8a); // Federal blue
      // Entrance stoop and striped red canopy
      addVoxelBox(apt.archGroup, 1.6, 0.8, 2.0, faceX - xSign * 0.7, 0.4, 0, 0xe2e8f0);
      addVoxelBox(apt.archGroup, 1.8, 0.35, depth * 0.65, faceX - xSign * 0.8, 3.2, 0, 0xef4444);
      // Windows with white shutters
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.6, faceX - xSign * 0.1, 6.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      addVoxelBox(apt.archGroup, width + 0.8, 0.8, depth + 0.8, 0, h + 0.4, 0, 0xf8fafc);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Embassy Row Beaux-Arts Mansion (h=13.5)
      const h = 13.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xf1f5f9);
      // Juliette balconies and large piano nobile windows
      addVoxelBox(apt.archGroup, 1.4, 0.8, depth * 0.7, faceX - xSign * 0.5, 5.5, 0, 0x1e293b);
      addVoxelBox(apt.archGroup, 0.4, 2.0, depth * 0.65, faceX - xSign * 0.1, 6.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      // Mansard slate roof with dormers
      addVoxelBox(apt.archGroup, width - 0.6, 2.8, depth - 0.6, 0, h + 1.4, 0, 0x059669);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Dupont Circle Heritage Red-Brick Apartment (h=15.5)
      const h = 15.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x991b1b);
      // White limestone beltcourses and grid of glowing windows
      [4.5, 8.5, 12.5].forEach(wy => {
        addVoxelBox(apt.archGroup, 0.4, 1.6, depth * 0.75, faceX - xSign * 0.1, wy, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
        addVoxelBox(apt.archGroup, 0.6, 0.3, depth * 0.8, faceX - xSign * 0.15, wy - 0.9, 0, 0xe2e8f0);
      });
      // Classical roof cornice & copper water tank
      addVoxelBox(apt.archGroup, width + 0.8, 1.0, depth + 0.8, 0, h + 0.5, 0, 0xe2e8f0);
      addVoxelBox(apt.archGroup, 2.5, 2.5, 2.5, -1.2, h + 1.8, 0, 0x059669);
      createAmericanHotDogCart(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 9. DUBAI (UAE)
  // =============================================================
  } else if (cityTheme.id === 'dubai') {
    if (bType === 0) {
      // Al Fahidi Historic Wind-Tower House (h=12.0)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0xd4a373); // Desert coral stone
      // Traditional architectural wind tower (barjeel) rising on roof
      const twX = -xSign * 1.5;
      const twZ = 2.0;
      addVoxelBox(apt.archGroup, 3.4, 5.5, 3.4, twX, 10.5, twZ, 0xd4a373);
      // Wind-catch cross vents
      addVoxelBox(apt.archGroup, 3.6, 1.2, 0.4, twX, 11.5, twZ, 0x1e293b);
      addVoxelBox(apt.archGroup, 0.4, 1.2, 3.6, twX, 11.5, twZ, 0x1e293b);
      // Mashrabiya wooden lattice bay windows
      addVoxelBox(apt.archGroup, 1.2, 2.0, 2.4, faceX - xSign * 0.4, 5.0, -2.5, 0x5c2c16);
      addVoxelBox(apt.archGroup, 0.4, 1.2, 1.6, faceX - xSign * 0.9, 5.0, -2.5, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Marina Aerodynamic Glass Skyscraper (h=18.5)
      const h = 17.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0f172a);
      // Reflective cyan curtain walls & white structural ribs
      addVoxelBox(apt.archGroup, 0.4, h * 0.85, depth * 0.75, faceX - xSign * 0.1, h * 0.5, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.75 });
      [-3.5, 3.5].forEach(rz => {
        addVoxelBox(apt.archGroup, 0.6, h, 0.6, faceX - xSign * 0.15, h / 2, rz, 0xf8fafc);
      });
      // Illuminated crown
      addVoxelBox(apt.archGroup, width * 0.75, 1.6, depth * 0.75, 0, h + 0.8, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Twisted Infinity Tower (h=20.0)
      const h = 19.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x1e293b);
      for (let s = 0; s < 6; s++) {
        const mesh = addVoxelBox(apt.archGroup, width - 0.6, 2.8, depth - 0.8, 0, 1.8 + s * 3.0, 0, 0x0284c7, { emissive: 0x38bdf8, emissiveIntensity: 0.4 });
        mesh.rotation.y = s * 0.12;
      }
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Luxury Arabian Oasis Villa (h=10.5)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0xfde047);
      // Horseshoe arch portico with brass geometric screens
      addVoxelBox(apt.archGroup, 1.8, 3.5, depth * 0.65, faceX - xSign * 0.6, 1.8, 0, 0xd4a373);
      // Upper veranda with golden dome cupola
      addVoxelBox(apt.archGroup, 2.0, 2.2, 2.0, -xSign * 1.5, 10.0, 0, 0xfacc15);
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Cantilevered Sky-Villa Tower (h=17.5)
      const h = 17.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x0f172a);
      // Cantilevered glass suites protruding forward
      addVoxelBox(apt.archGroup, 2.2, 3.6, depth * 0.55, faceX - xSign * 0.8, 10.5, 0, 0x0284c7);
      addVoxelBox(apt.archGroup, 0.4, 2.2, depth * 0.45, faceX - xSign * 1.8, 10.5, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.8 });
      // Golden vertical accent strips
      addVoxelBox(apt.archGroup, 0.4, h, 0.4, faceX - xSign * 0.1, h / 2, -3.5, 0xfacc15);
      addVoxelBox(apt.archGroup, 0.4, h, 0.4, faceX - xSign * 0.1, h / 2,  3.5, 0xfacc15);
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Twin Spire High-Rise with Skybridge (h=18.5)
      const h = 18.5;
      addVoxelBox(apt.archGroup, width * 0.42, h, depth * 0.42, 0, h / 2, -depth * 0.26, 0x0f172a);
      addVoxelBox(apt.archGroup, width * 0.42, h, depth * 0.42, 0, h / 2,  depth * 0.26, 0x0284c7);
      // Skybridge connecting towers
      addVoxelBox(apt.archGroup, width * 0.45, 2.5, depth * 0.35, 0, 13.0, 0, 0x00f5d4, { emissive: 0x00f5d4, emissiveIntensity: 0.85 });
      createDubaiGahwaMajlis(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }

  // =============================================================
  // 10. CAIRO (EGYPT)
  // =============================================================
  } else {
    if (bType === 0) {
      // Fatimid Historic Sandstone Townhouse with Mashrabiya (h=10.5)
      const h = 10.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xdfb887); // Warm sandstone
      // Projecting dark wooden mashrabiya lattice oriel bay windows
      [-2.8, 2.8].forEach(wz => {
        addVoxelBox(apt.archGroup, 1.2, 2.2, 2.0, faceX - xSign * 0.4, 6.0, wz, 0x5c3818);
        addVoxelBox(apt.archGroup, 0.8, 1.2, 1.2, faceX - xSign * 0.5, 6.0, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      });
      // Crenelated desert roof battlements
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xc89658);
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 1) {
      // Mamluk Residence with Octagonal Minaret Turret (h=17.8)
      const h = 11.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xdfb887);
      // Corner minaret turret with domed cupola
      const mx = -xSign * 1.8;
      const mz = -depth * 0.3;
      addVoxelBox(apt.archGroup, 2.8, 14.5, 2.8, mx, 7.25, mz, 0xc89658);
      addVoxelBox(apt.archGroup, 3.2, 0.6, 3.2, mx, 14.8, mz, 0xdfb887); // Balcony
      addVoxelBox(apt.archGroup, 2.0, 2.2, 2.0, mx, 16.2, mz, 0xc89658);
      addVoxelBox(apt.archGroup, 1.2, 1.2, 1.2, mx, 17.8, mz, 0xfacc15); // Golden dome
      // Windows with warm illumination
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.5, faceX - xSign * 0.1, 6.5, depth * 0.15, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 2) {
      // Desert Terraced Citadel Residence (h=12.0)
      addVoxelBox(apt.archGroup, width, 8.5, depth, 0, 4.25, 0, 0xc89658);
      // Stepped upper terrace with shaded wooden pergola
      addVoxelBox(apt.archGroup, width * 0.7, 3.2, depth * 0.7, -xSign * 1.0, 10.1, 0, 0xdfb887);
      addVoxelBox(apt.archGroup, 2.4, 0.3, depth * 0.6, faceX - xSign * 0.4, 11.8, 0, 0x78350f);
      // Arched recessed windows
      addVoxelBox(apt.archGroup, 0.4, 1.8, depth * 0.55, faceX - xSign * 0.1, 5.2, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 3) {
      // Islamic Cairo Shophouse with Striped Awning (h=10.0)
      addVoxelBox(apt.archGroup, width, 8.0, depth, 0, 4.0, 0, 0xdfb887);
      // Striped awning over ground-floor ahwa
      addVoxelBox(apt.archGroup, 2.2, 0.35, depth * 0.8, faceX - xSign * 0.8, 3.2, 0, 0x064e3b);
      addVoxelBox(apt.archGroup, 1.2, 1.8, depth * 0.55, faceX - xSign * 0.4, 5.5, 0, 0x5c3818); // Mashrabiya
      addVoxelBox(apt.archGroup, 0.4, 1.2, depth * 0.45, faceX - xSign * 0.9, 5.5, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.6 });
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, 8.4, 0, 0xc89658);
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else if (bType === 4) {
      // Khan el-Khalili Merchant House (h=13.0)
      const h = 12.0;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0xb8864f);
      // Ground floor arched merchant arcade
      addVoxelBox(apt.archGroup, 1.4, 3.5, depth * 0.75, faceX - xSign * 0.5, 1.75, 0, 0x5c3818);
      addVoxelBox(apt.archGroup, 0.4, 2.2, depth * 0.65, faceX - xSign * 1.1, 1.75, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.7 });
      // 2nd and 3rd floor mashrabiya lattice oriels
      [-2.8, 2.8].forEach(wz => {
        addVoxelBox(apt.archGroup, 1.2, 2.2, 1.8, faceX - xSign * 0.4, 7.5, wz, 0x5c3818);
        addVoxelBox(apt.archGroup, 0.4, 1.4, 1.2, faceX - xSign * 0.9, 7.5, wz, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      });
      // Crenelated roof
      addVoxelBox(apt.archGroup, width + 0.6, 0.8, depth + 0.6, 0, h + 0.4, 0, 0xdfb887);
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);

    } else {
      // Nile Corniche Grand Residence (h=15.0)
      const h = 14.5;
      addVoxelBox(apt.archGroup, width, h, depth, 0, h / 2, 0, 0x8c5e34);
      // Multi-tiered wooden verandas & windows
      [4.8, 9.8].forEach(vy => {
        addVoxelBox(apt.archGroup, 1.6, 0.4, depth * 0.8, faceX - xSign * 0.6, vy, 0, 0x78350f);
        addVoxelBox(apt.archGroup, 1.4, 0.8, depth * 0.75, faceX - xSign * 0.5, vy + 0.5, 0, 0xdfb887);
        addVoxelBox(apt.archGroup, 0.4, 1.6, depth * 0.65, faceX - xSign * 0.1, vy + 1.4, 0, 0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.65 });
      });
      // Overhanging roof cornice
      addVoxelBox(apt.archGroup, width + 0.8, 1.0, depth + 0.8, 0, h + 0.5, 0, 0xdfb887);
      createCairoAhwaTeahouse(apt.archGroup, frontX, 0, frontZ, rotFacingStreet);
    }
  }

  // Street-Level Native Signboard
  const stallX = -xSign * (width / 2 + 1.05);
  addVoxelBox(apt.archGroup, 1.9, 0.35, 4.8, stallX, 2.85, -3.2, cityTheme.accent);
  const signInfo = cityTheme.signs[index % cityTheme.signs.length];
  const signMesh = createNativeSignboardMesh(signInfo.top, signInfo.bottom, signInfo.bg, signInfo.fg, 0.28, 1.45, 3.8);
  signMesh.position.set(stallX - xSign * 0.35, 4.15, -3.2);
  apt.archGroup.add(signMesh);

  // Lush City Tree
  const treeX = -xSign * (width / 2 + 0.95);
  addVoxelBox(apt.archGroup, 0.52, 1.8, 0.52, treeX, 0.9, 5.4, 0x78350f);
  const leafCol = cityTheme.id === 'tokyo' ? 0xf472b6 : (cityTheme.id === 'chinatown' ? 0x10b981 : 0x22c55e);
  addVoxelBox(apt.archGroup, 1.85, 2.1, 1.85, treeX, 2.7, 5.4, leafCol);
  batchStaticVoxelBoxes(apt.archGroup);
}

var apartments = [];
var BLOCK_SPACING = 26;
var NUM_PAIRS = 10;
var globalOrderCounter = 0;
window.apartments = apartments;
window.NUM_PAIRS = NUM_PAIRS;
window.BLOCK_SPACING = BLOCK_SPACING;

    function createApartmentBuilding(side, zPos, index) {
      const group = new THREE.Group();
      const xSign = side === 'left' ? -1 : 1;
      const xCenter = xSign * 16.2;
      group.position.set(xCenter, 0, zPos);

      const archGroup = new THREE.Group();
      group.add(archGroup);

      const porchX = -xSign * (8.4 / 2 + 2.05);
      addVoxelBox(group, 3.1, 0.26, 3.4, porchX, 0.14, 1.2, 0x0f172a);

      const ringGroup = new THREE.Group();
      ringGroup.position.set(porchX, 0.30, 1.2);
      group.add(ringGroup);

      const ringColor = 0x00f5d4;
      const r1 = addVoxelBox(ringGroup, 3.0, 0.18, 0.28, 0, 0, -1.4, ringColor, { emissive: ringColor, emissiveIntensity: 0.95 });
      const r2 = addVoxelBox(ringGroup, 3.0, 0.18, 0.28, 0, 0,  1.4, ringColor, { emissive: ringColor, emissiveIntensity: 0.95 });
      const r3 = addVoxelBox(ringGroup, 0.28, 0.18, 3.0, -1.4, 0, 0, ringColor, { emissive: ringColor, emissiveIntensity: 0.95 });
      const r4 = addVoxelBox(ringGroup, 0.28, 0.18, 3.0,  1.4, 0, 0, ringColor, { emissive: ringColor, emissiveIntensity: 0.95 });

      // Dynamic Shrinking Target Indicator & Sweet-Spot Center Bullseye
      const sweetSpotGroup = new THREE.Group();
      ringGroup.add(sweetSpotGroup);
      const centerMarker = addVoxelBox(sweetSpotGroup, 1.1, 0.22, 1.1, 0, 0.04, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.2 });
      const shrinkRing = new THREE.Group();
      sweetSpotGroup.add(shrinkRing);
      addVoxelBox(shrinkRing, 2.6, 0.14, 0.22, 0, 0.06, -1.2, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
      addVoxelBox(shrinkRing, 2.6, 0.14, 0.22, 0, 0.06,  1.2, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
      addVoxelBox(shrinkRing, 0.22, 0.14, 2.6, -1.2, 0.06, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });
      addVoxelBox(shrinkRing, 0.22, 0.14, 2.6,  1.2, 0.06, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.1 });

      const customerSlot = new THREE.Group();
      customerSlot.position.set(porchX, 0.28, 1.2);
      customerSlot.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
      group.add(customerSlot);

      const cloudEl = document.createElement('div');
      cloudEl.className = 'porch-thought-cloud hidden';
      document.getElementById('thought-clouds-layer').appendChild(cloudEl);

      const aptData = {
        group,
        archGroup,
        side,
        index,
        porchX,
        ringGroup,
        ringBars: [r1, r2, r3, r4],
        sweetSpotGroup,
        shrinkRing,
        centerMarker,
        customerSlot,
        charMesh: null,
        cloudEl,
        hasOrder: false,
        wantedType: 0,
        character: CHARACTER_TYPES[0],
        delivered: false,
        orderId: 0
      };

      cloudEl.addEventListener('click', event => {
        if (!event.target.closest('.quick-throw-cloud-btn') || !isResidentInThrowRange(aptData)) return;
        event.preventDefault();
        event.stopPropagation();
        const matchingSlot = gameState.handSlots.indexOf(aptData.wantedType);
        if (matchingSlot !== -1) {
          gameState.lockedTargetApt = aptData;
          throwFromSlot(matchingSlot);
        }
      });

      rebuildApartmentVisuals(aptData, CITY_THEMES[gameState.cityIndex], index);
      configureApartmentCustomer(aptData, zPos < -42);
      envGroup.add(group);
      return aptData;
    }

    function createVoxelCrownMesh() {
      const crown = new THREE.Group();
      const cOpt = { emissive: 0xfacc15, emissiveIntensity: 0.95, metalness: 0.8 };
      addVoxelBox(crown, 1.0, 0.22, 1.0, 0, 0, 0, 0xfacc15, cOpt);
      addVoxelBox(crown, 0.24, 0.44, 0.24, -0.38, 0.28, -0.38, 0xfacc15, cOpt);
      addVoxelBox(crown, 0.24, 0.44, 0.24,  0.38, 0.28, -0.38, 0xfacc15, cOpt);
      addVoxelBox(crown, 0.24, 0.44, 0.24, -0.38, 0.28,  0.38, 0xfacc15, cOpt);
      addVoxelBox(crown, 0.24, 0.44, 0.24,  0.38, 0.28,  0.38, 0xfacc15, cOpt);
      addVoxelBox(crown, 0.28, 0.28, 0.28, 0, 0.22, 0.42, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.0 });
      crown.position.y = 2.45;
      return crown;
    }

    function configureApartmentCustomer(apt, allowOrder = true) {
      while (apt.customerSlot.children.length > 0) {
        apt.customerSlot.remove(apt.customerSlot.children[0]);
      }
      apt.charMesh = null;
      apt.crownMesh = null;
      apt.delivered = false;
      apt.isVip = false;
      apt.vipNeeded = 1;
      apt.vipDelivered = 0;

      const isRushHour = !!(gameState && gameState.rushHourActive);
      const minOrderGap = isRushHour ? 48 : 95;

      // Enforce order gap so orders don't overcrowd
      const tooCloseToExistingOrder = apartments.some(
        other => other !== apt && other.hasOrder && !other.delivered && Math.abs(other.group.position.z - apt.group.position.z) < minOrderGap
      );

      // Hold off spawning customer orders while player is still in Tutorial Step 1 (Steering Practice)
      if (gameState.tutorialActive && gameState.tutorialStep < 2) {
        apt.hasOrder = false;
        apt.ringGroup.visible = false;
        apt.cloudEl.classList.add('hidden');
        return;
      }

      const skipChance = routeState.kind === 'express' ? 0 : isRushHour ? 0.12 : 0.35;
      if (!allowOrder || tooCloseToExistingOrder || Math.random() < skipChance) {
        apt.hasOrder = false;
        apt.ringGroup.visible = false;
        apt.cloudEl.classList.add('hidden');
        return;
      }

      globalOrderCounter++;
      apt.hasOrder = true;
      apt.orderId = globalOrderCounter;

      // In Rush Hour Blitz, 65% chance for high-tier parcel (Legendary, Gold, Epic: ids 0 to 5)
      if (isRushHour && Math.random() < 0.65) {
        const highTierPool = [0, 1, 2, 3, 4, 5];
        apt.wantedType = highTierPool[Math.floor(Math.random() * highTierPool.length)];
      } else {
        apt.wantedType = Math.floor(Math.random() * PARCEL_TYPES.length);
      }
      apt.character = CHARACTER_TYPES[Math.floor(Math.random() * CHARACTER_TYPES.length)];

      const charMesh = createVoxelCharacter(apt.character.id, 0.96);
      apt.customerSlot.add(charMesh);
      apt.charMesh = charMesh;

      // VIP Double Order (20% chance)
      const isVip = routeState.kind === 'express' || Math.random() < 0.20;
      apt.isVip = isVip;
      apt.vipNeeded = isVip ? 2 : 1;
      apt.vipDelivered = 0;
      if (isVip) {
        const crown = createVoxelCrownMesh();
        apt.crownMesh = crown;
        apt.customerSlot.add(crown);
      }

      apt.ringGroup.visible = false;
      ensureParcelAvailableInHand(apt.wantedType);
    }

    function transformAllApartmentsToCity(cityTheme) {
      windowMeshes.length = 0;
      apartments.forEach((apt, idx) => {
        rebuildApartmentVisuals(apt, cityTheme, idx);
      });
      if (typeof updateCityLeftLandmark === 'function') {
        updateCityLeftLandmark(cityTheme);
      }
    }
    window.transformAllApartmentsToCity = transformAllApartmentsToCity;

