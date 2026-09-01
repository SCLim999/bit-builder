/* ============================================================================
   BIT BUILDER — loop, rendering, input and UI wiring
   ========================================================================== */

const STEP_MS = 145;          // one engine step
const VIEW = 11;              // tiles visible across the board
let BOARD = 528;              // css pixels of the square board, remeasured on resize
let TILE = BOARD / VIEW;
const STORE_KEY = "bitbuilder.v1";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let game = null;
let levelIndex = 0;
let custom = null;            // a level from a #lvl= share code, or null
let practice = false;         // clock stopped while you learn a level
let practiceUsed = false;     // this run used it, so nothing gets recorded
let mode = "intro";           // intro | playing | paused | dead | won | complete
let acc = 0;
let lastFrame = 0;
let animT = 0;
let elapsedMs = 0;
const held = [];
let buffered = null;

/* ------------------------------------------------------------------ saving */
function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (raw && typeof raw.unlocked === "number") return { unlocked: raw.unlocked, best: raw.best || {} };
  } catch (e) { /* first run, or storage disabled */ }
  return { unlocked: 1, best: {} };
}
function saveProgress(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) { /* private mode */ }
}
let progress = loadProgress();

/* --------------------------------------------------------------- language */
const LANG_KEY = "bitbuilder.lang";
function loadLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) return saved;
  } catch (e) { /* storage disabled */ }
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function applyLanguage(lang) {
  setLang(lang);
  try { localStorage.setItem(LANG_KEY, currentLang()); } catch (e) { /* ignore */ }
  document.documentElement.lang = currentLang() === "zh" ? "zh-CN" : "en";
  document.body.classList.toggle("lang-zh", currentLang() === "zh");
  for (const node of document.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll("[data-i18n-html]")) node.innerHTML = t(node.dataset.i18nHtml);
  el("btn-lang").textContent = t("lang.other");
  el("btn-sound").textContent = t("btn.sound", { state: t(Sound.on ? "state.on" : "state.off") });
  el("btn-practice").textContent = t("btn.practice", { state: t(practice ? "state.on" : "state.off") });
  el("btn-fullscreen").textContent = t(fullscreenOn() ? "btn.exitFullscreen" : "btn.fullscreen");
  buildLevelList();
  buildLegend();
  buildKnowledge();
  if (game) {
    updateHUD();
    if (mode === "intro") introOverlay();
  }
}

/* The display name of anything you can pick up. */
function pickupName(pickup) {
  if (!pickup) return "";
  if (pickup.type === "card") return t("card." + pickup.id);
  const k = knowledgeFor(pickup.id, currentLang());
  return k ? k.name : pickup.id;
}
function kindName(kind) {
  const k = knowledgeFor(kind, currentLang());
  return k ? k.name : kind;
}

/* ------------------------------------------------------------------- sound */
const Sound = {
  on: true,
  ac: null,
  ensure() {
    if (!this.ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ac = new AC();
    }
    if (this.ac && this.ac.state === "suspended") this.ac.resume();
    return this.ac;
  },
  tone(freq, when, dur, type = "square", vol = 0.05) {
    const ac = this.ac;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + when);
    gain.gain.setValueAtTime(vol, ac.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + when);
    osc.stop(ac.currentTime + when + dur + 0.02);
  },
  play(name) {
    if (!this.on || !this.ensure()) return;
    const seq = {
      pickup: [[880, 0, .07], [1320, .05, .07]],
      door: [[220, 0, .09, "sawtooth"]],
      socket: [[440, 0, .08], [660, .07, .1]],
      ready: [[660, 0, .08], [880, .08, .08], [1180, .16, .14]],
      push: [[120, 0, .09, "triangle"]],
      splash: [[300, 0, .12, "sine"], [180, .08, .14, "sine"]],
      burn: [[200, 0, .14, "sawtooth"]],
      teleport: [[500, 0, .06], [900, .05, .06], [1400, .1, .08]],
      toggle: [[520, 0, .06], [400, .06, .08]],
      scrub: [[400, 0, .1, "sawtooth"], [200, .1, .16, "sawtooth"]],
      boom: [[90, 0, .2, "sawtooth", .08]],
      die: [[440, 0, .12, "sawtooth"], [300, .12, .14, "sawtooth"], [160, .26, .3, "sawtooth"]],
      win: [[660, 0, .1], [880, .1, .1], [1100, .2, .1], [1320, .3, .25]],
      reject: [[240, 0, .1, "sawtooth", .06], [150, .1, .18, "sawtooth", .06]],
      rewind: [[700, 0, .05], [520, .05, .05], [380, .1, .08]],
      quarantine: [[880, 0, .06], [660, .06, .06], [440, .12, .14, "sawtooth"]],
      step: [[150, 0, .03, "triangle", .02]]
    }[name];
    if (!seq) return;
    for (const [f, w, d, type, vol] of seq) this.tone(f, w, d, type || "square", vol || 0.05);
  }
};

