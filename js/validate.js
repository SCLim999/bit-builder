/* ============================================================================
   BIT BUILDER — level checker
   Shared by tools/validate-levels.js (Node) and the in-browser editor.

   It answers the questions that make a map playable at all:
     - is the map rectangular, with exactly one start and one exit?
     - is every part reachable, picking tools and cards up along the way?
     - is the exit unreachable until the socket opens, and reachable after?
     - are there at least as many access cards as locked ports?

   Approximations: monsters are ignored, crates count as walls (a level that
   needs a crate bridge lists the tiles it frees in `_bridge`), ice and data
   buses count as plain floor, and teleports are treated as one linked set.
   ========================================================================== */

(function (root) {
  const WALL = "#";
  const HAZARD = { "~": "F", "*": "H" };
  const DOORS = { R: "r", B: "b", Y: "y", G: "g" };
  const ITEMS = "cszxrbygFHKMQ";
  const PARTS = "cs";

  function parse(level) {
    const g = level.map.map(r => r.split(""));
    const items = [];
    let start = null;
    const bridge = new Set((level._bridge || []).map(([x, y]) => x + "," + y));
    g.forEach((row, y) => row.forEach((ch, x) => {
      if (ch === "P") { start = { x, y }; g[y][x] = " "; }
      else if ("@%&$".includes(ch)) g[y][x] = " ";
      else if (ITEMS.includes(ch)) { items.push({ x, y, ch }); g[y][x] = " "; }
      if (bridge.has(x + "," + y)) g[y][x] = " ";
    }));
    return { g, items, start };
  }

  function flood(g, start, have, socketOpen, teleports, switchFound) {
    const H = g.length, W = g[0].length;
    const seen = new Set([start.x + "," + start.y]);
    const stack = [start];
    const passable = (x, y) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return false;
      const t = g[y][x];
      if (t === WALL || t === "O" || t === "!") return false;
      if (t === "S") return socketOpen;
      if (HAZARD[t]) return have.has(HAZARD[t]);
      if (DOORS[t]) return have.has(DOORS[t]);
      if (t === "-" || t === "|") return switchFound;
      return true;
    };
    while (stack.length) {
      const c = stack.pop();
      const nbrs = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: c.x + dx, y: c.y + dy }));
      if (g[c.y][c.x] === "0") for (const t of teleports) nbrs.push(t);
      for (const n of nbrs) {
        const k = n.x + "," + n.y;
        if (!passable(n.x, n.y) || seen.has(k)) continue;
        seen.add(k);
        stack.push(n);
      }
    }
    return seen;
  }

  function validateLevel(level) {
    const problems = [];
    if (!level || !Array.isArray(level.map) || !level.map.length) {
      return { ok: false, problems: ["the level has no map"], info: {} };
    }
    const W = level.map[0].length;
    level.map.forEach((r, y) => {
      if (r.length !== W) problems.push(`row ${y} is ${r.length} wide, expected ${W}`);
    });
    if (problems.length) return { ok: false, problems, info: {} };

    const { g, items, start } = parse(level);
    const flat = [].concat(...g);
    const count = ch => flat.filter(c => c === ch).length;
    if (!start) problems.push("no start tile — place the technician");
    if (count("X") !== 1) problems.push(`expected exactly 1 power button, found ${count("X")}`);
    if (count("S") < 1) problems.push("no assembly socket");
    if (!items.some(i => i.ch === "c") && !items.some(i => i.ch === "s")) problems.push("no parts to collect");
    if (problems.length) return { ok: false, problems, info: {} };

    for (const [ch, list] of Object.entries(level.kinds || {})) {
      const placed = items.filter(i => i.ch === ch).length;
      if (placed !== list.length) problems.push(`kinds.${ch} names ${list.length} parts but the map has ${placed}`);
    }

    const teleports = [];
    g.forEach((row, y) => row.forEach((ch, x) => { if (ch === "0") teleports.push({ x, y }); }));
    if (teleports.length === 1) problems.push("a lone network port has nowhere to send you — add a second");

    const have = new Set();
    let switchFound = false, reach = null, grew = true;
    while (grew) {
      reach = flood(g, start, have, false, teleports, switchFound);
      grew = false;
      for (const it of items) {
        if (reach.has(it.x + "," + it.y) && !PARTS.includes(it.ch) && it.ch !== "x" && it.ch !== "z" && !have.has(it.ch)) {
          have.add(it.ch);
          grew = true;
        }
      }
      if (!switchFound) {
        g.forEach((row, y) => row.forEach((ch, x) => {
          if (ch === "k" && reach.has(x + "," + y)) { switchFound = true; grew = true; }
        }));
      }
    }

    for (const m of items.filter(it => PARTS.includes(it.ch) && !reach.has(it.x + "," + it.y))) {
      problems.push(`the ${m.ch === "c" ? "hardware" : "software"} part at (${m.x},${m.y}) cannot be reached`);
    }

    let exit = null;
    g.forEach((row, y) => row.forEach((ch, x) => { if (ch === "X") exit = { x, y }; }));
    if (reach.has(exit.x + "," + exit.y)) problems.push("the power button can be reached without opening the socket");
    const open = flood(g, start, have, true, teleports, switchFound);
    if (!open.has(exit.x + "," + exit.y)) problems.push("the power button cannot be reached even with the socket open");

    for (const [door, card] of Object.entries(DOORS)) {
      if (card === "g") continue;                      // root access is reusable
      const doors = count(door), cards = items.filter(i => i.ch === card).length;
      if (doors > cards) problems.push(`${doors} ${card === "r" ? "red" : card === "b" ? "blue" : "yellow"} ports but only ${cards} matching card(s)`);
    }

    const info = {
      width: W, height: g.length,
      hardware: items.filter(i => i.ch === "c").length,
      software: items.filter(i => i.ch === "s").length,
      decoys: items.filter(i => i.ch === "x" || i.ch === "z").length,
      kit: [...have].filter(c => "FHKMQrbyg".includes(c)).join("")
    };
    return { ok: problems.length === 0, problems, info };
  }

  root.validateLevel = validateLevel;
  if (typeof module !== "undefined") module.exports = { validateLevel };
})(typeof window !== "undefined" ? window : globalThis);
