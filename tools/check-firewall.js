/* Checks the Firewall 3D maps in js/firewall-levels.js: rectangular, sealed
 * at the edges, one start, known characters, and a route to the reboot
 * terminal that picks the keys up in some order before the doors they open. */
const { FW_LEVELS, FW_ARENA } = require("../js/firewall-levels.js");

const WALLS = "#123DRBYXMNUQ";
const FLOOR = ".Pvwtsrdlnmxokhfacgpkbyz".split("").concat(["K", "H", "L", "W"]);
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
      if ((c === "M" || c === "U") && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ".PK".includes(map[y + dy]?.[x + dx]) || FLOOR.includes(map[y + dy]?.[x + dx])))
        problems.push(`${c === "M" ? "mail terminal" : "vulnerability"} at ${x},${y} cannot be reached from any floor tile`);
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
        if ("#123MNUQ".includes(c)) continue;
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
// the endless-mode arena: sealed, one start, known tiles, no exit needed
{
  const m = FW_ARENA.map, w = m[0].length, arenaProblems = [];
  let starts = 0;
  m.forEach((row, y) => {
    if (row.length !== w) arenaProblems.push(`row ${y} is ${row.length} wide`);
    [...row].forEach((c, x) => {
      if (!KNOWN.has(c)) arenaProblems.push(`unknown tile "${c}" at ${x},${y}`);
      if ((x === 0 || y === 0 || x === w - 1 || y === m.length - 1) && !"#123".includes(c)) arenaProblems.push(`the edge is open at ${x},${y}`);
      if (c === "P") starts++;
    });
  });
  if (starts !== 1) arenaProblems.push(`needs exactly one start, has ${starts}`);
  if (arenaProblems.length) { bad++; console.log("FAIL arena"); arenaProblems.forEach(p => console.log(`      - ${p}`)); }
  else console.log(`ok   arena    ${w}x${m.length}`);
}

// every kind of monster needs at least one real namesake in the history file
const { FW_HISTORY } = require("../js/firewall-history.js");
const KINDS = ["virus", "worm", "trojan", "spyware", "ransomware", "rootkit", "adware", "keylogger", "bot", "fileless", "wiper", "mobile"];
const historyProblems = [];
for (const k of KINDS) if (!FW_HISTORY.some(h => h.kind === k)) historyProblems.push(`no ${k} in the history`);
FW_HISTORY.forEach((h, i) => {
  if (!KINDS.includes(h.kind)) historyProblems.push(`${h.name}: unknown kind "${h.kind}"`);
  if (!h.en || !h.zh) historyProblems.push(`${h.name}: needs both an English and a Mandarin note`);
  if (i && h.year < FW_HISTORY[i - 1].year) historyProblems.push(`${h.name}: out of date order`);
});
if (historyProblems.length) { bad++; console.log("FAIL history"); historyProblems.forEach(p => console.log(`      - ${p}`)); }
else console.log(`ok   history  ${FW_HISTORY.length} entries, ${FW_HISTORY[0].year}\u2013${FW_HISTORY[FW_HISTORY.length - 1].year}`);

// the phishing emails: both languages, and clues that explain the verdict
const { FW_EMAILS } = require("../js/firewall-phishing.js");
const mailProblems = [];
FW_EMAILS.forEach((m, i) => {
  for (const l of ["en", "zh"]) {
    if (!m[l] || !m[l].subject || !m[l].body) mailProblems.push(`email ${i + 1}: missing ${l} subject or body`);
    if (!m.clues || !m.clues[l] || m.clues[l].length < 2) mailProblems.push(`email ${i + 1}: needs at least two ${l} clues`);
  }
});
const phish = FW_EMAILS.filter(m => m.phish).length;
if (!phish || phish === FW_EMAILS.length) mailProblems.push("the emails need both phishing and genuine examples");
if (mailProblems.length) { bad++; console.log("FAIL emails"); mailProblems.forEach(p => console.log(`      - ${p}`)); }
else console.log(`ok   emails   ${FW_EMAILS.length} (${phish} phishing, ${FW_EMAILS.length - phish} genuine)`);

console.log(bad ? `\n${bad} map(s) need attention` : `\nall ${FW_LEVELS.length} Firewall 3D maps can be finished`);
process.exit(bad ? 1 : 0);
