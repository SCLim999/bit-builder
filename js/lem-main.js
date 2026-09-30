/* ============================================================================
   PACKET RUSH — game loop, rendering, input and interface text
   The engine (lem-engine.js) knows nothing about the screen. This file runs it
   at TICK_HZ, draws the world at 2x, turns clicks into skill assignments, and
   shares the language and theme settings with Bit Builder.
   ========================================================================== */

const TEXT = {
  en: {
    "lang.other": "中文",
    "app.title": "Packet Rush",
    "app.tagline": "Packets march blindly across the network. Give them jobs so enough of them reach the server.",
    "btn.levels": "Levels", "btn.help": "How to play", "btn.builder": "Bit Builder", "btn.close": "Close",
    "theme.label": "Theme", "theme.bright": "Theme: Bright", "theme.dark": "Theme: Dark",
    "theme.soft": "Theme: Soft", "theme.energy": "Theme: Energy", "theme.excited": "Theme: Excited",
    "btn.sound": "Sound: {state}", "state.on": "on", "state.off": "off",
    "hud.level": "Level {n}", "hud.out": "Out", "hud.in": "Delivered", "hud.need": "Need", "hud.lost": "Lost", "hud.ttl": "TTL",
    "view.3d": "View: 3D", "view.2d": "View: 2D",
    "view.hint": "3D view — drag empty space to tilt the camera, scroll to zoom, double-click to reset.",
    "ctl.pause": "Pause", "ctl.resume": "Resume", "ctl.fast": "Fast", "ctl.restart": "Restart", "ctl.nuke": "kill -9",
    "ctl.nukeConfirm": "Press again to end the run",
    "levels.title": "Levels", "levels.sub": "Deliver enough packets to unlock the next network.",
    "levels.best": "best {n}/{count}", "levels.none": "not delivered yet", "levels.locked": "locked",
    "ov.intro": "Level {n} — {name}", "ov.start": "Start",
    "ov.goal": "Release {count} packets · deliver at least {need}",
    "ov.won": "Delivered!", "ov.wonAll": "Every network is up!",
    "ov.lost": "Too much packet loss",
    "ov.lostText": "Only {saved} of the {need} packets you needed reached the server.",
    "ov.wonText": "{saved} of {count} packets reached the server — {need} were needed.",
    "ov.wonAllText": "All seven networks are delivering. Replay any level to beat your best.",
    "ov.next": "Next level", "ov.retry": "Try again", "ov.levels": "Levels", "ov.replay": "Replay",
    "ov.paused": "Paused", "ov.pausedText": "The network is frozen. Nothing moves until you resume.",
    "ov.concept": "Concept", "ov.newBest": "New best!",
    "loss.splat": "corrupted by a long fall", "loss.void": "dropped off the network",
    "loss.short": "shorted on a live wire", "loss.overflow": "overflowed",
    "loss.ttl": "TTL expired", "loss.firewall": "stayed on as a firewall",
    "stat.saved": "Delivered", "stat.lost": "Lost", "stat.time": "Time",
    "note.pick": "Pick a skill, then click a packet to give it that job.",
    "note.none": "No <b>{skill}</b> left — try another skill.",
    "help.title": "How to play",
    "help.p1": "Packets drop out of the <b>router</b> and walk forward until they hit a wall, then turn around. They step up small ledges, but a fall that is too long <b>corrupts</b> them, and walking off the edge of the map <b>drops</b> them.",
    "help.p2": "Choose a skill in the toolbar (or press <kbd>1</kbd>–<kbd>7</kbd>), then click a packet to give it that job. Each level hands out a limited number of each skill. Get enough packets into the <b>server</b> before their <b>TTL</b> — time to live — runs out.",
    "help.p3": "<kbd>P</kbd> pause · <kbd>F</kbd> fast forward · <kbd>V</kbd> 3D / 2D view · <kbd>R</kbd> restart · <kbd>K</kbd> twice: <b>kill -9</b> ends the run by overflowing every packet.",
    "foot.text": "A Lemmings-style companion to Bit Builder. Mouse, keyboard or touch — no install, no plugins.",
    "skill.uplink": "Uplink", "skill.buffer": "Buffer", "skill.overflow": "Overflow", "skill.firewall": "Firewall",
    "skill.bridge": "Bridge", "skill.tunnel": "Tunnel", "skill.pipe": "Pipe",
    "sk.uplink": "climbs any wall it walks into. Stays with the packet.",
    "sk.buffer": "absorbs a fall of any height. Stays with the packet.",
    "sk.overflow": "the packet crashes on the spot and blows a hole five seconds later.",
    "sk.firewall": "stands still and turns back every packet that reaches it.",
    "sk.bridge": "lays twelve bricks of rising staircase.",
    "sk.tunnel": "digs sideways through silicon — never through shielded steel.",
    "sk.pipe": "digs straight down until it breaks through."
  },
  zh: {
    "lang.other": "EN",
    "app.title": "数据包大冲关",
    "app.tagline": "数据包只会盲目地向前走。给它们分配工作，让足够多的数据包到达服务器。",
    "btn.levels": "关卡", "btn.help": "玩法说明", "btn.builder": "组装大师", "btn.close": "关闭",
    "theme.label": "配色", "theme.bright": "配色：明亮", "theme.dark": "配色：暗夜",
    "theme.soft": "配色：柔和", "theme.energy": "配色：活力", "theme.excited": "配色：热烈",
    "btn.sound": "声音：{state}", "state.on": "开", "state.off": "关",
    "hud.level": "第 {n} 关", "hud.out": "已发出", "hud.in": "已送达", "hud.need": "需要", "hud.lost": "丢失", "hud.ttl": "TTL",
    "view.3d": "视图：3D", "view.2d": "视图：2D",
    "view.hint": "3D 视图 —— 拖动空白处旋转镜头，滚轮缩放，双击复位。",
    "ctl.pause": "暂停", "ctl.resume": "继续", "ctl.fast": "快进", "ctl.restart": "重来", "ctl.nuke": "kill -9",
    "ctl.nukeConfirm": "再按一次结束本局",
    "levels.title": "关卡", "levels.sub": "送达足够的数据包即可解锁下一个网络。",
    "levels.best": "最佳 {n}/{count}", "levels.none": "尚未送达", "levels.locked": "未解锁",
    "ov.intro": "第 {n} 关 —— {name}", "ov.start": "开始",
    "ov.goal": "发出 {count} 个数据包 · 至少送达 {need} 个",
    "ov.won": "送达成功！", "ov.wonAll": "所有网络都已接通！",
    "ov.lost": "丢包太多",
    "ov.lostText": "只有 {saved} 个数据包到达服务器，需要 {need} 个。",
    "ov.wonText": "{count} 个数据包中有 {saved} 个到达服务器 —— 需要 {need} 个。",
    "ov.wonAllText": "七个网络全部畅通。可以重玩任意关卡，刷新你的最佳成绩。",
    "ov.next": "下一关", "ov.retry": "再试一次", "ov.levels": "关卡", "ov.replay": "重玩",
    "ov.paused": "已暂停", "ov.pausedText": "网络已冻结，继续之前一切都不会动。",
    "ov.concept": "知识点", "ov.newBest": "新纪录！",
    "loss.splat": "摔得太远而损坏", "loss.void": "掉出了网络",
    "loss.short": "碰到带电导线短路", "loss.overflow": "溢出了",
    "loss.ttl": "TTL 耗尽", "loss.firewall": "留作防火墙",
    "stat.saved": "送达", "stat.lost": "丢失", "stat.time": "用时",
    "note.pick": "先选一个技能，再点击一个数据包，把这项工作交给它。",
    "note.none": "<b>{skill}</b>已经用完了 —— 换个技能试试。",
    "help.title": "玩法说明",
    "help.p1": "数据包从<b>路由器</b>里掉出来，一直向前走，碰到墙就掉头。它们能迈上小台阶，但摔得太远会<b>损坏</b>，走出地图边缘会<b>丢失</b>。",
    "help.p2": "在工具栏选择一个技能（或按 <kbd>1</kbd>–<kbd>7</kbd>），再点击一个数据包，把这项工作交给它。每关每种技能的数量有限。要在数据包的 <b>TTL</b>（生存时间）耗尽之前，把足够多的数据包送进<b>服务器</b>。",
    "help.p3": "<kbd>P</kbd> 暂停 · <kbd>F</kbd> 快进 · <kbd>V</kbd> 切换 3D / 2D · <kbd>R</kbd> 重来 · 连按两次 <kbd>K</kbd>：<b>kill -9</b> 让所有数据包溢出，结束本局。",
    "foot.text": "组装大师的旅鼠风格姊妹篇。鼠标、键盘或触屏均可 —— 无需安装，无需插件。",
    "skill.uplink": "上行链路", "skill.buffer": "缓冲区", "skill.overflow": "溢出", "skill.firewall": "防火墙",
    "skill.bridge": "网桥", "skill.tunnel": "隧道", "skill.pipe": "管道",
    "sk.uplink": "碰到墙就往上爬。永久有效。",
    "sk.buffer": "从任何高度落下都不会损坏。永久有效。",
    "sk.overflow": "数据包当场崩溃，五秒后炸出一个洞。",
    "sk.firewall": "原地站定，把碰到它的数据包全部挡回去。",
    "sk.bridge": "铺出十二级向上的台阶。",
    "sk.tunnel": "横向挖穿硅层 —— 但挖不动屏蔽钢板。",
    "sk.pipe": "垂直向下挖，直到挖穿为止。"
  }
};