/* --------------------------------------------------------------- rendering */
/* The canvas is square and sized by CSS; match the backing store to whatever
   size it ended up, so the board stays crisp full screen and on retina. */
function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const css = Math.max(200, Math.round(canvas.getBoundingClientRect().width) || BOARD);
  BOARD = css;
  TILE = BOARD / VIEW;
  canvas.width = Math.round(css * dpr);
  canvas.height = Math.round(css * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function cameraOrigin(px, py) {
  const span = VIEW - 1;
  const ox = game.w <= VIEW ? -(VIEW - game.w) / 2 : Math.min(Math.max(px - span / 2, 0), game.w - VIEW);
  const oy = game.h <= VIEW ? -(VIEW - game.h) / 2 : Math.min(Math.max(py - span / 2, 0), game.h - VIEW);
  return { ox, oy };
}

function drawTerrain(ch, sx, sy, gx, gy) {
  switch (ch) {
    case T.WALL: Sprites.wall(ctx, sx, sy, TILE); break;
    case T.COOLANT: Sprites.coolant(ctx, sx, sy, TILE, animT, gx, gy); break;
    case T.OVERHEAT: Sprites.overheat(ctx, sx, sy, TILE, animT, gx, gy); break;
    case T.ICE: Sprites.ice(ctx, sx, sy, TILE, null); break;
    case "1": case "2": case "3": case "4": Sprites.ice(ctx, sx, sy, TILE, ch); break;
    case T.BUS_L: Sprites.bus(ctx, sx, sy, TILE, "left", animT); break;
    case T.BUS_R: Sprites.bus(ctx, sx, sy, TILE, "right", animT); break;
    case T.BUS_U: Sprites.bus(ctx, sx, sy, TILE, "up", animT); break;
    case T.BUS_D: Sprites.bus(ctx, sx, sy, TILE, "down", animT); break;
    case T.SOCKET: Sprites.socket(ctx, sx, sy, TILE, game.partsDone(), animT); break;
    case T.EXIT: Sprites.exit(ctx, sx, sy, TILE, animT); break;
    case T.HINT: Sprites.hint(ctx, sx, sy, TILE); break;
    case T.SURGE: Sprites.surge(ctx, sx, sy, TILE, animT); break;
    case T.SCRUBBER: Sprites.scrubber(ctx, sx, sy, TILE, animT); break;
    case T.PORT: Sprites.port(ctx, sx, sy, TILE, animT); break;
    case T.SWITCH: Sprites.toggleSwitch(ctx, sx, sy, TILE); break;
    case T.TOGGLE_SHUT: Sprites.toggleWall(ctx, sx, sy, TILE, false); break;
    case T.TOGGLE_OPEN: Sprites.toggleWall(ctx, sx, sy, TILE, true); break;
    case "R": case "B": case "Y": case "G": Sprites.door(ctx, sx, sy, TILE, ch.toLowerCase()); break;
    default: Sprites.floor(ctx, sx, sy, TILE, gx, gy);
  }
}

function drawItem(ch, sx, sy, gx, gy) {
  const kind = game.kindAt.get(gx + "," + gy);
  if (ch === "c" || ch === "x") Sprites.hardware(ctx, sx, sy, TILE, kind, animT);
  else if (ch === "s" || ch === "z") Sprites.software(ctx, sx, sy, TILE, kind, animT);
  else if ("rbyg".includes(ch)) return Sprites.card(ctx, sx, sy, TILE, ch);
  else return Sprites.tool(ctx, sx, sy, TILE, ch);
  if (ch === "x" || ch === "z") Sprites.incompatible(ctx, sx, sy, TILE);
}

function render(alpha) {
  const p = game.player;
  const px = lerp(p.prevX, p.x, alpha);
  const py = lerp(p.prevY, p.y, alpha);
  const { ox, oy } = cameraOrigin(px, py);

  ctx.fillStyle = "#05080d";
  ctx.fillRect(0, 0, BOARD, BOARD);

  const x0 = Math.floor(ox) - 1, y0 = Math.floor(oy) - 1;
  for (let gy = y0; gy <= y0 + VIEW + 1; gy++) {
    for (let gx = x0; gx <= x0 + VIEW + 1; gx++) {
      if (!game.inBounds(gx, gy)) continue;
      const sx = (gx - ox) * TILE, sy = (gy - oy) * TILE;
      drawTerrain(game.grid[gy][gx], sx, sy, gx, gy);
      const item = game.items[gy][gx];
      if (item) drawItem(item, sx, sy, gx, gy);
    }
  }

  for (const b of game.blocks) {
    Sprites.crate(ctx, (lerp(b.prevX, b.x, alpha) - ox) * TILE, (lerp(b.prevY, b.y, alpha) - oy) * TILE, TILE);
  }
  for (const m of game.monsters) {
    if (!m.alive) continue;
    Sprites.monster(ctx, (lerp(m.prevX, m.x, alpha) - ox) * TILE, (lerp(m.prevY, m.y, alpha) - oy) * TILE,
      TILE, m.type, m.dir, animT);
  }
  if (game.state !== "dead") Sprites.player(ctx, (px - ox) * TILE, (py - oy) * TILE, TILE, p.dir, animT);

  const vig = ctx.createRadialGradient(BOARD / 2, BOARD / 2, BOARD * 0.3, BOARD / 2, BOARD / 2, BOARD * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, BOARD, BOARD);
}

/* --------------------------------------------------------------------- HUD */
const el = id => document.getElementById(id);

function fmtTime(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function chipCanvas(draw) {
  const c = document.createElement("canvas");
  c.width = c.height = 44;
  const cx = c.getContext("2d");
  draw(cx, 44);
  return c;
}

function updateHUD() {
  el("level-no").textContent = custom ? t("panel.custom") : t("panel.levelOf", { n: levelIndex + 1, total: LEVELS.length });
  el("level-name").textContent = custom ? game.level.name : levelName(game.level);
  el("time-left").textContent = practice ? "\u221e" : fmtTime(game.timeLeft);
  el("time-left").parentElement.classList.toggle("warn", !practice && game.timeLeft < 20000);
  const got = game.collected.hw + game.collected.sw;
  el("parts-count").textContent = `${got}/${game.required.hw + game.required.sw}`;
  el("par-count").textContent = game.level.par ? `${game.moves}/${game.level.par}` : String(game.moves);

  const list = el("spec-list");
  list.innerHTML = "";
  for (const entry of game.spec) {
    const row = document.createElement("div");
    row.className = "spec-row" + (entry.got >= entry.need ? " done" : "");
    row.appendChild(chipCanvas((c, sz) => (entry.hardware
      ? Sprites.hardware(c, 0, 0, sz, entry.kind, 0)
      : Sprites.software(c, 0, 0, sz, entry.kind, 0))));
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = kindName(entry.kind);
    const q = document.createElement("span");
    q.className = "q";
    q.textContent = entry.got >= entry.need ? "\u2713" : `${entry.got}/${entry.need}`;
    row.append(n, q);
    list.appendChild(row);
  }
  el("btn-rewind").disabled = !game.canUndo();

  const ready = game.partsDone();
  const socket = el("socket-state");
  socket.classList.toggle("ready", ready);
  socket.textContent = t(ready ? "socket.open" : "socket.locked");

  const inv = el("inventory");
  inv.innerHTML = "";
  for (const card of "rbyg") {
    if (!game.keys[card]) continue;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.appendChild(chipCanvas((c, s) => Sprites.card(c, 0, 0, s, card)));
    chip.append(t("card." + card));
    if (card !== "g") { const b = document.createElement("b"); b.textContent = `×${game.keys[card]}`; chip.appendChild(b); }
    inv.appendChild(chip);
  }
  for (const tool of "FHKM") {
    if (!game.tools[tool]) continue;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.appendChild(chipCanvas((c, s) => Sprites.tool(c, 0, 0, s, tool)));
    chip.append(kindName(tool));
    inv.appendChild(chip);
  }
  if (game.kits) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.appendChild(chipCanvas((c, s) => Sprites.tool(c, 0, 0, s, "Q")));
    chip.append(kindName("Q"));
    const b = document.createElement("b");
    b.textContent = `\u00d7${game.kits}`;
    chip.appendChild(b);
    inv.appendChild(chip);
  }
  if (!inv.children.length) {
    inv.innerHTML = "";
    const empty = document.createElement("span");
    empty.className = "empty";
    empty.textContent = t("belt.empty");
    inv.appendChild(empty);
  }

  const box = el("hint-box");
  box.classList.toggle("live", game.onHint);
  box.querySelector("h3").textContent = t(game.onHint ? "head.terminal" : "head.objective");
  el("hint-text").textContent = game.onHint
    ? (custom ? game.level.hint : levelHint(game.level))
    : t("objective.text");
  renderFieldNote();
}

/* What the last thing you picked up actually is, in the sidebar. */
let noteId = null;
function renderFieldNote() {
  const box = el("field-note");
  const info = noteId && knowledgeFor(noteId, currentLang());
  if (!info) {
    box.className = "field-note";
    box.textContent = t("note.empty");
    return;
  }
  box.className = "field-note filled";
  box.innerHTML = "";
  const head = document.createElement("div");
  head.className = "fn-head";
  head.appendChild(chipCanvas((c, s) => drawKnowledgeIcon(c, s, noteId)));
  const b = document.createElement("b");
  b.textContent = info.name;
  head.appendChild(b);
  const p = document.createElement("span");
  p.textContent = info.note;
  box.append(head, p);
}

/* Icon for anything in the knowledge base. */
function drawKnowledgeIcon(c, size, id) {
  const entry = KNOWLEDGE[id];
  if (!entry) return;
  if (entry.group === "hardware") return Sprites.hardware(c, 0, 0, size, id, 0);
  if (entry.group === "software") return Sprites.software(c, 0, 0, size, id, 0);
  if (entry.group === "tool") return Sprites.tool(c, 0, 0, size, id);
  Sprites.monster(c, 0, 0, size, id.slice(-1), "down", 0);
}

let toastTimer = null;
function toast(msg, bad) {
  const node = el("toast");
  node.textContent = msg;
  node.classList.toggle("bad", !!bad);
  node.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.style.opacity = "0"; }, 1600);
}

