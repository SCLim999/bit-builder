/* ============================================================================
   BIT BUILDER — 3D view
   A real three.js scene of the same board: walls and doors are solid blocks,
   parts float above the floor, the technician is a small 3D robot, and a
   perspective camera follows from behind and above with lights and shadows.

   The flat canvas sprites are reused as textures, so both views always show
   the same things. The engine is untouched: every frame this file compares
   the grid, items and entities with what it built last time and changes only
   what differs — which also covers rewinds, which replace the whole grid.
   ========================================================================== */

const View3D = (() => {
  const TEX = 128;              // texture size for tile and item sprites
  const WALL_H = 0.72;          // block heights, in tiles
  const DOOR_H = 0.8;
  const TOGGLE_H = 0.6;
  const CRATE = 0.84;
  const CAM_UP = 13, CAM_BACK = 7.2;   // camera offset from the point it looks at
  const ANIMATED = "~*<>^vSX!T0";       // tiles whose sprite moves

  let ok = null;                // null until tried, then true / false
  let renderer, scene, camera, sun, hemi, ground, holder;
  let built = null;             // the Game object the scene was built for
  let cells = [];               // [y][x] -> { tKey, tObj, iKey, iObj }
  let crates = [], bugs = [], robot = null;
  let camTarget = null;         // where the camera is looking, eased each frame
  const textures = new Map();   // key -> { tex, canvas, draw, animated }
  const geo = {}, mats = new Map();

  /* THREE may be missing (script blocked, old browser) or WebGL switched off;
     the game then stays on the flat board. */
  function supported() {
    if (ok !== null) return ok;
    ok = false;
    if (typeof THREE === "undefined") return ok;
    try {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return ok;
      init();
      ok = true;
    } catch (e) { ok = false; }
    return ok;
  }

  function init() {
    const canvas = document.getElementById("board3d");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camTarget = new THREE.Vector3();

    hemi = new THREE.HemisphereLight(0xdbe7ff, 0x1a2434, 0.55);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
    sun.shadow.bias = -0.0008;
    scene.add(sun, sun.target);

    ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0x000000 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;          // below the sunk coolant and overheat tiles
    scene.add(ground);

    geo.tile = new THREE.PlaneGeometry(1, 1);
    geo.tile.rotateX(-Math.PI / 2);
    geo.wall = new THREE.BoxGeometry(1, WALL_H, 1);
    geo.door = new THREE.BoxGeometry(0.94, DOOR_H, 0.94);
    geo.toggle = new THREE.BoxGeometry(0.92, TOGGLE_H, 0.92);
    geo.crate = new THREE.BoxGeometry(CRATE, CRATE, CRATE);
    geo.blob = new THREE.CircleGeometry(0.3, 20);
    geo.blob.rotateX(-Math.PI / 2);
  }

  /* ------------------------------------------------------------ textures */
  function texture(key, draw, animated) {
    let t = textures.get(key);
    if (t) return t.tex;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = TEX;
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t = { tex, canvas, draw, animated };
    paint(t, 0);
    textures.set(key, t);
    return tex;
  }
  function paint(t, time) {
    const c = t.canvas.getContext("2d");
    c.clearRect(0, 0, TEX, TEX);
    t.draw(c, TEX, time);
    t.tex.needsUpdate = true;
  }

  function mat(key, make) {
    let m = mats.get(key);
    if (!m) { m = make(); mats.set(key, m); }
    return m;
  }

  /* The side of a wall: a rack face with vents and a status light. */
  function wallSide(c, S) {
    c.fillStyle = C.wallFace;
    c.fillRect(0, 0, S, S);
    c.strokeStyle = C.wallEdge;
    c.lineWidth = S * 0.04;
    c.strokeRect(S * 0.04, S * 0.04, S * 0.92, S * 0.92);
    c.fillStyle = "rgba(0,0,0,0.3)";
    for (let i = 0; i < 5; i++) c.fillRect(S * 0.14, S * (0.14 + i * 0.15), S * 0.72, S * 0.07);
    c.fillStyle = C.green;
    c.beginPath();
    c.arc(S * 0.82, S * 0.86, S * 0.035, 0, 7);
    c.fill();
  }

  /* ------------------------------------------------------------- terrain */
  function terrainKey(ch, gx, gy) {
    if (ch === T.SOCKET) return "S" + (built.partsDone() ? 1 : 0);
    if (ch === T.FLOOR || !ch.trim()) return "f" + ((gx * 3 + gy * 5) % 4);
    return ch;
  }

  function flatSprite(key, ch) {
    const anim = ANIMATED.includes(ch);
    const draw = (c, S, t) => {
      switch (ch) {
        case T.COOLANT: return Sprites.coolant(c, 0, 0, S, t, 1, 1);
        case T.OVERHEAT: return Sprites.overheat(c, 0, 0, S, t, 1, 1);
        case T.ICE: return Sprites.ice(c, 0, 0, S, null);
        case "1": case "2": case "3": case "4": return Sprites.ice(c, 0, 0, S, ch);
        case T.BUS_L: return Sprites.bus(c, 0, 0, S, "left", t);
        case T.BUS_R: return Sprites.bus(c, 0, 0, S, "right", t);
        case T.BUS_U: return Sprites.bus(c, 0, 0, S, "up", t);
        case T.BUS_D: return Sprites.bus(c, 0, 0, S, "down", t);
        case T.SOCKET: return Sprites.socket(c, 0, 0, S, key === "S1", t);
        case T.EXIT: return Sprites.exit(c, 0, 0, S, t);
        case T.HINT: return Sprites.hint(c, 0, 0, S);
        case T.SURGE: return Sprites.surge(c, 0, 0, S, t);
        case T.SCRUBBER: return Sprites.scrubber(c, 0, 0, S, t);
        case T.PORT: return Sprites.port(c, 0, 0, S, t);
        case T.SWITCH: return Sprites.toggleSwitch(c, 0, 0, S);
        case T.TOGGLE_OPEN: return Sprites.toggleWall(c, 0, 0, S, true);
        default: return Sprites.floor(c, 0, 0, S, 0, 0);
      }
    };
    return texture("t:" + key, key[0] === "f" ? floorDraw(Number(key.slice(1))) : draw, anim);
  }
  /* Floor variants follow the same (gx*3 + gy*5) % 4 pattern as the flat board. */
  function floorDraw(mode) {
    const g = [[0, 0], [3, 0], [2, 0], [1, 0]][mode];   // (g0*3 + g1*5) % 4 === mode
    return (c, S) => Sprites.floor(c, 0, 0, S, g[0], g[1]);
  }

  function makeTerrain(ch, key, gx, gy) {
    const glow = "~*<>^vSX!0".includes(ch);
    let obj;
    if (ch === T.WALL) {
      const side = mat("wallSide", () => new THREE.MeshLambertMaterial({ map: texture("wallSide", wallSide) }));
      const top = mat("wallTop", () => new THREE.MeshLambertMaterial({ map: texture("wallTop", (c, S) => Sprites.wall(c, 0, 0, S)) }));
      obj = new THREE.Mesh(geo.wall, [side, side, top, side, side, side]);
      obj.position.y = WALL_H / 2;
    } else if ("RBYG".includes(ch)) {
      const col = ch.toLowerCase();
      const face = mat("door" + col, () => new THREE.MeshLambertMaterial({ map: texture("door" + col, (c, S) => Sprites.door(c, 0, 0, S, col)) }));
      obj = new THREE.Mesh(geo.door, face);
      obj.position.y = DOOR_H / 2;
    } else if (ch === T.TOGGLE_SHUT) {
      obj = new THREE.Group();
      obj.add(new THREE.Mesh(geo.tile, mat("t:f1", () => new THREE.MeshLambertMaterial({ map: flatSprite("f1", " ") }))));
      const box = new THREE.Mesh(geo.toggle, mat("toggle", () => new THREE.MeshLambertMaterial({
        color: 0x14b8a6, emissive: 0x0f766e, emissiveIntensity: 0.4, transparent: true, opacity: 0.82
      })));
      box.position.y = TOGGLE_H / 2;
      box.castShadow = true;
      obj.add(box);
    } else {
      const m = mat("t:" + key, () => glow
        ? new THREE.MeshBasicMaterial({ map: flatSprite(key, ch) })
        : new THREE.MeshLambertMaterial({ map: flatSprite(key, ch) }));
      obj = new THREE.Mesh(geo.tile, m);
      if (ch === T.COOLANT || ch === T.OVERHEAT) obj.position.y = -0.04;   // sunk a little
      obj.receiveShadow = true;
    }
    if (obj.isMesh && obj.position.y > 0) { obj.castShadow = true; obj.receiveShadow = true; }
    obj.position.x = gx + 0.5;
    obj.position.z = gy + 0.5;
    return obj;
  }

  /* --------------------------------------------------------------- items */
  function itemKey(ch, gx, gy) {
    if (!ch) return "";
    return "cxsz".includes(ch) ? ch + (built.kindAt.get(gx + "," + gy) || "") : ch;
  }

  function makeItem(ch, key) {
    const kind = key.slice(1);
    const tex = texture("i:" + key, (c, S) => {
      if (ch === "c" || ch === "x") Sprites.hardware(c, 0, 0, S, kind, 0);
      else if (ch === "s" || ch === "z") Sprites.software(c, 0, 0, S, kind, 0);
      else if ("rbyg".includes(ch)) Sprites.card(c, 0, 0, S, ch);
      else Sprites.tool(c, 0, 0, S, ch);
      if (ch === "x" || ch === "z") Sprites.incompatible(c, 0, 0, S);
    });
    const group = new THREE.Group();
    const sprite = new THREE.Sprite(mat("i:" + key, () => new THREE.SpriteMaterial({ map: tex })));
    sprite.scale.set(0.78, 0.78, 1);
    group.add(sprite);
    group.add(blob(0.55));
    group.userData.sprite = sprite;
    return group;
  }

  function blob(opacity) {
    const m = new THREE.Mesh(geo.blob, mat("blob" + opacity, () => new THREE.MeshBasicMaterial({
      map: texture("blob", (c, S) => {
        const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, S, S);
      }),
      transparent: true, opacity, depthWrite: false
    })));
    m.position.y = 0.01;
    return m;
  }

  /* --------------------------------------------------------------- robot */
  function makeRobot() {
    const white = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.1 });
    const grey = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const cyan = new THREE.MeshBasicMaterial({ color: 0x45d0e0 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xf5a524 });
    const part = (g, m, x, y, z) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      return mesh;
    };
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    body.add(part(new THREE.CylinderGeometry(0.2, 0.23, 0.34, 20), white, 0, 0.36, 0));
    body.add(part(new THREE.CylinderGeometry(0.235, 0.235, 0.05, 20), cyan, 0, 0.3, 0));
    body.add(part(new THREE.SphereGeometry(0.2, 24, 16), grey, 0, 0.66, 0));
    body.add(part(new THREE.BoxGeometry(0.26, 0.12, 0.1), dark, 0, 0.68, 0.16));
    body.add(part(new THREE.BoxGeometry(0.08, 0.035, 0.02), cyan, -0.05, 0.69, 0.215));
    const stalk = part(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6), amber, 0.1, 0.88, 0);
    stalk.rotation.z = -0.4;
    body.add(stalk);
    body.add(part(new THREE.SphereGeometry(0.04, 10, 8), amber, 0.135, 0.96, 0));
    const legGeo = new THREE.BoxGeometry(0.1, 0.2, 0.12);
    const legL = part(legGeo, grey, -0.1, 0.12, 0), legR = part(legGeo, grey, 0.1, 0.12, 0);
    root.add(legL, legR);
    root.scale.setScalar(1.3);
    root.userData = { body, legL, legR, heading: 0 };
    return root;
  }

  const HEADING = { down: 0, right: Math.PI / 2, up: Math.PI, left: -Math.PI / 2 };

  /* -------------------------------------------------------------- malware */
  function makeBug(type) {
    const group = new THREE.Group();
    const tex = texture("m:" + type, (c, S, t) => Sprites.monster(c, 0, 0, S, type, "down", t), true);
    const sprite = new THREE.Sprite(mat("m:" + type, () => new THREE.SpriteMaterial({ map: tex })));
    sprite.scale.set(0.95, 0.95, 1);
    sprite.position.y = 0.44;
    group.add(sprite, blob(0.5));
    group.userData.type = type;
    return group;
  }

  function makeCrate() {
    const face = mat("crate", () => new THREE.MeshLambertMaterial({
      map: texture("crate", (c, S) => { c.fillStyle = "#27272a"; c.fillRect(0, 0, S, S); Sprites.crate(c, 0, 0, S); })
    }));
    const mesh = new THREE.Mesh(geo.crate, face);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /* --------------------------------------------------------------- build */
  function clear() {
    if (holder) scene.remove(holder);
    holder = new THREE.Group();
    scene.add(holder);
    cells = [];
    crates = []; bugs = []; robot = null;
  }

  function rebuild(game) {
    built = game;
    clear();
    for (let y = 0; y < game.h; y++) {
      cells.push([]);
      for (let x = 0; x < game.w; x++) cells[y].push({ tKey: null, tObj: null, iKey: "", iObj: null });
    }
    robot = makeRobot();
    holder.add(robot);
    scene.background = new THREE.Color(C.void);
    scene.fog = new THREE.Fog(C.void, 18, 34);
    ground.material.color.set(C.void);
    const snap = cameraGoal(game, game.player.x, game.player.y);
    camTarget.copy(snap);
  }

  function sync(game) {
    for (let y = 0; y < game.h; y++) {
      for (let x = 0; x < game.w; x++) {
        const cell = cells[y][x];
        const ch = game.grid[y][x];
        const tKey = terrainKey(ch, x, y);
        if (tKey !== cell.tKey) {
          if (cell.tObj) holder.remove(cell.tObj);
          cell.tObj = makeTerrain(ch, tKey, x, y);
          cell.tKey = tKey;
          holder.add(cell.tObj);
        }
        const iKey = itemKey(game.items[y][x], x, y);
        if (iKey !== cell.iKey) {
          if (cell.iObj) holder.remove(cell.iObj);
          cell.iObj = iKey ? makeItem(game.items[y][x], iKey) : null;
          if (cell.iObj) {
            cell.iObj.position.set(x + 0.5, 0, y + 0.5);
            holder.add(cell.iObj);
          }
          cell.iKey = iKey;
        }
      }
    }
  }

  function syncList(list, meshes, make, fits) {
    while (meshes.length > list.length) holder.remove(meshes.pop());
    for (let i = 0; i < list.length; i++) {
      if (meshes[i] && !fits(meshes[i], list[i])) { holder.remove(meshes[i]); meshes[i] = null; }
      if (!meshes[i]) { meshes[i] = make(list[i]); holder.add(meshes[i]); }
    }
  }

  /* The point the camera looks at: the player, held back from the edges of
     a level the way the flat board's camera is. */
  function cameraGoal(game, px, py) {
    const half = VIEW / 2;
    const clamp = (v, n) => n <= VIEW ? n / 2 : Math.min(Math.max(v, half), n - half);
    return new THREE.Vector3(clamp(px + 0.5, game.w), 0, clamp(py + 0.5, game.h) + 0.7);   // nearer rows look bigger, so aim a little low
  }

  /* -------------------------------------------------------------- render */
  function render(game, alpha, time, playing) {
    if (game !== built) rebuild(game);
    sync(game);

    for (const t of textures.values()) if (t.animated) paint(t, time);

    // items bob and turn slowly
    for (const row of cells) for (const cell of row) {
      if (!cell.iObj) continue;
      const s = cell.iObj.userData.sprite;
      s.position.y = 0.5 + Math.sin(time * 3 + cell.iObj.position.x * 1.7 + cell.iObj.position.z) * 0.05;
    }

    syncList(game.blocks, crates, () => makeCrate(), () => true);
    game.blocks.forEach((b, i) => {
      crates[i].position.set(lerp(b.prevX, b.x, alpha) + 0.5, CRATE / 2, lerp(b.prevY, b.y, alpha) + 0.5);
    });

    const alive = game.monsters.filter(m => m.alive);
    syncList(alive, bugs, m => makeBug(m.type), (mesh, m) => mesh.userData.type === m.type);
    alive.forEach((m, i) => {
      bugs[i].position.set(lerp(m.prevX, m.x, alpha) + 0.5, Math.abs(Math.sin(time * 6 + i)) * 0.05,
        lerp(m.prevY, m.y, alpha) + 0.5);
    });

    const p = game.player;
    const px = lerp(p.prevX, p.x, alpha), py = lerp(p.prevY, p.y, alpha);
    const moving = playing && (p.prevX !== p.x || p.prevY !== p.y) && alpha < 1;
    robot.visible = game.state !== "dead";
    robot.position.set(px + 0.5, 0, py + 0.5);
    const u = robot.userData;
    let want = HEADING[p.dir] || 0;
    while (want - u.heading > Math.PI) want -= Math.PI * 2;
    while (want - u.heading < -Math.PI) want += Math.PI * 2;
    u.heading += (want - u.heading) * 0.3;
    robot.rotation.y = u.heading;
    const swing = moving ? Math.sin(time * 18) : 0;
    u.legL.position.z = swing * 0.07;
    u.legR.position.z = -swing * 0.07;
    u.body.position.y = moving ? Math.abs(swing) * 0.03 : Math.sin(time * 2.5) * 0.01;

    // camera: ease towards the goal so it glides rather than jumps
    const goal = cameraGoal(game, px, py);
    camTarget.lerp(goal, 0.12);
    camera.position.set(camTarget.x, CAM_UP, camTarget.z + CAM_BACK);
    camera.lookAt(camTarget.x, 0, camTarget.z);
    sun.position.set(camTarget.x - 5, 12, camTarget.z + 4);
    sun.target.position.set(camTarget.x, 0, camTarget.z);

    renderer.render(scene, camera);
  }

  /* Colours come from the theme, so a theme change rebuilds everything. */
  function reset() {
    for (const t of textures.values()) t.tex.dispose();
    textures.clear();
    for (const m of mats.values()) m.dispose();
    mats.clear();
    built = null;
  }

  function resize(css) {
    if (!ok) return;
    renderer.setSize(css, css, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  return { supported, render, reset, resize };
})();
