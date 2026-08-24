/* ============================================================================
   BIT BUILDER — rules engine
   Grid based, one discrete step at a time. Rendering interpolates between the
   previous and current cell of every entity, so the engine only ever deals in
   whole tiles.
   ========================================================================== */

const T = {
  FLOOR: " ", WALL: "#", COOLANT: "~", OVERHEAT: "*",
  ICE: ".", ICE_NW: "1", ICE_NE: "2", ICE_SE: "3", ICE_SW: "4",
  BUS_L: "<", BUS_R: ">", BUS_U: "^", BUS_D: "v",
  SOCKET: "S", EXIT: "X", HINT: "+", SURGE: "!", SCRUBBER: "T",
  PORT: "0", SWITCH: "k", TOGGLE_SHUT: "-", TOGGLE_OPEN: "|"
};

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const LEFT_OF = { up: "left", left: "down", down: "right", right: "up" };
const RIGHT_OF = { up: "right", right: "down", down: "left", left: "up" };

const ICE_TILES = ".1234";
const BUS_DIR = { "<": "left", ">": "right", "^": "up", "v": "down" };
/* An ice corner walls off two sides and bends whatever slides in. */
const ICE_BEND = {
  "1": { down: "right", right: "down" },   // NW corner: blocks north + west
  "2": { down: "left", left: "down" },     // NE corner: blocks north + east
  "3": { up: "left", left: "up" },         // SE corner: blocks south + east
  "4": { up: "right", right: "up" }        // SW corner: blocks south + west
};
const ICE_WALLS = { "1": ["up", "left"], "2": ["up", "right"], "3": ["down", "right"], "4": ["down", "left"] };

const DOOR_CARD = { R: "r", B: "b", Y: "y", G: "g" };
const CARD_CHARS = "rbyg";
const TOOL_CHARS = "FHKM";
const PART_CHARS = "cs";           // parts the build spec asks for
const DECOY_CHARS = "xz";          // parts that do not fit this build
const ITEM_CHARS = PART_CHARS + DECOY_CHARS + CARD_CHARS + TOOL_CHARS;
const MONSTER_CHARS = "@%&$";
const MONSTER_SPEED = { "@": 2, "%": 2, "&": 2, "$": 1 };

const TOOL_INFO = {
  F: { name: "Coolant Seal", blurb: "wade through coolant" },
  H: { name: "Heatsink", blurb: "cross overheat zones" },
  K: { name: "Grip Pads", blurb: "walk on cryo ice" },
  M: { name: "Mag Grips", blurb: "ignore data buses" }
};
const CARD_INFO = {
  r: { name: "Red access card" }, b: { name: "Blue access card" },
  y: { name: "Yellow access card" }, g: { name: "Root access", blurb: "never used up" }
};

const HARDWARE_KINDS = ["cpu", "ram", "gpu", "ssd", "psu", "fan", "nic", "mobo"];
const SOFTWARE_KINDS = ["os", "driver", "compiler", "antivirus", "database", "browser"];
const HARDWARE_NAMES = {
  cpu: "CPU", ram: "RAM module", gpu: "Graphics card", ssd: "SSD",
  psu: "Power supply", fan: "Cooling fan", nic: "Network card", mobo: "Motherboard"
};
const SOFTWARE_NAMES = {
  os: "OS image", driver: "Device driver", compiler: "Compiler",
  antivirus: "Antivirus", database: "Database", browser: "Browser"
};

const PART_NAMES = Object.assign({}, HARDWARE_NAMES, SOFTWARE_NAMES);
const DECOY_PENALTY_MS = 10000;    // grabbing a part that does not fit costs time
const HISTORY_LIMIT = 80;          // how many moves the rewind buffer holds

/* Fallback flavour when a level does not name its parts: stable per tile, so a
   part always looks the same on a given map. */
function partKind(x, y, isHardware) {
  const list = isHardware ? HARDWARE_KINDS : SOFTWARE_KINDS;
  return list[(x * 7 + y * 13) % list.length];
}

class Game {
  constructor(level) {
    this.level = level;
    this.reset();
  }