/* ---------------------------------------------------------------- overlays */
let bootTimer = null;
function stopBoot() { clearTimeout(bootTimer); bootTimer = null; }

function showOverlay(title, text, stats, primary, secondary) {
  stopBoot();
  const quiz = el("ov-quiz");
  quiz.classList.add("hidden");
  quiz.removeAttribute("data-done");
  el("ov-boot").classList.add("hidden");
  el("ov-stars").textContent = "";
  el("ov-title").textContent = title;
  el("ov-text").textContent = text;
  el("ov-stats").innerHTML = stats || "";
  const p = el("ov-primary"), s = el("ov-secondary");
  p.textContent = primary.label;
  p.onclick = primary.action;
  if (secondary) { s.classList.remove("hidden"); s.style.display = ""; s.textContent = secondary.label; s.onclick = secondary.action; }
  else { s.style.display = "none"; }
  el("overlay").classList.remove("hidden");
}
function hideOverlay() { stopBoot(); el("overlay").classList.add("hidden"); }

function introOverlay() {
  mode = "intro";
  showOverlay(
    custom ? game.level.name : t("ov.introTitle", { n: levelIndex + 1, name: levelName(game.level) }),
    custom ? game.level.hint : levelHint(game.level),
    `<span>${t("stat.parts")} <b>${game.required.hw + game.required.sw}</b></span>` +
    `<span>${t("stat.clock")} <b>${fmtTime(game.timeLeft)}</b></span>` +
    (game.level.par ? `<span>${t("stat.par")} <b>${t("stat.parMoves", { n: game.level.par })}</b></span>` : ""),
    { label: t("ov.start"), action: startPlaying },
    { label: t("btn.levels"), action: () => el("levels-dialog").showModal() }
  );
}

