/* Breadth-first search that plays a level through the real engine.
   Monsters are removed and the clock is ignored: this proves the puzzle is
   completable and that the engine's rules (pushing, sliding, doors, sockets,
   teleports, toggles) actually let a player finish.                       */

const { Game, DIRS } = require("../js/engine.js");
const { LEVELS } = require("../js/levels.js");

const LIMIT = Number(process.env.LIMIT || 900000);

/* The engine owns snapshot/restore (they back the in-game rewind), so the
   search reuses them — that keeps the two from drifting apart. */
function key(s) {
  return s.grid.join("|") + "#" + s.items.join("|") + "#" + s.player.x + "," + s.player.y +
    "#" + s.slide + "#" + s.blocks.map(b => b.x + "," + b.y).sort().join(";") +
    "#" + Object.values(s.keys).join("") + Object.values(s.tools).map(Boolean).map(Number).join("") +
    "#" + s.got.join(",");
}

function solve(level) {
  const g = new Game(level);
  g.monsters = [];
  /* Incompatible parts are never required — they only cost time, which this
     search ignores — so drop them rather than double the state space. */
  g.items = g.items.map(row => row.map(i => ("xz".includes(i) ? null : i)));
  const start = g.snapshot();
  const seen = new Set([key(start)]);
  let frontier = [{ s: start, path: "" }];
  let visited = 0;

  while (frontier.length) {
    const next = [];
    for (const node of frontier) {
      const moves = node.s.slide ? [null] : ["up", "down", "left", "right"];
      for (const mv of moves) {
        g.restore(node.s);
        g.monsters = [];
        g.history.length = 0;                 // the search does its own bookkeeping
        g.step(mv);
        if (g.state === "dead") continue;
        const snap = g.snapshot();
        const k = key(snap);
        if (seen.has(k)) continue;
        seen.add(k);
        visited++;
        const path = node.path + (mv ? mv[0] : ".");
        if (g.state === "won") return { ok: true, moves: path.length, visited, path };
        if (visited > LIMIT) return { ok: false, reason: `gave up after ${visited} states`, visited };
        next.push({ s: snap, path });
      }
    }
    frontier = next;
  }
  return { ok: false, reason: "no solution exists", visited };
}

const only = process.argv[2] ? [Number(process.argv[2]) - 1] : LEVELS.map((_, i) => i);
let bad = 0;
for (const i of only) {
  const t0 = Date.now();
  const r = solve(LEVELS[i]);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (r.ok) {
    console.log(`ok   #${i + 1} ${LEVELS[i].name} — solved in ${r.moves} steps (${r.visited} states, ${secs}s)`);
    console.log(`     par ${[...r.path].filter(c => c !== ".").length} moves`);
    if (process.env.SHOW_PATH) console.log("PATH " + r.path);
  }
  else { bad++; console.log(`FAIL #${i + 1} ${LEVELS[i].name} — ${r.reason} (${secs}s)`); }
}
process.exit(bad ? 1 : 0);