  reset() {
    const rows = this.level.map;
    this.h = rows.length;
    this.w = rows[0].length;
    this.grid = rows.map(r => r.split(""));
    this.items = Array.from({ length: this.h }, () => Array(this.w).fill(null));
    this.blocks = [];
    this.monsters = [];
    this.ports = [];
    this.player = null;

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = this.grid[y][x];
        if (ch === "P") { this.player = { x, y, prevX: x, prevY: y, dir: "down" }; this.grid[y][x] = T.FLOOR; }
        else if (ch === "O") { this.blocks.push({ x, y, prevX: x, prevY: y }); this.grid[y][x] = T.FLOOR; }
        else if (MONSTER_CHARS.includes(ch)) {
          this.monsters.push({ type: ch, x, y, prevX: x, prevY: y, dir: ch === "$" ? "left" : "down", alive: true });
          this.grid[y][x] = T.FLOOR;
        } else if (ITEM_CHARS.includes(ch)) { this.items[y][x] = ch; this.grid[y][x] = T.FLOOR; }
        if (this.grid[y][x] === T.PORT) this.ports.push({ x, y });
      }
    }

    this.assignKinds();
    this.buildSpec();
    this.collected = { hw: 0, sw: 0 };
    this.keys = { r: 0, b: 0, y: 0, g: 0 };
    this.tools = { F: false, H: false, K: false, M: false };

    this.timeLeft = this.level.time * 1000;
    this.state = "playing";              // playing | won | dead
    this.deathReason = "";
    this.slide = null;                   // direction the floor is dragging us
    this.tick = 0;
    this.moves = 0;
    this.rejects = 0;
    this.rewinds = 0;
    this.history = [];
    this.onHint = false;
    this.lastPickup = null;
    this.events = [];
  }

  /* Each part tile gets a component kind. A level names them in reading order
     via `kinds`, e.g. { c: ["cpu", "ram", "ram"], x: ["ram"] }; anything not
     named falls back to the positional hash. */
  assignKinds() {
    const named = this.level.kinds || {};
    const cursor = {};
    this.kindAt = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = this.items[y][x];
        if (!ch || !(PART_CHARS + DECOY_CHARS).includes(ch)) continue;
        const list = named[ch] || [];
        const i = cursor[ch] = (cursor[ch] || 0);
        cursor[ch]++;
        const hardware = ch === "c" || ch === "x";
        this.kindAt.set(x + "," + y, list[i] || partKind(x, y, hardware));
      }
    }
  }

  /* The build spec is simply every part the level actually placed, grouped by
     kind. Incompatible parts ('x'/'z') are deliberately left out of it. */
  buildSpec() {
    const order = [], byKind = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = this.items[y][x];
        if (!PART_CHARS.includes(ch)) continue;
        const kind = this.kindAt.get(x + "," + y);
        if (!byKind.has(kind)) {
          const entry = { kind, name: PART_NAMES[kind] || kind, hardware: ch === "c", need: 0, got: 0 };
          byKind.set(kind, entry);
          order.push(entry);
        }
        byKind.get(kind).need++;
      }
    }
    order.sort((a, b) => (a.hardware === b.hardware ? 0 : a.hardware ? -1 : 1));
    this.spec = order;
    this.required = {
      hw: order.filter(e => e.hardware).reduce((n, e) => n + e.need, 0),
      sw: order.filter(e => !e.hardware).reduce((n, e) => n + e.need, 0)
    };
  }

  specFor(kind) { return this.spec.find(e => e.kind === kind); }

  /* -------------------------------------------------------------- helpers */
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  tileAt(x, y) { return this.inBounds(x, y) ? this.grid[y][x] : T.WALL; }
  blockAt(x, y) { return this.blocks.find(b => b.x === x && b.y === y); }
  monsterAt(x, y) { return this.monsters.find(m => m.alive && m.x === x && m.y === y); }
  partsDone() { return this.spec.every(e => e.got >= e.need); }
  emit(name, data) { this.events.push({ name, data }); }
  drainEvents() { const e = this.events; this.events = []; return e; }

  /* An ice corner acts as a wall on two of its sides. */
  cornerBlocks(tile, dir) {
    const walls = ICE_WALLS[tile];
    return !!walls && walls.includes(OPPOSITE[dir]);
  }

  playerCanEnter(x, y, dir) {
    if (!this.inBounds(x, y)) return false;
    const t = this.grid[y][x];
    if (t === T.WALL || t === T.TOGGLE_SHUT) return false;
    if (this.cornerBlocks(t, dir)) return false;
    if (DOOR_CARD[t]) return this.keys[DOOR_CARD[t]] > 0;
    if (t === T.SOCKET) return this.partsDone();
    return true;
  }

  blockCanEnter(x, y, dir) {
    if (!this.inBounds(x, y)) return false;
    const t = this.grid[y][x];
    if (t === T.WALL || t === T.TOGGLE_SHUT || t === T.TOGGLE_OPEN) return false;
    if (DOOR_CARD[t] || t === T.SOCKET || t === T.EXIT) return false;
    if (t === T.PORT || t === T.SCRUBBER || t === T.SWITCH) return false;
    if (this.cornerBlocks(t, dir)) return false;
    if (this.items[y][x]) return false;
    if (this.blockAt(x, y) || this.monsterAt(x, y)) return false;
    return true;
  }

  monsterCanEnter(x, y, dir) {
    if (!this.inBounds(x, y)) return false;
    const t = this.grid[y][x];
    if (t !== T.FLOOR && t !== T.HINT && t !== T.SURGE) return false;
    if (this.items[y][x]) return false;
    if (this.blockAt(x, y) || this.monsterAt(x, y)) return false;
    return true;
  }

  /* ------------------------------------------------------------- rewind */
  /* A compact copy of everything a step can change. The clock is deliberately
     left out: rewinding costs you the time you already spent. */
  snapshot() {
    return {
      grid: this.grid.map(r => r.join("")),
      items: this.items.map(r => r.map(i => i || ".").join("")),
      player: { ...this.player },
      blocks: this.blocks.map(b => ({ ...b })),
      monsters: this.monsters.map(m => ({ ...m })),
      keys: { ...this.keys },
      tools: { ...this.tools },
      got: this.spec.map(e => e.got),
      collected: { ...this.collected },
      slide: this.slide, state: this.state, deathReason: this.deathReason,
      moves: this.moves, rejects: this.rejects, onHint: this.onHint, tick: this.tick
    };
  }

  restore(s) {
    this.grid = s.grid.map(r => r.split(""));
    this.items = s.items.map(r => r.split("").map(c => (c === "." ? null : c)));
    this.player = { ...s.player };
    this.blocks = s.blocks.map(b => ({ ...b }));
    this.monsters = s.monsters.map(m => ({ ...m }));
    this.keys = { ...s.keys };
    this.tools = { ...s.tools };
    this.spec.forEach((e, i) => { e.got = s.got[i]; });
    this.collected = { ...s.collected };
    this.slide = s.slide;
    this.state = s.state;
    this.deathReason = s.deathReason;
    this.moves = s.moves;
    this.rejects = s.rejects;
    this.onHint = s.onHint;
    this.tick = s.tick;
    this.events = [];
  }

  canUndo() { return this.history.length > 0; }

  /* Step back one move — including the one that killed you. */
  undo() {
    if (!this.history.length) return false;
    this.restore(this.history.pop());
    this.rewinds++;
    this.emit("rewind");
    return true;
  }

  /* ------------------------------------------------------------- one step */
  step(inputDir) {
    if (this.state !== "playing") return;
    const before = this.snapshot();
    this.tick++;
    this.stepPlayer(inputDir);
    if (this.state === "playing") {
      this.stepMonsters();
      this.checkMonsterHit();
    }
    /* Only remember steps where the player actually did something, so the
       rewind buffer is not filled up by standing still near a monster. */
    const p = this.player;
    if (before.player.x !== p.x || before.player.y !== p.y ||
        before.moves !== this.moves || before.state !== this.state) {
      this.history.push(before);
      if (this.history.length > HISTORY_LIMIT) this.history.shift();
    }
  }

  stepPlayer(inputDir) {
    const p = this.player;
    p.prevX = p.x; p.prevY = p.y;
    const forced = !!this.slide;
    const dir = forced ? this.slide : inputDir;
    if (!dir) return;
    p.dir = dir;

    const [dx, dy] = DIRS[dir];
    const nx = p.x + dx, ny = p.y + dy;

    if (!forced) {
      const block = this.blockAt(nx, ny);
      if (block) {
        if (!this.pushBlock(block, dir)) return;
      }
    } else if (this.blockAt(nx, ny)) {
      this.bounce(dir);
      return;
    }

    if (!this.playerCanEnter(nx, ny, dir)) {
      if (forced) this.bounce(dir);
      return;
    }

    const target = this.grid[ny][nx];
    if (DOOR_CARD[target]) {
      const card = DOOR_CARD[target];
      if (card !== "g") this.keys[card]--;          // root access is reusable
      this.grid[ny][nx] = T.FLOOR;
      this.emit("door", card);
    } else if (target === T.SOCKET) {
      this.grid[ny][nx] = T.FLOOR;
      this.emit("socket");
    }

    p.x = nx; p.y = ny;
    if (!forced) this.moves++;
    this.enterTile(dir);
  }

  /* Ice throws you back the way you came. A blocked data bus hands control
     back instead of pinning you against the wall forever. */
  bounce(dir) {
    const here = this.grid[this.player.y][this.player.x];
    this.slide = ICE_TILES.includes(here) ? OPPOSITE[dir] : null;
  }

  pushBlock(block, dir) {
    const [dx, dy] = DIRS[dir];
    const tx = block.x + dx, ty = block.y + dy;
    if (!this.blockCanEnter(tx, ty, dir)) return false;
    block.prevX = block.x; block.prevY = block.y;
    const t = this.grid[ty][tx];
    if (t === T.COOLANT || t === T.OVERHEAT || t === T.SURGE) {
      this.grid[ty][tx] = T.FLOOR;                  // the crate plugs the hazard
      this.blocks.splice(this.blocks.indexOf(block), 1);
      this.emit(t === T.COOLANT ? "splash" : "burn");
      return true;
    }
    block.x = tx; block.y = ty;
    this.emit("push");
    return true;
  }

  enterTile(dir) {
    const p = this.player;
    const item = this.items[p.y][p.x];
    if (item) {
      this.items[p.y][p.x] = null;
      this.collectItem(item, p.x, p.y);
    }

    const t = this.grid[p.y][p.x];
    this.onHint = t === T.HINT;

    if (t === T.COOLANT && !this.tools.F) return this.die("Drowned in coolant");
    if (t === T.OVERHEAT && !this.tools.H) return this.die("Cooked in an overheat zone");
    if (t === T.SURGE) {
      this.grid[p.y][p.x] = T.FLOOR;
      return this.die("Fried by a power surge");
    }
    if (t === T.SCRUBBER) {
      this.tools = { F: false, H: false, K: false, M: false };
      this.emit("scrub");
    }
    if (t === T.SWITCH) this.flipToggles();
    if (t === T.EXIT) {
      this.state = "won";
      this.emit("win");
      return;
    }

    if (t === T.PORT) { this.teleport(dir); return; }

    if (ICE_TILES.includes(t) && !this.tools.K) {
      this.slide = ICE_BEND[t] ? (ICE_BEND[t][dir] || dir) : dir;
    } else if (BUS_DIR[t] && !this.tools.M) {
      this.slide = BUS_DIR[t];
    } else {
      this.slide = null;
    }
  }

  collectItem(item, x, y) {
    if (PART_CHARS.includes(item)) {
      const kind = this.kindAt.get(x + "," + y);
      const entry = this.specFor(kind);
      if (entry) entry.got++;
      if (item === "c") this.collected.hw++; else this.collected.sw++;
      this.lastPickup = PART_NAMES[kind] || kind;
    } else if (DECOY_CHARS.includes(item)) {
      const kind = this.kindAt.get(x + "," + y);
      this.lastPickup = PART_NAMES[kind] || kind;
      this.timeLeft -= DECOY_PENALTY_MS;                 // wrong part for this build
      this.rejects++;
      this.emit("reject", this.lastPickup);
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.die("Ran out of time"); }
      return;
    } else if (CARD_CHARS.includes(item)) {
      this.keys[item]++;
      this.lastPickup = CARD_INFO[item].name;
    } else if (TOOL_CHARS.includes(item)) {
      this.tools[item] = true;
      this.lastPickup = TOOL_INFO[item].name;
    }
    this.emit("pickup", item);
    if (this.partsDone()) this.emit("ready");
  }

  flipToggles() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === T.TOGGLE_SHUT) this.grid[y][x] = T.TOGGLE_OPEN;
        else if (this.grid[y][x] === T.TOGGLE_OPEN) this.grid[y][x] = T.TOGGLE_SHUT;
      }
    }
    /* A wall must never close on top of something standing there. */
    const p = this.player;
    if (this.grid[p.y][p.x] === T.TOGGLE_SHUT) this.grid[p.y][p.x] = T.TOGGLE_OPEN;
    for (const b of this.blocks) if (this.grid[b.y][b.x] === T.TOGGLE_SHUT) this.grid[b.y][b.x] = T.TOGGLE_OPEN;
    this.emit("toggle");
  }

  teleport(dir) {
    const p = this.player;
    const here = this.ports.findIndex(t => t.x === p.x && t.y === p.y);
    if (here < 0 || this.ports.length < 2) return;
    const [dx, dy] = DIRS[dir];
    for (let i = 1; i <= this.ports.length; i++) {
      const dest = this.ports[(here + i) % this.ports.length];
      if (this.playerCanEnter(dest.x + dx, dest.y + dy, dir) && !this.blockAt(dest.x + dx, dest.y + dy)) {
        p.x = dest.x; p.y = dest.y;
        p.prevX = dest.x; p.prevY = dest.y;
        this.slide = dir;                           // shot out the far side
        this.emit("teleport");
        return;
      }
    }
    this.slide = null;
  }

  die(reason) {
    if (this.state !== "playing") return;
    this.state = "dead";
    this.deathReason = reason;
    this.emit("die");
  }

  /* ------------------------------------------------------------ monsters */
  stepMonsters() {
    for (const m of this.monsters) {
      m.prevX = m.x; m.prevY = m.y;
      if (!m.alive || this.tick % MONSTER_SPEED[m.type] !== 0) continue;
      const order = this.monsterChoices(m);
      for (const dir of order) {
        const [dx, dy] = DIRS[dir];
        const nx = m.x + dx, ny = m.y + dy;
        if (!this.monsterCanEnter(nx, ny, dir)) continue;
        m.dir = dir; m.x = nx; m.y = ny;
        if (this.grid[ny][nx] === T.SURGE) {         // surge traps take anything
          this.grid[ny][nx] = T.FLOOR;
          m.alive = false;
          this.emit("boom");
        }
        break;
      }
    }
  }

  monsterChoices(m) {
    const d = m.dir;
    switch (m.type) {
      case "@": return [LEFT_OF[d], d, RIGHT_OF[d], OPPOSITE[d]];
      case "%": return [RIGHT_OF[d], d, LEFT_OF[d], OPPOSITE[d]];
      case "$": return [d, OPPOSITE[d]];
      case "&": {
        const dx = this.player.x - m.x, dy = this.player.y - m.y;
        const horiz = dx > 0 ? "right" : "left", vert = dy > 0 ? "down" : "up";
        const first = Math.abs(dx) >= Math.abs(dy) ? [horiz, vert] : [vert, horiz];
        return [...first, OPPOSITE[first[0]], OPPOSITE[first[1]]];
      }
      default: return [d];
    }
  }

  checkMonsterHit() {
    const p = this.player;
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const sameTile = m.x === p.x && m.y === p.y;
      const swapped = m.x === p.prevX && m.y === p.prevY && m.prevX === p.x && m.prevY === p.y;
      if (sameTile || swapped) return this.die("Caught by malware");
    }
  }

  /* --------------------------------------------------------------- clock */
  advanceClock(ms) {
    if (this.state !== "playing") return;
    this.timeLeft -= ms;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.die("Ran out of time");
    }
  }
}

if (typeof module !== "undefined") { module.exports = { Game, T, DIRS, TOOL_INFO, CARD_INFO, partKind, PART_NAMES, HARDWARE_NAMES, SOFTWARE_NAMES, PART_CHARS, DECOY_CHARS, ITEM_CHARS, MONSTER_CHARS, DECOY_PENALTY_MS }; }