function startPlaying() {
  hideOverlay();
  mode = "playing";
  acc = 0;
  Sound.ensure();
}

function deathOverlay() {
  mode = "dead";
  Sound.play("die");
  const reason = t("death." + game.deathReason);
  const parts = `<span>${t("stat.parts")} <b>${game.collected.hw + game.collected.sw}/${game.required.hw + game.required.sw}</b></span>` +
    `<span>${t("stat.moves")} <b>${game.moves}</b></span>`;
  const again = () => (custom ? loadCustomLevel(custom) : loadLevel(levelIndex));
  if (game.canUndo()) {
    showOverlay(t("ov.deadTitle"), t("ov.deadRewind", { reason }), parts,
      { label: t("ov.rewindOne"), action: rewind },
      { label: t("ov.restartLevel"), action: again });
  } else {
    showOverlay(t("ov.deadTitle"), reason, parts,
      { label: t("ov.tryAgain"), action: again },
      { label: t("btn.levels"), action: () => el("levels-dialog").showModal() });
  }
}

function rewind() {
  if (!game.undo()) return;
  for (const ev of game.drainEvents()) handleEvent(ev);
  hideOverlay();
  mode = "playing";
  acc = 0;
  held.length = 0;
  buffered = null;
  updateHUD();
}

/* Three stars: finish, finish briskly, finish briskly with no rewinds and no
   incompatible parts picked up. Par comes from the solver in tools/solve.js. */
