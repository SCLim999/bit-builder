/* ============================================================================
   BIT BUILDER — level editor
   Paints the same character grid the engine reads, checks it with the shared
   validator, and hands back a share link. Nothing leaves the browser.
   ========================================================================== */

const board = document.getElementById("ed-board");
const bctx = board.getContext("2d");
const BOARD_PX = 640;

/* Every brush: the character it paints, a label, and how to draw a preview. */
const BRUSHES = [
  ["group", "Ground"],
  [" ", "Floor", (c, s) => Sprites.floor(c, 0, 0, s, 1, 1)],
  ["#", "Wall", (c, s) => Sprites.wall(c, 0, 0, s)],
  ["P", "Start", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.player(c, 0, 0, s, "down", 0); }],
  ["X", "Power button", (c, s) => Sprites.exit(c, 0, 0, s, 0)],
  ["S", "Assembly socket", (c, s) => Sprites.socket(c, 0, 0, s, false, 0)],
  ["+", "Help terminal", (c, s) => Sprites.hint(c, 0, 0, s)],

  ["group", "Parts"],
  ["c", "Hardware part", (c, s) => Sprites.hardware(c, 0, 0, s, "cpu", 0)],
  ["s", "Software part", (c, s) => Sprites.software(c, 0, 0, s, "os", 0)],
  ["x", "Wrong hardware", (c, s) => { Sprites.hardware(c, 0, 0, s, "ram", 0); Sprites.incompatible(c, 0, 0, s); }],
  ["z", "Wrong software", (c, s) => { Sprites.software(c, 0, 0, s, "browser", 0); Sprites.incompatible(c, 0, 0, s); }],

  ["group", "Hazards"],
  ["~", "Coolant", (c, s) => Sprites.coolant(c, 0, 0, s, 0, 1, 1)],
  ["*", "Overheat", (c, s) => Sprites.overheat(c, 0, 0, s, 0, 1, 1)],
  ["!", "Surge trap", (c, s) => Sprites.surge(c, 0, 0, s, 0)],
  ["T", "Scrubber", (c, s) => Sprites.scrubber(c, 0, 0, s, 0)],
  [".", "Cryo ice", (c, s) => Sprites.ice(c, 0, 0, s, null)],
  ["1", "Ice corner NW", (c, s) => Sprites.ice(c, 0, 0, s, "1")],
  ["2", "Ice corner NE", (c, s) => Sprites.ice(c, 0, 0, s, "2")],
  ["3", "Ice corner SE", (c, s) => Sprites.ice(c, 0, 0, s, "3")],
  ["4", "Ice corner SW", (c, s) => Sprites.ice(c, 0, 0, s, "4")],

  ["group", "Movement"],
  ["<", "Bus west", (c, s) => Sprites.bus(c, 0, 0, s, "left", 0)],
  [">", "Bus east", (c, s) => Sprites.bus(c, 0, 0, s, "right", 0)],
  ["^", "Bus north", (c, s) => Sprites.bus(c, 0, 0, s, "up", 0)],
  ["v", "Bus south", (c, s) => Sprites.bus(c, 0, 0, s, "down", 0)],
  ["0", "Network port", (c, s) => Sprites.port(c, 0, 0, s, 0)],
  ["O", "Crate", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.crate(c, 0, 0, s); }],

  ["group", "Locks and tools"],
  ["r", "Red card", (c, s) => Sprites.card(c, 0, 0, s, "r")],
  ["R", "Red port", (c, s) => Sprites.door(c, 0, 0, s, "r")],
  ["b", "Blue card", (c, s) => Sprites.card(c, 0, 0, s, "b")],
  ["B", "Blue port", (c, s) => Sprites.door(c, 0, 0, s, "b")],
  ["y", "Yellow card", (c, s) => Sprites.card(c, 0, 0, s, "y")],
  ["Y", "Yellow port", (c, s) => Sprites.door(c, 0, 0, s, "y")],
  ["g", "Root access", (c, s) => Sprites.card(c, 0, 0, s, "g")],
  ["G", "Green port", (c, s) => Sprites.door(c, 0, 0, s, "g")],
  ["k", "Toggle switch", (c, s) => Sprites.toggleSwitch(c, 0, 0, s)],
  ["-", "Toggle wall shut", (c, s) => Sprites.toggleWall(c, 0, 0, s, false)],
  ["|", "Toggle wall open", (c, s) => Sprites.toggleWall(c, 0, 0, s, true)],
  ["F", "Coolant Seal", (c, s) => Sprites.tool(c, 0, 0, s, "F")],
  ["H", "Heatsink", (c, s) => Sprites.tool(c, 0, 0, s, "H")],
  ["K", "Grip Pads", (c, s) => Sprites.tool(c, 0, 0, s, "K")],
  ["M", "Mag Grips", (c, s) => Sprites.tool(c, 0, 0, s, "M")],
  ["Q", "Quarantine kit", (c, s) => Sprites.tool(c, 0, 0, s, "Q")],

  ["group", "Malware"],
  ["@", "Bug", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.monster(c, 0, 0, s, "@", "down", 0); }],
  ["%", "Glitch", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.monster(c, 0, 0, s, "%", "down", 0); }],
  ["&", "Trojan", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.monster(c, 0, 0, s, "&", "down", 0); }],
  ["$", "Packet", (c, s) => { Sprites.floor(c, 0, 0, s, 1, 1); Sprites.monster(c, 0, 0, s, "$", "left", 0); }]
];

