/* ============================================================================
   PACKET RUSH — the data centre behind the play area
   Pure layout, shared by the 2D and 3D renderers so both views show the same
   room: two rows of server racks with status lights, an overhead cable tray,
   fibre runs with data pulses travelling along them, ceiling lights, and a
   few drifting 0s and 1s. Everything is deterministic (no Math.random), so
   the room looks the same on every visit and every frame is reproducible.
   Coordinates are world pixels, like the terrain.
   ========================================================================== */

const BACKDROP = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const rows = [
    { depth: "far",  top: 96, width: 26, step: 33, offset: 6,  slot: 4 },
    { depth: "near", top: 62, width: 36, step: 47, offset: -8, slot: 5 }
  ];
  const racks = [], leds = [];
  for (const row of rows) {
    for (let x = row.offset; x < 400; x += row.step) {
      const rack = { x, y: row.top, w: row.width, h: 200 - row.top, depth: row.depth, slot: row.slot };
      racks.push(rack);
      /* status lights on the right edge of a few units per rack */
      for (let y = row.top + 8; y < 196; y += row.slot * 2) {
        if (rnd() < 0.45) continue;
        leds.push({
          x: x + row.width - 5 - (rnd() < 0.5 ? 0 : 3), y, depth: row.depth,
          color: Math.floor(rnd() * 3), period: 12 + Math.floor(rnd() * 40), phase: Math.floor(rnd() * 60),
          duty: 0.35 + rnd() * 0.5
        });
      }
    }
  }

  const tray = { y: 14, h: 4 };
  const fibres = [30, 40];                          // thin runs under the tray
  const hangers = [];
  for (let x = 20; x < 400; x += 60) hangers.push(x);
  const lights = [70, 200, 330];

  const pulses = [];
  for (let i = 0; i < 9; i++) {
    pulses.push({
      lane: i % 3,                                  // 0 = tray, 1-2 = fibres
      speed: 0.6 + rnd() * 1.1, dir: rnd() < 0.7 ? 1 : -1,
      start: rnd() * 480, len: 10 + rnd() * 16
    });
  }

  const bits = [];
  for (let i = 0; i < 22; i++) {
    bits.push({ x: rnd() * 400, y: rnd() * 200, speed: 0.08 + rnd() * 0.18, ch: rnd() < 0.5 ? "0" : "1", size: 5 + rnd() * 4 });
  }

  return {
    racks, leds, tray, fibres, hangers, lights, pulses, bits,
    ledOn(l, frame) { return ((frame + l.phase) % l.period) < l.period * l.duty; },
    /* where each pulse is on this frame: x of its head, y of its lane */
    pulseAt(p, frame) {
      const span = 480, laneY = [tray.y + tray.h / 2, fibres[0], fibres[1]][p.lane];
      const t = (p.start + frame * p.speed) % span;
      return { x: p.dir > 0 ? t - 40 : 440 - t, y: laneY };
    },
    bitAt(b, frame) {
      const y = ((b.y - frame * b.speed) % 230 + 230) % 230 - 15;
      return { x: b.x + Math.sin((frame + b.x) / 40) * 3, y };
    }
  };
})();

if (typeof module !== "undefined") module.exports = { BACKDROP };