function starsFor(g) {
  const par = g.level.par;
  if (!par) return 3;
  if (g.moves <= Math.round(par * 1.25) && g.rewinds === 0 && g.rejects === 0) return 3;
  if (g.moves <= par * 2) return 2;
  return 1;
}
function starString(n) { return "\u2605".repeat(n) + "\u2606".repeat(3 - n); }

function winOverlay() {
  mode = "won";
  Sound.play("win");
  const name = game.level.name;
  const shown = custom ? name : levelName(game.level);
  const seconds = Math.round(elapsedMs / 1000);
  const stars = starsFor(game);
  const prev = progress.best[name];
  const record = !practiceUsed && (!prev || seconds < prev.time || stars > (prev.stars || 0));
  if (!practiceUsed) progress.best[name] = {
    time: Math.min(seconds, prev ? prev.time : seconds),
    moves: Math.min(game.moves, prev ? prev.moves : game.moves),
    stars: Math.max(stars, prev ? prev.stars || 0 : 0)
  };
  progress.unlocked = Math.max(progress.unlocked, Math.min(levelIndex + 2, LEVELS.length));
  saveProgress(progress);
  buildLevelList();

  const last = levelIndex === LEVELS.length - 1;
  const primary = custom
    ? { label: t("ov.playAgain"), action: () => loadCustomLevel(custom) }
    : last
      ? { label: t("ov.replay"), action: () => loadLevel(levelIndex) }
      : { label: t("ov.next"), action: () => loadLevel(levelIndex + 1) };

  showOverlay(
    t(last && !custom ? "ov.winAllTitle" : "ov.winTitle"),
    last && !custom ? t("ov.winAllText") : t("ov.winText", { name: shown }),
    `<span>${t("stat.time")} <b>${seconds}s</b></span><span>${t("stat.moves")} <b>${game.moves}</b></span>` +
    (game.level.par ? `<span>${t("stat.par")} <b>${game.level.par}</b></span>` : "") +
    (game.rewinds ? `<span>${t("stat.rewinds")} <b>${game.rewinds}</b></span>` : "") +
    (practiceUsed ? `<span><b>${t("ov.practiceRun")}</b></span>` : record ? `<span><b>${t("ov.newBest")}</b></span>` : ""),
    primary,
    { label: t("btn.levels"), action: () => el("levels-dialog").showModal() }
  );
  runBootSequence(seconds, practiceUsed ? 0 : stars);
}

/* The payoff: a POST screen listing exactly what you installed. */
function runBootSequence(seconds, stars) {
  const pre = el("ov-boot");
  const text = el("ov-text"), stats = el("ov-stats"), starLine = el("ov-stars");
  const buttons = document.querySelector(".overlay-buttons");
  const lines = [t("boot.header"), ""];
  const width = currentLang() === "zh" ? 16 : 26;
  for (const e of game.spec) {
    const label = kindName(e.kind) + (e.need > 1 ? ` \u00d7${e.need}` : "");
    const dots = Math.max(3, width - [...label].length);
    lines.push(label + " " + ".".repeat(dots) + " " + t("boot.ok"));
    if (e === game.spec.filter(x => x.hardware).slice(-1)[0]) lines.push("");
  }
  lines.push("", t("boot.done", { seconds, moves: game.moves }));

  pre.textContent = "";
  pre.classList.remove("hidden");
  for (const n of [text, stats, buttons]) n.style.visibility = "hidden";
  starLine.textContent = "";

  let i = 0;
  const tick = () => {
    if (i < lines.length) {
      pre.textContent += (i ? "\n" : "") + lines[i++];
      if (lines[i - 1]) Sound.play("step");
      bootTimer = setTimeout(tick, 70);
      return;
    }
    starLine.textContent = stars ? starString(stars) : "";
    for (const n of [text, stats, buttons]) n.style.visibility = "";
    bootTimer = null;
    showQuiz();
  };
  tick();
}

function skipBoot() {
  if (!bootTimer) return false;
  stopBoot();
  el("ov-stars").textContent = practiceUsed ? "" : starString(starsFor(game));
  for (const n of [el("ov-text"), el("ov-stats"), document.querySelector(".overlay-buttons")]) n.style.visibility = "";
  showQuiz();
  return true;
}

/* ---------------------------------------------------------- knowledge check
   One definition, three candidates, drawn from the parts you just collected.
   Answering is optional and never blocks the level buttons.                */
