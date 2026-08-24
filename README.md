# Bit Builder

A tile-based puzzle game in the spirit of *Chip's Challenge*: you play a
technician walking a grid of server rooms, filling a **build spec**: this rig
needs a motherboard, a CPU, two sticks of RAM, an SSD, an OS image and a
driver — and the map is also littered with parts that belong to some other
machine. Fetch the right ones, walk through the **assembly socket** (it only
opens once the spec is complete), and reach the **power button** to boot the
machine before the clock runs out.

Pure static HTML/CSS/JS. No build step, no dependencies, no image assets —
every sprite is drawn with canvas paths. Clone it and open `index.html`, or
serve the folder anywhere static.

**Play it:** https://sclim999.github.io/bit-builder/ (enable GitHub Pages under
*Settings → Pages → Deploy from a branch → `main` / root*).

## Controls

| Action | Keys |
|---|---|
| Move | arrow keys or WASD (swipe, or the on-screen pad on touch devices) |
| Rewind one move | <kbd>Z</kbd> — works after a fatal move too |
| Restart level | <kbd>R</kbd> |
| Pause | <kbd>P</kbd> |
| Practice (clock stopped) | the *Practice* button — a practice run records no time, stars or best |
| Confirm on an overlay | <kbd>Enter</kbd> / <kbd>Space</kbd> |

Progress, best times and stars are kept in `localStorage`, so finishing a level
unlocks the next one on that browser.

### Stars

Every level carries a **par** move count, produced by the breadth-first solver
in `tools/solve.js` — it is the shortest possible solution, so matching it is
hard on purpose.

| Stars | Earned by |
|---|---|
| ★☆☆ | finishing |
| ★★☆ | finishing within twice par |
| ★★★ | finishing within 125% of par, with no rewinds and no wrong parts picked up |

Rewinding never refunds the clock, so it costs time as well as the third star.
Practice mode stops the clock while you learn a level; it unlocks the next level
but records nothing.

## Mechanics

| Thing | Behaviour |
|---|---|
| Hardware / software part | listed on the build spec — collect every one before the socket opens |
| A part marked with a red cross | belongs to another build: picking it up costs **10 seconds** |
| Assembly socket | walk through it once the spec is complete |
| Access cards (red/blue/yellow) | one card opens one matching port |
| Root access (green) | opens every green port, never used up |
| Coolant spill | kills you unless you carry the **Coolant Seal** |
| Overheat zone | kills you unless you carry the **Heatsink** |
| Cryo ice | you slide until something stops you; **Grip Pads** cancel it. Corner tiles bend the slide |
| Data bus | carries you one tile per beat; **Mag Grips** ignore it |
| Crate | push it; shoved into coolant or fire it plugs the hazard |
| Surge trap | one-shot — destroys whatever steps on it, you or a monster |
| Quarantine kit | walk into malware to shut it down; one kit per monster, and there are never enough |
| Scrubber | wipes every tool and kit off your belt (cards survive) |
| Network port | throws you out of the next port, still moving |
| Toggle switch / toggle walls | the switch flips every toggle wall on the map |
| Bug / Glitch | wall followers (left hand / right hand) |
| Trojan | hunts you down |
| Packet | flies straight and bounces |

## Files

| File | Purpose |
|---|---|
| `index.html` | the game |
| `editor.html` | the level editor |
| `css/game.css`, `css/editor.css` | styling |
| `js/levels.js` | **the level maps** — ASCII art, one character per tile (legend at the top of the file) |
| `js/engine.js` | rules: movement, sliding, pushing, hazards, monsters, the build spec, rewind |
| `js/sprites.js` | every sprite, drawn with canvas paths |
| `js/main.js` | game loop, camera, input, HUD, level select, sound |
| `js/validate.js` | the level checker, shared by the editor and the Node tools |
| `js/codec.js` | share codes — a level packed into a URL |
| `js/editor.js` | the editor: painting, part kinds, checking, sharing |
| `tools/*.js` | Node scripts that check the maps (not shipped to the browser) |

## Making your own levels

Open **[the editor](editor.html)** (the *Editor* button in the game). Paint the
map with the brush palette, choose which component each part tile is, press
**Check**, then **Test play** or **Copy share link**.

A share link carries the whole level in its URL — `index.html#lvl=<code>` —
so a level can be pasted into a chat message and played by anyone with no
server, no accounts and nothing uploaded. **Load code** brings a shared level
back into the editor, and **Start from a level** opens one of the built-in maps
as a starting point.

**Check** runs the same validator as the command line tool: it catches ragged
maps, a missing start or exit, parts you cannot reach, more locked ports than
cards, a lone teleport, and the classic mistake of leaving a way to the power
button that skips the socket.

## Editing the built-in levels

Levels live in `js/levels.js` as arrays of equal-length strings. The legend at
the top of that file lists every character. Add an entry and it appears in the
level list automatically; `time` is the clock in seconds, `par` is the star
threshold (get it from `node solve.js <n>`), `hint` is the text shown by the
level's help terminal, and `kinds` names the component behind each part tile in
reading order:

```js
kinds: {
  c: ["mobo", "cpu", "ram", "psu"],   // the 'c' tiles, top-left to bottom-right
  s: ["os", "driver"],                //  … same for 's'
  x: ["ram"],                         // 'x' / 'z' are parts that do not fit
}
```

After editing, run the checks (Node, no dependencies):

```bash
cd tools
node validate-levels.js      # rectangular maps, reachable parts, exit only via the socket, cards vs ports
node solve.js                # breadth-first search that actually plays each level through the engine
node solve.js 5              # …or just one level
node replay.js               # hand-written routes for the two crate-heavy levels, which are too big for BFS
node show.js 7               # print a level with a coordinate ruler
```

`validate-levels.js` and `solve.js` are the useful ones: the first catches
broken geometry, the second proves a level can actually be finished.
