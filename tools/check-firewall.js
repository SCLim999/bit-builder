/* Checks the Firewall 3D maps in js/firewall-levels.js: rectangular, sealed
 * at the edges, one start, known characters, and a route to the reboot
 * terminal that picks the keys up in some order before the doors they open. */
const { FW_LEVELS } = require("../js/firewall-levels.js");

const WALLS = "#123DRBYX";
const FLOOR = ".Pvwtsrkhfacgpkby".split("").concat(["K", "H"]);
const KNOWN = new Set(WALLS.split("").concat(FLOOR));
const LOCKS = { R: "k", B: "b", Y: "y" };

function check(level) {
  const problems = [];
  const map = level.map;
  const h = map.length, w = map[0].length;
  map.forEach((row, y) => {
    if (row.length !== w) problems.push(`row ${y} is ${row.length} wide, expected ${w}`);
  });
  if (problems.length) return problems;

  let start = null, exits = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = map[y][x];
      if (!KNOWN.has(c)) problems.push(`unknown tile "${c}" at ${x},${y}`);
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      if (edge && !WALLS.includes(c)) problems.push(`the edge is open at ${x},${y}`);
      if (edge && "DRBY".includes(c)) problems.push(`door on the edge at ${x},${y}`);
      if (c === "P") { if (start) problems.push("more than one start"); start = [x, y]; }
      if (c === "X") exits++;
    }
  }
  if (!start) problems.push("no start (P)");
  if (!exits) problems.push("no reboot terminal (X)");
  if (problems.length) return problems;

  // Flood fill, reopening with each new key until nothing changes.
  const keys = new Set();
  let seen, reachedExit = false, grew = true;
  while (grew) {
    grew = false;
    seen = new Set([start.join()]);
    const queue = [start];
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        const c = map[ny][nx];
        if (c === "X") { reachedExit = true; continue; }
        if ("#123".includes(c)) continue;
        if (LOCKS[c] && !keys.has(LOCKS[c])) continue;
        const id = nx + "," + ny;
        if (seen.has(id)) continue;
        seen.add(id);
        if ("kby".includes(c) && !keys.has(c)) { keys.add(c); grew = true; }
        queue.push([nx, ny]);
      }
    }
  }
  if (!reachedExit) problems.push(`the terminal cannot be reached (keys found: ${[...keys].join("") || "none"})`);
  for (const [lock, key] of Object.entries(LOCKS)) {
    if (map.some(r => r.includes(lock)) && !map.some(r => r.includes(key))) {
      problems.push(`door ${lock} has no key ${key} on the map`);
    }
  }
  return problems;
}

let bad = 0;
FW_LEVELS.forEach((level, i) => {
  const problems = check(level);
  const label = `#${i + 1} ${level.name.en}`;
  if (problems.length) {
    bad++;
    console.log(`FAIL ${label}`);
    problems.forEach(p => console.log(`      - ${p}`));
  } else {
    console.log(`ok   ${label}  ${level.map[0].length}x${level.map.length}`);
  }
});
console.log(bad ? `\n${bad} map(s) need attention` : `\nall ${FW_LEVELS.length} Firewall 3D maps can be finished`);
process.exit(bad ? 1 : 0);