function showQuiz() {
  const card = el("ov-quiz");
  const collected = game.spec.map(e => e.kind).filter(k => QUIZ_KINDS.includes(k));
  if (!collected.length) { card.classList.add("hidden"); return; }

  const answer = collected[Math.floor(Math.random() * collected.length)];
  const pool = QUIZ_KINDS.filter(k => k !== answer && KNOWLEDGE[k].group === KNOWLEDGE[answer].group);
  const options = [answer];
  while (options.length < 3 && pool.length) options.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  options.sort(() => Math.random() - 0.5);

  card.className = "quiz";
  card.innerHTML = "";
  const h = document.createElement("h3");
  h.textContent = t("quiz.title");
  const q = document.createElement("p");
  q.className = "q";
  q.textContent = knowledgeFor(answer, currentLang()).note;
  const opts = document.createElement("div");
  opts.className = "quiz-options";
  const verdict = document.createElement("p");
  verdict.className = "quiz-verdict";

  for (const kind of options) {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = kindName(kind);
    b.onclick = () => {
      if (card.dataset.done) return;
      card.dataset.done = "1";
      const right = kind === answer;
      b.classList.add(right ? "right" : "wrong");
      for (const other of opts.children) {
        other.disabled = true;
        if (!right && other.textContent === kindName(answer)) other.classList.add("right");
      }
      verdict.textContent = t(right ? "quiz.correct" : "quiz.wrong", { name: kindName(answer) });
      Sound.play(right ? "ready" : "reject");
      progress.quiz = progress.quiz || { right: 0, asked: 0 };
      progress.quiz.asked++;
      if (right) progress.quiz.right++;
      saveProgress(progress);
      noteId = answer;
      renderFieldNote();
    };
    opts.appendChild(b);
  }
  card.append(h, q, opts, verdict);
  card.classList.remove("hidden");
}

function togglePause() {
  if (mode === "playing") {
    mode = "paused";
    showOverlay(t("ov.pausedTitle"), t("ov.pausedText"), "", { label: t("ov.resume"), action: startPlaying }, null);
  } else if (mode === "paused") {
    startPlaying();
  }
}

/* ------------------------------------------------------------------- input */
const KEY_DIRS = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", a: "left", s: "down", d: "right", W: "up", A: "left", S: "down", D: "right"
};

function pressDir(dir) {
  if (!held.includes(dir)) held.unshift(dir);
  buffered = dir;
}
function releaseDir(dir) {
  const i = held.indexOf(dir);
  if (i >= 0) held.splice(i, 1);
}

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  const dir = KEY_DIRS[e.key];
  if (dir) {
    e.preventDefault();
    pressDir(dir);
    if (mode === "intro") startPlaying();
    return;
  }
  if (e.key === "r" || e.key === "R") { custom ? loadCustomLevel(custom) : loadLevel(levelIndex); return; }
  if (e.key === "z" || e.key === "Z") { if (mode === "playing" || mode === "dead") rewind(); return; }
  if (e.key === "f" || e.key === "F") { toggleFullscreen(); return; }
  if (e.key === "p" || e.key === "P") { togglePause(); return; }
  if (e.key === "Enter" || e.key === " ") {
    if (!el("overlay").classList.contains("hidden")) {
      e.preventDefault();
      if (!skipBoot()) el("ov-primary").click();
    }
  }
});
document.addEventListener("keyup", e => {
  const dir = KEY_DIRS[e.key];
  if (dir) releaseDir(dir);
});

for (const btn of document.querySelectorAll(".dpad-btn")) {
  const dir = btn.dataset.dir;
  const down = e => { e.preventDefault(); pressDir(dir); if (mode === "intro") startPlaying(); };
  const up = e => { e.preventDefault(); releaseDir(dir); };
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointerleave", up);
  btn.addEventListener("pointercancel", up);
}

