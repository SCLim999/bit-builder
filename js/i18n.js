/* ============================================================================
   BIT BUILDER — interface text, English and Mandarin
   Component names and their explanations live in js/knowledge.js; this file is
   everything else the interface says. t("key", {vars}) looks a string up in the
   current language and fills in {placeholders}.
   ========================================================================== */

const I18N = {
  en: {
    "lang.other": "中文",
    "app.tagline": "Collect the parts on the build spec, plug them into the assembly socket, and boot the machine.",
    "btn.levels": "Levels", "btn.editor": "Editor", "btn.firewall": "Firewall 3D", "btn.help": "How to play", "btn.knowledge": "Knowledge",
    "btn.fullscreen": "Full screen", "btn.exitFullscreen": "Exit full screen",
    "btn.practice": "Practice: {state}", "btn.sound": "Sound: {state}",
    "btn.theme": "Theme: {state}", "theme.bright": "bright", "theme.dark": "dark",
    "state.on": "on", "state.off": "off",
    "btn.rewind": "Rewind", "btn.restart": "Restart", "btn.pause": "Pause", "btn.close": "Close",

    "panel.levelOf": "Level {n} of {total}", "panel.custom": "Custom level",
    "gauge.time": "Time", "gauge.parts": "Parts", "gauge.par": "Par",
    "socket.locked": "Socket locked — the build is not complete",
    "socket.open": "Socket open — get to the power button",
    "head.spec": "Build spec", "head.belt": "Belt", "head.note": "Field note",
    "head.objective": "Objective", "head.terminal": "Help terminal",
    "belt.empty": "nothing yet", "note.empty": "Pick a part up and what it does appears here.",
    "objective.text": "Fetch exactly the parts on the build spec — anything tagged with a red cross does not fit this machine and costs you 10 seconds.",

    "ov.introTitle": "Level {n} — {name}", "ov.start": "Start",
    "ov.winTitle": "Machine booted!", "ov.winAllTitle": "All systems assembled!",
    "ov.winText": "{name} is complete.",
    "ov.winAllText": "Every rig is built and running. Replay any level for a cleaner run.",
    "ov.next": "Next level", "ov.replay": "Replay level", "ov.playAgain": "Play again",
    "ov.deadTitle": "Assembly failed",
    "ov.deadRewind": "{reason} — you can step back and try something else.",
    "ov.rewindOne": "Rewind one move", "ov.restartLevel": "Restart level", "ov.tryAgain": "Try again",
    "ov.pausedTitle": "Paused", "ov.pausedText": "The clock is stopped.", "ov.resume": "Resume",
    "ov.newBest": "New best", "ov.practiceRun": "Practice run — not recorded",
    "stat.parts": "Parts", "stat.clock": "Clock", "stat.par": "Par",
    "stat.time": "Time", "stat.moves": "Moves", "stat.rewinds": "Rewinds", "stat.parMoves": "{n} moves",

    "boot.header": "BIT BUILDER POST v1.0", "boot.ok": "OK",
    "boot.done": "Boot complete in {seconds}s, {moves} moves.",

    "toast.pickup": "Picked up: {name}", "toast.reject": "{name} does not fit this build — 10s lost",
    "toast.rewind": "Rewound one move", "toast.quarantine": "Malware quarantined — kit used up",
    "toast.door": "Access card used", "toast.scrub": "Scrubber wiped your tools!",
    "toast.ready": "Build spec complete — socket unlocked", "toast.teleport": "Routed through the network",

    "death.coolant": "Drowned in coolant", "death.overheat": "Cooked in an overheat zone",
    "death.surge": "Fried by a power surge", "death.malware": "Caught by malware",
    "death.time": "Ran out of time",

    "levels.title": "Levels", "levels.sub": "Finish a level to unlock the next one.",
    "levels.n": "Level {n}", "levels.locked": "Locked", "levels.best": "best {time}s · {moves} moves",

    "help.title": "How to play",
    "help.p1": "Move with the <strong>arrow keys</strong> or <strong>WASD</strong> (swipe or use the pad on a phone). Every level is a <strong>build spec</strong>: fetch exactly the components it lists, walk through the <strong>assembly socket</strong> — it only opens once the spec is complete — and reach the <strong>power button</strong> before the clock runs out. Parts marked with a red cross belong to a different machine: picking one up costs you ten seconds.",
    "help.p2": "Malware kills on contact — unless you are carrying a <strong>quarantine kit</strong>, which shuts one down and is used up doing it. There are never enough kits for every monster, so pick your fights. <strong>Practice</strong> in the top bar stops the clock while you learn a level; nothing is recorded from a practice run.",
    "help.p3": "Made a mess of a crate push? <kbd>Z</kbd> <strong>rewinds</strong> one move, even the one that killed you — the clock keeps running, and a clean run with no rewinds is worth the third star. <kbd>R</kbd> restarts, <kbd>P</kbd> pauses, <kbd>F</kbd> goes full screen. Every level has a <strong>par</strong> move count from the solver. You can also <a href=\"editor.html\">build your own levels</a> and share them as a link.",

    "legend.hardware": "Hardware part", "legend.hardwareD": "CPUs, RAM, drives, fans — only the ones on the build spec",
    "legend.software": "Software part", "legend.softwareD": "OS images, drivers, compilers, antivirus",
    "legend.decoy": "Does not fit", "legend.decoyD": "a part this build has no slot for — grabbing it costs 10 seconds",
    "legend.socket": "Assembly socket", "legend.socketD": "opens once the whole build spec is ticked off",
    "legend.exit": "Power button", "legend.exitD": "reach it to finish the level",
    "legend.card": "Access card", "legend.cardD": "opens one matching port (green root access is reusable)",
    "legend.door": "Locked port", "legend.doorD": "needs the matching card",
    "legend.coolant": "Coolant spill", "legend.coolantD": "deadly without the Coolant Seal",
    "legend.overheat": "Overheat zone", "legend.overheatD": "deadly without the Heatsink",
    "legend.ice": "Cryo ice", "legend.iceD": "you slide until something stops you",
    "legend.bus": "Data bus", "legend.busD": "carries you along — Mag Grips ignore it",
    "legend.crate": "Crate", "legend.crateD": "push it; shoved into coolant it plugs the leak",
    "legend.surge": "Surge trap", "legend.surgeD": "one-shot: destroys whatever steps on it",
    "legend.scrubber": "Scrubber", "legend.scrubberD": "wipes every tool off your belt",
    "legend.port": "Network port", "legend.portD": "throws you out of the next port",
    "legend.switch": "Toggle switch", "legend.switchD": "flips every toggle wall on the map",
    "legend.tools": "Tools", "legend.toolsD": "Coolant Seal, Heatsink, Grip Pads, Mag Grips",
    "legend.kit": "Quarantine kit", "legend.kitD": "walk into malware to shut it down — one use each",
    "legend.bug": "Bug", "legend.bugD": "walks hugging the left-hand wall",
    "legend.trojan": "Trojan", "legend.trojanD": "hunts you down",

    "know.title": "Knowledge base",
    "know.sub": "Every part in this game is a real component. Here is what each one actually does — the same notes appear as you collect them.",
    "know.hardware": "Hardware", "know.software": "Software", "know.tool": "Equipment", "know.malware": "Malware",
    "quiz.title": "Knowledge check",
    "quiz.prompt": "Which component is this?",
    "quiz.correct": "Correct — {name}.", "quiz.wrong": "Not quite: that was {name}.",
    "quiz.score": "Knowledge check: {right} right out of {total}",
    "quiz.skip": "Skip",

    "card.r": "Red access card", "card.b": "Blue access card",
    "card.y": "Yellow access card", "card.g": "Root access",
    "foot.text": "Built for PPS2114. Keyboard, mouse or touch — no install, no plugins.",

    "ed.title": "Level editor",
    "ed.tagline": "Paint a map, name the parts, check it, then share the link. Levels travel in the URL — nothing is uploaded.",
    "ed.back": "Back to the game",
    "ed.hint": "Click or drag to paint · right-click to erase · the board resizes to fit your map",
    "ed.name": "Name", "ed.seconds": "Seconds", "ed.width": "Width", "ed.height": "Height",
    "ed.hintLine": "Hint shown at the help terminal",
    "ed.brush": "Brush", "ed.parts": "Parts on the map", "ed.partsEmpty": "paint some parts and they will be listed here",
    "ed.check": "Check", "ed.play": "Test play", "ed.copy": "Copy share link",
    "ed.load": "Load code", "ed.start": "Start from a level", "ed.clear": "Clear",
    "ed.ready": "Draw a map, then press Check.",
    "ed.bad": "Not playable yet:", "ed.good": "Looks playable.",
    "ed.summary": "{w}×{h}, {hardware} hardware, {software} software, {decoys} that do not fit.",
    "ed.spec": "Build spec: {spec}",
    "ed.copied": "Share link copied ({n} characters). Anyone who opens it plays your level.",
    "ed.copyManual": "Copy the link below:",
    "ed.loadPrompt": "Paste a share link or level code:",
    "ed.loaded": "Loaded. Edit away.", "ed.loadFail": "That code could not be read: {message}",
    "ed.startPrompt": "Start from which level?", "ed.startedFrom": "Loaded {name} as a starting point.",
    "ed.clearConfirm": "Clear the map?", "ed.cleared": "Cleared.",
    "ed.doesNotFit": "(does not fit)",
    "ed.g.ground": "Ground", "ed.g.parts": "Parts", "ed.g.hazards": "Hazards",
    "ed.g.movement": "Movement", "ed.g.locks": "Locks and tools", "ed.g.malware": "Malware",
    "ed.b.floor": "Floor", "ed.b.wall": "Wall", "ed.b.start": "Start", "ed.b.exit": "Power button",
    "ed.b.socket": "Assembly socket", "ed.b.terminal": "Help terminal",
    "ed.b.hw": "Hardware part", "ed.b.sw": "Software part",
    "ed.b.badHw": "Wrong hardware", "ed.b.badSw": "Wrong software",
    "ed.b.coolant": "Coolant", "ed.b.overheat": "Overheat", "ed.b.surge": "Surge trap",
    "ed.b.scrubber": "Scrubber", "ed.b.ice": "Cryo ice",
    "ed.b.iceNW": "Ice corner NW", "ed.b.iceNE": "Ice corner NE",
    "ed.b.iceSE": "Ice corner SE", "ed.b.iceSW": "Ice corner SW",
    "ed.b.busW": "Bus west", "ed.b.busE": "Bus east", "ed.b.busN": "Bus north", "ed.b.busS": "Bus south",
    "ed.b.port": "Network port", "ed.b.crate": "Crate",
    "ed.b.cardR": "Red card", "ed.b.doorR": "Red port", "ed.b.cardB": "Blue card", "ed.b.doorB": "Blue port",
    "ed.b.cardY": "Yellow card", "ed.b.doorY": "Yellow port", "ed.b.cardG": "Root access", "ed.b.doorG": "Green port",
    "ed.b.switch": "Toggle switch", "ed.b.toggleShut": "Toggle wall shut", "ed.b.toggleOpen": "Toggle wall open",
    "ed.b.seal": "Coolant Seal", "ed.b.heatsink": "Heatsink",
    "ed.b.grips": "Grip Pads", "ed.b.mag": "Mag Grips", "ed.b.kit": "Quarantine kit",
    "ed.b.bug": "Bug", "ed.b.glitch": "Glitch", "ed.b.trojan": "Trojan", "ed.b.packet": "Packet",
    "code.unreadable": "That level code could not be read: {message}"
  },

  zh: {
    "lang.other": "EN",
    "app.tagline": "按装配清单收集零件，插入装配插槽，然后启动这台机器。",
    "btn.levels": "关卡", "btn.editor": "编辑器", "btn.firewall": "防火墙 3D", "btn.help": "玩法说明", "btn.knowledge": "知识库",
    "btn.fullscreen": "全屏", "btn.exitFullscreen": "退出全屏",
    "btn.practice": "练习模式：{state}", "btn.sound": "音效：{state}",
    "btn.theme": "背景：{state}", "theme.bright": "明亮", "theme.dark": "暗色",
    "state.on": "开", "state.off": "关",
    "btn.rewind": "回退", "btn.restart": "重来", "btn.pause": "暂停", "btn.close": "关闭",

    "panel.levelOf": "第 {n} 关，共 {total} 关", "panel.custom": "自定义关卡",
    "gauge.time": "时间", "gauge.parts": "零件", "gauge.par": "标准步数",
    "socket.locked": "插槽已锁 —— 装配清单尚未完成",
    "socket.open": "插槽已开 —— 前往电源按钮",
    "head.spec": "装配清单", "head.belt": "工具带", "head.note": "知识卡",
    "head.objective": "任务目标", "head.terminal": "帮助终端",
    "belt.empty": "暂无物品", "note.empty": "拾取零件后，这里会显示它的作用。",
    "objective.text": "只收集装配清单上列出的零件；带红叉的零件不适用于这台机器，拾取会损失 10 秒。",

    "ov.introTitle": "第 {n} 关 —— {name}", "ov.start": "开始",
    "ov.winTitle": "机器启动成功！", "ov.winAllTitle": "全部装配完成！",
    "ov.winText": "{name} 已完成。",
    "ov.winAllText": "所有机器都已组装并运行。你可以重玩任意关卡，追求更漂亮的成绩。",
    "ov.next": "下一关", "ov.replay": "重玩本关", "ov.playAgain": "再玩一次",
    "ov.deadTitle": "装配失败",
    "ov.deadRewind": "{reason} —— 你可以回退一步，换个走法。",
    "ov.rewindOne": "回退一步", "ov.restartLevel": "重玩本关", "ov.tryAgain": "再试一次",
    "ov.pausedTitle": "已暂停", "ov.pausedText": "计时已停止。", "ov.resume": "继续",
    "ov.newBest": "新纪录", "ov.practiceRun": "练习模式 —— 成绩不记录",
    "stat.parts": "零件", "stat.clock": "时限", "stat.par": "标准步数",
    "stat.time": "用时", "stat.moves": "步数", "stat.rewinds": "回退次数", "stat.parMoves": "{n} 步",

    "boot.header": "BIT BUILDER 自检程序 v1.0", "boot.ok": "正常",
    "boot.done": "启动完成：用时 {seconds} 秒，共 {moves} 步。",

    "toast.pickup": "已拾取：{name}", "toast.reject": "{name} 不适用于这台机器 —— 损失 10 秒",
    "toast.rewind": "已回退一步", "toast.quarantine": "恶意软件已隔离 —— 工具包已用完",
    "toast.door": "已使用门禁卡", "toast.scrub": "清除器抹掉了你的全部工具！",
    "toast.ready": "装配清单已齐全 —— 插槽解锁", "toast.teleport": "已通过网络端口传送",

    "death.coolant": "淹没在冷却液中", "death.overheat": "在过热区被烤焦",
    "death.surge": "被电涌击穿", "death.malware": "被恶意软件抓住",
    "death.time": "时间用尽",

    "levels.title": "关卡", "levels.sub": "完成一关即可解锁下一关。",
    "levels.n": "第 {n} 关", "levels.locked": "未解锁", "levels.best": "最佳 {time} 秒 · {moves} 步",

    "help.title": "玩法说明",
    "help.p1": "使用<strong>方向键</strong>或 <strong>WASD</strong> 移动（手机上可滑动屏幕或使用方向按钮）。每一关都是一份<strong>装配清单</strong>：收集清单上列出的零件，穿过<strong>装配插槽</strong>（清单集齐后才会打开），并在时间用尽前抵达<strong>电源按钮</strong>。带红叉的零件属于另一台机器，拾取会损失十秒。",
    "help.p2": "恶意软件碰到即致命 —— 除非你带着<strong>隔离工具包</strong>，它能让一个恶意软件停止运行，同时自身被消耗。工具包永远不够对付所有敌人，所以要挑准目标。顶栏的<strong>练习模式</strong>会停止计时，方便你熟悉关卡；练习模式下的成绩不会被记录。",
    "help.p3": "推错了箱子？按 <kbd>Z</kbd> 可以<strong>回退</strong>一步，连致命的那一步也能撤销 —— 但计时不会倒退，而且不使用回退才能拿到第三颗星。<kbd>R</kbd> 重来，<kbd>P</kbd> 暂停，<kbd>F</kbd> 全屏。每关都有求解器算出的<strong>标准步数</strong>。你还可以<a href=\"editor.html\">自己制作关卡</a>并通过链接分享。",

    "legend.hardware": "硬件零件", "legend.hardwareD": "CPU、内存、硬盘、风扇 —— 只收集清单上列出的",
    "legend.software": "软件零件", "legend.softwareD": "操作系统镜像、驱动程序、编译器、杀毒软件",
    "legend.decoy": "不适配的零件", "legend.decoyD": "这台机器没有它的位置 —— 拾取会损失 10 秒",
    "legend.socket": "装配插槽", "legend.socketD": "装配清单全部完成后才会打开",
    "legend.exit": "电源按钮", "legend.exitD": "抵达它即可通关",
    "legend.card": "门禁卡", "legend.cardD": "可打开一道同色端口（绿色的最高权限可反复使用）",
    "legend.door": "上锁端口", "legend.doorD": "需要同色的门禁卡",
    "legend.coolant": "冷却液泄漏", "legend.coolantD": "没有冷却液防护就会致命",
    "legend.overheat": "过热区", "legend.overheatD": "没有散热器就会致命",
    "legend.ice": "低温冰面", "legend.iceD": "会一直滑行，直到被挡住",
    "legend.bus": "数据总线", "legend.busD": "会带着你移动 —— 磁力手套可以无视它",
    "legend.crate": "货箱", "legend.crateD": "可以推动；推进冷却液可以堵住泄漏",
    "legend.surge": "电涌陷阱", "legend.surgeD": "一次性：踩上去的一切都会被摧毁",
    "legend.scrubber": "清除器", "legend.scrubberD": "抹掉工具带上的全部工具",
    "legend.port": "网络端口", "legend.portD": "把你从下一个端口送出",
    "legend.switch": "切换开关", "legend.switchD": "翻转地图上所有的切换墙",
    "legend.tools": "工具", "legend.toolsD": "冷却液防护、散热器、防滑垫、磁力手套",
    "legend.kit": "隔离工具包", "legend.kitD": "撞向恶意软件即可将其隔离 —— 每个只能用一次",
    "legend.bug": "臭虫", "legend.bugD": "沿着左手边的墙移动",
    "legend.trojan": "木马", "legend.trojanD": "会主动追击你",

    "know.title": "知识库",
    "know.sub": "游戏里的每个零件都是真实的计算机部件。以下是它们各自的作用 —— 你在关卡中拾取时也会看到同样的说明。",
    "know.hardware": "硬件", "know.software": "软件", "know.tool": "装备", "know.malware": "恶意软件",
    "quiz.title": "知识检测",
    "quiz.prompt": "以下描述的是哪个部件？",
    "quiz.correct": "正确 —— {name}。", "quiz.wrong": "不对：这是{name}。",
    "quiz.score": "知识检测：答对 {right} / {total}",
    "quiz.skip": "跳过",

    "card.r": "红色门禁卡", "card.b": "蓝色门禁卡",
    "card.y": "黄色门禁卡", "card.g": "最高权限卡",
    "foot.text": "为 PPS2114 制作。键盘、鼠标或触屏均可 —— 无需安装，无需插件。",

    "ed.title": "关卡编辑器",
    "ed.tagline": "绘制地图、指定零件、检查可玩性，然后分享链接。关卡数据就存在网址里 —— 不会上传任何内容。",
    "ed.back": "返回游戏",
    "ed.hint": "点击或拖动绘制 · 右键擦除 · 画布会自动适应地图大小",
    "ed.name": "名称", "ed.seconds": "秒数", "ed.width": "宽", "ed.height": "高",
    "ed.hintLine": "帮助终端显示的提示",
    "ed.brush": "画笔", "ed.parts": "地图上的零件", "ed.partsEmpty": "放置零件后会在这里列出",
    "ed.check": "检查", "ed.play": "试玩", "ed.copy": "复制分享链接",
    "ed.load": "载入代码", "ed.start": "从现成关卡开始", "ed.clear": "清空",
    "ed.ready": "先画好地图，然后点击“检查”。",
    "ed.bad": "还不能游玩：", "ed.good": "可以正常游玩。",
    "ed.summary": "{w}×{h}，硬件 {hardware} 个，软件 {software} 个，不适配零件 {decoys} 个。",
    "ed.spec": "装配清单：{spec}",
    "ed.copied": "分享链接已复制（{n} 个字符）。任何人打开它都能玩你的关卡。",
    "ed.copyManual": "请手动复制下面的链接：",
    "ed.loadPrompt": "粘贴分享链接或关卡代码：",
    "ed.loaded": "已载入，可以继续编辑。", "ed.loadFail": "无法读取该代码：{message}",
    "ed.startPrompt": "从哪一关开始？", "ed.startedFrom": "已载入《{name}》作为起点。",
    "ed.clearConfirm": "确定要清空地图吗？", "ed.cleared": "已清空。",
    "ed.doesNotFit": "（不适配）",
    "ed.g.ground": "地面", "ed.g.parts": "零件", "ed.g.hazards": "危险区",
    "ed.g.movement": "移动装置", "ed.g.locks": "门禁与工具", "ed.g.malware": "恶意软件",
    "ed.b.floor": "地板", "ed.b.wall": "墙 / 机柜", "ed.b.start": "起点", "ed.b.exit": "电源按钮",
    "ed.b.socket": "装配插槽", "ed.b.terminal": "帮助终端",
    "ed.b.hw": "硬件零件", "ed.b.sw": "软件零件",
    "ed.b.badHw": "不适配的硬件", "ed.b.badSw": "不适配的软件",
    "ed.b.coolant": "冷却液", "ed.b.overheat": "过热区", "ed.b.surge": "电涌陷阱",
    "ed.b.scrubber": "清除器", "ed.b.ice": "低温冰面",
    "ed.b.iceNW": "冰面拐角 西北", "ed.b.iceNE": "冰面拐角 东北",
    "ed.b.iceSE": "冰面拐角 东南", "ed.b.iceSW": "冰面拐角 西南",
    "ed.b.busW": "总线 向西", "ed.b.busE": "总线 向东", "ed.b.busN": "总线 向北", "ed.b.busS": "总线 向南",
    "ed.b.port": "网络端口", "ed.b.crate": "货箱",
    "ed.b.cardR": "红色门禁卡", "ed.b.doorR": "红色端口", "ed.b.cardB": "蓝色门禁卡", "ed.b.doorB": "蓝色端口",
    "ed.b.cardY": "黄色门禁卡", "ed.b.doorY": "黄色端口", "ed.b.cardG": "最高权限卡", "ed.b.doorG": "绿色端口",
    "ed.b.switch": "切换开关", "ed.b.toggleShut": "切换墙（关闭）", "ed.b.toggleOpen": "切换墙（打开）",
    "ed.b.seal": "冷却液防护", "ed.b.heatsink": "散热器",
    "ed.b.grips": "防滑垫", "ed.b.mag": "磁力手套", "ed.b.kit": "隔离工具包",
    "ed.b.bug": "臭虫", "ed.b.glitch": "故障", "ed.b.trojan": "木马", "ed.b.packet": "数据包",
    "code.unreadable": "无法读取该关卡代码：{message}"
  }
};

