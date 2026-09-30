/* ============================================================================
   PACKET RUSH — rules engine
   A Lemmings-style simulation on a pixel bitmap. Packets fall out of a router,
   walk until something stops them, and do exactly one job each if you give
   them one. Everything here is deterministic and tick based (TICK_HZ ticks per
   game second), so tools/lem-check.js can replay a solution in Node and prove
   that a level can be won.

   Coordinates: x, y is the pixel a packet's feet occupy. The ground it stands
   on is row y + 1. A packet is 5 px wide and 8 px tall.
   ========================================================================== */

const LW = 400, LH = 200;
const TICK_HZ = 20;
const M = { EMPTY: 0, DIRT: 1, STEEL: 2, BRICK: 3 };

const SAFE_FALL = 56;             // further than this without a buffer corrupts the packet
const BUFFER_OPENS = 12;          // a buffer slows the fall after this many pixels
const STEP_UP = 6;                // highest ledge a walker climbs without help
const BRICKS = 12;                // bricks in one bridge
const OVERFLOW_TICKS = 5 * TICK_HZ;
const BLAST = 9;                  // overflow crater radius

/* The skills, in toolbar order. `on` lists the states a skill can interrupt. */
const SKILLS = [
  { id: "uplink",   key: "1", flag: true },
  { id: "buffer",   key: "2", flag: true },
  { id: "overflow", key: "3" },
  { id: "firewall", key: "4", on: ["walk", "build", "bash", "dig", "shrug"] },
  { id: "bridge",   key: "5", on: ["walk", "bash", "dig", "shrug", "build"] },
  { id: "tunnel",   key: "6", on: ["walk", "build", "dig", "shrug"] },
  { id: "pipe",     key: "7", on: ["walk", "build", "bash", "shrug"] }
];

class PacketGame {
  constructor(level) {
    this.level = level;
    this.map = new Uint8Array(LW * LH);
    for (const op of level.terrain) this.paint(op);
    this.hazards = level.hazards || [];
    this.skills = {};
    for (const s of SKILLS) this.skills[s.id] = (level.skills && level.skills[s.id]) || 0;
    this.packets = [];
    this.tick = 0;
    this.spawned = 0;
    this.saved = 0;
    this.lost = 0;
    this.losses = {};
    this.nuking = false;
    this.rate = level.rate;                  // ticks between releases
    this.ticksLeft = level.ttl * TICK_HZ;
    this.state = "playing";                  // playing | won | lost
    this.dirty = true;                       // terrain changed since last render
    this.events = [];                        // sounds and effects for the UI to drain
  }

  /* ------------------------------------------------------------ terrain */
  paint(op) {
    const m = op.m === undefined ? M.DIRT : op.m;
    for (let y = Math.max(0, op.y); y < Math.min(LH, op.y + op.h); y++) {
      for (let x = Math.max(0, op.x); x < Math.min(LW, op.x + op.w); x++) {
        this.map[y * LW + x] = m;
      }
    }
  }

  at(x, y) {
    if (x < 0 || x >= LW) return M.STEEL;    // the screen edges are walls
    if (y < 0 || y >= LH) return M.EMPTY;
    return this.map[y * LW + x];
  }

  solid(x, y) { return this.at(x, y) !== M.EMPTY; }

  /* Clears dirt and bricks, never steel. Returns true if steel got in the way. */
  carve(x, y) {
    if (x < 0 || x >= LW || y < 0 || y >= LH) return false;
    const i = y * LW + x, v = this.map[i];
    if (v === M.STEEL) return true;
    if (v !== M.EMPTY) { this.map[i] = M.EMPTY; this.dirty = true; }
    return false;
  }

  diggable(x, y) { const v = this.at(x, y); return v === M.DIRT || v === M.BRICK; }

  /* ------------------------------------------------------------- skills */
  canAssign(p, id) {
    if (!p || !p.alive || this.skills[id] <= 0 || this.state !== "playing") return false;
    const s = SKILLS.find(k => k.id === id);
    if (id === "uplink") return !p.climber;
    if (id === "buffer") return !p.floater;
    if (id === "overflow") return p.bomb === 0;
    if (!s.on.includes(p.state)) return false;
    if (id === "bridge" && p.state === "build" && p.bricks > 2) return false;
    return true;
  }