let touchStart = null;
canvas.addEventListener("pointerdown", e => { touchStart = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener("pointerup", e => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  buffered = dir;
  if (mode === "intro") startPlaying();
});

/* -------------------------------------------------------------------- loop */
function takeStep() {
  let dir = held[0] || buffered;
  buffered = null;
  game.step(dir);
  for (const ev of game.drainEvents()) handleEvent(ev);
  if (game.state === "won") winOverlay();
  else if (game.state === "dead") deathOverlay();
  updateHUD();
}

function handleEvent(ev) {
  Sound.play(ev.name);
  if (ev.name === "pickup" && game.lastPickup) {
    toast(t("toast.pickup", { name: pickupName(game.lastPickup) }));
    if (game.lastPickup.type !== "card") {          // cards have no component note
      noteId = game.lastPickup.id;
      renderFieldNote();
    }
  }
  if (ev.name === "reject") {
    toast(t("toast.reject", { name: kindName(ev.data) }), true);
    noteId = ev.data;
    renderFieldNote();
  }
  if (ev.name === "rewind") toast(t("toast.rewind"));
  if (ev.name === "quarantine") toast(t("toast.quarantine"));
  if (ev.name === "door") toast(t("toast.door"));
  if (ev.name === "scrub") toast(t("toast.scrub"));
  if (ev.name === "ready") toast(t("toast.ready"));
  if (ev.name === "teleport") toast(t("toast.teleport"));
}

function frame(now) {
  const dt = Math.min(120, now - lastFrame || 16);
  lastFrame = now;
  animT = now / 1000;

  if (mode === "playing") {
    if (!practice) {
      game.advanceClock(dt);
      elapsedMs += dt;
    }
    if (game.state === "dead") { deathOverlay(); updateHUD(); }
    else {
      acc += dt;
      while (acc >= STEP_MS && mode === "playing") { acc -= STEP_MS; takeStep(); }
    }
    el("time-left").textContent = practice ? "\u221e" : fmtTime(game.timeLeft);
  }

  render(mode === "playing" ? Math.min(acc / STEP_MS, 1) : 1);
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ levels */
function loadLevel(i) {
  custom = null;
  levelIndex = Math.max(0, Math.min(i, LEVELS.length - 1));
  startGame(LEVELS[levelIndex]);
}

function loadCustomLevel(level) {
  custom = level;
  startGame(level);
}

function startGame(level) {
  game = new Game(level);
  practiceUsed = practice;
  noteId = null;
  elapsedMs = 0;
  acc = 0;
  held.length = 0;
  buffered = null;
  updateHUD();
  introOverlay();
  const dlg = el("levels-dialog");
  if (dlg.open) dlg.close();
}

function buildLevelList() {
  const list = el("level-list");
  list.innerHTML = "";
  LEVELS.forEach((lv, i) => {
    const b = document.createElement("button");
    b.className = "level-card";
    b.disabled = i + 1 > progress.unlocked;
    const best = progress.best[lv.name];
    b.innerHTML = `<span class="n">${t("levels.n", { n: i + 1 })}</span>` +
      `<span class="t">${b.disabled ? t("levels.locked") : levelName(lv)}</span>` +
      (best ? `<p class="stars">${starString(best.stars || 1)}</p>` +
              `<span class="best">${t("levels.best", { time: best.time, moves: best.moves })}</span>` : "");
    b.onclick = () => loadLevel(i);
    list.appendChild(b);
  });
}

/* ------------------------------------------------------------------ legend */
function buildLegend() {
  const items = [
    [(c, s) => Sprites.hardware(c, 0, 0, s, "cpu", 0), "hardware"],
    [(c, s) => Sprites.software(c, 0, 0, s, "os", 0), "software"],
    [(c, s) => { Sprites.hardware(c, 0, 0, s, "ram", 0); Sprites.incompatible(c, 0, 0, s); }, "decoy"],
    [(c, s) => Sprites.socket(c, 0, 0, s, false, 0), "socket"],
    [(c, s) => Sprites.exit(c, 0, 0, s, 0), "exit"],
    [(c, s) => Sprites.card(c, 0, 0, s, "b"), "card"],
    [(c, s) => Sprites.door(c, 0, 0, s, "b"), "door"],
    [(c, s) => Sprites.coolant(c, 0, 0, s, 0, 1, 1), "coolant"],
    [(c, s) => Sprites.overheat(c, 0, 0, s, 0, 1, 1), "overheat"],
    [(c, s) => Sprites.ice(c, 0, 0, s, null), "ice"],
    [(c, s) => Sprites.bus(c, 0, 0, s, "right", 0), "bus"],
    [(c, s) => Sprites.crate(c, 0, 0, s), "crate"],
    [(c, s) => Sprites.surge(c, 0, 0, s, 0), "surge"],
    [(c, s) => Sprites.scrubber(c, 0, 0, s, 0), "scrubber"],
    [(c, s) => Sprites.port(c, 0, 0, s, 0), "port"],
    [(c, s) => Sprites.toggleSwitch(c, 0, 0, s), "switch"],
    [(c, s) => Sprites.tool(c, 0, 0, s, "F"), "tools"],
    [(c, s) => Sprites.tool(c, 0, 0, s, "Q"), "kit"],
    [(c, s) => Sprites.monster(c, 0, 0, s, "@", "down", 0), "bug"],
    [(c, s) => Sprites.monster(c, 0, 0, s, "&", "down", 0), "trojan"]
  ];
  const box = el("legend");
  box.innerHTML = "";
  for (const [draw, key] of items) {
    const row = document.createElement("div");
    row.className = "legend-item";
    const c = document.createElement("canvas");
    c.width = c.height = 48;
    draw(c.getContext("2d"), 48);
    row.appendChild(c);
    const span = document.createElement("span");
    const b = document.createElement("b");
    b.textContent = t("legend." + key);
    span.append(b, document.createTextNode(t("legend." + key + "D")));
    row.appendChild(span);
    box.appendChild(row);
  }
}

/* The reference book: every component, what it is, in the current language. */
function buildKnowledge() {
  const box = el("knowledge-list");
  box.innerHTML = "";
  for (const group of ["hardware", "software", "tool", "malware"]) {
    const ids = Object.keys(KNOWLEDGE).filter(id => KNOWLEDGE[id].group === group);
    if (!ids.length) continue;
    const sec = document.createElement("section");
    sec.className = "know-group";
    const h = document.createElement("h3");
    h.textContent = t("know." + group);
    sec.appendChild(h);
    for (const id of ids) {
      const info = knowledgeFor(id, currentLang());
      const row = document.createElement("div");
      row.className = "know-row";
      const c = document.createElement("canvas");
      c.width = c.height = 44;
      drawKnowledgeIcon(c.getContext("2d"), 44, id);
      const text = document.createElement("div");
      text.className = "kn";
      const b = document.createElement("b");
      b.textContent = info.name;
      const p = document.createElement("span");
      p.textContent = info.note;
      text.append(b, p);
      row.append(c, text);
      sec.appendChild(row);
    }
    box.appendChild(sec);
  }
}

/* -------------------------------------------------------------------- boot */
el("overlay").addEventListener("click", e => { if (e.target.tagName !== "BUTTON") skipBoot(); });
el("btn-rewind").onclick = rewind;
el("btn-restart").onclick = () => (custom ? loadCustomLevel(custom) : loadLevel(levelIndex));
el("btn-pause").onclick = togglePause;
el("btn-levels").onclick = () => el("levels-dialog").showModal();
el("btn-help").onclick = () => el("help-dialog").showModal();
/* Real full screen where the browser allows it; on iOS, where a non-video
   element cannot go full screen, the same class still maximises the layout. */
function fullscreenOn() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement) ||
    document.body.classList.contains("fs");
}