const DRAW = new Map(BRUSHES.filter(b => b[0] !== "group").map(([ch, , draw]) => [ch, draw]));
const HARDWARE = ["cpu", "ram", "gpu", "ssd", "psu", "fan", "nic", "mobo"];
const SOFTWARE = ["os", "driver", "compiler", "antivirus", "database", "browser"];
const NAMES = Object.assign({}, HARDWARE_NAMES, SOFTWARE_NAMES);

let grid = [];
let brush = "#";
let kinds = { c: [], s: [], x: [], z: [] };
let painting = false;

/* ------------------------------------------------------------------- model */
function blankMap(w, h) {
  const g = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#" : " ");
    g.push(row);
  }
  g[1][1] = "P";
  return g;
}

function resize(w, h) {
  const old = grid;
  grid = blankMap(w, h);
  if (old.length) {
    grid[1][1] = " ";
    for (let y = 0; y < Math.min(h, old.length); y++) {
      for (let x = 0; x < Math.min(w, old[0].length); x++) grid[y][x] = old[y][x];
    }
    /* keep the frame solid so nobody walks off the map */
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) grid[y][x] = "#";
    }
    if (!grid.some(r => r.includes("P"))) grid[1][1] = "P";
  }
  syncKinds();
  draw();
}

function currentLevel() {
  return {
    name: document.getElementById("ed-name").value.trim() || "Custom level",
    hint: document.getElementById("ed-hintline").value.trim(),
    time: Number(document.getElementById("ed-time").value) || 150,
    kinds: {
      c: kinds.c.slice(), s: kinds.s.slice(),
      x: kinds.x.slice(), z: kinds.z.slice()
    },
    map: grid.map(r => r.join(""))
  };
}

/* Part tiles in reading order, so the kind lists always line up with the map. */
function partTiles(ch) {
  const out = [];
  grid.forEach((row, y) => row.forEach((c, x) => { if (c === ch) out.push({ x, y }); }));
  return out;
}

function syncKinds() {
  for (const ch of ["c", "s", "x", "z"]) {
    const tiles = partTiles(ch);
    const fallback = ch === "c" || ch === "x" ? HARDWARE : SOFTWARE;
    const list = kinds[ch];
    while (list.length > tiles.length) list.pop();
    while (list.length < tiles.length) list.push(fallback[(list.length) % fallback.length]);
  }
  renderKinds();
}

/* ---------------------------------------------------------------- painting */
function tileSize() { return Math.max(12, Math.floor(BOARD_PX / Math.max(grid[0].length, grid.length))); }

/* Keep the canvas exactly as big as the map so there is no dead space. */
function fitCanvas() {
  const S = tileSize();
  board.width = grid[0].length * S;
  board.height = grid.length * S;
  board.style.maxWidth = board.width + "px";
}