/* Level names and hints, translated. Keyed by the English name in levels.js. */
const LEVEL_TEXT = {
  "Boot Camp": { name: "启动训练营", hint: "收集装配清单上的每个零件，然后穿过装配插槽前往电源按钮。" },
  "Access Control": { name: "门禁管制", hint: "门禁卡一开门就会被消耗掉。花掉之前先想清楚。" },
  "Coolant Spill": { name: "冷却液泄漏", hint: "把货箱推进冷却液可以堵住泄漏；有了冷却液防护，你自己也能蹚过去。" },
  "Thermal Runaway": { name: "热失控", hint: "散热器能让过热区变得无害。电涌陷阱是一次性的 —— 千万别踩。" },
  "Cryo Vault": { name: "低温仓库", hint: "在低温冰面上你会一直滑，直到被挡住。防滑垫能让你像走地板一样行走。" },
  "Data Bus": { name: "数据总线", hint: "数据总线每拍带你移动一格，而且不会放手。磁力手套可以无视它。" },
  "Malware Outbreak": { name: "恶意软件爆发", hint: "臭虫沿左墙走，故障沿右墙走，数据包直线飞行并反弹。" },
  "Firewall": { name: "防火墙", hint: "绿色代表最高权限：能打开所有绿色端口且永不消耗。其余门禁卡都是一次性的。" },
  "Network Ports": { name: "网络端口", hint: "网络端口会把你从下一个端口送出。切换开关会翻转地图上所有的切换墙。" },
  "Final Assembly": { name: "总装", hint: "所有机制齐上阵：堵住冷却液、滑过冰面、穿越高温，还要留意时间。" }
};

let LANG = "en";

function setLang(lang) { LANG = I18N[lang] ? lang : "en"; return LANG; }
function currentLang() { return LANG; }

function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
  return s;
}

/* Level name and hint in the current language, falling back to the map file. */
function levelName(level) {
  const tr = LEVEL_TEXT[level.name];
  return LANG === "zh" && tr ? tr.name : level.name;
}
function levelHint(level) {
  const tr = LEVEL_TEXT[level.name];
  return LANG === "zh" && tr ? tr.hint : level.hint;
}

if (typeof module !== "undefined") { module.exports = { I18N, LEVEL_TEXT, t, setLang, currentLang, levelName, levelHint }; }