function syncFullscreen() {
  const on = fullscreenOn();
  document.body.classList.toggle("fs", on);
  const b = el("btn-fullscreen");
  b.textContent = t(on ? "btn.exitFullscreen" : "btn.fullscreen");
  b.setAttribute("aria-pressed", String(on));
  requestAnimationFrame(setupCanvas);
}

function toggleFullscreen() {
  const root = document.documentElement;
  const real = document.fullscreenElement || document.webkitFullscreenElement;
  if (real) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    document.body.classList.remove("fs");
    syncFullscreen();
    return;
  }
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  document.body.classList.add("fs");
  if (request) {
    Promise.resolve(request.call(root)).catch(() => { /* keep the maximised layout */ });
  }
  syncFullscreen();
}

for (const ev of ["fullscreenchange", "webkitfullscreenchange"]) {
  document.addEventListener(ev, () => {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) document.body.classList.remove("fs");
    syncFullscreen();
  });
}

el("btn-fullscreen").onclick = toggleFullscreen;
el("btn-practice").onclick = e => {
  practice = !practice;
  if (practice) practiceUsed = true;
  e.target.textContent = t("btn.practice", { state: t(practice ? "state.on" : "state.off") });
  e.target.setAttribute("aria-pressed", String(practice));
  updateHUD();
};
el("btn-knowledge").onclick = () => el("knowledge-dialog").showModal();
el("btn-lang").onclick = () => applyLanguage(currentLang() === "zh" ? "en" : "zh");
el("btn-sound").onclick = e => {
  Sound.on = !Sound.on;
  e.target.textContent = t("btn.sound", { state: t(Sound.on ? "state.on" : "state.off") });
  e.target.setAttribute("aria-pressed", String(Sound.on));
  if (Sound.on) Sound.ensure();
};

setupCanvas();
window.addEventListener("resize", setupCanvas);
applyLanguage(loadLang());
startFromHash();
requestAnimationFrame(frame);

function startFromHash() {
  const m = /[#&]lvl=([A-Za-z0-9\-_]+)/.exec(location.hash);
  if (m) {
    try {
      loadCustomLevel(Codec.decode(m[1]));
      return;
    } catch (err) {
      alert(t("code.unreadable", { message: err.message }));
    }
  }
  loadLevel(Math.min(progress.unlocked - 1, LEVELS.length - 1));
}

window.addEventListener("hashchange", startFromHash);