function draw() {
  fitCanvas();
  const S = tileSize();
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.fillStyle = "#05080d";
  bctx.fillRect(0, 0, board.width, board.height);

  const kindFor = (ch, x, y) => {
    const idx = partTiles(ch).findIndex(t => t.x === x && t.y === y);
    return kinds[ch][idx] || (ch === "c" || ch === "x" ? "cpu" : "os");
  };

  grid.forEach((row, y) => row.forEach((ch, x) => {
    bctx.save();
    bctx.translate(x * S, y * S);
    /* things that sit on the floor need the floor drawn under them first */
    if ("csxzPO@%&$rbygFHKMQ".includes(ch)) Sprites.floor(bctx, 0, 0, S, x, y);
    if ("csxz".includes(ch)) {
      const kind = kindFor(ch, x, y);
      if (ch === "c" || ch === "x") Sprites.hardware(bctx, 0, 0, S, kind, 0);
      else Sprites.software(bctx, 0, 0, S, kind, 0);
      if (ch === "x" || ch === "z") Sprites.incompatible(bctx, 0, 0, S);
    } else {
      const fn = DRAW.get(ch);
      if (fn) fn(bctx, S);
    }
    bctx.restore();
  }));

  bctx.strokeStyle = "rgba(255,255,255,0.06)";
  bctx.lineWidth = 1;
  for (let x = 0; x <= grid[0].length; x++) {
    bctx.beginPath(); bctx.moveTo(x * S + .5, 0); bctx.lineTo(x * S + .5, grid.length * S); bctx.stroke();
  }
  for (let y = 0; y <= grid.length; y++) {
    bctx.beginPath(); bctx.moveTo(0, y * S + .5); bctx.lineTo(grid[0].length * S, y * S + .5); bctx.stroke();
  }
}

function paintAt(clientX, clientY, erase) {
  const rect = board.getBoundingClientRect();
  const S = tileSize();
  const scale = rect.width / board.width;
  const x = Math.floor((clientX - rect.left) / (S * scale));
  const y = Math.floor((clientY - rect.top) / (S * scale));
  if (y < 0 || x < 0 || y >= grid.length || x >= grid[0].length) return;
  const ch = erase ? " " : brush;
  if (grid[y][x] === ch) return;
  if (ch === "P") grid.forEach(row => row.forEach((c, i) => { if (c === "P") row[i] = " "; }));
  grid[y][x] = ch;
  syncKinds();
  draw();
}

board.addEventListener("contextmenu", e => e.preventDefault());
board.addEventListener("pointerdown", e => {
  painting = true;
  board.setPointerCapture(e.pointerId);
  paintAt(e.clientX, e.clientY, e.button === 2 || e.ctrlKey);
});
board.addEventListener("pointermove", e => { if (painting) paintAt(e.clientX, e.clientY, e.buttons === 2); });
for (const ev of ["pointerup", "pointercancel"]) board.addEventListener(ev, () => { painting = false; });

/* ------------------------------------------------------------------- panel */
function buildPalette() {
  const box = document.getElementById("ed-palette");
  box.innerHTML = "";
  for (const entry of BRUSHES) {
    if (entry[0] === "group") {
      const h = document.createElement("p");
      h.className = "gauge-label";
      h.style.gridColumn = "1 / -1";
      h.style.margin = "6px 0 0";
      h.textContent = entry[1];
      box.appendChild(h);
      continue;
    }
    const [ch, label, drawFn] = entry;
    const b = document.createElement("button");
    b.className = "ed-swatch";
    b.title = `${label}  (${ch === " " ? "space" : ch})`;
    b.setAttribute("aria-pressed", String(ch === brush));
    const c = document.createElement("canvas");
    c.width = c.height = 40;
    drawFn(c.getContext("2d"), 40);
    b.appendChild(c);
    b.onclick = () => {
      brush = ch;
      for (const other of box.querySelectorAll(".ed-swatch")) other.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-pressed", "true");
    };
    box.appendChild(b);
  }
}

function renderKinds() {
  const box = document.getElementById("ed-kinds");
  box.innerHTML = "";
  let any = false;
  for (const ch of ["c", "s", "x", "z"]) {
    const tiles = partTiles(ch);
    const options = ch === "c" || ch === "x" ? HARDWARE : SOFTWARE;
    tiles.forEach((t, i) => {
      any = true;
      const row = document.createElement("div");
      row.className = "ed-kind-row" + ("xz".includes(ch) ? " bad" : "");
      const c = document.createElement("canvas");
      c.width = c.height = 30;
      const cc = c.getContext("2d");
      if (ch === "c" || ch === "x") Sprites.hardware(cc, 0, 0, 30, kinds[ch][i], 0);
      else Sprites.software(cc, 0, 0, 30, kinds[ch][i], 0);
      if ("xz".includes(ch)) Sprites.incompatible(cc, 0, 0, 30);
      const at = document.createElement("span");
      at.className = "at";
      at.textContent = `${t.x},${t.y}`;
      const sel = document.createElement("select");
      for (const k of options) {
        const o = document.createElement("option");
        o.value = k;
        o.textContent = NAMES[k] + ("xz".includes(ch) ? " (does not fit)" : "");
        if (k === kinds[ch][i]) o.selected = true;
        sel.appendChild(o);
      }
      sel.onchange = () => { kinds[ch][i] = sel.value; renderKinds(); draw(); };
      row.append(c, at, sel);
      box.appendChild(row);
    });
  }
  if (!any) box.innerHTML = '<span class="empty" style="color:var(--muted);font-size:12px">paint some parts and they will be listed here</span>';
}

