# Bit Builder

[![Level checks](https://github.com/SCLim999/bit-builder/actions/workflows/checks.yml/badge.svg)](https://github.com/SCLim999/bit-builder/actions/workflows/checks.yml)

**English · [中文](#中文)**

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
| Full screen | <kbd>F</kbd>, or the *Full screen* button — the board scales up to fill the display |
| Language | the *中文 / EN* button — the whole interface, including the editor |
| Brightness | the *Theme* button — a brighter slate board (default) or the original night palette |
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

## Learning content

Every part in the game is a real component, and the game says what each one
actually does:

- **Field note** — pick a part up and the sidebar explains it: what RAM is for
  and why it forgets, what a compiler does before your program runs, why a
  network card has a MAC address.
- **Knowledge base** — the *Knowledge* button lists all 23 entries (hardware,
  software, equipment, malware) in one reference, in the current language.
- **Knowledge check** — after the boot screen, one definition from the parts you
  just collected, three candidates, immediate feedback. Answering is optional;
  the running tally is kept in `localStorage`.

The notes are written for an introductory computing course and lean towards the
things that actually catch students out — volatile versus non-volatile storage,
compile time versus run time, what the operating system is actually doing.
Editing them means editing one file, `js/knowledge.js`, which holds both
languages side by side.

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

## Firewall 3D

**[firewall.html](firewall.html)** (the *Firewall 3D* button in the game) is a
bonus first-person shooter in the style of the early-90s classics, set inside
an infected network. You are the security software: clear three sectors of
malware, pick up encryption keys to open locked ports, and press <kbd>E</kbd>
at the reboot terminal to finish. Same rules as the rest of the project — no
dependencies, no image files; the walls, monsters and weapons are all drawn in
code and rendered by a raycaster on a 320×200 buffer.

| Malware | What it does in the game — and in real life |
|---|---|
| Virus | shoots from range; attaches to a host file and needs someone to run it |
| Worm | fast, bites up close, and **copies itself** if you leave it alive |
| Trojan horse | sits disguised as a "FREE" gift box until you get close |
| Spyware | half-invisible and quick; built not to be noticed |
| Ransomware | its hits **encrypt some of your ammo** |
| Rootkit | the boss of the last sector, with admin rights; the exit stays locked until it is gone |
| Adware | its hits throw pop-up ads over your screen |
| Keylogger | while it can see you, it reports your position to the malware around it |
| Bot / botnet | comes in swarms of three; hit one and the whole swarm attacks |
| Fileless malware | lives only in memory: almost invisible until it is close, and leaves no trace |
| Wiper | its hits erase your firewall completely |
| Mobile malware | a small, fast phone that bites |

The twelve types follow the usual security-industry classification (as in
Fortinet's glossary of malware types), and the *Threat database* explains
each one.

Every monster is a real piece of malware from history, after Wikipedia's
[Timeline of computer viruses and worms](https://en.wikipedia.org/wiki/Timeline_of_computer_viruses_and_worms):
aim at a worm and the scanner names it (*Morris worm · 1988*, *ILOVEYOU ·
2000*, *WannaCry · 2017*…), and the rootkit boss is Stuxnet. The five viruses
each have their own design drawn from their history: Elk Cloner is an Apple II
floppy with antlers, Brain is a brain, Michelangelo is a marble bust with a
6 March calendar page, CIH is a radioactive BIOS chip and Melissa is a Word
document that throws envelopes. The *Timeline*
button lists all 29 specimens from Creeper (1971) to NotPetya (2017) with a
short note on each, and ticks off the ones you have removed in the game. The
entries live in `js/firewall-history.js`, in both languages.

**Recognise, then respond.** Four features turn "shoot everything" into a
security lesson:

- **Scan to identify.** Unknown monsters show as *??? · unknown sample*. Keep
  one in the crosshair for a moment to identify it; after that the Antivirus
  Scanner does 50% more damage to that kind, as signature-based antivirus
  only recognises malware it already has a signature for.
- **Phishing terminals.** Blue mail screens in the walls show a real-looking
  email. Report it or open it: judge right and your firewall grows, open a
  phishing email and a Trojan gets in. The verdict lists the red flags (or
  why it was genuine). The ten emails live in `js/firewall-phishing.js`.
- **Security check.** Three questions after each sector about the malware
  you just met.
- **Stars.** One for clearing the sector, one for removing 75% of the
  malware, one for judging every email right and passing the quiz.

**More to fight, more reasons to replay.**

- **Three bosses.** Each sector ends with a famous piece of malware, and the
  reboot terminal stays locked until it is gone: **ILOVEYOU** (2000) sheds
  love-letter worms as it takes damage, **WannaCry** (2017) throws a
  full-screen ransom note over your view and encrypts your ammo, and
  **Stuxnet** (2010) spawns hidden processes.
- **Unpatched vulnerabilities.** Red *CVE!* cracks in the walls let a worm
  in every few seconds while you are near. Press E to patch one and it stops
  for good.
- **Backup drive.** Pick one up and ransomware and wipers can no longer touch
  your files or firewall; WannaCry's ransom note does nothing.
- **Incident Response (endless mode).** Waves of malware in an open server
  hall, a boss every fifth wave, and a choice of three upgrades between waves
  (firewall, security update, signature update, overclock, ammo cache, backup
  drive). The best wave and score are kept.
- **Feel.** A boss health bar, red markers pointing at whoever just hit you,
  and a chiptune soundtrack (the *Music* button turns it off).

Your weapons are defences: the **Antivirus Scanner** (signature matching,
unlimited), the **Packet Filter** (a firewall-shotgun) and the **Quarantine
Cannon**. The first time you meet each kind of malware a card says what it
really is, and they are all collected in the *Threat database*.

Controls: click the view to aim with the mouse, <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
or arrows to move, <kbd>Shift</kbd> to run, click / <kbd>Space</kbd> / <kbd>Ctrl</kbd>
to fire, <kbd>E</kbd> to open doors, <kbd>1</kbd>–<kbd>3</kbd> or <kbd>Q</kbd> for
weapons, <kbd>M</kbd> for the map, <kbd>P</kbd> / <kbd>Esc</kbd> to pause. Touch
devices get a stick and fire / use buttons.

The maps are ASCII art in `js/firewall-levels.js` (legend at the top), and
`node tools/check-firewall.js` proves each one can be finished — the keys can
be collected in an order that opens the way to the terminal — and that every
kind of monster has a real namesake in the timeline.

## Game master (GM) mode

For teachers demonstrating the game: open the **Game master** link at the bottom
of the page (or type `gmlogin` anywhere, or add `#gm` to the address) and enter
the GM password. In GM mode you are **invincible** — no damage, no stolen ammo,
no wiped firewall, no pop-ups or ransom notes — and a gold *GM · INVINCIBLE*
badge shows on screen. Stars, best times and endless-mode records are **not
saved** while it is on, so class scores stay fair; levels still unlock, so you
can preview the later sectors. Log out from the same link.

The default password is `firewall-gm`. To change it, run

```bash
node -e 'console.log(require("crypto").createHash("sha256").update("YOUR NEW PASSWORD").digest("hex"))'
```

and paste the result into `GM_HASH` at the top of `js/firewall.js`. Only the
hash is stored, but the whole game runs in the browser, so this keeps students
out of GM mode rather than stopping a determined programmer.

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
| `js/i18n.js` | every interface string in English and Mandarin, plus level names and hints |
| `js/knowledge.js` | what each component actually is, in both languages — field notes, reference and quiz |
| `js/validate.js` | the level checker, shared by the editor and the Node tools |
| `js/codec.js` | share codes — a level packed into a URL |
| `js/editor.js` | the editor: painting, part kinds, checking, sharing |
| `firewall.html`, `js/firewall.js`, `js/firewall-levels.js`, `css/firewall.css` | Firewall 3D, the first-person bonus game, and its maps |
| `js/firewall-phishing.js` | the emails behind Firewall 3D's phishing terminals, in English and Mandarin |
| `js/firewall-history.js` | the malware timeline behind Firewall 3D's monster names, in English and Mandarin |
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
`check-wiring.js` covers what neither can see: a string translated into one
language but not the other, a key the markup asks for that nobody defined, a
component a level names that the knowledge base has never heard of, or a level
with no par value.

## Continuous checks

`.github/workflows/checks.yml` runs the wiring check, the level checker, both
hand routes and a sample of full solves on every push and pull request — about
twenty seconds, and nothing to install, since the tools have no dependencies.
Once a week (and on demand from the Actions tab) it also solves every level the
search can reach, levels 1–9, which takes a few minutes.

So a change that makes a level unfinishable — a wall in the wrong place, a
part sealed off, a route to the power button that skips the socket, a card
short of a locked port — fails the build instead of reaching a student.

---

## 中文

**Bit Builder（组装大师）** 是一款受《Chip's Challenge》启发的方格解谜游戏。你扮演一名技术员，
在机房的方格地图中按**装配清单**收集零件：一块主板、一颗 CPU、两条内存、一块固态硬盘、
一份操作系统镜像和一个驱动程序。地图上还散落着属于其他机器的零件（带红叉），拿错要损失
十秒。集齐清单后，**装配插槽**才会打开，你需要在时限内抵达**电源按钮**启动机器。

纯静态 HTML / CSS / JS：没有构建步骤，没有第三方依赖，也没有图片素材 —— 所有图形都由
canvas 绘制。点击顶栏的 **中文 / EN** 按钮即可切换语言，**背景**按钮可在明亮与暗色两种配色
之间切换（默认明亮），游戏与编辑器都会跟着切换。

**学习内容**：每个零件都是真实的计算机部件。拾取时侧栏会显示它的作用（知识卡），
**知识库**按钮汇总了全部 23 条说明，通关后还有一道**知识检测**小题。这些说明面向计算机入门
课程，重点讲清学生最容易混淆的地方：易失性与非易失性存储、编译期与运行期、操作系统到底
在做什么。

**操作**：方向键或 WASD 移动，<kbd>Z</kbd> 回退一步（连致命的一步也能撤销），
<kbd>R</kbd> 重来，<kbd>P</kbd> 暂停，<kbd>F</kbd> 全屏。手机上可以滑动屏幕或使用方向按钮。

**自制关卡**：打开[编辑器](editor.html)绘制地图、指定零件、检查可玩性，然后复制分享链接。
关卡数据完整地存在网址里，不会上传到任何服务器。

**自动检查**：每次 push 与 pull request 都会自动运行关卡检查器、两条手工通关路线和部分完整求解
（约 20 秒）；每周还会完整求解 1–9 关。因此「某一关被改到无解」这类问题会在合并前就被拦下，
而不是等学生玩到才发现。