  assign(p, id) {
    if (!this.canAssign(p, id)) return false;
    this.skills[id]--;
    switch (id) {
      case "uplink": p.climber = true; break;
      case "buffer": p.floater = true; break;
      case "overflow": p.bomb = OVERFLOW_TICKS; break;
      case "firewall": p.state = "block"; break;
      case "bridge": p.state = "build"; p.bricks = BRICKS; p.timer = 0; break;
      case "tunnel": p.state = "bash"; p.timer = 0; break;
      case "pipe": p.state = "dig"; p.timer = 0; break;
    }
    this.events.push({ type: "assign", skill: id });
    return true;
  }

  /* The packet under a point, preferring the one nearest the middle of its body.
     With a skill selected, packets that cannot take it are skipped, so a click
     on a crowd lands on someone useful. */
  pick(x, y, skill) {
    let best = null, bestD = Infinity;
    for (const p of this.packets) {
      if (!p.alive) continue;
      if (Math.abs(p.x - x) > 5 || y < p.y - 11 || y > p.y + 3) continue;
      if (skill && !this.canAssign(p, skill)) continue;
      const d = Math.abs(p.x - x) + Math.abs(p.y - 4 - y);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  nuke() {
    if (this.nuking || this.state !== "playing") return;
    this.nuking = true;
    let stagger = 0;
    for (const p of this.packets) if (p.alive && p.bomb === 0) p.bomb = OVERFLOW_TICKS + (stagger += 2);
  }

  /* --------------------------------------------------------------- loop */
  step() {
    if (this.state !== "playing") return;
    this.tick++;
    this.ticksLeft--;

    const lv = this.level;
    if (!this.nuking && this.spawned < lv.count && (this.tick === 1 || (this.tick - 1) % this.rate === 0)) {
      this.packets.push({
        id: this.spawned++, x: lv.hatch.x, y: lv.hatch.y, dir: lv.hatch.dir || 1,
        state: "fall", fall: 0, climber: false, floater: false, bomb: 0,
        bricks: 0, timer: 0, anim: 0, alive: true
      });
      this.events.push({ type: "spawn" });
    }

    for (const p of this.packets) if (p.alive) this.update(p);

    /* firewalls never move again, so once they are all that is left the run is over */
    const alive = this.packets.some(p => p.alive && p.state !== "block");
    if (this.ticksLeft <= 0) {
      for (const p of this.packets) if (p.alive) this.kill(p, "ttl");
      this.finish();
    } else if (!alive && (this.spawned >= lv.count || this.nuking)) {
      for (const p of this.packets) if (p.alive) this.kill(p, "firewall");
      this.finish();
    }
  }

  finish() {
    this.state = this.saved >= this.level.need ? "won" : "lost";
    this.events.push({ type: this.state });
  }

  kill(p, why) {
    p.alive = false;
    p.death = why;
    this.lost++;
    this.losses[why] = (this.losses[why] || 0) + 1;
    this.events.push({ type: "lost", why, x: p.x, y: p.y });
  }

  update(p) {
    p.anim++;

    if (p.bomb > 0 && --p.bomb === 0) {
      for (let dy = -BLAST; dy <= BLAST; dy++) {
        for (let dx = -BLAST; dx <= BLAST; dx++) {
          if (dx * dx + dy * dy <= BLAST * BLAST) this.carve(p.x + dx, p.y - 3 + dy);
        }
      }
      this.events.push({ type: "boom", x: p.x, y: p.y - 3 });
      this.kill(p, "overflow");
      return;
    }
    /* an overflowing packet has crashed: it stops dead where it stands */
    if (p.bomb > 0 && ["walk", "shrug", "build", "bash", "dig"].includes(p.state)) p.state = "crash";

    switch (p.state) {
      case "fall": this.doFall(p); break;
      case "walk": this.doWalk(p); break;
      case "climb": this.doClimb(p); break;
      case "block":
      case "crash": if (!this.solid(p.x, p.y + 1)) this.startFall(p); break;
      case "build": this.doBuild(p); break;
      case "bash": this.doBash(p); break;
      case "dig": this.doDig(p); break;
      case "shrug": if (++p.timer > 10) p.state = "walk"; break;
    }
    if (!p.alive) return;

    if (p.y >= LH + 8) { this.kill(p, "void"); return; }
    for (const h of this.hazards) {
      if (p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h) { this.kill(p, "short"); return; }
    }
    const ex = this.level.exit;
    if (p.state !== "block" && Math.abs(p.x - ex.x) <= 3 && p.y <= ex.y && p.y >= ex.y - 6) {
      p.alive = false;
      p.saved = true;
      this.saved++;
      this.events.push({ type: "saved" });
    }
  }

  startFall(p) { p.state = "fall"; p.fall = 0; }

  doFall(p) {
    const slow = p.floater && p.fall >= BUFFER_OPENS;
    const speed = slow ? 1 : 3;
    for (let i = 0; i < speed; i++) {
      if (this.solid(p.x, p.y + 1)) {
        if (p.fall > SAFE_FALL && !p.floater) { this.kill(p, "splat"); return; }
        p.state = "walk";
        p.fall = 0;
        return;
      }
      p.y++;
      p.fall++;
    }
  }

  blockedByFirewall(p, nx) {
    for (const b of this.packets) {
      if (b === p || !b.alive || b.state !== "block") continue;
      if (Math.abs(b.y - p.y) > 6) continue;
      if (Math.sign(b.x - p.x) === p.dir && Math.abs(b.x - nx) <= 4) return true;
    }
    return false;
  }

  doWalk(p) {
    const nx = p.x + p.dir;
    if (this.blockedByFirewall(p, nx)) { p.dir = -p.dir; return; }

    if (this.solid(nx, p.y)) {
      for (let k = 1; k <= STEP_UP; k++) {
        if (!this.solid(nx, p.y - k)) { p.x = nx; p.y -= k; return; }
      }
      if (p.climber) { p.state = "climb"; return; }
      p.dir = -p.dir;
      return;
    }

    p.x = nx;
    for (let k = 0; k < 3 && !this.solid(p.x, p.y + 1); k++) p.y++;
    if (!this.solid(p.x, p.y + 1)) { p.state = "fall"; p.fall = 3; }
  }

  doClimb(p) {
    if (this.solid(p.x, p.y - 9)) {          // head against an overhang: let go
      p.dir = -p.dir;
      this.startFall(p);
      return;
    }
    p.y--;
    if (!this.solid(p.x + p.dir, p.y)) { p.x += p.dir; p.state = "walk"; }
  }

  doBuild(p) {
    if (++p.timer % 4) return;
    /* stop if the next step up would put the packet's head in a wall */
    for (let r = 1; r <= 9; r++) {
      if (this.solid(p.x + p.dir * 2, p.y - r)) { p.dir = -p.dir; p.state = "shrug"; p.timer = 0; return; }
    }
    for (let i = 0; i < 6; i++) {
      const bx = p.x + p.dir * i;
      if (bx >= 0 && bx < LW && p.y >= 0 && p.y < LH && this.map[p.y * LW + bx] === M.EMPTY) {
        this.map[p.y * LW + bx] = M.BRICK;
        this.dirty = true;
      }
    }
    this.events.push({ type: "brick" });
    p.y--;
    p.x += p.dir * 2;
    if (--p.bricks === 0) { p.state = "shrug"; p.timer = 0; }
  }

  doBash(p) {
    if (++p.timer % 2) return;
    let ahead = false;
    for (let c = 1; c <= 10 && !ahead; c++) {
      for (let r = 0; r <= 8; r++) if (this.diggable(p.x + p.dir * c, p.y - r)) { ahead = true; break; }
    }
    if (!ahead) { p.state = "walk"; return; }
    for (let c = 1; c <= 3; c++) {
      let steel = false;
      for (let r = 0; r <= 8; r++) steel = this.carve(p.x + p.dir * c, p.y - r) || steel;
      if (steel) { p.dir = -p.dir; p.state = "shrug"; p.timer = 0; return; }
    }
    p.x += p.dir;
    if (!this.solid(p.x, p.y + 1)) {
      for (let k = 0; k < 3 && !this.solid(p.x, p.y + 1); k++) p.y++;
      if (!this.solid(p.x, p.y + 1)) this.startFall(p);
    }
  }

  doDig(p) {
    if (++p.timer % 3) return;
    const row = p.y + 1;
    for (let dx = -3; dx <= 3; dx++) {
      if (this.at(p.x + dx, row) === M.STEEL && Math.abs(dx) <= 1) { p.state = "shrug"; p.timer = 0; return; }
    }
    for (let dx = -3; dx <= 3; dx++) this.carve(p.x + dx, row);
    p.y++;
    let floor = false;
    for (let dx = -3; dx <= 3; dx++) if (this.solid(p.x + dx, p.y + 1)) floor = true;
    if (!floor) this.startFall(p);
  }
}

if (typeof module !== "undefined") {
  module.exports = { PacketGame, SKILLS, M, LW, LH, TICK_HZ, SAFE_FALL };
}