function report(msg, kind) {
  const box = document.getElementById("ed-report");
  box.textContent = msg;
  box.className = "ed-report" + (kind ? " " + kind : "");
}

function check() {
  const level = currentLevel();
  const { ok, problems, info } = validateLevel(level);
  if (!ok) {
    report("Not playable yet:\n• " + problems.join("\n• "), "bad");
    return false;
  }
  const g = new Game(level);
  const spec = g.spec.map(e => `${e.need}× ${e.name}`).join(", ");
  report(`Looks playable.\n${info.width}×${info.height}, ${info.hardware} hardware, ` +
    `${info.software} software, ${info.decoys} that do not fit.\nBuild spec: ${spec}`, "good");
  return true;
}

async function copyLink() {
  if (!check()) return;
  const link = Codec.link(currentLevel(), location.href.replace(/editor\.html.*$/, "index.html"));
  try {
    await navigator.clipboard.writeText(link);
    report(`Share link copied (${link.length} characters). Anyone who opens it plays your level.`, "good");
  } catch (e) {
    report("Copy the link below:\n" + link, "good");
  }
}

function applyLevel(level) {
  grid = level.map.map(r => r.split(""));
  kinds = { c: [], s: [], x: [], z: [] };
  for (const ch of ["c", "s", "x", "z"]) kinds[ch] = ((level.kinds || {})[ch] || []).slice();
  document.getElementById("ed-name").value = level.name || "Custom level";
  document.getElementById("ed-time").value = level.time || 150;
  document.getElementById("ed-hintline").value = level.hint || "";
  document.getElementById("ed-w").value = grid[0].length;
  document.getElementById("ed-h").value = grid.length;
  syncKinds();
  draw();
}

/* --------------------------------------------------------------- controls */
document.getElementById("ed-check").onclick = check;
document.getElementById("ed-copy").onclick = copyLink;
document.getElementById("ed-play").onclick = () => {
  if (!check()) return;
  location.href = Codec.link(currentLevel(), location.href.replace(/editor\.html.*$/, "index.html"));
};
document.getElementById("ed-load").onclick = () => {
  const input = prompt("Paste a share link or level code:");
  if (!input) return;
  const code = (/[#&]lvl=([A-Za-z0-9\-_]+)/.exec(input) || [null, input.trim()])[1];
  try {
    applyLevel(Codec.decode(code));
    report("Loaded. Edit away.", "good");
  } catch (e) {
    report("That code could not be read: " + e.message, "bad");
  }
};
document.getElementById("ed-start").onclick = () => {
  const list = LEVELS.map((l, i) => `${i + 1}. ${l.name}`).join("\n");
  const pick = prompt("Start from which level?\n\n" + list, "1");
  const i = Number(pick) - 1;
  if (LEVELS[i]) {
    applyLevel(JSON.parse(JSON.stringify(LEVELS[i])));
    report(`Loaded ${LEVELS[i].name} as a starting point.`, "good");
  }
};
document.getElementById("ed-clear").onclick = () => {
  if (!confirm("Clear the map?")) return;
  kinds = { c: [], s: [], x: [], z: [] };
  resize(Number(document.getElementById("ed-w").value), Number(document.getElementById("ed-h").value));
  report("Cleared.", null);
};
for (const id of ["ed-w", "ed-h"]) {
  document.getElementById(id).onchange = () => {
    const w = Math.max(7, Math.min(40, Number(document.getElementById("ed-w").value) || 15));
    const h = Math.max(7, Math.min(40, Number(document.getElementById("ed-h").value) || 13));
    document.getElementById("ed-w").value = w;
    document.getElementById("ed-h").value = h;
    resize(w, h);
  };
}

buildPalette();
resize(15, 13);