/* ------------------------------------------------------------ settings */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage disabled */ } }
};
let lang = store.get("bitbuilder.lang", (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en");
/* Bit Builder only knows bright and dark, so the extra themes live under
   Packet Rush's own key; bright and dark are still written back to the shared one. */
let theme = store.get("packetrush.theme", store.get("bitbuilder.theme", "bright"));
let soundOn = store.get("packetrush.sound", "on") === "on";
let progress;
try { progress = JSON.parse(store.get("packetrush.progress", "")) || null; } catch (e) { progress = null; }
if (!progress || typeof progress !== "object") progress = { unlocked: 1, best: {} };

function t(key, vars) {
  let s = (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
  return s;
}
const L = obj => obj[lang] || obj.en;
const el = id => document.getElementById(id);

/* --------------------------------------------------------------- sound */
let audio = null;
function beep(freq, ms, type = "square", vol = 0.05, slide = 0) {
  if (!soundOn) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(), now = audio.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, now + ms / 1000);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
    o.connect(g).connect(audio.destination);
    o.start(now);
    o.stop(now + ms / 1000);
  } catch (e) { /* no audio */ }
}

/* --------------------------------------------------------------- state */
const canvas = el("world");
const fxCanvas = el("fx");
const fx = fxCanvas.getContext("2d");
/* The 3D view needs WebGL2; without it the game simply stays flat. */
let r3 = null;
try { r3 = typeof createRenderer3D === "function" ? createRenderer3D(el("world3d")) : null; } catch (e) { r3 = null; }
let view3d = !!r3 && store.get("packetrush.view", "3d") === "3d";
let hoverScreen = null;           // pointer position in CSS pixels, for the 3D overlay
const ctx = canvas.getContext("2d");
const SCALE = canvas.width / LW;
const terrainCanvas = document.createElement("canvas");
terrainCanvas.width = LW; terrainCanvas.height = LH;
const tctx = terrainCanvas.getContext("2d");
const terrainImg = tctx.createImageData(LW, LH);

let levelIndex = 0;
let game = null;
let selected = null;
let paused = false;
let fast = false;
let running = false;              // false while an overlay is up
let hover = null;                 // world coordinates of the pointer
let nukeArmed = 0;
let effects = [];
let acc = 0, last = 0, frame = 0;

/* -------------------------------------------------------------- colours */
/* One palette per theme. sky/grid paint the background, dirt/trace the
   circuit-board silicon, steel and brick the other two materials, and pulse
   makes the grid breathe (only the excited theme uses it). */
const THEMES = {
  bright:  { sky1: "#16233a", sky2: "#23405a", grid: [160, 220, 255, 0.07], dirt: [34, 128, 84], trace: [230, 190, 80], via: [250, 230, 150], steel: [128, 142, 160], brick: [240, 160, 50] },
  dark:    { sky1: "#05080d", sky2: "#0b1624", grid: [69, 208, 224, 0.05], dirt: [22, 92, 60], trace: [201, 162, 58], via: [240, 220, 140], steel: [96, 108, 124], brick: [214, 139, 38] },
  soft:    { sky1: "#e8e6fb", sky2: "#fdebf1", grid: [120, 100, 180, 0.09], dirt: [150, 208, 184], trace: [246, 196, 160], via: [255, 240, 225], steel: [178, 184, 208], brick: [243, 170, 150] },
  energy:  { sky1: "#0a2a44", sky2: "#0f5a66", grid: [34, 211, 238, 0.10], dirt: [16, 150, 118], trace: [255, 160, 40], via: [255, 236, 160], steel: [92, 126, 156], brick: [255, 118, 54] },
  excited: { sky1: "#2a0a4a", sky2: "#7a1a72", grid: [255, 79, 216, 0.10], dirt: [118, 42, 176], trace: [255, 225, 77], via: [255, 255, 200], steel: [150, 128, 200], brick: [255, 92, 184], pulse: true }
};
function palette() { return THEMES[theme] || THEMES.bright; }

/* The terrain is repainted into an ImageData whenever the engine carves or
   builds. Silicon gets a circuit-board pattern of gold traces and vias, steel
   gets rivets, bricks get mortar lines; every exposed top edge is lit. */
function paintTerrain() {
  const pal = palette(), d = terrainImg.data, map = game.map;
  for (let y = 0; y < LH; y++) {
    for (let x = 0; x < LW; x++) {
      const i = y * LW + x, o = i * 4, m = map[i];
      if (m === M.EMPTY) { d[o + 3] = 0; continue; }
      let c;
      const top = y === 0 || map[i - LW] === M.EMPTY;
      const side = (x > 0 && map[i - 1] === M.EMPTY) || (x < LW - 1 && map[i + 1] === M.EMPTY);
      if (m === M.DIRT) {
        const traceH = y % 12 === 5 && (x + (y >> 3) * 17) % 48 < 30;
        const traceV = x % 16 === 9 && (y + (x >> 4) * 11) % 36 < 20;
        const via = x % 16 === 9 && y % 12 === 5;
        c = via ? pal.via : traceH || traceV ? pal.trace : pal.dirt;
        const n = ((x * 73856093) ^ (y * 19349663)) & 7;
        c = [c[0] + n - 3, c[1] + n - 3, c[2] + n - 3];
      } else if (m === M.STEEL) {
        const rivet = x % 10 === 2 && y % 10 === 2;
        const seam = x % 20 === 0 || y % 20 === 0;
        c = rivet ? [210, 220, 232] : seam ? pal.steel.map(v => v - 30) : pal.steel;
      } else {
        const mortar = y % 2 === 0 && x % 6 === 0;
        c = mortar ? pal.brick.map(v => v - 60) : pal.brick;
      }
      if (top) c = c.map(v => Math.min(255, v + 55));
      else if (side) c = c.map(v => Math.min(255, v + 20));
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
  }
  tctx.putImageData(terrainImg, 0, 0);
  game.dirty = false;
}

/* ----------------------------------------------------------- rendering */
const STATE_COLOR = { block: "#f87171", build: "#f5a524", bash: "#c084fc", dig: "#60a5fa", crash: "#fb7185" };

function drawBackground(pal) {
  const g = ctx.createLinearGradient(0, 0, 0, LH);
  g.addColorStop(0, pal.sky1); g.addColorStop(1, pal.sky2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LW, LH);
  const [r, gg, b, a] = pal.grid;
  const alpha = pal.pulse ? a * (1 + 0.8 * Math.sin(frame / 12)) : a;
  ctx.strokeStyle = `rgba(${r},${gg},${b},${alpha.toFixed(3)})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= LW; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, LH); }
  for (let y = 0; y <= LH; y += 20) { ctx.moveTo(0, y); ctx.lineTo(LW, y); }
  ctx.stroke();
}

function drawRouter(h) {
  const x = h.x - 12, y = h.y - 14;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x, y, 24, 9);
  ctx.strokeStyle = "#45d0e0";
  ctx.lineWidth = 0.75;
  ctx.strokeRect(x + 0.5, y + 0.5, 23, 8);
  for (let i = 0; i < 4; i++) {           // blinking link lights
    const on = ((frame >> 3) + i * 3) % 5 < 3;
    ctx.fillStyle = on ? (i % 2 ? "#4ade80" : "#f5a524") : "#334155";
    ctx.fillRect(x + 3 + i * 3, y + 3, 1.5, 1.5);
  }
  ctx.fillStyle = "#94a3b8";                // antennae
  ctx.fillRect(x + 3, y - 5, 1, 5);
  ctx.fillRect(x + 20, y - 5, 1, 5);
  ctx.fillStyle = "#0f172a";                // the slot packets drop out of
  ctx.fillRect(h.x - 5, y + 8, 10, 2);
}

function drawServer(ex) {
  const x = ex.x - 9, y = ex.y - 22;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x, y, 18, 23);
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 0.75;
  ctx.strokeRect(x + 0.5, y + 0.5, 17, 22);
  for (let i = 0; i < 3; i++) {             // drive bays
    ctx.fillStyle = "#334155";
    ctx.fillRect(x + 2, y + 2 + i * 3, 14, 2);
    ctx.fillStyle = (frame + i * 7) % 20 < 10 ? "#4ade80" : "#166534";
    ctx.fillRect(x + 13, y + 2.5 + i * 3, 1.5, 1);
  }
  const glow = 0.55 + 0.35 * Math.sin(frame / 8);
  ctx.fillStyle = `rgba(74,222,128,${glow})`;   // the open port
  ctx.fillRect(ex.x - 4, ex.y - 11, 8, 12);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillRect(ex.x - 1, ex.y - 13, 2, 1);
}

function drawHazard(h) {
  ctx.fillStyle = "rgba(15,23,42,0.85)";
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let row = 0; row < 2; row++) {
    const yy = h.y + h.h - 3 - row * 5;
    ctx.moveTo(h.x, yy);
    for (let x = h.x; x <= h.x + h.w; x += 4) {
      ctx.lineTo(x, yy + (((x + frame * (row ? 1 : -1)) >> 2) % 2 ? -2 : 2));
    }
  }
  ctx.stroke();
  if (frame % 6 < 3) {                      // sparks
    ctx.fillStyle = "#fef08a";
    const sx = h.x + ((frame * 37) % h.w), sy = h.y + h.h - 6 - ((frame * 13) % 6);
    ctx.fillRect(sx, sy, 1, 1);
  }
}

/* A packet is a little envelope on legs. Colour and props show its job. */
function drawPacket(p, highlight) {
  const x = p.x, y = p.y, f = p.dir;
  const body = STATE_COLOR[p.state] || (p.climber || p.floater ? "#a7f3d0" : "#e0f2fe");

  if (p.state === "fall" && p.floater && p.fall >= 12) {   // the buffer opens like a canopy
    ctx.fillStyle = "#45d0e0";
    ctx.beginPath();
    ctx.arc(x, y - 11, 5, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 11); ctx.lineTo(x - 2, y - 7);
    ctx.moveTo(x + 5, y - 11); ctx.lineTo(x + 2, y - 7);
    ctx.stroke();
  }

  /* legs */
  ctx.fillStyle = "#94a3b8";
  const walkingish = p.state === "walk" || p.state === "bash";
  const phase = walkingish ? (p.anim >> 1) % 4 : 0;
  const la = [0, 1, 0, -1][phase];
  if (p.state === "climb") {
    ctx.fillRect(x + f * 1.5, y - 2 - ((p.anim >> 1) % 2), 1, 2);
    ctx.fillRect(x + f * 1.5, y - 5 + ((p.anim >> 1) % 2), 1, 2);
  } else {
    ctx.fillRect(x - 2 + la * 0.5, y - 2, 1, 2.5);
    ctx.fillRect(x + 1 - la * 0.5, y - 2, 1, 2.5);
  }

  /* envelope */
  const bx = p.state === "climb" ? x - 3 + f * -1 : x - 3.5;
  const by = y - 8;
  ctx.fillStyle = body;
  ctx.fillRect(bx, by, 7, 6);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx + 0.25, by + 0.25, 6.5, 5.5);
  ctx.beginPath();
  ctx.moveTo(bx + 0.25, by + 0.25);
  ctx.lineTo(bx + 3.5, by + 3);
  ctx.lineTo(bx + 6.75, by + 0.25);
  ctx.stroke();
  ctx.fillStyle = "#0f172a";                // eye, looking where it walks
  ctx.fillRect(bx + 3.5 + f * 1.8 - 0.5, by + 3.4, 1, 1);

  if (p.climber) { ctx.fillStyle = "#4ade80"; ctx.fillRect(bx, by + 5, 7, 0.8); }

  switch (p.state) {
    case "block":                           // arms out, a wall of flame each side
      ctx.fillStyle = "#f87171";
      ctx.fillRect(x - 6, y - 6, 2.5, 1);
      ctx.fillRect(x + 3.5, y - 6, 2.5, 1);
      ctx.fillStyle = (frame >> 2) % 2 ? "#fb923c" : "#facc15";
      ctx.fillRect(x - 7, y - 9 + ((frame >> 2) % 2), 1, 3);
      ctx.fillRect(x + 6, y - 9 + (((frame >> 2) + 1) % 2), 1, 3);
      break;
    case "build":
      ctx.fillStyle = "#f5a524";
      ctx.fillRect(x + f * 3, y - 4, 2 * f, 1.5);
      break;
    case "bash":
      if (frame % 4 < 2) { ctx.fillStyle = "#e9d5ff"; ctx.fillRect(x + f * 5, y - 5 + (frame % 3), 1, 1); }
      break;
    case "dig":
      if (frame % 4 < 2) {
        ctx.fillStyle = "#a3e635";
        ctx.fillRect(x - 4 + (frame % 3), y - 1, 1, 1);
        ctx.fillRect(x + 3 - (frame % 2), y - 2, 1, 1);
      }
      break;
    case "shrug":
      ctx.fillStyle = "#e0f2fe";
      ctx.fillRect(x - 5, y - 9, 1, 1); ctx.fillRect(x + 4, y - 9, 1, 1);
      break;
  }

  if (p.bomb > 0) {
    const secs = Math.ceil(p.bomb / TICK_HZ);
    ctx.fillStyle = secs <= 1 && frame % 4 < 2 ? "#ffffff" : "#fb7185";
    ctx.font = "bold 7px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(secs), x, y - 11);
  }

  if (highlight) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x - 5.5, y - 11.5, 11, 13);
  }
}

function stepEffects() {
  effects = effects.filter(e => e.life > 0);
  for (const e of effects) {
    e.life--;
    if (e.kind === "text") e.y -= 0.35;
    else { e.x += e.vx; e.y += e.vy; e.vy += 0.12; }
  }
}

function drawEffects() {
  for (const e of effects) {
    if (e.kind === "text") {
      ctx.globalAlpha = Math.min(1, e.life / 20);
      ctx.fillStyle = e.color;
      ctx.font = "bold 7px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(e.text, e.x, e.y);
    } else {
      ctx.globalAlpha = Math.min(1, e.life / 15);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }
}

function burst(x, y, colors, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, s = 0.6 + Math.random() * 1.6;
    effects.push({ kind: "spark", x, y, z: (Math.random() - 0.5) * 18, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 25 + Math.random() * 20, color: colors[i % colors.length] });
  }
}

function render() {
  frame++;
  stepEffects();
  if (view3d) render3D(); else render2D();
}

/* The 3D renderer draws the world; this overlay adds what reads better flat:
   floating labels, overflow countdowns, the target ring and the pause card. */
function render3D() {
  const target = hover && running ? game.pick(hover.x, hover.y, selected) : null;
  r3.render(game, { pal: palette(), frame, hot: target, effects });

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(fxCanvas.clientWidth * dpr), H = Math.round(fxCanvas.clientHeight * dpr);
  if (fxCanvas.width !== W || fxCanvas.height !== H) { fxCanvas.width = W; fxCanvas.height = H; }
  fx.setTransform(1, 0, 0, 1, 0, 0);
  fx.clearRect(0, 0, W, H);
  const unit = W / 400;                     // roughly one world pixel on screen
  const at = (x, y, z) => { const s = r3.project(x, y, z); return [s.x * W, s.y * H]; };
  fx.textAlign = "center";

  for (const e of effects) {
    if (e.kind !== "text") continue;
    const [sx, sy] = at(e.x, e.y, 4);
    fx.globalAlpha = Math.min(1, e.life / 20);
    fx.font = `bold ${Math.round(8 * unit)}px ui-sans-serif, system-ui, sans-serif`;
    fx.lineWidth = 3 * dpr; fx.strokeStyle = "rgba(0,0,0,0.55)";
    fx.strokeText(e.text, sx, sy);
    fx.fillStyle = e.color;
    fx.fillText(e.text, sx, sy);
  }
  fx.globalAlpha = 1;
  for (const p of game.packets) {
    if (!p.alive || p.bomb <= 0) continue;
    const secs = Math.ceil(p.bomb / TICK_HZ);
    const [sx, sy] = at(p.x, p.y - 16, 0);
    fx.font = `bold ${Math.round(9 * unit)}px ui-monospace, monospace`;
    fx.lineWidth = 3 * dpr; fx.strokeStyle = "rgba(0,0,0,0.6)";
    fx.strokeText(String(secs), sx, sy);
    fx.fillStyle = secs <= 1 && frame % 4 < 2 ? "#ffffff" : "#fb7185";
    fx.fillText(String(secs), sx, sy);
  }
  if (target) {
    const [sx, sy] = at(target.x, target.y - 6, 0);
    fx.strokeStyle = "#4ade80";
    fx.lineWidth = 1.5 * dpr;
    fx.beginPath();
    fx.arc(sx, sy, 11 * unit, 0, Math.PI * 2);
    fx.stroke();
  } else if (hoverScreen && running) {
    const sx = hoverScreen.x * dpr, sy = hoverScreen.y * dpr, r = 5 * dpr;
    fx.strokeStyle = "rgba(255,255,255,0.6)";
    fx.lineWidth = 1 * dpr;
    fx.beginPath();
    fx.moveTo(sx - r, sy); fx.lineTo(sx - r / 3, sy); fx.moveTo(sx + r / 3, sy); fx.lineTo(sx + r, sy);
    fx.moveTo(sx, sy - r); fx.lineTo(sx, sy - r / 3); fx.moveTo(sx, sy + r / 3); fx.lineTo(sx, sy + r);
    fx.stroke();
  }
  if (paused && running) {
    fx.fillStyle = "rgba(0,0,0,0.35)";
    fx.fillRect(0, 0, W, H);
    fx.fillStyle = "#ffffff";
    fx.font = `bold ${Math.round(16 * unit)}px ui-sans-serif, system-ui, sans-serif`;
    fx.fillText(t("ov.paused"), W / 2, H / 2);
  }
}

function render2D() {
  const pal = palette();
  if (game.dirty) paintTerrain();
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawBackground(pal);
  ctx.drawImage(terrainCanvas, 0, 0);
  for (const h of game.hazards) drawHazard(h);
  drawServer(game.level.exit);
  drawRouter(game.level.hatch);

  const target = hover && running ? game.pick(hover.x, hover.y, selected) : null;
  for (const p of game.packets) if (p.alive) drawPacket(p, p === target);
  drawEffects();

  if (hover && running) {                   // crosshair cursor
    ctx.strokeStyle = target ? "#4ade80" : "rgba(255,255,255,0.55)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(hover.x - 4, hover.y); ctx.lineTo(hover.x - 1.5, hover.y);
    ctx.moveTo(hover.x + 1.5, hover.y); ctx.lineTo(hover.x + 4, hover.y);
    ctx.moveTo(hover.x, hover.y - 4); ctx.lineTo(hover.x, hover.y - 1.5);
    ctx.moveTo(hover.x, hover.y + 1.5); ctx.lineTo(hover.x, hover.y + 4);
    ctx.stroke();
  }
  if (paused && running) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, LW, LH);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("ov.paused"), LW / 2, LH / 2);
  }
}

/* --------------------------------------------------------- skill icons */
function drawSkillIcon(c, id) {
  const g = c.getContext("2d");
  c.width = 30; c.height = 30;
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.clearRect(0, 0, 15, 15);
  g.lineWidth = 1.2;
  g.lineCap = "round";
  g.lineJoin = "round";
  const wall = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  switch (id) {
    case "uplink":
      wall(10, 1, 3, 13, "#94a3b8");
      g.strokeStyle = "#4ade80";
      g.beginPath(); g.moveTo(6, 13); g.lineTo(6, 3); g.moveTo(3, 6); g.lineTo(6, 3); g.lineTo(9, 6); g.stroke();
      break;
    case "buffer":
      g.fillStyle = "#45d0e0";
      g.beginPath(); g.arc(7.5, 6, 6, Math.PI, 0); g.fill();
      g.strokeStyle = "#e0f2fe"; g.lineWidth = 0.7;
      g.beginPath(); g.moveTo(1.5, 6); g.lineTo(6, 11); g.moveTo(13.5, 6); g.lineTo(9, 11); g.stroke();
      wall(5.5, 10, 4, 3, "#e0f2fe");
      break;
    case "overflow":
      g.fillStyle = "#fb7185";
      g.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 ? 3 : 6.5, a = (i / 16) * Math.PI * 2;
        g.lineTo(7.5 + Math.cos(a) * r, 7.5 + Math.sin(a) * r);
      }
      g.fill();
      wall(6, 6, 3, 3, "#fef08a");
      break;
    case "firewall":
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) wall((r % 2 ? 0 : 2) + k * 5, 6 + r * 3, 4, 2.3, "#f87171");
      g.fillStyle = "#facc15";
      g.beginPath(); g.moveTo(4, 6); g.quadraticCurveTo(3, 2, 6, 0.5); g.quadraticCurveTo(6, 3, 8, 3); g.quadraticCurveTo(9, 1, 11, 1.5); g.quadraticCurveTo(12, 4, 11, 6); g.fill();
      break;
    case "bridge":
      for (let i = 0; i < 5; i++) wall(1 + i * 2.6, 12 - i * 2.4, 4, 1.6, "#f5a524");
      break;
    case "tunnel":
      wall(5, 1, 5, 13, "#22805a");
      wall(5, 6, 5, 4, "rgba(0,0,0,0)");
      g.clearRect(5, 6, 5, 4);
      g.strokeStyle = "#c084fc";
      g.beginPath(); g.moveTo(1, 8); g.lineTo(14, 8); g.moveTo(11, 5.5); g.lineTo(14, 8); g.lineTo(11, 10.5); g.stroke();
      break;
    case "pipe":
      wall(1, 8, 13, 6, "#22805a");
      g.clearRect(5.5, 8, 4, 6);
      g.strokeStyle = "#60a5fa";
      g.beginPath(); g.moveTo(7.5, 1); g.lineTo(7.5, 13); g.moveTo(5, 10.5); g.lineTo(7.5, 13); g.lineTo(10, 10.5); g.stroke();
      break;
  }
}

/* ------------------------------------------------------------- toolbar */
function buildSkills() {
  const box = el("skills");
  box.innerHTML = "";
  for (const s of SKILLS) {
    const b = document.createElement("button");
    b.className = "skill";
    b.dataset.skill = s.id;
    b.title = t("skill." + s.id) + " — " + t("sk." + s.id);
    const c = document.createElement("canvas");
    drawSkillIcon(c, s.id);
    b.append(c);
    const name = document.createElement("span");
    name.textContent = t("skill." + s.id);
    const count = document.createElement("span");
    count.className = "count";
    const k = document.createElement("kbd");
    k.textContent = s.key;
    b.append(name, count, k);
    b.onclick = () => selectSkill(s.id);
    box.append(b);
  }
  updateSkills();
}

function updateSkills() {
  for (const b of el("skills").children) {
    const id = b.dataset.skill, n = game ? game.skills[id] : 0;
    b.querySelector(".count").textContent = n;
    b.classList.toggle("empty", n <= 0);
    b.classList.toggle("selected", id === selected);
  }
}

function selectSkill(id) {
  selected = id;
  updateSkills();
  const n = game.skills[id];
  el("skill-note").innerHTML = n > 0
    ? `<b>${t("skill." + id)}</b> — ${t("sk." + id)}`
    : t("note.none", { skill: t("skill." + id) });
  beep(660, 40, "triangle", 0.03);
}

function defaultSkill() {
  const first = SKILLS.find(s => game.skills[s.id] > 0);
  selected = first ? first.id : null;
  if (selected) selectSkill(selected); else el("skill-note").innerHTML = t("note.pick");
}

/* ----------------------------------------------------------------- HUD */
function fmtTime(ticks) {
  const s = Math.max(0, Math.ceil(ticks / TICK_HZ));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function updateHUD() {
  el("hud-level").textContent = t("hud.level", { n: levelIndex + 1 });
  el("hud-name").textContent = L(game.level.name);
  el("hud-out").textContent = `${game.spawned}/${game.level.count}`;
  el("hud-in").textContent = game.saved;
  el("hud-need").textContent = game.level.need;
  el("hud-lost").textContent = game.lost;
  const ttl = el("hud-ttl");
  ttl.textContent = fmtTime(game.ticksLeft);
  ttl.style.color = game.ticksLeft < 20 * TICK_HZ ? "var(--red)" : "";
}

/* ------------------------------------------------------------ overlays */
function overlay({ title, goal, note, stats, primary, secondary }) {
  el("ov-title").textContent = title;
  el("ov-goal").innerHTML = goal || "";
  el("ov-note").innerHTML = note ? `<h4>${t("ov.concept")}</h4>${note}` : "";
  el("ov-stats").innerHTML = stats || "";
  const btn = (node, spec) => {
    node.style.display = spec ? "" : "none";
    if (spec) { node.textContent = spec[0]; node.onclick = spec[1]; }
  };
  btn(el("ov-primary"), primary);
  btn(el("ov-secondary"), secondary);
  el("overlay").classList.remove("hidden");
  running = false;
  setTimeout(() => el("ov-primary").focus(), 0);
}
function hideOverlay() { el("overlay").classList.add("hidden"); running = true; last = performance.now(); acc = 0; }

function showIntro() {
  const lv = game.level;
  overlay({
    title: t("ov.intro", { n: levelIndex + 1, name: L(lv.name) }),
    goal: `<b>${t("ov.goal", { count: lv.count, need: lv.need })}</b><br>${L(lv.goal)}`,
    note: L(lv.note),
    primary: [t("ov.start"), hideOverlay],
    secondary: [t("ov.levels"), openLevels]
  });
}

function showResult() {
  const lv = game.level, won = game.state === "won";
  const losses = Object.entries(game.losses)
    .map(([k, n]) => `${n} ${t("loss." + k)}`).join(" · ");
  const stats = `<span>${t("stat.saved")} <b>${game.saved}/${lv.count}</b></span>`
    + `<span>${t("stat.time")} <b>${fmtTime(game.tick)}</b></span>`
    + (losses ? `<span>${t("stat.lost")}: ${losses}</span>` : "");
  if (won) {
    const prev = progress.best[lv.id] || 0;
    const newBest = game.saved > prev;
    if (newBest) progress.best[lv.id] = game.saved;
    progress.unlocked = Math.max(progress.unlocked, Math.min(PACKET_LEVELS.length, levelIndex + 2));
    store.set("packetrush.progress", JSON.stringify(progress));
    const last = levelIndex === PACKET_LEVELS.length - 1;
    overlay({
      title: last ? t("ov.wonAll") : t("ov.won"),
      goal: (last ? t("ov.wonAllText") : t("ov.wonText", { saved: game.saved, count: lv.count, need: lv.need }))
        + (newBest && prev ? ` <b>${t("ov.newBest")}</b>` : ""),
      note: L(lv.note),
      stats,
      primary: last ? [t("ov.replay"), () => startLevel(levelIndex)] : [t("ov.next"), () => startLevel(levelIndex + 1)],
      secondary: last ? [t("ov.levels"), openLevels] : [t("ov.replay"), () => startLevel(levelIndex)]
    });
    beep(523, 120, "triangle", 0.05); setTimeout(() => beep(784, 200, "triangle", 0.05), 120);
  } else {
    overlay({
      title: t("ov.lost"),
      goal: t("ov.lostText", { saved: game.saved, need: lv.need }) + "<br>" + L(lv.goal),
      stats,
      primary: [t("ov.retry"), () => startLevel(levelIndex, true)],
      secondary: [t("ov.levels"), openLevels]
    });
    beep(220, 300, "sawtooth", 0.04, -100);
  }
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  el("btn-pause").querySelector("span").textContent = t(paused ? "ctl.resume" : "ctl.pause");
}

/* ---------------------------------------------------------------- flow */
function startLevel(i, skipIntro) {
  levelIndex = i;
  game = new PacketGame(PACKET_LEVELS[i]);
  effects = [];
  paused = false;
  nukeArmed = 0;
  el("btn-nuke").classList.remove("armed");
  el("btn-pause").querySelector("span").textContent = t("ctl.pause");
  store.set("packetrush.level", String(i));
  buildSkills();
  defaultSkill();
  updateHUD();
  if (skipIntro) hideOverlay(); else showIntro();
}

function drainEvents() {
  for (const e of game.events) {
    switch (e.type) {
      case "spawn": beep(880, 25, "square", 0.015); break;
      case "saved":
        beep(988, 60, "triangle", 0.04, 200);
        effects.push({ kind: "text", text: "+1", x: game.level.exit.x, y: game.level.exit.y - 16, life: 40, color: "#4ade80" });
        break;
      case "lost":
        if (e.why !== "overflow" && e.why !== "ttl" && e.why !== "firewall") {
          beep(160, 120, "sawtooth", 0.03, -60);
          burst(e.x, e.y - 4, ["#e0f2fe", "#f87171"], 10);
          effects.push({ kind: "text", text: "×", x: e.x, y: e.y - 10, life: 35, color: "#f87171" });
        }
        break;
      case "boom":
        beep(90, 250, "sawtooth", 0.06, -40);
        burst(e.x, e.y, ["#fb7185", "#facc15", "#ffffff", "#22805a"], 26);
        break;
      case "brick": beep(420, 15, "square", 0.012); break;
    }
  }
  game.events.length = 0;
}

function loop(now) {
  if (running && !paused && game.state === "playing") {
    acc += Math.min(250, now - last) * (fast ? 3 : 1);
    const dt = 1000 / TICK_HZ;
    while (acc >= dt && game.state === "playing") { game.step(); acc -= dt; }
    drainEvents();
    updateHUD();
    updateSkills();
    if (game.state !== "playing") setTimeout(showResult, 700);
  }
  last = now;
  if (nukeArmed && now > nukeArmed) { nukeArmed = 0; el("btn-nuke").classList.remove("armed"); el("skill-note").innerHTML = ""; }
  render();
  requestAnimationFrame(loop);
}

/* --------------------------------------------------------------- input */
function worldPoint(ev) {
  const r = canvas.getBoundingClientRect();
  return { x: (ev.clientX - r.left) / r.width * LW, y: (ev.clientY - r.top) / r.height * LH };
}

/* Returns true if the click landed on a packet (whether or not it took the skill). */
function clickAt(pt) {
  if (!running || game.state !== "playing") return false;
  hover = pt;
  const any = game.pick(pt.x, pt.y, null);
  if (!selected) return !!any;
  if (game.skills[selected] <= 0) { el("skill-note").innerHTML = t("note.none", { skill: t("skill." + selected) }); return !!any; }
  const p = game.pick(pt.x, pt.y, selected);
  if (p && game.assign(p, selected)) {
    effects.push({ kind: "text", text: t("skill." + selected), x: p.x, y: p.y - 12, life: 30, color: "#fef08a" });
    beep(740, 50, "square", 0.04, 120);
    drainEvents();
    updateSkills();
    return true;
  }
  return !!any;
}

canvas.addEventListener("pointermove", ev => { hover = worldPoint(ev); });
canvas.addEventListener("pointerleave", () => { hover = null; });
canvas.addEventListener("pointerdown", ev => { clickAt(worldPoint(ev)); });

/* In 3D a click on a packet assigns the skill; a drag that starts anywhere
   else tilts the camera. */
if (r3) {
  const c3 = el("world3d");
  let drag = null;
  const local = ev => { const r = c3.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; };
  c3.addEventListener("pointermove", ev => {
    hoverScreen = local(ev);
    hover = r3.pickPoint(ev.clientX, ev.clientY);
    if (drag) {
      r3.orbit(ev.clientX - drag.x, ev.clientY - drag.y);
      drag.x = ev.clientX; drag.y = ev.clientY;
    }
  });
  c3.addEventListener("pointerleave", () => { hover = null; hoverScreen = null; });
  c3.addEventListener("pointerdown", ev => {
    hoverScreen = local(ev);
    if (clickAt(r3.pickPoint(ev.clientX, ev.clientY))) return;
    drag = { x: ev.clientX, y: ev.clientY };
    c3.classList.add("orbiting");
    c3.setPointerCapture(ev.pointerId);
  });
  const stop = () => { drag = null; c3.classList.remove("orbiting"); };
  c3.addEventListener("pointerup", stop);
  c3.addEventListener("pointercancel", stop);
  c3.addEventListener("dblclick", () => r3.resetView());
  c3.addEventListener("wheel", ev => { ev.preventDefault(); r3.zoom(ev.deltaY > 0 ? 1.08 : 1 / 1.08); }, { passive: false });
  c3.addEventListener("contextmenu", ev => ev.preventDefault());
}

function applyView() {
  if (!r3) { el("btn-view").hidden = true; view3d = false; }
  document.body.classList.toggle("view-3d", view3d);
  el("world3d").hidden = !view3d;
  el("fx").hidden = !view3d;
  el("btn-view").querySelector("span").textContent = t(view3d ? "view.3d" : "view.2d");
  if (r3) r3.markDirty();
  if (game) game.dirty = true;
  if (r3) r3.markDirty();
}

function toggleView() {
  if (!r3) return;
  view3d = !view3d;
  store.set("packetrush.view", view3d ? "3d" : "2d");
  applyView();
  el("skill-note").innerHTML = view3d ? t("view.hint") : "";
}

function nuke() {
  if (!running || game.state !== "playing") return;
  if (nukeArmed) {
    game.nuke();
    nukeArmed = 0;
    el("btn-nuke").classList.remove("armed");
  } else {
    nukeArmed = performance.now() + 2000;
    el("btn-nuke").classList.add("armed");
    el("skill-note").innerHTML = t("ctl.nukeConfirm");
  }
}

function toggleFast() {
  fast = !fast;
  el("btn-fast").setAttribute("aria-pressed", String(fast));
}

el("btn-pause").onclick = togglePause;
el("btn-fast").onclick = toggleFast;
el("btn-view").onclick = toggleView;
el("btn-restart").onclick = () => startLevel(levelIndex, true);
el("btn-nuke").onclick = nuke;

document.addEventListener("keydown", ev => {
  if (ev.target.closest && ev.target.closest("dialog[open]")) return;
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  const skill = SKILLS.find(s => s.key === k);
  if (skill) { selectSkill(skill.id); ev.preventDefault(); return; }
  if (k === "p" || k === " " && running) { togglePause(); ev.preventDefault(); }
  else if (k === "f") toggleFast();
  else if (k === "v") toggleView();
  else if (k === "r") startLevel(levelIndex, true);
  else if (k === "k") nuke();
  else if (k === "enter" && !running && !el("overlay").classList.contains("hidden")) { el("ov-primary").click(); ev.preventDefault(); }
});

/* ------------------------------------------------------------- dialogs */
function openLevels() {
  const list = el("level-list");
  list.innerHTML = "";
  PACKET_LEVELS.forEach((lv, i) => {
    const b = document.createElement("button");
    const locked = i + 1 > progress.unlocked;
    b.className = "level-card" + (locked ? " locked" : "");
    const best = progress.best[lv.id];
    b.innerHTML = `<span class="pill">${t("hud.level", { n: i + 1 })}</span><strong>${L(lv.name)}</strong>`
      + `<span class="lv-best">${locked ? t("levels.locked") : best ? t("levels.best", { n: best, count: lv.count }) : t("levels.none")}</span>`;
    b.disabled = locked;
    b.onclick = () => { el("levels-dialog").close(); startLevel(i); };
    list.append(b);
  });
  el("levels-dialog").showModal();
}

function buildHelp() {
  const box = el("help-skills");
  box.innerHTML = "";
  for (const s of SKILLS) {
    const row = document.createElement("div");
    row.className = "help-skill";
    const c = document.createElement("canvas");
    drawSkillIcon(c, s.id);
    const txt = document.createElement("div");
    txt.innerHTML = `<b>${t("skill." + s.id)}</b> <kbd>${s.key}</kbd> — ${t("sk." + s.id)}`;
    row.append(c, txt);
    box.append(row);
  }
}

/* --------------------------------------------------- language and theme */
function applyText() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.body.classList.toggle("lang-zh", lang === "zh");
  document.title = t("app.title") + (lang === "zh" ? " —— 把数据包送到服务器" : " — guide the packets to the server");
  for (const n of document.querySelectorAll("[data-t]")) n.textContent = t(n.dataset.t);
  for (const n of document.querySelectorAll("[data-th]")) n.innerHTML = t(n.dataset.th);
  el("btn-lang").textContent = t("lang.other");
  for (const o of el("theme-pick").options) o.textContent = t("theme." + o.value);
  el("theme-pick").title = t("theme.label");
  el("btn-pause").querySelector("span").textContent = t(paused ? "ctl.resume" : "ctl.pause");
  buildHelp();
  el("btn-view").querySelector("span").textContent = t(view3d ? "view.3d" : "view.2d");
  if (game) {
    buildSkills();
    if (selected) selectSkill(selected);
    updateHUD();
    if (!running && game.state === "playing") showIntro();
    else if (!running) showResult();
  }
}

function applyTheme() {
  if (!THEMES[theme]) theme = "bright";
  for (const name of Object.keys(THEMES)) document.body.classList.toggle("rush-" + name, name === theme);
  el("theme-pick").value = theme;
  if (game) game.dirty = true;
}

el("btn-lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; store.set("bitbuilder.lang", lang); applyText(); };
el("theme-pick").onchange = ev => {
  theme = ev.target.value;
  store.set("packetrush.theme", theme);
  if (theme === "bright" || theme === "dark") store.set("bitbuilder.theme", theme);
  applyTheme();
  ev.target.blur();                      // hand the keyboard back to the game
};
el("btn-levels").onclick = openLevels;
el("btn-help").onclick = () => el("help-dialog").showModal();

/* ---------------------------------------------------------------- boot */
applyTheme();
applyText();
applyView();
const saved = Number(store.get("packetrush.level", "0"));
startLevel(Math.min(Number.isFinite(saved) ? saved : 0, progress.unlocked - 1, PACKET_LEVELS.length - 1));
requestAnimationFrame(t0 => { last = t0; requestAnimationFrame(loop); });
