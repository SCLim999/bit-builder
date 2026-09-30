/* ============================================================================
   PACKET RUSH — 3D view
   A second renderer for the same simulation. Nothing about the rules changes:
   the engine still plays on its 400 x 200 pixel plane, and this file draws
   that plane as a diorama in WebGL2 with no library. Everything on screen is a
   shaded box — the terrain is extruded in 2 x 2 pixel cells, the packets are
   little envelopes on legs — so one instanced cube is the only geometry.

   World pixel (x, y) sits at scene (x, -y, 0); +z points at the viewer.
   Packets hidden inside a tunnel or a shaft are drawn a second time as a
   glowing silhouette so they are never lost behind the silicon.
   ========================================================================== */

function createRenderer3D(canvas) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  /* ------------------------------------------------------------ shaders */
  const VS = `#version 300 es
  layout(location=0) in vec3 aPos;
  layout(location=1) in vec3 aNormal;
  layout(location=2) in vec3 iPos;
  layout(location=3) in vec3 iScale;
  layout(location=4) in vec4 iColor;
  uniform mat4 uVP;
  out vec3 vColor; out vec3 vN; out float vGlow; out vec3 vWorld;
  void main() {
    vec3 w = iPos + aPos * iScale;
    vWorld = w; vN = aNormal; vColor = iColor.rgb; vGlow = iColor.a;
    gl_Position = uVP * vec4(w, 1.0);
  }`;
  const FS = `#version 300 es
  precision mediump float;
  in vec3 vColor; in vec3 vN; in float vGlow; in vec3 vWorld;
  uniform vec3 uLight; uniform vec3 uEye; uniform vec3 uFog; uniform float uGhost;
  out vec4 outColor;
  void main() {
    if (uGhost > 0.5) { outColor = vec4(mix(vColor, vec3(1.0), 0.35), 0.55); return; }
    vec3 n = normalize(vN);
    float diff = max(dot(n, uLight), 0.0);
    float sky = 0.5 + 0.5 * n.y;                       // hemisphere fill: tops lighter than undersides
    vec3 lit = vColor * (0.34 + 0.22 * sky + 0.62 * diff);
    vec3 v = normalize(uEye - vWorld);
    lit += vColor * pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.25;   // soft rim
    vec3 c = mix(lit, vColor * 1.25, clamp(vGlow, 0.0, 1.0));
    float fog = clamp((length(uEye - vWorld) - 380.0) / 420.0, 0.0, 0.55);
    outColor = vec4(mix(c, uFog, fog), 1.0);
  }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  const U = {};
  for (const n of ["uVP", "uLight", "uEye", "uFog", "uGhost"]) U[n] = gl.getUniformLocation(prog, n);

  /* ------------------------------------------------------- unit cube */
  const faces = [
    [[1, 0, 0], [[.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5], [.5, -.5, .5]]],
    [[-1, 0, 0], [[-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5], [-.5, -.5, -.5]]],
    [[0, 1, 0], [[-.5, .5, -.5], [-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5]]],
    [[0, -1, 0], [[-.5, -.5, .5], [-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5]]],
    [[0, 0, 1], [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]]],
    [[0, 0, -1], [[.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]]]
  ];
  const cube = [];
  for (const [n, q] of faces) for (const i of [0, 1, 2, 0, 2, 3]) cube.push(...q[i], ...n);
  const cubeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);

  /* one VAO per instance buffer: the static terrain and the per-frame objects */
  const STRIDE = 10;
  function makeBatch() {
    const vao = gl.createVertexArray(), buf = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuf);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const attr = (loc, size, off) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, off * 4);
      gl.vertexAttribDivisor(loc, 1);
    };
    attr(2, 3, 0); attr(3, 3, 3); attr(4, 4, 6);
    gl.bindVertexArray(null);
    return { vao, buf, data: new Float32Array(STRIDE * 4096), n: 0 };
  }
  const terrain = makeBatch(), objects = makeBatch(), ghosts = makeBatch();

  function push(b, x, y, z, sx, sy, sz, c, glow = 0) {
    if ((b.n + 1) * STRIDE > b.data.length) {
      const bigger = new Float32Array(b.data.length * 2);
      bigger.set(b.data);
      b.data = bigger;
    }
    const o = b.n++ * STRIDE, d = b.data;
    d[o] = x; d[o + 1] = y; d[o + 2] = z; d[o + 3] = sx; d[o + 4] = sy; d[o + 5] = sz;
    d[o + 6] = c[0]; d[o + 7] = c[1]; d[o + 8] = c[2]; d[o + 9] = glow;
  }
  /* a box given by its pixel-space corner, the way the 2D renderer thinks */
  function box(b, px, py, w, h, z, d, c, glow) { push(b, px + w / 2, -(py + h / 2), z, w, h, d, c, glow); }
  function upload(b) {
    gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
    gl.bufferData(gl.ARRAY_BUFFER, b.data.subarray(0, b.n * STRIDE), gl.DYNAMIC_DRAW);
  }

  const rgb = hex => {
    if (Array.isArray(hex)) return hex.map(v => v / 255);
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const shade = (c, k) => c.map(v => Math.min(1, v * k));

  /* ---------------------------------------------------------- terrain */
  const CELL = 2, DEPTH = { 1: 30, 2: 34, 3: 12 };
  function buildTerrain(game, pal) {
    terrain.n = 0;
    const map = game.map;
    const cw = LW / CELL, ch = LH / CELL;
    const kind = new Uint8Array(cw * ch);
    for (let cy = 0; cy < ch; cy++) {
      for (let cx = 0; cx < cw; cx++) {
        const counts = [0, 0, 0, 0];
        for (let dy = 0; dy < CELL; dy++) for (let dx = 0; dx < CELL; dx++) {
          counts[map[(cy * CELL + dy) * LW + cx * CELL + dx]]++;
        }
        if (counts[0] > 2) continue;           // mostly air
        kind[cy * cw + cx] = counts[3] >= 2 ? 3 : counts[2] >= counts[1] ? 2 : 1;
      }
    }
    const dirt = rgb(pal.dirt), trace = rgb(pal.trace), via = rgb(pal.via), steel = rgb(pal.steel), brick = rgb(pal.brick);
    for (let cy = 0; cy < ch; cy++) {
      for (let cx = 0; cx < cw; cx++) {
        const k = kind[cy * cw + cx];
        if (!k) continue;
        const x = cx * CELL, y = cy * CELL;
        const top = cy === 0 || !kind[(cy - 1) * cw + cx];
        let c, glow = 0;
        if (k === 1) {
          const traceH = y % 12 < 2 && ((x + (y >> 3) * 17) % 48) < 30;
          const traceV = x % 16 < 2 && ((y + (x >> 4) * 11) % 36) < 20;
          const isVia = x % 16 < 2 && y % 12 < 2;
          c = isVia ? via : traceH || traceV ? trace : dirt;
          if (isVia || traceH || traceV) glow = 0.25;
          const n = (((x * 73856093) ^ (y * 19349663)) & 7) / 100;
          c = c.map(v => v + n - 0.035);
        } else if (k === 2) {
          c = (x % 20 < 2 || y % 20 < 2) ? shade(steel, 0.8) : (x % 10 === 2 && y % 10 === 2) ? shade(steel, 1.35) : steel;
        } else {
          c = y % 4 < 2 ? brick : shade(brick, 0.85);
        }
        if (top) c = shade(c, 1.25);
        box(terrain, x, y, CELL, CELL, 0, DEPTH[k], c, glow);
      }
    }
    /* the back wall of the diorama, with the same grid the 2D view draws */
    const g = pal.grid, gc = [g[0] / 255, g[1] / 255, g[2] / 255];
    const wall = rgb(pal.sky2);
    push(terrain, LW / 2, -LH / 2, -60, LW + 1400, LH + 1000, 1, shade(wall, 0.9));
    const line = wall.map((v, i) => v * (1 - g[3] * 3) + gc[i] * g[3] * 3);
    for (let x = -700; x <= LW + 700; x += 20) push(terrain, x, -LH / 2, -59.3, 0.6, LH + 1000, 0.4, line);
    for (let y = -500; y <= LH + 500; y += 20) push(terrain, LW / 2, -y, -59.3, LW + 1400, 0.6, 0.4, line);
    upload(terrain);
  }

  /* ------------------------------------------------------------ camera */
  const cam = { yaw: -0.16, pitch: 0.24, dist: 318 };
  const DEFAULT = { ...cam };
  const target = [LW / 2, -LH / 2 + 8, 0];
  let vp = new Float32Array(16), inv = new Float32Array(16), eye = [0, 0, 0];

  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(e, c, up) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
  }
  function mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function invert(m) {
    const o = new Float32Array(16);
    const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
    const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
    o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return o;
  }
  function updateCamera() {
    eye = [
      target[0] + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist,
      target[1] + Math.sin(cam.pitch) * cam.dist,
      target[2] + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist
    ];
    const proj = perspective(0.72, canvas.width / canvas.height, 10, 2000);
    vp = mul(proj, lookAt(eye, target, [0, 1, 0]));
    inv = invert(vp);
  }

  /* screen <-> world. Picking casts a ray from the pointer and meets the
     plane the packets walk on (z = 0). */
  function toWorld(ndcX, ndcY) {
    const un = (z) => {
      const v = [ndcX, ndcY, z, 1], o = [0, 0, 0, 0];
      for (let r = 0; r < 4; r++) o[r] = inv[r] * v[0] + inv[4 + r] * v[1] + inv[8 + r] * v[2] + inv[12 + r] * v[3];
      return [o[0] / o[3], o[1] / o[3], o[2] / o[3]];
    };
    const a = un(-1), b = un(1);
    const t = a[2] / (a[2] - b[2]);
    return { x: a[0] + (b[0] - a[0]) * t, y: -(a[1] + (b[1] - a[1]) * t) };
  }
  function toScreen(x, y, z = 0) {
    const v = [x, -y, z, 1], o = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) o[r] = vp[r] * v[0] + vp[4 + r] * v[1] + vp[8 + r] * v[2] + vp[12 + r] * v[3];
    return { x: (o[0] / o[3] * 0.5 + 0.5), y: (1 - (o[1] / o[3] * 0.5 + 0.5)), behind: o[3] <= 0 };
  }

  /* ------------------------------------------------------------ objects */
  const STATE = { block: "#f87171", build: "#f5a524", bash: "#c084fc", dig: "#60a5fa", crash: "#fb7185" };
  const INK = rgb("#0f172a");

  /* Packets are modelled a little larger than their 5 x 8 px hit box so they
     read at diorama distance; the scale is anchored at the feet. */
  const PS = 1.3;
  function packet(b0, p, frame, hot) {
    const x = p.x, y = p.y, f = p.dir;
    const b = b0, box = (bb, px, py, w, h, z, d, c, glow) =>
      push(bb, x + (px + w / 2 - x) * PS, -(y + (py + h / 2 - y) * PS), z * PS, w * PS, h * PS, d * PS, c, glow);
    const body = rgb(STATE[p.state] || (p.climber || p.floater ? "#a7f3d0" : "#e0f2fe"));
    const glow = hot ? 0.55 : 0.08;
    const walking = p.state === "walk" || p.state === "bash";
    const step = walking ? [0, 1, 0, -1][(p.anim >> 1) % 4] : 0;
    const legs = rgb("#94a3b8");

    if (p.state === "climb") {
      const k = (p.anim >> 1) % 2;
      box(b, x + f * 1.5 - 0.5, y - 2 - k, 1, 2, 1.2, 1.2, legs);
      box(b, x + f * 1.5 - 0.5, y - 5 + k, 1, 2, -1.2, 1.2, legs);
    } else {
      box(b, x - 2.5 + step * 0.6, y - 2.5, 1.2, 2.6, 1.3, 1.2, legs);
      box(b, x + 1.3 - step * 0.6, y - 2.5, 1.2, 2.6, -1.3, 1.2, legs);
    }
    const bx = p.state === "climb" ? x - 3 - f : x - 3.5;
    box(b, bx, y - 8.5, 7, 6, 0, 5, body, glow);
    box(b, bx + 0.6, y - 8.7, 5.8, 0.6, 0, 5.2, shade(body, 0.7), glow);        // the envelope's lid
    box(b, bx + 1.5, y - 7.6, 4, 0.7, 2.55, 0.2, shade(body, 0.55));             // flap crease on the front
    box(b, bx + 3.5 + f * 1.6 - 0.55, y - 5.9, 1.1, 1.1, 2.6, 0.3, INK);         // eye, looking ahead
    if (p.climber) box(b, bx, y - 3.2, 7, 0.8, 0, 5.3, rgb("#4ade80"), 0.6);

    if (p.state === "fall" && p.floater && p.fall >= 12) {
      box(b, x - 6, y - 15, 12, 1.4, 0, 9, rgb("#45d0e0"), 0.3);                 // the buffer opens
      box(b, x - 4, y - 16.2, 8, 1.2, 0, 7, rgb("#45d0e0"), 0.3);
    }
    switch (p.state) {
      case "block": {
        const fl = (frame >> 2) % 2;
        box(b, x - 7, y - 6.5, 3, 1.2, 0, 1.2, rgb("#f87171"));
        box(b, x + 4, y - 6.5, 3, 1.2, 0, 1.2, rgb("#f87171"));
        box(b, x - 8, y - 10 + fl, 1.4, 4, 0, 4, rgb(fl ? "#fb923c" : "#facc15"), 0.9);
        box(b, x + 6.6, y - 10 + (1 - fl), 1.4, 4, 0, 4, rgb(fl ? "#facc15" : "#fb923c"), 0.9);
        break;
      }
      case "build":
        box(b, x + (f > 0 ? 3 : -5), y - 4.5, 2, 1.5, 0, 3, rgb("#f5a524"), 0.2);
        break;
      case "bash":
        if (frame % 4 < 2) box(b, x + f * 5, y - 5 + (frame % 3), 1, 1, (frame % 5) - 2, 1, rgb("#e9d5ff"), 0.8);
        break;
      case "dig":
        if (frame % 4 < 2) {
          box(b, x - 4 + (frame % 3), y - 1.5, 1, 1, 2, 1, rgb("#a3e635"), 0.5);
          box(b, x + 3 - (frame % 2), y - 2.5, 1, 1, -2, 1, rgb("#a3e635"), 0.5);
        }
        break;
    }
  }

  function scenery(game, frame) {
    const b = objects, lv = game.level;
    /* router */
    const h = lv.hatch;
    box(b, h.x - 12, h.y - 14, 24, 9, 0, 14, rgb("#1e293b"));
    box(b, h.x - 12.2, h.y - 14.2, 24.4, 0.8, 0, 14.4, rgb("#45d0e0"), 0.8);
    for (let i = 0; i < 4; i++) {
      const on = ((frame >> 3) + i * 3) % 5 < 3;
      box(b, h.x - 9 + i * 3, h.y - 11, 1.5, 1.5, 7.2, 0.5, rgb(on ? (i % 2 ? "#4ade80" : "#f5a524") : "#334155"), on ? 1 : 0);
    }
    box(b, h.x - 9, h.y - 19, 1, 5, -4, 1, rgb("#94a3b8"));
    box(b, h.x + 8, h.y - 19, 1, 5, -4, 1, rgb("#94a3b8"));
    box(b, h.x - 5, h.y - 5.6, 10, 1, 0, 8, rgb("#0f172a"));
    /* server */
    const ex = lv.exit;
    box(b, ex.x - 9, ex.y - 22, 18, 23, -4, 18, rgb("#1e293b"));
    box(b, ex.x - 9.2, ex.y - 22.2, 18.4, 0.8, -4, 18.4, rgb("#4ade80"), 0.8);
    for (let i = 0; i < 3; i++) {
      box(b, ex.x - 7, ex.y - 20 + i * 3, 14, 2, 5.1, 0.4, rgb("#334155"));
      box(b, ex.x + 4, ex.y - 19.5 + i * 3, 1.5, 1, 5.4, 0.3, rgb((frame + i * 7) % 20 < 10 ? "#4ade80" : "#166534"), 1);
    }
    const pulse = 0.55 + 0.35 * Math.sin(frame / 8);
    box(b, ex.x - 4, ex.y - 11, 8, 12, 0, 6, rgb("#4ade80"), pulse);
    /* live wires */
    for (const z of game.hazards) {
      box(b, z.x, z.y, z.w, z.h, 0, 30, rgb("#0f172a"));
      for (let x = z.x + 2; x < z.x + z.w - 1; x += 4) {
        const up = ((x + frame) >> 2) % 2;
        box(b, x, z.y + z.h - 5 + (up ? -2 : 2), 2, 1, 15.3, 0.4, rgb("#facc15"), 1);
      }
      if (frame % 6 < 3) box(b, z.x + ((frame * 37) % z.w), z.y + z.h - 7, 1.2, 1.2, 16, 1.2, rgb("#fef08a"), 1);
    }
  }

  /* ------------------------------------------------------------ public */
  let lastPal = null, lastW = 0, lastH = 0;

  return {
    canvas,
    markDirty() { lastPal = null; },
    orbit(dx, dy) {
      cam.yaw = Math.max(-1.1, Math.min(1.1, cam.yaw - dx * 0.006));
      cam.pitch = Math.max(-0.1, Math.min(1.15, cam.pitch + dy * 0.005));
    },
    zoom(k) { cam.dist = Math.max(220, Math.min(620, cam.dist * k)); },
    resetView() { Object.assign(cam, DEFAULT); },
    pickPoint(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      return toWorld(((clientX - r.left) / r.width) * 2 - 1, 1 - ((clientY - r.top) / r.height) * 2);
    },
    project(x, y, z) { return toScreen(x, y, z); },

    render(game, opt) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr) || canvas.width, h = Math.round(canvas.clientHeight * dpr) || canvas.height;
      if (w !== lastW || h !== lastH) { canvas.width = w; canvas.height = h; lastW = w; lastH = h; }
      updateCamera();
      if (game.dirty || lastPal !== opt.pal) { buildTerrain(game, opt.pal); lastPal = opt.pal; game.dirty = false; }

      objects.n = 0; ghosts.n = 0;
      scenery(game, opt.frame);
      for (const p of game.packets) {
        if (!p.alive) continue;
        packet(objects, p, opt.frame, p === opt.hot);
        box(ghosts, p.x - 3.5, p.y - 8.5, 7, 6, 0, 5, rgb(p === opt.hot ? "#4ade80" : "#e0f2fe"));
      }
      for (const e of opt.effects) {
        if (e.kind !== "spark") continue;
        box(objects, e.x, e.y, 1.3, 1.3, e.z || 0, 1.3, rgb(e.color), 0.9);
      }
      upload(objects); upload(ghosts);

      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.useProgram(prog);
      gl.uniformMatrix4fv(U.uVP, false, vp);
      const L = [-0.45, 0.8, 0.55], ln = Math.hypot(...L);
      gl.uniform3f(U.uLight, L[0] / ln, L[1] / ln, L[2] / ln);
      gl.uniform3f(U.uEye, eye[0], eye[1], eye[2]);
      gl.uniform3fv(U.uFog, rgb(opt.pal.sky2));
      gl.uniform1f(U.uGhost, 0);
      gl.depthFunc(gl.LESS);
      gl.disable(gl.BLEND);
      for (const b of [terrain, objects]) {
        if (!b.n) continue;
        gl.bindVertexArray(b.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, b.n);
      }
      /* silhouettes for packets the terrain hides */
      if (ghosts.n) {
        gl.uniform1f(U.uGhost, 1);
        gl.depthFunc(gl.GREATER);
        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(ghosts.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, ghosts.n);
        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
        gl.disable(gl.BLEND);
      }
      gl.bindVertexArray(null);
    }
  };
}
