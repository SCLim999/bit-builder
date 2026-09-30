/* Firewall 3D — a first-person raycaster in the spirit of the early-90s
 * shooters, set inside a network. Everything is drawn in code: the walls,
 * floors and every monster are canvas paths turned into pixel arrays once at
 * start-up, then the renderer works on a 320x200 pixel buffer that is scaled
 * up 2x with the status bar drawn underneath at full resolution.
 *
 * Sections: strings · helpers · sound · textures · sprites · level ·
 * rules (player, doors, monsters, shots) · renderer · status bar · UI.
 */
(() => {
"use strict";

/* ================================================================ strings */
const STR = {
  en: {
    tagline: "A first-person shooter inside the network. Find the malware, delete it, reboot the machine.",
    back: "← Bit Builder", other: "中文", levels: "Levels", intel: "Threat database",
    soundOn: "Sound: on", soundOff: "Sound: off", full: "Full screen", exitFull: "Exit full screen",
    help: "How to play", close: "Close",
    keys: "Click the view to aim with the mouse · WASD / arrows move · Shift run · click, Space or Ctrl fire · E open / use · 1–3 or Q switch weapon · M map · P / Esc pause",
    foot: "Part of Bit Builder — built for PPS2114. Keyboard and mouse, or touch.",
    disclaimerTitle: "Disclaimer.",
    disclaimer: "Firewall 3D is an educational game. It contains no real malware and no harmful code: every \u201cvirus\u201d in it is a drawing. " +
      "The malware names and notes describe real historical incidents, summarised for teaching from public sources such as Wikipedia\u2019s \u201cTimeline of computer viruses and worms\u201d, and may simplify events. " +
      "Product and company names mentioned (such as Microsoft Word, Apple II, Sony BMG and Siemens) are trademarks of their owners; this project is not affiliated with or endorsed by them. " +
      "Provided as is, without warranty. Never download or run real malware.",
    menuTitle: "Firewall 3D",
    menuText: "Malware has breached the network. You are the security software. Scan it, filter it, quarantine it — and reach the reboot terminal.",
    start: "Start mission", resume: "Resume", restart: "Restart level", next: "Next sector", retry: "Try again",
    pickLevel: "Choose a level", playAgain: "Play again",
    paused: "Paused", pausedText: "Click Resume, or press P, to carry on.",
    dead: "System compromised", deadText: "The malware got the better of you this time. Your loadout is restored to the start of the level.",
    clear: "Sector clean", win: "Network secured",
    winText: "The rootkit is gone and the machine reboots clean. Every piece of malware you met is in the threat database.",
    kills: "Malware removed", items: "Items", time: "Time",
    level: "Sector {n}", locked: "Locked", best: "Best {t}",
    hudAmmo: "AMMO", hudHealth: "INTEGRITY", hudArmor: "FIREWALL", hudArms: "ARMS", hudKeys: "KEYS", hudKills: "KILLS",
    w_scanner: "Antivirus Scanner", w_filter: "Packet Filter", w_cannon: "Quarantine Cannon",
    p_h: "Installed a security patch (+15)", p_H: "Installed a security update (+50)", p_f: "Firewall up (+100)",
    p_a: "Picked up virus signatures", p_c: "Picked up energy cells",
    p_g: "Got the Packet Filter! (2)", p_p: "Got the Quarantine Cannon! (3)",
    p_k: "Picked up the red encryption key", p_b: "Picked up the blue encryption key", p_y: "Picked up the yellow encryption key",
    needKey: "This port needs the {c} encryption key", red: "red", blue: "blue", yellow: "yellow",
    exitLocked: "{n} is still active \u2014 remove it first",
    reveal: "That “free gift” was a Trojan!",
    ransom: "Ransomware encrypted some of your ammo!",
    promptMail: "Press E to read the email", promptExit: "Press E to reboot the machine", promptPatch: "Press E to patch the vulnerability",
    p_z: "Backup drive connected \u2014 ransomware and wipers can\u2019t hurt your files now",
    backupSaved: "Your backup made the ransom note harmless",
    vulnOpen: "Worms are getting in through a vulnerability \u2014 patch it with E",
    patched: "Vulnerability patched \u2014 no more worms from here", patchStat: "Patched",
    ransomTitle: "Ooops, your files have been encrypted!", ransomText: "Send $300 in Bitcoin to get them back.", ransomHint: "A backup drive makes this harmless",
    split: "ILOVEYOU split into more love letters!",
    survival: "Incident Response", survivalText: "Endless waves of malware. Clear a wave, choose an upgrade, and see how long the network holds.",
    survivalStart: "Start Incident Response", endless: "Endless mode", survivalBest: "Best: wave {w}, {s} points.",
    waveStart: "Wave {n}", waveClear: "Wave {n} cleared", chooseUpgrade: "Choose one upgrade before the next wave.",
    survivalOver: "Network overrun", survivalOverText: "You held out until wave {w} with {s} points. Best so far: wave {bw}, {bs} points.",
    hudWave: "WAVE", score: "Score", backToMenu: "Main menu",
    up_firewall: "Firewall +75|Soaks up half of every hit.", up_patch: "Security update|+40 integrity.",
    up_sig: "Signature update|+25% damage with every weapon.", up_clock: "Overclock|Fire 15% faster.",
    up_ammo: "Ammo cache|+20 signatures and +80 cells.", up_backup: "Backup drive|Ransomware and wipers can\u2019t touch your files.",
    musicOn: "Music: on", musicOff: "Music: off",
    identified: "Signature identified: {n}", scanning: "unknown sample \u00b7 scanning",
    mailTitle: "Incoming email \u2014 is it safe?", mailText: "Read it carefully. Report it if it is phishing; open it if it is genuine.",
    mailFrom: "From", mailSubject: "Subject", mailAttach: "Attachment",
    reportBtn: "Report as phishing", openBtn: "It\u2019s safe \u2014 open it", carryOn: "Carry on",
    mailRight: "Correct!", mailWrong: "Not quite",
    wasPhish: "This email was phishing. The red flags:", wasSafe: "This email was genuine. How you can tell:",
    rewardRight: "Good call \u2014 firewall +25", phishOpened: "You opened a phishing email \u2014 a Trojan got in!", safeReported: "That email was genuine \u2014 no harm done, but keep an eye out",
    quizTitle: "Security check \u2014 question {n} of {t}", quizAsk: "Which kind of malware is this?",
    quizNext: "Next", quizDone: "See results", quizRight: "Right!", quizWrong: "It was: {a}",
    phishStat: "Phishing spotted", quizStat: "Quiz",
    star1: "Sector cleared", star2: "Removed at least 75% of the malware", star3: "Security aware: every email judged right and 2 of 3 quiz answers",
    helpMore:
      "<p><strong>Scan before you shoot.</strong> Keep an unknown monster in your crosshair for a moment to identify it. Once its signature is known, the Antivirus Scanner does 50% more damage to that kind \u2014 just like real signature-based antivirus.</p>" +
      "<p><strong>Mail terminals</strong> (blue screens with an envelope) show an email. Decide whether it is phishing. Get it right and your firewall grows; open a phishing email and a Trojan gets in.</p>" +
      "<p>After each sector there is a three-question <strong>security check</strong>, and you earn up to three <strong>stars</strong>: clear the sector, remove 75% of the malware, and judge every email right with at least 2 of 3 quiz answers.</p>",
    reported: "A keylogger reported your position!", wiped: "A wiper erased your firewall!",
    popups: ["YOU WON!!! Claim your prize", "FREE RAM \u2014 click here", "Your PC is SLOW! Fix it now", "Congratulations, visitor #1,000,000", "HOT DEALS \u2014 90% OFF"],
    popupClose: "closes in {s}s",
    wormCopy: "A worm copied itself",
    summon: "The rootkit spawned hidden processes",
    bossDown: "{n} removed \u2014 the reboot terminal is unlocked",
    noAmmo: "Out of ammo",
    newThreat: "Signature identified",
    intelSub: "Every kind of malware you have met. The ones you have not met yet stay hidden.",
    unknown: "Not encountered yet",
    cardWeapon: "Defence",
    timeline: "Timeline", timelineTitle: "Malware timeline",
    timelineSub: "Every monster in the game is named after real malware. Removing one in the game ticks it off here.",
    source: "Source: Wikipedia, “Timeline of computer viruses and worms”",
    removedMark: "removed", removedMsg: "Removed {n} ({y})", examples: "Real examples: {list}",
    removedCount: "{n} of {t} removed",
    helpHtml:
      "<p>You are the security software on an infected network. Each sector is a maze of server rooms. " +
      "Remove the malware, pick up <strong>encryption keys</strong> to open locked ports, and press <strong>E</strong> at the " +
      "<strong>reboot terminal</strong> (the green screen in the wall) to finish.</p>" +
      "<table>" +
      "<tr><td>Mouse</td><td>click the view once, then move the mouse to turn (Esc lets the mouse go)</td></tr>" +
      "<tr><td>W A S D / arrows</td><td>move and strafe / turn</td></tr>" +
      "<tr><td>Shift</td><td>run</td></tr>" +
      "<tr><td>Click, Space, Ctrl</td><td>fire (hold for automatic)</td></tr>" +
      "<tr><td>E / Enter</td><td>open doors, use the terminal</td></tr>" +
      "<tr><td>1 2 3, Q, wheel</td><td>switch weapon</td></tr>" +
      "<tr><td>M / Tab</td><td>network map</td></tr>" +
      "<tr><td>P / Esc</td><td>pause</td></tr>" +
      "<tr><td>E on a red CVE crack</td><td>patch the vulnerability so worms stop coming through it</td></tr>" +
      "</table>" +
      "<p>Your weapons are real defences: the <strong>Antivirus Scanner</strong> matches known signatures, the " +
      "<strong>Packet Filter</strong> is a firewall that drops a whole burst of packets, and the <strong>Quarantine Cannon</strong> " +
      "isolates whatever it hits. <strong>Integrity</strong> is your health; the <strong>Firewall</strong> soaks up half of " +
      "every hit while it lasts.</p>" +
      "<p>Each new kind of malware shows a short card saying what it really is. They all end up in the <strong>threat database</strong>.</p>"
  },
  zh: {
    tagline: "在网络内部的第一人称射击游戏。找到恶意软件，清除它，重启机器。",
    back: "← 组装大师", other: "EN", levels: "关卡", intel: "威胁数据库",
    soundOn: "声音：开", soundOff: "声音：关", full: "全屏", exitFull: "退出全屏",
    help: "玩法说明", close: "关闭",
    keys: "点击画面后用鼠标瞄准 · WASD / 方向键移动 · Shift 奔跑 · 点击、空格或 Ctrl 射击 · E 开门 / 使用 · 1–3 或 Q 切换武器 · M 地图 · P / Esc 暂停",
    disclaimerTitle: "免责声明：",
    disclaimer: "《防火墙 3D》是一款教育游戏。它不包含任何真实的恶意软件或有害代码：游戏里的每一个“病毒”都只是一幅画。" +
      "游戏中的恶意软件名称和说明描述的是真实的历史事件，根据维基百科《Timeline of computer viruses and worms》等公开资料整理用于教学，可能对事件有所简化。" +
      "文中提到的产品和公司名称（如 Microsoft Word、Apple II、Sony BMG 和西门子）是其各自所有者的商标；本项目与它们没有任何关联，也未获得它们的认可。" +
      "本软件按“现状”提供，不作任何保证。切勿下载或运行真实的恶意软件。",
    foot: "属于 Bit Builder —— 为 PPS2114 制作。支持键盘鼠标或触屏。",
    menuTitle: "防火墙 3D",
    menuText: "恶意软件已经入侵网络。你就是安全软件：扫描、过滤、隔离它们，然后抵达重启终端。",
    start: "开始任务", resume: "继续", restart: "重来本关", next: "下一区域", retry: "再试一次",
    pickLevel: "选择关卡", playAgain: "再玩一次",
    paused: "已暂停", pausedText: "点击“继续”或按 P 继续游戏。",
    dead: "系统已被攻陷", deadText: "这次恶意软件占了上风。你的装备已恢复到本关开始时的状态。",
    clear: "区域已清理", win: "网络已安全",
    winText: "Rootkit 已被清除，机器干净地重启了。你遇到过的每一种恶意软件都记录在威胁数据库里。",
    kills: "清除恶意软件", items: "物品", time: "用时",
    level: "第 {n} 区", locked: "未解锁", best: "最佳 {t}",
    hudAmmo: "弹药", hudHealth: "完整性", hudArmor: "防火墙", hudArms: "武器", hudKeys: "密钥", hudKills: "击杀",
    w_scanner: "杀毒扫描器", w_filter: "数据包过滤器", w_cannon: "隔离炮",
    p_h: "安装了安全补丁（+15）", p_H: "安装了安全更新（+50）", p_f: "防火墙已启用（+100）",
    p_a: "拾取了病毒特征码", p_c: "拾取了能量电池",
    p_g: "获得数据包过滤器！（2）", p_p: "获得隔离炮！（3）",
    p_k: "拾取了红色加密密钥", p_b: "拾取了蓝色加密密钥", p_y: "拾取了黄色加密密钥",
    needKey: "这个端口需要{c}加密密钥", red: "红色", blue: "蓝色", yellow: "黄色",
    exitLocked: "{n} 仍在活动 —— 先清除它",
    reveal: "那个“免费礼物”是木马！",
    ransom: "勒索软件加密了你的部分弹药！",
    promptMail: "按 E 阅读邮件", promptExit: "按 E 重启机器", promptPatch: "按 E 修补漏洞",
    p_z: "已连接备份硬盘 —— 勒索软件和擦除器伤不到你的文件了",
    backupSaved: "你的备份让勒索信失去了作用",
    vulnOpen: "一个未修补的漏洞正在放蠕虫进来 —— 对着它按 E 修补",
    patched: "漏洞已修补 —— 这里不会再有蠕虫进来", patchStat: "已修补",
    ransomTitle: "哎呀，你的文件已被加密！", ransomText: "支付价值 300 美元的比特币才能取回。", ransomHint: "有备份硬盘就不怕它",
    split: "ILOVEYOU 分裂出了更多情书！",
    survival: "应急响应", survivalText: "一波又一波的恶意软件。清完一波，选一项升级，看看网络能坚持多久。",
    survivalStart: "开始应急响应", endless: "无尽模式", survivalBest: "最佳纪录：第 {w} 波，{s} 分。",
    waveStart: "第 {n} 波", waveClear: "第 {n} 波已清除", chooseUpgrade: "下一波来临前，选择一项升级。",
    survivalOver: "网络已被攻陷", survivalOverText: "你坚持到了第 {w} 波，得分 {s}。最佳纪录：第 {bw} 波，{bs} 分。",
    hudWave: "波次", score: "得分", backToMenu: "主菜单",
    up_firewall: "防火墙 +75|抵挡每次伤害的一半。", up_patch: "安全更新|完整性 +40。",
    up_sig: "特征码更新|所有武器伤害 +25%。", up_clock: "超频|射速提高 15%。",
    up_ammo: "弹药补给|特征码 +20，能量电池 +80。", up_backup: "备份硬盘|勒索软件和擦除器碰不到你的文件。",
    musicOn: "音乐：开", musicOff: "音乐：关",
    identified: "已识别特征码：{n}", scanning: "未知样本 · 扫描中",
    mailTitle: "新邮件 —— 它安全吗？", mailText: "仔细阅读。如果是钓鱼邮件就举报；如果是正常邮件就打开。",
    mailFrom: "发件人", mailSubject: "主题", mailAttach: "附件",
    reportBtn: "举报为钓鱼邮件", openBtn: "它是安全的 —— 打开", carryOn: "继续",
    mailRight: "正确！", mailWrong: "判断错了",
    wasPhish: "这是一封钓鱼邮件。危险信号：", wasSafe: "这是一封正常邮件。判断依据：",
    rewardRight: "判断正确 —— 防火墙 +25", phishOpened: "你打开了钓鱼邮件 —— 一只木马溜了进来！", safeReported: "那封邮件是正常的 —— 没有损失，但要继续保持警惕",
    quizTitle: "安全检测 —— 第 {n} 题，共 {t} 题", quizAsk: "这是哪一种恶意软件？",
    quizNext: "下一题", quizDone: "查看结果", quizRight: "答对了！", quizWrong: "正确答案：{a}",
    phishStat: "识破钓鱼", quizStat: "测验",
    star1: "清理完本区域", star2: "清除至少 75% 的恶意软件", star3: "安全意识：每封邮件都判断正确，且测验至少答对 2 题",
    helpMore:
      "<p><strong>先扫描，再开火。</strong>把未知的怪物放在准星里停留片刻即可识别它。一旦掌握了它的特征码，杀毒扫描器对这类怪物的伤害提高 50% —— 就像真实的基于特征码的杀毒软件。</p>" +
      "<p><strong>邮件终端</strong>（带信封图标的蓝色屏幕）会显示一封邮件。判断它是不是钓鱼邮件。判断正确，防火墙增强；打开钓鱼邮件，木马就会溜进来。</p>" +
      "<p>每个区域结束后有三道<strong>安全检测</strong>题，最多可获得三颗<strong>星</strong>：清理完区域、清除 75% 的恶意软件、每封邮件都判断正确且测验至少答对 2 题。</p>",
    reported: "键盘记录器报告了你的位置！", wiped: "擦除器清空了你的防火墙！",
    popups: ["恭喜中奖！！！立即领取", "免费内存 —— 点击这里", "你的电脑太慢了！马上修复", "恭喜你成为第 1,000,000 位访客", "限时特价 —— 一折起"],
    popupClose: "{s} 秒后关闭",
    wormCopy: "一只蠕虫复制了自己",
    summon: "Rootkit 生成了隐藏进程",
    bossDown: "{n} 已清除 —— 重启终端已解锁",
    noAmmo: "弹药耗尽",
    newThreat: "已识别特征码",
    intelSub: "你遇到过的每一种恶意软件。还没遇到的会保持隐藏。",
    unknown: "尚未遇到",
    cardWeapon: "防御",
    timeline: "时间线", timelineTitle: "恶意软件时间线",
    timelineSub: "游戏里的每个怪物都以真实的恶意软件命名。在游戏中清除一个，这里就会打钩。",
    source: "来源：维基百科《Timeline of computer viruses and worms》",
    removedMark: "已清除", removedMsg: "已清除 {n}（{y}）", examples: "真实案例：{list}",
    removedCount: "已清除 {n} / {t}",
    helpHtml:
      "<p>你是一个被感染网络中的安全软件。每个区域都是由机房组成的迷宫。" +
      "清除恶意软件，拾取<strong>加密密钥</strong>打开上锁的端口，然后在" +
      "<strong>重启终端</strong>（墙上的绿色屏幕）前按 <strong>E</strong> 过关。</p>" +
      "<table>" +
      "<tr><td>鼠标</td><td>先点击一次画面，然后移动鼠标转向（按 Esc 释放鼠标）</td></tr>" +
      "<tr><td>W A S D / 方向键</td><td>移动、平移 / 转向</td></tr>" +
      "<tr><td>Shift</td><td>奔跑</td></tr>" +
      "<tr><td>点击、空格、Ctrl</td><td>射击（按住连发）</td></tr>" +
      "<tr><td>E / Enter</td><td>开门、使用终端</td></tr>" +
      "<tr><td>1 2 3、Q、滚轮</td><td>切换武器</td></tr>" +
      "<tr><td>M / Tab</td><td>网络地图</td></tr>" +
      "<tr><td>P / Esc</td><td>暂停</td></tr>" +
      "<tr><td>对着红色 CVE 裂缝按 E</td><td>修补漏洞，蠕虫就不会再从那里钻进来</td></tr>" +
      "</table>" +
      "<p>你的武器就是真实的防御手段：<strong>杀毒扫描器</strong>匹配已知的特征码，" +
      "<strong>数据包过滤器</strong>是一道防火墙，一次拦下一整波数据包，<strong>隔离炮</strong>把击中的东西隔离起来。" +
      "<strong>完整性</strong>就是你的生命值；<strong>防火墙</strong>在耗尽之前会抵挡每次伤害的一半。</p>" +
      "<p>每遇到一种新的恶意软件，都会弹出一张小卡片说明它到底是什么。它们都会收录到<strong>威胁数据库</strong>里。</p>"
  }
};

/* What each kind of malware really is. The second sentence says how that
 * shows up in the game, so the behaviour teaches the definition. */
const THREATS = {
  virus: {
    en: ["Virus", "Malicious code that attaches itself to a normal program or file and runs when its host runs, infecting other files as it goes. It needs a host and someone to run it."],
    zh: ["病毒", "附着在正常程序或文件上的恶意代码，宿主运行时它也运行，并感染其他文件。它需要宿主，也需要有人去运行它。"]
  },
  worm: {
    en: ["Worm", "Self-replicating malware that spreads across a network on its own by exploiting security holes — no host file, no click needed. Remove worms fast: left alone, they copy themselves."],
    zh: ["蠕虫", "能自我复制的恶意软件，利用安全漏洞在网络中自行传播——不需要宿主文件，也不需要用户点击。要尽快清除：放着不管，它们会复制自己。"]
  },
  trojan: {
    en: ["Trojan horse", "Malware disguised as something you want — a free game, a cracked app, an invoice. It does not copy itself; it waits for you to open it. Be suspicious of free gifts."],
    zh: ["木马", "伪装成你想要的东西的恶意软件——免费游戏、破解软件、发票。它不会自我复制，而是等你自己打开。对“免费礼物”要保持怀疑。"]
  },
  spyware: {
    en: ["Spyware", "Quietly records what you do — keystrokes, passwords, browsing — and sends it to someone else. Keyloggers are one kind. It is built to be hard to notice."],
    zh: ["间谍软件", "悄悄记录你的一举一动——按键、密码、浏览记录——并发送给别人。键盘记录器就是其中一种。它就是为了不被发现而设计的。"]
  },
  ransomware: {
    en: ["Ransomware", "Encrypts your files and demands payment for the key. Paying is no guarantee; an offline backup is the real defence. Its shots here encrypt your ammo."],
    zh: ["勒索软件", "加密你的文件并索要赎金换取密钥。付钱也不一定能恢复，离线备份才是真正的防御。在这里，它的攻击会加密你的弹药。"]
  },
  adware: {
    en: ["Adware", "Software that floods you with unwanted adverts, often bundled with free programs. Its maker earns money from every view or click; it slows the computer and may track your browsing. Its hits here cover your screen with pop-ups."],
    zh: ["广告软件", "向你狂推不想要的广告的软件，常常捆绑在免费程序里。每一次展示或点击都在为它的作者赚钱；它会拖慢电脑，还可能跟踪你的浏览记录。在这里，它的攻击会让弹窗盖住你的屏幕。"]
  },
  keylogger: {
    en: ["Keylogger", "A kind of spyware that records every key you press, capturing passwords, card numbers and messages. Some are small hardware plugs between the keyboard and the computer. While this one can see you, it reports your position to other malware."],
    zh: ["键盘记录器", "一种记录你每一次按键的间谍软件，可以窃取密码、卡号和聊天内容。有些是插在键盘和电脑之间的小硬件。在这里，只要它能看到你，就会把你的位置报告给其他恶意软件。"]
  },
  bot: {
    en: ["Bot / botnet", "A bot is an infected device that quietly takes orders from an attacker. Thousands of them form a botnet, used to send spam, steal data or flood websites in denial-of-service attacks. Bots here come in swarms and act together."],
    zh: ["僵尸程序 / 僵尸网络", "僵尸程序是被感染后悄悄听命于攻击者的设备。成千上万台组成僵尸网络，用来发送垃圾邮件、窃取数据或以拒绝服务攻击淹没网站。在这里，它们成群出现、一起行动。"]
  },
  fileless: {
    en: ["Fileless malware", "Runs in memory using tools already on the computer, such as PowerShell, instead of installing a program file, so antivirus that scans files struggles to see it. Here it is almost invisible until it is close, and leaves nothing behind."],
    zh: ["无文件恶意软件", "借助电脑上已有的工具（如 PowerShell）在内存中运行，而不是安装程序文件，所以只扫描文件的杀毒软件很难发现它。在这里，它靠近之前几乎看不见，被清除后也不留痕迹。"]
  },
  wiper: {
    en: ["Wiper", "Malware built to destroy data rather than steal it or hold it to ransom: it erases files or the records a disk needs to start. Backups kept offline are the only way back. Its hits here wipe out your firewall."],
    zh: ["擦除器", "专门用来销毁数据的恶意软件，而不是窃取或勒索：它会删除文件，或破坏磁盘启动所需的记录。只有离线备份才能挽回。在这里，它的攻击会清空你的防火墙。"]
  },
  mobile: {
    en: ["Mobile malware", "Malware for phones and tablets: fake apps, malicious links in texts, and apps that steal data, run up premium-rate charges or spy through the camera and microphone. Install apps only from official stores. It is small and fast here."],
    zh: ["移动恶意软件", "针对手机和平板的恶意软件：假冒应用、短信里的恶意链接，以及窃取数据、偷偷扣费或通过摄像头和麦克风监视你的应用。只从官方应用商店安装应用。在这里，它又小又快。"]
  },
  rootkit: {
    en: ["Rootkit", "Buries itself deep in the operating system — even the kernel — to keep administrator access and hide other malware from security tools. Often the only sure fix is a clean reinstall."],
    zh: ["Rootkit", "深深藏进操作系统——甚至内核——以保持管理员权限，并把其他恶意软件从安全工具眼前藏起来。往往只有重装系统才能彻底清除。"]
  }
};

/* Short clues for the end-of-sector quiz: one per kind, worded differently
   from the threat cards so the question tests understanding, not recall. */
const QUIZ = {
  virus:      { en: "Needs a host file and someone to run it before it can spread.", zh: "需要寄生在文件里，并且要有人运行它才能传播。" },
  worm:       { en: "Spreads across a network all by itself \u2014 no host file, no click.", zh: "完全靠自己在网络中传播——不需要宿主文件，也不需要点击。" },
  trojan:     { en: "Pretends to be something useful so that you run it yourself.", zh: "伪装成有用的东西，让你自己去运行它。" },
  spyware:    { en: "Secretly watches what you do and sends it to someone else.", zh: "偷偷监视你的一举一动，并把信息发给别人。" },
  ransomware: { en: "Locks your files with encryption and demands payment.", zh: "用加密锁住你的文件，并索要赎金。" },
  rootkit:    { en: "Hides deep in the operating system to keep administrator access.", zh: "深藏在操作系统里，以保持管理员权限。" },
  adware:     { en: "Makes money by pushing unwanted adverts at you.", zh: "通过向你推送不想要的广告来赚钱。" },
  keylogger:  { en: "Records every key you press, including passwords.", zh: "记录你按下的每一个键，包括密码。" },
  bot:        { en: "Turns your device into one of thousands taking orders from an attacker.", zh: "把你的设备变成成千上万台听命于攻击者的机器之一。" },
  fileless:   { en: "Runs only in memory using tools already on the computer, leaving no program file.", zh: "只在内存中运行，借用电脑上已有的工具，不留下程序文件。" },
  wiper:      { en: "Destroys data on purpose \u2014 there is no ransom and no way to pay.", zh: "故意销毁数据——没有赎金，也无从付款。" },
  mobile:     { en: "Targets phones and tablets, often hidden in fake apps.", zh: "以手机和平板为目标，常藏在假冒应用里。" }
};

const LANG_KEY = "bitbuilder.lang", THEME_KEY = "bitbuilder.theme";
const PROGRESS_KEY = "firewall3d.progress", INTEL_KEY = "firewall3d.intel", SOUND_KEY = "firewall3d.sound";
const REMOVED_KEY = "firewall3d.removed";

let lang = (() => {
  try { const s = localStorage.getItem(LANG_KEY); if (s) return s; } catch (e) { /* storage disabled */ }
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
})();
if (!STR[lang]) lang = "en";
function T(key, vars) {
  let s = STR[lang][key] ?? STR.en[key] ?? key;
  if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
}
function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
}

/* ================================================================ helpers */
const $ = id => document.getElementById(id);
const W = 320, H = 200, TEX = 64;          // 3D view and texture size
const SW = 640, SH = 480, VIEW_H = 400;    // screen, and the part the view fills
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function rng(seed) {                        // small deterministic generator, so textures look the same every load
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shade(c, f) {                      // darken a packed ABGR pixel
  const r = (c & 255) * f, g = ((c >> 8) & 255) * f, b = ((c >> 16) & 255) * f;
  return 0xff000000 | (b << 16) | (g << 8) | r;
}

/* ================================================================== sound */
const Sound = {
  on: load(SOUND_KEY, true) !== false,
  ctx: null,
  ensure() {
    if (!this.on) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  tone(f0, f1, dur, type = "square", vol = 0.12, delay = 0) {
    const ac = this.ensure(); if (!ac) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.2, freq = 1200) {
    const ac = this.ensure(); if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; flt.type = "lowpass"; flt.frequency.value = freq; g.gain.value = vol;
    src.connect(flt).connect(g).connect(ac.destination);
    src.start();
  },
  play(name) {
    if (!this.on) return;
    switch (name) {
      case "scanner": this.tone(1400, 300, 0.12, "square", 0.08); this.noise(0.06, 0.08, 3000); break;
      case "filter": this.noise(0.35, 0.35, 900); this.tone(160, 50, 0.25, "sawtooth", 0.1); break;
      case "cannon": this.tone(420, 1200, 0.09, "sawtooth", 0.05); break;
      case "enemyShot": this.tone(600, 180, 0.2, "triangle", 0.08); break;
      case "bite": this.noise(0.12, 0.2, 600); break;
      case "hurt": this.tone(180, 60, 0.25, "sawtooth", 0.14); break;
      case "die": this.tone(500, 40, 0.45, "square", 0.1); this.noise(0.3, 0.12, 1500); break;
      case "bossDie": this.tone(300, 20, 1.4, "sawtooth", 0.18); this.noise(1.2, 0.3, 800); break;
      case "pickup": this.tone(660, 660, 0.06, "sine", 0.12); this.tone(990, 990, 0.08, "sine", 0.12, 0.06); break;
      case "weapon": [440, 554, 659, 880].forEach((f, i) => this.tone(f, f, 0.08, "square", 0.08, i * 0.06)); break;
      case "key": [523, 784, 1047].forEach((f, i) => this.tone(f, f, 0.1, "triangle", 0.12, i * 0.07)); break;
      case "door": this.noise(0.45, 0.18, 260); break;
      case "denied": this.tone(200, 200, 0.12, "square", 0.1); this.tone(150, 150, 0.16, "square", 0.1, 0.13); break;
      case "reveal": for (let i = 0; i < 4; i++) this.tone(i % 2 ? 700 : 950, i % 2 ? 700 : 950, 0.1, "square", 0.08, i * 0.11); break;
      case "wake": this.tone(90, 140, 0.3, "sawtooth", 0.07); break;
      case "exit": [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.14, "triangle", 0.12, i * 0.1)); break;
      case "click": this.tone(300, 300, 0.03, "square", 0.05); break;
    }
  }
};

/* A small tracker loop: bass, a sparse arpeggio and a hi-hat, scheduled a
   little ahead on the audio clock so it keeps time even when frames drop. */
const Music = {
  on: load("firewall3d.music", true) !== false, playing: false, timer: 0, step: 0, next: 0, noise: null,
  BASS: [45, 0, 45, 0, 48, 0, 45, 0, 43, 0, 43, 0, 40, 0, 43, 0],
  LEAD: [69, 0, 72, 0, 76, 0, 0, 72, 67, 0, 71, 0, 74, 0, 0, 0],
  set(want) {
    if (want === this.playing) return;
    this.playing = want;
    clearInterval(this.timer);
    if (!want) return;
    const ac = Sound.ensure(); if (!ac) { this.playing = false; return; }
    this.next = ac.currentTime + 0.05;
    this.timer = setInterval(() => this.tick(), 60);
  },
  note(midi, t, dur, type, vol) {
    const ac = Sound.ctx, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  hat(t) {
    const ac = Sound.ctx;
    if (!this.noise) {
      this.noise = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.05), ac.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = this.noise; f.type = "highpass"; f.frequency.value = 7000; g.gain.value = 0.025;
    src.connect(f).connect(g).connect(ac.destination); src.start(t);
  },
  tick() {
    const ac = Sound.ctx, stepLen = 60 / 128 / 4;
    if (this.next < ac.currentTime) this.next = ac.currentTime + 0.02;     // after a stall, don't play catch-up
    while (this.next < ac.currentTime + 0.2) {
      const i = this.step % 16, bar = Math.floor(this.step / 16) % 4;
      const shift = [0, 0, 3, -2][bar];
      if (this.BASS[i]) this.note(this.BASS[i] + shift, this.next, stepLen * 1.8, "square", 0.035);
      if (this.LEAD[i] && bar % 2 === 1) this.note(this.LEAD[i] + shift, this.next, stepLen * 1.5, "triangle", 0.02);
      if (i % 2 === 0) this.hat(this.next);
      this.next += stepLen; this.step++;
    }
  }
};

/* =============================================================== textures */
function texFrom(draw, seed = 1) {
  const c = makeCanvas(TEX, TEX), g = c.getContext("2d");
  draw(g, rng(seed));
  return new Uint32Array(g.getImageData(0, 0, TEX, TEX).data.buffer);
}
function bevel(g, light, dark) {
  g.fillStyle = light; g.fillRect(0, 0, 64, 1); g.fillRect(0, 0, 1, 64);
  g.fillStyle = dark; g.fillRect(0, 63, 64, 1); g.fillRect(63, 0, 1, 64);
}

function texCircuit(g, r) {
  g.fillStyle = "#0e3b2b"; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "#1f7a52"; g.lineWidth = 1;
  for (let i = 0; i < 14; i++) {        // traces run straight, then turn 90 degrees
    let x = Math.floor(r() * 16) * 4 + 0.5, y = Math.floor(r() * 16) * 4 + 0.5;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 3; s++) {
      if (r() < 0.5) x = clamp(x + (r() < 0.5 ? -1 : 1) * (8 + Math.floor(r() * 4) * 4), 2.5, 61.5);
      else y = clamp(y + (r() < 0.5 ? -1 : 1) * (8 + Math.floor(r() * 4) * 4), 2.5, 61.5);
      g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = "#d8b24a"; g.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
  g.fillStyle = "#111"; g.fillRect(22, 22, 20, 20);          // a chip
  g.fillStyle = "#9aa3ad";
  for (let i = 0; i < 5; i++) { g.fillRect(24 + i * 4, 19, 2, 3); g.fillRect(24 + i * 4, 42, 2, 3); g.fillRect(19, 24 + i * 4, 3, 2); g.fillRect(42, 24 + i * 4, 3, 2); }
  g.fillStyle = "#2a2a2a"; g.fillRect(24, 24, 16, 16);
  g.fillStyle = "#3de08a"; g.fillRect(25, 25, 2, 2);
  bevel(g, "#2d6b50", "#06180f");
}
function texRack(g, r) {
  g.fillStyle = "#2b3039"; g.fillRect(0, 0, 64, 64);
  for (let y = 2; y < 62; y += 8) {
    g.fillStyle = "#1a1e25"; g.fillRect(3, y, 58, 7);
    g.fillStyle = "#3a414d"; g.fillRect(3, y, 58, 1);
    for (let x = 30; x < 58; x += 4) { g.fillStyle = "#0c0e12"; g.fillRect(x, y + 2, 2, 3); }
    const leds = ["#3de08a", "#f5a524", "#45d0e0", "#3de08a", "#e04a4a"];
    for (let i = 0; i < 4; i++) { g.fillStyle = leds[Math.floor(r() * leds.length)]; g.fillRect(6 + i * 4, y + 3, 2, 2); }
  }
  g.fillStyle = "#4a5260"; g.fillRect(0, 0, 3, 64); g.fillRect(61, 0, 3, 64);
  bevel(g, "#5a6372", "#101318");
}
function texFirewall(g, r) {
  g.fillStyle = "#3a0d08"; g.fillRect(0, 0, 64, 64);
  for (let row = 0; row < 8; row++) {
    const off = row % 2 ? 8 : 0;
    for (let col = -1; col < 4; col++) {
      const x = col * 16 + off + 1, y = row * 8 + 1;
      const hue = 12 + Math.floor(r() * 16);
      g.fillStyle = `hsl(${hue}, 75%, ${28 + r() * 10}%)`; g.fillRect(x, y, 14, 6);
      g.fillStyle = `hsl(${hue + 18}, 90%, 50%)`; g.fillRect(x, y, 14, 1);
    }
  }
  g.globalAlpha = 0.35;                  // a glow licking up from the floor
  const grad = g.createLinearGradient(0, 64, 0, 24);
  grad.addColorStop(0, "#ffb02e"); grad.addColorStop(1, "rgba(255,80,20,0)");
  g.fillStyle = grad; g.fillRect(0, 24, 64, 40);
  g.globalAlpha = 1;
}
function texCode(g, r) {
  g.fillStyle = "#0a1730"; g.fillRect(0, 0, 64, 64);
  g.font = "bold 7px monospace";
  for (let y = 7; y < 64; y += 8) {
    for (let x = 1; x < 62; x += 5) {
      g.fillStyle = r() < 0.15 ? "#8fd3ff" : `rgba(60,130,230,${0.35 + r() * 0.5})`;
      g.fillText(r() < 0.5 ? "0" : "1", x, y);
    }
  }
  bevel(g, "#1f3d70", "#040a16");
}
function texDoor(stripe) {
  return g => {
    g.fillStyle = "#5b6574"; g.fillRect(0, 0, 64, 64);
    for (let x = 4; x < 64; x += 8) { g.fillStyle = "#4b5461"; g.fillRect(x, 0, 2, 64); }
    g.fillStyle = "#3a414c"; g.fillRect(0, 0, 4, 64); g.fillRect(60, 0, 4, 64);
    if (stripe) {
      g.fillStyle = stripe; g.fillRect(4, 24, 56, 16);
      g.fillStyle = "#111"; g.fillRect(27, 26, 10, 9);               // padlock
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.arc(32, 26, 3.5, Math.PI, 0); g.stroke();
      g.fillStyle = stripe; g.fillRect(31, 29, 2, 3);
    } else {
      for (let x = 4; x < 60; x += 8) {                              // hazard stripes
        g.fillStyle = "#f5a524"; g.beginPath(); g.moveTo(x, 40); g.lineTo(x + 4, 40); g.lineTo(x + 8, 34); g.lineTo(x + 4, 34); g.fill();
      }
      g.fillStyle = "#1a1e24"; g.fillRect(4, 33, 56, 1); g.fillRect(4, 40, 56, 1);
      g.fillStyle = "#45d0e0"; g.fillRect(28, 14, 8, 3);
    }
    bevel(g, "#8793a4", "#20252d");
  };
}
function texExit(g) {
  g.fillStyle = "#1c222b"; g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#0b0f14"; g.fillRect(8, 8, 48, 34);
  g.fillStyle = "#0e3b24"; g.fillRect(10, 10, 44, 30);
  g.fillStyle = "#4ade80"; g.font = "bold 8px monospace";
  g.fillText("REBOOT", 15, 22);
  g.strokeStyle = "#4ade80"; g.lineWidth = 2;
  g.beginPath(); g.arc(32, 31, 5, -Math.PI * 0.3, Math.PI * 1.3); g.stroke();
  g.beginPath(); g.moveTo(32, 24); g.lineTo(32, 31); g.stroke();
  g.fillStyle = "#2b3340"; g.fillRect(12, 46, 40, 12);
  for (let i = 0; i < 9; i++) { g.fillStyle = "#4b5566"; g.fillRect(14 + i * 4, 48, 3, 3); g.fillRect(14 + i * 4, 53, 3, 3); }
  bevel(g, "#465163", "#0b0e12");
}
function texMail(done) {             // a phishing-check terminal; dimmed once answered
  return g => {
    g.fillStyle = "#1c222b"; g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#0b0f14"; g.fillRect(8, 8, 48, 36);
    g.fillStyle = done ? "#1f2a24" : "#1e3a8a"; g.fillRect(10, 10, 44, 32);
    if (done) {
      g.strokeStyle = "#4ade80"; g.lineWidth = 4; g.beginPath(); g.moveTo(22, 26); g.lineTo(29, 33); g.lineTo(43, 18); g.stroke();
    } else {
      g.fillStyle = "#f8fafc"; g.fillRect(18, 16, 28, 19);
      g.strokeStyle = "#1e3a8a"; g.lineWidth = 2; g.beginPath(); g.moveTo(18, 16); g.lineTo(32, 27); g.lineTo(46, 16); g.stroke();
      circle(g, 46, 16, 5, "#ef4444"); g.fillStyle = "#fff"; g.font = "bold 8px sans-serif"; g.fillText("!", 44.5, 19);
    }
    g.fillStyle = "#2b3340"; g.fillRect(12, 48, 40, 10);
    g.fillStyle = done ? "#4b5566" : "#60a5fa"; g.font = "bold 7px monospace"; g.fillText(done ? " DONE" : " MAIL", 18, 56);
    bevel(g, "#465163", "#0b0e12");
  };
}
function texVuln(patched) {          // a hole in the wall, before and after the patch
  return (g, r) => {
    texCircuit(g, r);
    if (patched) {
      g.fillStyle = "#15803d"; g.fillRect(18, 12, 28, 32);
      g.fillStyle = "#4ade80"; g.fillRect(29, 16, 6, 24); g.fillRect(22, 25, 20, 6);
      g.fillStyle = "#052e16"; g.fillRect(8, 49, 48, 10);
      g.fillStyle = "#4ade80"; g.font = "bold 7px monospace"; g.fillText("PATCHED", 12, 57);
    } else {
      const grad = g.createRadialGradient(32, 32, 2, 32, 32, 26);
      grad.addColorStop(0, "#fff1c2"); grad.addColorStop(0.3, "#ff4d4d"); grad.addColorStop(1, "rgba(255,40,40,0)");
      g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
      g.strokeStyle = "#1a0505"; g.lineWidth = 4; g.lineJoin = "bevel";
      g.beginPath(); g.moveTo(30, 6); g.lineTo(36, 20); g.lineTo(26, 30); g.lineTo(38, 42); g.lineTo(30, 58); g.stroke();
      g.fillStyle = "#fff"; g.fillRect(6, 50, 26, 9);
      g.fillStyle = "#b91c1c"; g.font = "bold 7px monospace"; g.fillText("CVE!", 8, 57.5);
    }
  };
}
function texFloor(base, line, dot) {
  return g => {
    g.fillStyle = base; g.fillRect(0, 0, 64, 64);
    g.fillStyle = line; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64);
    g.fillStyle = dot;
    for (let y = 8; y < 64; y += 8) for (let x = 8; x < 64; x += 8) g.fillRect(x, y, 1, 1);
  };
}
function texCeil(base, light) {
  return g => {
    g.fillStyle = base; g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#0a0c10"; g.fillRect(0, 0, 64, 1); g.fillRect(0, 0, 1, 64);
    g.fillStyle = light; g.fillRect(20, 20, 24, 24);
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(22, 22, 20, 2);
  };
}

const WALL_CHARS = "#123DRBYXMNUQ";
const WALL_TEX = [
  texFrom(texCircuit, 11), texFrom(texRack, 22), texFrom(texFirewall, 33), texFrom(texCode, 44),
  texFrom(texDoor(null)), texFrom(texDoor("#e04a4a")), texFrom(texDoor("#3b82f6")), texFrom(texDoor("#facc15")),
  texFrom(texExit), texFrom(texMail(false)), texFrom(texMail(true)), texFrom(texVuln(false), 11), texFrom(texVuln(true), 11)
];
const LEVEL_LOOK = [   // floor and ceiling per sector
  { floor: texFrom(texFloor("#1c2430", "#2a3544", "#45d0e0")), ceil: texFrom(texCeil("#141920", "#8aa4c2")), fog: 1 },
  { floor: texFrom(texFloor("#22262c", "#30363f", "#f5a524")), ceil: texFrom(texCeil("#121418", "#b8c4d4")), fog: 0.9 },
  { floor: texFrom(texFloor("#2a1414", "#3d1c1c", "#ff5a3c")), ceil: texFrom(texCeil("#170b0b", "#8a3526")), fog: 0.8 },
  { floor: texFrom(texFloor("#131a2a", "#1f2a44", "#a78bfa")), ceil: texFrom(texCeil("#0d1220", "#6d5bd0")), fog: 0.85 }
];

/* ================================================================ sprites */
function spriteFrom(draw) {
  const c = makeCanvas(64, 64), g = c.getContext("2d");
  draw(g);
  return { canvas: c, data: new Uint32Array(g.getImageData(0, 0, 64, 64).data.buffer) };
}
function circle(g, x, y, r, fill) { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function rrect(g, x, y, w, h, r, fill) {
  g.fillStyle = fill; g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.fill();
}

function drawVirus(g, f) {
  const cx = 32, cy = 36, R = f === 1 ? 16 : 15;
  g.strokeStyle = "#1d8a45"; g.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * TAU + (f === 1 ? 0.15 : 0);
    g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    g.lineTo(cx + Math.cos(a) * (R + 9), cy + Math.sin(a) * (R + 9)); g.stroke();
    circle(g, cx + Math.cos(a) * (R + 10), cy + Math.sin(a) * (R + 10), 3, "#8dff9f");
  }
  const grad = g.createRadialGradient(cx - 5, cy - 6, 2, cx, cy, R);
  grad.addColorStop(0, "#c6ffd2"); grad.addColorStop(0.5, "#34c35e"); grad.addColorStop(1, "#0b5e2b");
  circle(g, cx, cy, R, grad);
  circle(g, cx - 6, cy - 4, 4.5, "#fff"); circle(g, cx + 6, cy - 4, 4.5, "#fff");
  circle(g, cx - 5, cy - 3, 2.2, "#e02424"); circle(g, cx + 5, cy - 3, 2.2, "#e02424");
  g.strokeStyle = "#062d14"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(cx - 11, cy - 11); g.lineTo(cx - 2, cy - 7); g.moveTo(cx + 11, cy - 11); g.lineTo(cx + 2, cy - 7); g.stroke();
  if (f === 2) { circle(g, cx, cy + 7, 5, "#062d14"); circle(g, cx, cy + 7, 3, "#e8ff5a"); }
  else { g.beginPath(); g.moveTo(cx - 7, cy + 6); for (let i = 0; i <= 7; i++) g.lineTo(cx - 7 + i * 2, cy + 6 + (i % 2 ? 3 : 0)); g.stroke(); }
}
function drawWorm(g, f) {
  const phase = f === 1 ? Math.PI : 0;
  for (let i = 0; i < 6; i++) {
    const x = 32 + Math.sin(i * 1.1 + phase) * 7, y = 58 - i * 7, r = 8 - i * 0.4;
    circle(g, x, y, r, i % 2 ? "#7a3fc4" : "#9b5de5");
    circle(g, x - 2, y - 2, r * 0.35, "rgba(255,255,255,.35)");
  }
  const hx = 32 + Math.sin(6 * 1.1 + phase) * 7, hy = 14;
  circle(g, hx, hy, 10, "#c77dff");
  circle(g, hx - 4, hy - 2, 2.5, "#fff"); circle(g, hx + 4, hy - 2, 2.5, "#fff");
  circle(g, hx - 4, hy - 2, 1.2, "#111"); circle(g, hx + 4, hy - 2, 1.2, "#111");
  g.strokeStyle = "#3b1466"; g.lineWidth = 2;
  const open = f === 2 ? 5 : 2;
  g.beginPath(); g.moveTo(hx - 6, hy + 5); g.lineTo(hx - 2, hy + 5 + open); g.moveTo(hx + 6, hy + 5); g.lineTo(hx + 2, hy + 5 + open); g.stroke();
}
function drawTrojan(g, f) {
  g.fillStyle = "#4a3320"; g.fillRect(6, 50, 52, 6);
  for (const wx of [14, 50]) {
    circle(g, wx, 58, 6, "#2e2014"); circle(g, wx, 58, 2, "#c79a5a");
    g.strokeStyle = "#c79a5a"; g.lineWidth = 1; const a = f === 1 ? 0.8 : 0;
    g.beginPath(); g.moveTo(wx + Math.cos(a) * 5, 58 + Math.sin(a) * 5); g.lineTo(wx - Math.cos(a) * 5, 58 - Math.sin(a) * 5); g.stroke();
  }
  g.fillStyle = "#7c5230";
  for (const lx of [12, 20, 38, 46]) g.fillRect(lx, 36, 5, 15);
  rrect(g, 8, 22, 42, 18, 5, "#9c6b3c");
  g.strokeStyle = "#6b4526"; g.lineWidth = 1;
  for (let y = 27; y < 40; y += 5) { g.beginPath(); g.moveTo(10, y + .5); g.lineTo(48, y + .5); g.stroke(); }
  const dy = f === 2 ? 5 : 0;
  g.fillStyle = "#9c6b3c"; g.fillRect(38, 8 + dy, 10, 18);
  rrect(g, 38, 4 + dy, 22, 11, 3, "#a8743f");
  g.fillStyle = "#5a3a20"; g.fillRect(36, 4 + dy, 4, 16);             // mane
  g.beginPath(); g.moveTo(40, 5 + dy); g.lineTo(43, -1 + dy); g.lineTo(46, 5 + dy); g.fill();
  circle(g, 49, 8 + dy, 2.2, "#ff3030");
  if (f === 2) { g.fillStyle = "#300"; g.fillRect(50, 12 + dy, 10, 3); }
  g.fillStyle = "#5a3a20"; g.beginPath(); g.moveTo(8, 26); g.lineTo(1, 38); g.lineTo(6, 38); g.fill();  // tail
}
function drawGift(g) {
  g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(12, 60, 40, 3);
  rrect(g, 12, 28, 40, 32, 3, "#e23b5a");
  g.fillStyle = "#c22a48"; g.fillRect(12, 28, 40, 6);
  g.fillStyle = "#facc15"; g.fillRect(29, 28, 6, 32); g.fillRect(12, 40, 40, 5);
  g.strokeStyle = "#facc15"; g.lineWidth = 4;
  g.beginPath(); g.ellipse(25, 22, 7, 5, -0.4, 0, TAU); g.stroke();
  g.beginPath(); g.ellipse(39, 22, 7, 5, 0.4, 0, TAU); g.stroke();
  g.fillStyle = "#fff"; g.fillRect(14, 47, 14, 9);
  g.fillStyle = "#111"; g.font = "bold 7px sans-serif"; g.fillText("FREE", 14.5, 54);
}
function drawSpyware(g, f) {
  g.strokeStyle = "#8a93a3"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(32, 18); g.lineTo(32, 6); g.stroke();
  circle(g, 32, 5, 3, f === 1 ? "#ff4040" : "#661111");
  g.strokeStyle = "#aab4c3"; g.lineWidth = 3;                          // rotor arms
  const s = f === 1 ? 4 : -4;
  g.beginPath(); g.moveTo(8, 30 + s); g.lineTo(56, 30 - s); g.stroke();
  g.beginPath(); g.ellipse(32, 32, 19, 15, 0, 0, TAU); g.fillStyle = "#2b2f3a"; g.fill();
  g.beginPath(); g.ellipse(32, 32, 14, 10, 0, 0, TAU); g.fillStyle = "#f2f5f9"; g.fill();
  const px = f === 1 ? 3 : -2;
  circle(g, 32 + px, 32, 7, f === 2 ? "#ff3b3b" : "#26c6da");
  circle(g, 32 + px, 32, 3.5, "#05070a");
  circle(g, 30 + px, 30, 1.5, "#fff");
  g.fillStyle = "#2b2f3a"; g.fillRect(13, 22, 38, 3);                  // eyelid
}
function drawRansom(g, f) {
  const up = f === 1 ? 3 : 0;
  g.strokeStyle = "#aab4c3"; g.lineWidth = 6;
  g.beginPath(); g.arc(32, 24 - up, 12, Math.PI, 0); g.lineTo(44, 28); g.moveTo(20, 24 - up); g.lineTo(20, 28); g.stroke();
  rrect(g, 10, 26, 44, 34, 6, "#c62828");
  g.fillStyle = "#8e1b1b"; g.fillRect(10, 52, 44, 8);
  g.fillStyle = f === 2 ? "#ffe14a" : "#fff"; g.font = "bold 20px sans-serif"; g.fillText("$", 26, 48);
  g.fillStyle = "#ffd23f";
  g.beginPath(); g.moveTo(14, 32); g.lineTo(24, 35); g.lineTo(14, 37); g.fill();
  g.beginPath(); g.moveTo(50, 32); g.lineTo(40, 35); g.lineTo(50, 37); g.fill();
  g.fillStyle = "#fff";
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(13 + i * 6.5, 52); g.lineTo(16 + i * 6.5, f === 2 ? 58 : 56); g.lineTo(19 + i * 6.5, 52); g.fill(); }
}
function drawRootkit(g, f) {
  g.strokeStyle = "#6b7280"; g.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {                                         // spider-leg pins
    const y = 20 + i * 8, k = (i + f) % 2 ? 3 : -3;
    g.beginPath(); g.moveTo(12, y); g.lineTo(4, y + 8 + k); g.lineTo(2, 63); g.stroke();
    g.beginPath(); g.moveTo(52, y); g.lineTo(60, y + 8 - k); g.lineTo(62, 63); g.stroke();
  }
  rrect(g, 10, 12, 44, 40, 4, "#17171f");
  g.strokeStyle = "#50505e"; g.lineWidth = 1; g.strokeRect(12.5, 14.5, 39, 35);
  circle(g, 32, 29, 13, "#d9d9d9");
  g.fillStyle = "#d9d9d9"; g.fillRect(24, 34, 16, 10);
  const glow = f === 2 ? "#ffea00" : "#ff2d2d";
  circle(g, 27, 28, 3.8, "#111"); circle(g, 37, 28, 3.8, "#111");
  circle(g, 27, 28, 2, glow); circle(g, 37, 28, 2, glow);
  g.fillStyle = "#111"; g.beginPath(); g.moveTo(32, 32); g.lineTo(30, 36); g.lineTo(34, 36); g.fill();
  for (let i = 0; i < 4; i++) g.fillRect(25 + i * 4, 40, 2, 4);
  g.fillStyle = "#ff3b3b"; g.font = "bold 6px monospace"; g.fillText("ROOT", 25, 51);
  g.fillStyle = "#facc15";                                               // crown: it has admin rights
  g.beginPath(); g.moveTo(20, 13); g.lineTo(22, 4); g.lineTo(27, 9); g.lineTo(32, 2); g.lineTo(37, 9); g.lineTo(42, 4); g.lineTo(44, 13); g.fill();
}
function drawCorpse(colors) {
  return g => {
    const r = rng(colors.length * 7 + colors[0].length);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = colors[i % colors.length];
      const x = 10 + r() * 44, y = 50 + r() * 12, s = 2 + r() * 4;
      g.fillRect(x, y, s, s * 0.7);
    }
    g.fillStyle = colors[0]; g.font = "bold 6px monospace";
    g.fillText("010", 16, 56); g.fillText("11", 38, 60);
  };
}
function drawOrb(core, edge) {
  return g => {
    const grad = g.createRadialGradient(32, 32, 1, 32, 32, 14);
    grad.addColorStop(0, "#fff"); grad.addColorStop(0.35, core); grad.addColorStop(1, edge);
    circle(g, 32, 32, 14, grad);
  };
}
function drawSpark(g) {
  g.strokeStyle = "#fff7c2"; g.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(a) * 18, 32 + Math.sin(a) * 18); g.stroke();
  }
  circle(g, 32, 32, 7, "#ffd23f");
}
function drawBlood(g) {    // a hit on malware throws corrupted bits
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, d = 8 + (i % 3) * 5;
    g.fillStyle = i % 2 ? "#ff4d6d" : "#ffd23f";
    g.fillRect(32 + Math.cos(a) * d - 2, 32 + Math.sin(a) * d - 2, 4, 4);
  }
}
const ITEM_DRAW = {
  h: g => { rrect(g, 20, 42, 24, 20, 3, "#f2f5f9"); g.fillStyle = "#22c55e"; g.fillRect(29, 45, 6, 14); g.fillRect(25, 49, 14, 6); },
  H: g => {
    rrect(g, 14, 30, 36, 32, 4, "#2563eb"); g.fillStyle = "#1e40af"; g.fillRect(14, 30, 36, 6);
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(32, 38); g.lineTo(43, 49); g.lineTo(36, 49); g.lineTo(36, 58); g.lineTo(28, 58); g.lineTo(28, 49); g.lineTo(21, 49); g.fill();
  },
  f: g => {
    g.fillStyle = "#ff7a1a"; g.beginPath(); g.moveTo(32, 26); g.lineTo(50, 32); g.quadraticCurveTo(50, 54, 32, 63); g.quadraticCurveTo(14, 54, 14, 32); g.fill();
    g.strokeStyle = "#9a3412"; g.lineWidth = 1.5;
    for (let y = 37; y < 60; y += 6) { g.beginPath(); g.moveTo(16, y); g.lineTo(48, y); g.stroke(); }
    for (let y = 31; y < 58; y += 6) for (let x = (y % 12 ? 24 : 32); x < 46; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 6); g.stroke(); }
  },
  a: g => { rrect(g, 16, 44, 32, 18, 2, "#facc15"); g.fillStyle = "#1a1a1a"; g.font = "bold 10px monospace"; g.fillText("SIG", 21, 57); g.fillStyle = "#a16207"; g.fillRect(16, 44, 32, 3); },
  c: g => {
    rrect(g, 22, 38, 20, 25, 3, "#0e7490"); g.fillStyle = "#94a3b8"; g.fillRect(27, 34, 10, 4);
    g.fillStyle = "#67e8f9"; g.beginPath(); g.moveTo(34, 41); g.lineTo(27, 52); g.lineTo(32, 52); g.lineTo(29, 61); g.lineTo(37, 49); g.lineTo(32, 49); g.fill();
  },
  g: g => {
    g.fillStyle = "#2b2f36"; g.fillRect(6, 50, 44, 4); g.fillRect(6, 55, 44, 4);
    g.fillStyle = "#f97316"; g.fillRect(34, 48, 10, 13);
    g.fillStyle = "#7c4a1d"; g.fillRect(44, 50, 16, 10);
  },
  p: g => {
    rrect(g, 8, 44, 48, 16, 4, "#1e3a8a");
    for (let x = 14; x < 40; x += 7) { g.fillStyle = "#67e8f9"; g.fillRect(x, 44, 3, 16); }
    circle(g, 50, 52, 4, "#a5f3fc");
  },
  k: null, b: null, y: null, z: null
};
function drawKey(color) {
  return g => {
    rrect(g, 18, 42, 28, 19, 3, color);
    g.fillStyle = "#d8b24a"; g.fillRect(22, 46, 8, 7);
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(18, 56, 28, 3);
    g.fillStyle = "#fff"; g.fillRect(34, 46, 8, 2); g.fillRect(34, 50, 6, 2);
  };
}
ITEM_DRAW.k = drawKey("#e04a4a"); ITEM_DRAW.b = drawKey("#3b82f6"); ITEM_DRAW.y = drawKey("#facc15");

function drawAdware(g, f) {          // a pop-up window that will not close
  rrect(g, 6, 10, 52, 42, 3, "#f8fafc");
  g.fillStyle = f === 1 ? "#f59e0b" : "#e11d48"; g.fillRect(6, 10, 52, 9);
  g.fillStyle = "#fff"; g.fillRect(48, 12, 7, 5);
  g.strokeStyle = "#e11d48"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(49, 12.5); g.lineTo(54, 16.5); g.moveTo(54, 12.5); g.lineTo(49, 16.5); g.stroke();
  g.fillStyle = f === 2 ? "#facc15" : f === 1 ? "#e11d48" : "#2563eb"; g.font = "bold 17px sans-serif"; g.fillText(f === 2 ? "WIN!" : "AD", f === 2 ? 11 : 20, 38);
  g.fillStyle = "#16a34a"; g.fillRect(14, 42, 36, 7);
  g.fillStyle = "#fff"; g.font = "bold 6px sans-serif"; g.fillText("CLICK HERE", 17, 47.5);
  g.fillStyle = "#111"; g.beginPath(); g.moveTo(44, 44); g.lineTo(44, 58); g.lineTo(47.5, 54.5); g.lineTo(50.5, 60); g.lineTo(52.5, 59); g.lineTo(49.5, 53.5); g.lineTo(54, 53); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.moveTo(45, 46.5); g.lineTo(45, 55.5); g.lineTo(47.8, 52.8); g.lineTo(50.8, 58.3); g.lineTo(51.4, 58); g.lineTo(48.5, 52.5); g.lineTo(51.7, 52.2); g.fill();
}
function drawKeylogger(g, f) {       // a keyboard that watches you type
  g.strokeStyle = "#475569"; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 26); g.bezierCurveTo(34, 12, 50, 18, 56, 6); g.stroke();
  rrect(g, 6, 26, 52, 28, 4, "#374151");
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const hot = f === 2 || (f === 1 && (r * 9 + c) % 7 === 3);
    g.fillStyle = hot ? "#f87171" : "#e5e7eb";
    g.fillRect(9 + c * 5.4 + (r % 2) * 1.5, 29 + r * 6, 4, 4);
  }
  rrect(g, 20, 14, 24, 13, 5, "#64748b");
  circle(g, 27, 20, 3.5, "#fff"); circle(g, 37, 20, 3.5, "#fff");
  circle(g, 27 + (f === 1 ? 1 : 0), 20.5, 2, f === 2 ? "#ef4444" : "#0f172a"); circle(g, 37 + (f === 1 ? 1 : 0), 20.5, 2, f === 2 ? "#ef4444" : "#0f172a");
  g.fillStyle = "#374151"; g.fillRect(f === 1 ? 10 : 12, 54, 5, 9); g.fillRect(f === 1 ? 49 : 47, 54, 5, 9);
}
function drawBot(g, f) {             // one small drone in a botnet
  g.strokeStyle = "#94a3b8"; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 22); g.lineTo(32, 10); g.stroke();
  circle(g, 32, 9, 3, f === 1 ? "#ef4444" : "#7f1d1d");
  g.strokeStyle = "#cbd5e1"; g.lineWidth = 3; g.beginPath();
  g.moveTo(f === 1 ? 14 : 18, 12); g.lineTo(f === 1 ? 50 : 46, 12); g.stroke();
  circle(g, 32, 36, 15, "#64748b");
  circle(g, 28, 32, 5, "rgba(255,255,255,.18)");
  rrect(g, 18, 31, 28, 9, 4, "#0f172a");
  const ex = f === 1 ? 5 : -3;
  circle(g, 32 + ex, 35.5, f === 2 ? 4.5 : 3.5, f === 2 ? "#ff3b3b" : "#ef4444");
  g.fillStyle = "#475569"; g.fillRect(24, 50, 4, 8); g.fillRect(36, 50, 4, 8);
  g.fillStyle = "#e2e8f0"; g.font = "bold 5px monospace"; g.fillText("BOT", 27, 47);
}
function drawFileless(g, f) {        // a ghost that lives only in memory
  const grad = g.createLinearGradient(0, 8, 0, 60);
  grad.addColorStop(0, "#c4b5fd"); grad.addColorStop(1, "rgba(139,92,246,.75)");
  g.fillStyle = grad; g.beginPath();
  g.moveTo(12, 58); g.lineTo(12, 30); g.arc(32, 30, 20, Math.PI, 0); g.lineTo(52, 58);
  const w = f === 1 ? 1 : 0;
  for (let i = 0; i < 4; i++) { const x = 52 - i * 10; g.lineTo(x - 5, w ^ (i & 1) ? 52 : 60); g.lineTo(x - 10, 58); }
  g.fill();
  circle(g, 25, 28, 5, "#fff"); circle(g, 39, 28, 5, "#fff");
  circle(g, 26, 29, 2.5, f === 2 ? "#ef4444" : "#1e1b4b"); circle(g, 40, 29, 2.5, f === 2 ? "#ef4444" : "#1e1b4b");
  g.fillStyle = "#15803d"; g.fillRect(12, 38, 40, 10);                       // a RAM stick for a belt
  g.fillStyle = "#111"; for (let i = 0; i < 4; i++) g.fillRect(15 + i * 9, 39.5, 6, 6);
  g.fillStyle = "#d8b24a"; for (let i = 0; i < 12; i++) g.fillRect(13 + i * 3.3, 46, 2, 2);
}
function drawWiper(g, f) {           // a hard disk that erases itself and you
  rrect(g, 8, 10, 48, 50, 4, "#9ca3af");
  g.fillStyle = "#6b7280"; g.fillRect(8, 10, 48, 5);
  circle(g, 31, 36, 18, "#e2e8f0");
  g.strokeStyle = "#94a3b8"; g.lineWidth = 1;
  for (const r of [7, 11, 15]) { g.beginPath(); g.arc(31, 36, r, 0, TAU); g.stroke(); }
  circle(g, 31, 36, 3, "#475569");
  const a = f === 1 ? -2.2 : -2.6;                                          // the read/write arm, sweeping
  g.strokeStyle = "#dc2626"; g.lineWidth = 3; g.lineCap = "round";
  g.beginPath(); g.moveTo(50, 54); g.lineTo(50 + Math.cos(a) * 26, 54 + Math.sin(a) * 26); g.stroke();
  circle(g, 50, 54, 4, "#7f1d1d");
  if (f === 2) for (let i = 0; i < 6; i++) { g.fillStyle = "#fde047"; g.fillRect(20 + i * 4, 30 + (i % 2) * 8, 2, 2); }
  g.fillStyle = "#b91c1c";
  g.beginPath(); g.moveTo(16, 18); g.lineTo(26, 21); g.lineTo(16, 24); g.fill();
  g.beginPath(); g.moveTo(46, 18); g.lineTo(36, 21); g.lineTo(46, 24); g.fill();
  g.fillStyle = "#111"; g.font = "bold 6px monospace"; g.fillText("ERASE", 12, 58);
}
function drawMobile(g, f) {          // a phone with a bad app
  g.fillStyle = "#111827"; g.fillRect(f === 1 ? 21 : 23, 54, 4, 9); g.fillRect(f === 1 ? 39 : 37, 54, 4, 9);
  rrect(g, 18, 6, 28, 50, 5, "#111827");
  g.fillStyle = f === 2 ? "#7f1d1d" : "#0ea5e9"; g.fillRect(21, 12, 22, 38);
  g.fillStyle = "#1f2937"; g.fillRect(28, 8, 8, 2);
  circle(g, 32, 26, 7, "#f8fafc");
  g.fillStyle = "#f8fafc"; g.fillRect(28, 30, 8, 5);
  circle(g, 29.5, 26, 2, "#111827"); circle(g, 34.5, 26, 2, "#111827");
  g.fillStyle = "#111827"; for (let i = 0; i < 3; i++) g.fillRect(29 + i * 2.5, 32, 1, 3);
  g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 1;                  // cracked screen
  g.beginPath(); g.moveTo(22, 40); g.lineTo(30, 44); g.lineTo(27, 49); g.moveTo(30, 44); g.lineTo(41, 41); g.stroke();
  g.fillStyle = "#f8fafc"; g.font = "bold 5px sans-serif"; g.fillText("APP", 28, 20);
}

function drawLoveBug(g, f) {         // ILOVEYOU: a love letter with a worm for a tail
  for (let i = 0; i < 4; i++) circle(g, 32 + Math.sin(i + f) * 6, 60 - i * 3, 5 - i * 0.6, i % 2 ? "#be185d" : "#db2777");
  const s = f === 1 ? 1.04 : 1;
  g.save(); g.translate(32, 32); g.scale(s, s); g.translate(-32, -32);
  g.fillStyle = "#f472b6"; g.beginPath();
  g.moveTo(32, 56); g.bezierCurveTo(6, 40, 2, 22, 16, 14); g.bezierCurveTo(24, 9, 30, 14, 32, 20);
  g.bezierCurveTo(34, 14, 40, 9, 48, 14); g.bezierCurveTo(62, 22, 58, 40, 32, 56); g.fill();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(20, 22, 5, 3, -0.6, 0, TAU); g.fill();
  g.restore();
  rrect(g, 20, 26, 24, 16, 2, "#fdf2f8");                                    // the envelope face
  g.strokeStyle = "#be185d"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(20, 26); g.lineTo(32, 35); g.lineTo(44, 26); g.stroke();
  circle(g, 26, 31, 2.2, f === 2 ? "#ef4444" : "#831843"); circle(g, 38, 31, 2.2, f === 2 ? "#ef4444" : "#831843");
  if (f === 2) circle(g, 32, 39, 2.5, "#831843");
  g.fillStyle = "#831843"; g.font = "bold 5px monospace"; g.fillText("LOVE-LETTER.vbs", 12, 50);
}
function drawWannaCry(g, f) {        // WannaCry: a crying padlock asking for $300
  g.strokeStyle = "#9ca3af"; g.lineWidth = 7;
  g.beginPath(); g.arc(32, 22, 13, Math.PI, 0); g.lineTo(45, 28); g.moveTo(19, 22); g.lineTo(19, 28); g.stroke();
  rrect(g, 8, 26, 48, 34, 6, "#b91c1c");
  g.fillStyle = "#7f1d1d"; g.fillRect(8, 52, 48, 8);
  g.fillStyle = "#fff"; g.beginPath(); g.ellipse(23, 36, 6, 4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(41, 36, 6, 4, 0, 0, TAU); g.fill();
  circle(g, 23, 37, 2.2, "#111"); circle(g, 41, 37, 2.2, "#111");
  g.strokeStyle = "#111"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(16, 31); g.lineTo(28, 33); g.moveTo(48, 31); g.lineTo(36, 33); g.stroke();
  const drop = f === 1 ? 6 : 0;                                              // tears
  g.fillStyle = "#60a5fa";
  for (const x of [21, 43]) { g.beginPath(); g.moveTo(x, 40 + drop); g.quadraticCurveTo(x - 3, 45 + drop, x, 47 + drop); g.quadraticCurveTo(x + 3, 45 + drop, x, 40 + drop); g.fill(); }
  g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath();
  if (f === 2) g.ellipse(32, 48, 5, 3, 0, 0, TAU); else g.arc(32, 51, 5, 1.15 * Math.PI, 1.85 * Math.PI);
  g.stroke();
  rrect(g, 44, 4, 18, 11, 2, "#facc15");                                     // the ransom tag
  g.fillStyle = "#111"; g.font = "bold 7px sans-serif"; g.fillText("$300", 45.5, 12.5);
  g.strokeStyle = "#facc15"; g.lineWidth = 1; g.beginPath(); g.moveTo(47, 15); g.lineTo(42, 22); g.stroke();
}
function drawBackup(g) {             // an external backup drive
  rrect(g, 16, 36, 32, 26, 3, "#475569");
  g.fillStyle = "#334155"; g.fillRect(16, 36, 32, 5);
  circle(g, 42, 55, 2, "#38bdf8");
  g.fillStyle = "#e2e8f0"; g.font = "bold 6px monospace"; g.fillText("BACKUP", 20, 50);
  g.strokeStyle = "#94a3b8"; g.lineWidth = 2; g.beginPath(); g.moveTo(24, 36); g.quadraticCurveTo(24, 26, 34, 28); g.stroke();
}
ITEM_DRAW.z = drawBackup;

/* Monsters. hp and dmg are per shot; keep is how close a shooter likes to get. */
const ENEMY = {
  v: { key: "virus", draw: drawVirus, hp: 30, speed: 1.5, radius: 0.3, scale: 0.62, z: 0, dmg: [5, 10], cool: 1.8, range: 12, keep: 3.5, shot: "green", shotSpeed: 6, corpse: ["#34c35e", "#8dff9f", "#0b5e2b"] },
  w: { key: "worm", draw: drawWorm, hp: 22, speed: 2.7, radius: 0.28, scale: 0.55, z: 0, dmg: [6, 11], cool: 0.8, range: 0.95, melee: true, corpse: ["#9b5de5", "#c77dff", "#3b1466"] },
  t: { key: "trojan", draw: drawTrojan, hp: 90, speed: 1.8, radius: 0.36, scale: 0.8, z: 0, dmg: [14, 22], cool: 1.1, range: 1.05, melee: true, corpse: ["#9c6b3c", "#5a3a20", "#ff3030"] },
  s: { key: "spyware", draw: drawSpyware, hp: 18, speed: 2.3, radius: 0.26, scale: 0.45, z: 0.3, dmg: [3, 6], cool: 1.0, range: 10, keep: 4, shot: "cyan", shotSpeed: 9, corpse: ["#2b2f3a", "#26c6da", "#f2f5f9"] },
  r: { key: "ransomware", draw: drawRansom, hp: 100, speed: 1.1, radius: 0.36, scale: 0.72, z: 0, dmg: [10, 16], cool: 2.2, range: 12, keep: 4, shot: "red", shotSpeed: 7, steals: true, corpse: ["#c62828", "#ffd23f", "#aab4c3"] },
  d: { key: "adware", draw: drawAdware, hp: 40, speed: 1.2, radius: 0.32, scale: 0.6, z: 0.15, dmg: [3, 6], cool: 1.6, range: 11, keep: 4, shot: "pink", shotSpeed: 6, popups: true, corpse: ["#f8fafc", "#e11d48", "#2563eb"] },
  l: { key: "keylogger", draw: drawKeylogger, hp: 25, speed: 2.0, radius: 0.3, scale: 0.5, z: 0, dmg: [2, 4], cool: 1.5, range: 9, keep: 6, shot: "cyan", shotSpeed: 8, reports: true, corpse: ["#374151", "#e5e7eb", "#f87171"] },
  n: { key: "bot", draw: drawBot, hp: 12, speed: 2.6, radius: 0.2, scale: 0.36, z: 0.25, dmg: [2, 4], cool: 0.9, range: 9, keep: 2.5, shot: "red", shotSpeed: 8, swarm: true, corpse: ["#64748b", "#ef4444", "#0f172a"] },
  m: { key: "fileless", draw: drawFileless, hp: 45, speed: 1.9, radius: 0.3, scale: 0.6, z: 0.1, dmg: [6, 10], cool: 1.4, range: 10, keep: 3, shot: "purple", shotSpeed: 7, fileless: true, corpse: ["#c4b5fd"] },
  x: { key: "wiper", draw: drawWiper, hp: 130, speed: 1.0, radius: 0.38, scale: 0.78, z: 0, dmg: [12, 18], cool: 2.4, range: 11, keep: 3.5, shot: "void", shotSpeed: 6, wipes: true, corpse: ["#9ca3af", "#e2e8f0", "#dc2626"] },
  o: { key: "mobile", draw: drawMobile, hp: 24, speed: 3.0, radius: 0.26, scale: 0.48, z: 0, dmg: [5, 9], cool: 0.8, range: 1.0, melee: true, corpse: ["#111827", "#0ea5e9", "#f8fafc"] },
  L: { key: "worm", draw: drawLoveBug, hp: 360, speed: 1.3, radius: 0.5, scale: 1.1, z: 0, dmg: [6, 10], cool: 1.3, range: 14, keep: 4, shot: "pink", shotSpeed: 7, spread: 3, boss: true, specimen: "ILOVEYOU", splits: true, corpse: ["#f472b6", "#fdf2f8", "#831843"] },
  W: { key: "ransomware", draw: drawWannaCry, hp: 750, speed: 1.0, radius: 0.55, scale: 1.25, z: 0, dmg: [8, 12], cool: 1.8, range: 16, keep: 4.5, shot: "red", shotSpeed: 7, spread: 3, boss: true, specimen: "WannaCry", steals: true, ransomNote: true, corpse: ["#b91c1c", "#facc15", "#60a5fa"] },
  K: { key: "rootkit", draw: drawRootkit, hp: 1400, speed: 0.9, radius: 0.6, scale: 1.35, z: 0, dmg: [7, 11], cool: 1.7, range: 20, keep: 5, shot: "purple", shotSpeed: 7, spread: 5, boss: true, specimen: "Stuxnet", summons: true, corpse: ["#17171f", "#d9d9d9", "#ff2d2d"] }
};
const SPR = { item: {}, shot: {}, enemy: {} };
for (const [ch, def] of Object.entries(ENEMY)) {
  SPR.enemy[ch] = [0, 1, 2].map(f => spriteFrom(g => def.draw(g, f)));
  SPR.enemy[ch].corpse = spriteFrom(drawCorpse(def.corpse));
}
SPR.gift = spriteFrom(drawGift);
for (const ch in ITEM_DRAW) SPR.item[ch] = spriteFrom(ITEM_DRAW[ch]);
SPR.shot.green = spriteFrom(drawOrb("#7dff9b", "rgba(20,160,60,0)"));
SPR.shot.cyan = spriteFrom(drawOrb("#7de8ff", "rgba(20,140,200,0)"));
SPR.shot.red = spriteFrom(drawOrb("#ff6b6b", "rgba(200,30,30,0)"));
SPR.shot.purple = spriteFrom(drawOrb("#d08bff", "rgba(120,30,200,0)"));
SPR.shot.player = spriteFrom(drawOrb("#a5f3fc", "rgba(40,120,255,0)"));
SPR.spark = spriteFrom(drawSpark);
SPR.bits = spriteFrom(drawBlood);

/* Each real virus from the timeline gets its own design, taken from its history.
   Viruses without an entry here use the generic green one above. */
function drawElkCloner(g, f) {       // 1982: an Apple II floppy disk with antlers
  g.strokeStyle = "#c8a36a"; g.lineWidth = 3; g.lineCap = "round";
  const tilt = f === 1 ? 3 : 0;
  for (const s of [-1, 1]) {
    const bx = 32 + s * 12;
    g.beginPath();
    g.moveTo(bx, 16); g.lineTo(bx + s * (8 + tilt), 4);
    g.moveTo(bx + s * 4, 10); g.lineTo(bx + s * 14, 10 - tilt);
    g.moveTo(bx + s * 6, 7); g.lineTo(bx + s * 4, 1);
    g.stroke();
  }
  rrect(g, 10, 14, 44, 42, 3, "#1b1f1a");
  g.strokeStyle = "#39ff6a"; g.lineWidth = 1.5; g.strokeRect(11.5, 15.5, 41, 39);
  g.fillStyle = "#d9f7d0"; g.fillRect(16, 18, 32, 8);
  g.fillStyle = "#135c26"; g.font = "bold 7px monospace"; g.fillText("ELK", 26, 25);
  circle(g, 32, 46, 6, "#39ff6a"); circle(g, 32, 46, 4, "#0a0c0a");
  g.fillStyle = "#0a0c0a"; g.fillRect(49, 30, 5, 5);                     // write-protect notch
  const eye = f === 2 ? "#eaffea" : "#39ff6a";                           // blocky Apple II pixels
  g.fillStyle = eye; g.fillRect(19, 30, 7, 7); g.fillRect(38, 30, 7, 7);
  g.fillStyle = "#000"; g.fillRect(22, 33, 3, 3); g.fillRect(39, 33, 3, 3);
  if (f === 2) { g.fillStyle = "#39ff6a"; g.fillRect(24, 38, 16, 3); }
  g.fillStyle = "#1b1f1a";
  g.fillRect(f === 1 ? 18 : 20, 56, 6, 7); g.fillRect(f === 1 ? 42 : 40, 56, 6, 7);
}
function drawBrain(g, f) {           // 1986: Brain, a creature with a real brain
  g.strokeStyle = "#c2587f"; g.lineWidth = 3; g.lineCap = "round";
  for (const s of [-1, 1]) {                                            // tentacles
    g.beginPath(); g.moveTo(32 + s * 6, 46);
    g.quadraticCurveTo(32 + s * (f === 1 ? 20 : 12), 54, 32 + s * 14, 63); g.stroke();
  }
  g.fillStyle = "#e47aa8"; g.fillRect(29, 44, 6, 19);                    // stem
  g.beginPath(); g.ellipse(24, 30, 15, 16, 0, 0, TAU); g.fillStyle = "#f49ac1"; g.fill();
  g.beginPath(); g.ellipse(40, 30, 15, 16, 0, 0, TAU); g.fill();
  g.strokeStyle = "#c2587f"; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(32, 15); g.lineTo(32, 44); g.stroke();       // the two halves
  for (const [x, y, r, a] of [[20, 20, 6, 0.4], [44, 20, 6, 2.2], [15, 32, 5, -0.9], [49, 32, 5, 3.6], [22, 42, 5, 2.8], [42, 42, 5, 0.2]]) {
    g.beginPath(); g.arc(x, y, r, a, a + Math.PI * 1.2); g.stroke();
  }
  const px = f === 1 ? 1.5 : 0;
  circle(g, 25, 32, 5.5, "#fff"); circle(g, 39, 32, 5.5, "#fff");
  circle(g, 25 + px, 33, 2.6, "#401024"); circle(g, 39 + px, 33, 2.6, "#401024");
  if (f === 2) {                                                         // thinking very hard
    g.strokeStyle = "#ffe14a"; g.lineWidth = 2;
    for (const [x1, y1, x2, y2] of [[8, 10, 3, 4], [56, 10, 61, 4], [4, 26, 0, 24], [60, 26, 64, 24]]) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
    circle(g, 32, 41, 3, "#401024");
  }
  g.fillStyle = "#8c2f57"; g.font = "bold 5px monospace"; g.fillText("(c)BRAIN", 20, 24);
}
function drawMichelangelo(g, f) {    // 1992: a marble sculpture that goes off on 6 March
  rrect(g, 20, 54, 24, 9, 1, "#d6d3cb");                                 // plinth
  g.fillStyle = "#b7b3a8"; g.fillRect(20, 54, 24, 2);
  const paints = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#9b5de5", "#ffd166"];
  g.strokeStyle = "#8d8a80"; g.lineWidth = 2.5; g.lineCap = "round";
  for (let i = 0; i < 6; i++) {                                          // paintbrush spikes
    const a = -Math.PI / 2 + (i - 2.5) * 0.55 + (f === 1 ? 0.08 : 0);
    g.beginPath(); g.moveTo(32 + Math.cos(a) * 15, 34 + Math.sin(a) * 15);
    g.lineTo(32 + Math.cos(a) * 25, 34 + Math.sin(a) * 25); g.stroke();
    circle(g, 32 + Math.cos(a) * 26, 34 + Math.sin(a) * 26, 3, paints[i]);
  }
  const grad = g.createRadialGradient(26, 26, 2, 32, 34, 18);
  grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.6, "#e7e4dc"); grad.addColorStop(1, "#a9a69c");
  circle(g, 32, 36, 17, grad);
  g.strokeStyle = "rgba(120,115,105,.55)"; g.lineWidth = 1;              // marble veins
  g.beginPath(); g.moveTo(18, 30); g.bezierCurveTo(24, 36, 20, 42, 28, 50); g.stroke();
  g.beginPath(); g.moveTo(42, 22); g.bezierCurveTo(38, 30, 46, 34, 44, 46); g.stroke();
  for (let i = 0; i < 9; i++) {                                          // laurel wreath
    const a = Math.PI + i * (Math.PI / 8);
    g.save(); g.translate(32 + Math.cos(a) * 16, 36 + Math.sin(a) * 16); g.rotate(a + Math.PI / 2);
    g.beginPath(); g.ellipse(0, 0, 4, 2, 0, 0, TAU); g.fillStyle = i % 2 ? "#6b8e23" : "#556b2f"; g.fill(); g.restore();
  }
  const eye = f === 2 ? "#ff3b3b" : "#8d8a80";                           // blank statue eyes
  g.beginPath(); g.ellipse(26, 34, 3.5, 2.5, 0, 0, TAU); g.fillStyle = eye; g.fill();
  g.beginPath(); g.ellipse(38, 34, 3.5, 2.5, 0, 0, TAU); g.fill();
  g.fillStyle = "#fff"; g.fillRect(34, 40, 14, 13);                      // the calendar page
  g.fillStyle = "#e63946"; g.fillRect(34, 40, 14, 4);
  g.fillStyle = "#fff"; g.font = "bold 4px sans-serif"; g.fillText("MAR", 36, 43.5);
  g.fillStyle = "#111"; g.font = "bold 8px sans-serif"; g.fillText("6", 38.5, 52);
}
function drawCIH(g, f) {             // 1998: CIH / Chernobyl, which wiped the BIOS chip
  if (f !== 0) { circle(g, 32, 28, f === 2 ? 25 : 22, f === 2 ? "rgba(190,242,100,.55)" : "rgba(190,242,100,.3)"); }
  g.strokeStyle = "#9aa3ad"; g.lineWidth = 2;
  for (let i = 0; i < 4; i++) {                                          // chip pins as legs
    const x = 20 + i * 8, k = (i + f) % 2 ? 2 : 0;
    g.beginPath(); g.moveTo(x, 50); g.lineTo(x - 2, 58 + k); g.lineTo(x - 3, 63); g.stroke();
  }
  rrect(g, 14, 42, 36, 10, 2, "#111318");
  g.fillStyle = "#e5e7eb"; g.font = "bold 7px monospace"; g.fillText("BIOS", 24, 50);
  circle(g, 32, 26, 17, "#facc15");
  g.strokeStyle = "#111"; g.lineWidth = 1.5; g.beginPath(); g.arc(32, 26, 17, 0, TAU); g.stroke();
  g.fillStyle = "#111";                                                  // radiation trefoil
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + i * TAU / 3;
    g.beginPath(); g.moveTo(32, 30); g.arc(32, 30, 10, a - 0.5, a + 0.5); g.closePath(); g.fill();
  }
  circle(g, 32, 30, 3, "#facc15"); circle(g, 32, 30, 2, "#111");
  g.fillStyle = f === 2 ? "#ff2d2d" : "#b91c1c";                         // eyes, in the gaps
  g.beginPath(); g.moveTo(21, 20); g.lineTo(28, 22); g.lineTo(21, 24); g.fill();
  g.beginPath(); g.moveTo(43, 20); g.lineTo(36, 22); g.lineTo(43, 24); g.fill();
}
function drawMelissa(g, f) {         // 1999: a Word document that mails itself to 50 people
  const flap = f === 1 ? -4 : 2;
  for (const s of [-1, 1]) {                                             // envelope wings
    const x = s < 0 ? 1 : 49;
    g.save(); g.translate(x + 7, 30); g.rotate(s * (f === 1 ? -0.35 : 0.15));
    g.fillStyle = "#e2e8f0"; g.fillRect(-7, -5 + flap, 14, 10);
    g.strokeStyle = "#64748b"; g.lineWidth = 1;
    g.strokeRect(-6.5, -4.5 + flap, 13, 9);
    g.beginPath(); g.moveTo(-6.5, -4.5 + flap); g.lineTo(0, 1 + flap); g.lineTo(6.5, -4.5 + flap); g.stroke();
    g.restore();
  }
  g.fillStyle = "#f8fafc"; g.beginPath();
  g.moveTo(16, 10); g.lineTo(40, 10); g.lineTo(48, 18); g.lineTo(48, 54); g.lineTo(16, 54); g.closePath(); g.fill();
  g.fillStyle = "#cbd5e1"; g.beginPath(); g.moveTo(40, 10); g.lineTo(40, 18); g.lineTo(48, 18); g.fill();
  g.fillStyle = "#2b579a"; g.fillRect(16, 10, 16, 14);
  g.fillStyle = "#fff"; g.font = "bold 12px sans-serif"; g.fillText("W", 18, 22);
  g.fillStyle = "#94a3b8";
  for (let y = 40; y < 52; y += 4) g.fillRect(20, y, 24 - (y % 8), 2);
  g.fillStyle = "#1e293b";
  circle(g, 26, 31, 2.5, "#1e293b"); circle(g, 38, 31, 2.5, "#1e293b");
  g.fillRect(21, 25, 8, 1.5); g.fillRect(35, 25, 8, 1.5);
  if (f === 2) { g.fillStyle = "#1e293b"; g.fillRect(28, 35, 8, 4); g.fillStyle = "#2b579a"; g.font = "bold 7px sans-serif"; g.fillText("@", 29, 39); }
  g.strokeStyle = "#2b579a"; g.lineWidth = 2;                            // { } macro legs
  g.beginPath(); g.moveTo(24, 54); g.lineTo(f === 1 ? 20 : 22, 63); g.moveTo(40, 54); g.lineTo(f === 1 ? 44 : 42, 63); g.stroke();
}
function drawEnvelope(g) {
  g.fillStyle = "#f8fafc"; g.fillRect(14, 20, 36, 24);
  g.strokeStyle = "#2b579a"; g.lineWidth = 3; g.strokeRect(15.5, 21.5, 33, 21);
  g.beginPath(); g.moveTo(15, 21); g.lineTo(32, 35); g.lineTo(49, 21); g.stroke();
}
const VARIANTS = {
  "Elk Cloner":      { draw: drawElkCloner,    shot: "green",  corpse: ["#1b1f1a", "#39ff6a", "#c8a36a"] },
  "Brain":           { draw: drawBrain,        shot: "pink",   corpse: ["#f49ac1", "#c2587f", "#fff"] },
  "Michelangelo":    { draw: drawMichelangelo, shot: "paint",  corpse: ["#e7e4dc", "#e63946", "#457b9d", "#6b8e23"] },
  "CIH (Chernobyl)": { draw: drawCIH,          shot: "lime",   corpse: ["#facc15", "#111318", "#bef264"] },
  "Melissa":         { draw: drawMelissa,      shot: "mail",   corpse: ["#f8fafc", "#2b579a", "#94a3b8"] }
};
SPR.shot.void = spriteFrom(drawOrb("#e5e7eb", "rgba(30,41,59,0)"));
SPR.shot.pink = spriteFrom(drawOrb("#ff9cc8", "rgba(220,60,140,0)"));
SPR.shot.paint = spriteFrom(drawOrb("#ffd166", "rgba(230,57,70,0)"));
SPR.shot.lime = spriteFrom(drawOrb("#d9f99d", "rgba(132,204,22,0)"));
SPR.shot.mail = spriteFrom(drawEnvelope);
SPR.variant = {};
for (const [name, v] of Object.entries(VARIANTS)) {
  SPR.variant[name] = [0, 1, 2].map(f => spriteFrom(g => v.draw(g, f)));
  SPR.variant[name].corpse = spriteFrom(drawCorpse(v.corpse));
}
const spritesFor = e => SPR.variant[e.hist.name] || SPR.enemy[e.ch];

const WEAPONS = [
  { key: "scanner", ammo: null, cool: 0.38, pellets: 1, spread: 0.012, dmg: [10, 18], sound: "scanner" },
  { key: "filter", ammo: "sig", cool: 0.85, pellets: 7, spread: 0.075, dmg: [6, 12], sound: "filter" },
  { key: "cannon", ammo: "cells", cool: 0.11, projectile: true, dmg: [16, 24], speed: 16, sound: "cannon" }
];
const AMMO_MAX = { sig: 50, cells: 300 };

/* ================================================================== level */
const screen = $("fw-screen"), sctx = screen.getContext("2d");
const view = makeCanvas(W, H), vctx = view.getContext("2d");
const frame = vctx.createImageData(W, H);
const pix = new Uint32Array(frame.data.buffer);
const zbuf = new Float32Array(W);

let levelIndex = 0, map = [], mapW = 0, mapH = 0, doors = new Map(), seen = null, look = null, vulns = [];
let mode = "campaign", survival = null;
let enemies = [], items = [], shots = [], puffs = [];
let player = null, levelStart = null, stats = null, flow = null, flowTimer = 0, flowTile = -1;
let state = "menu", showMap = false, messages = [], screenFlash = { color: "", t: 0 }, popups = [];
let progress = load(PROGRESS_KEY, { unlocked: 1, best: {} });
let intel = new Set(load(INTEL_KEY, []));
let removed = new Set(load(REMOVED_KEY, []));
const identified = new Set();            // kinds scanned this session: the scanner knows their signature
let scan = { e: null, t: 0 }, mail = null, quiz = null;
const SCAN_TIME = 0.9;
let mailDeck = [];
function nextEmail() {
  if (!mailDeck.length) mailDeck = FW_EMAILS.map((m, i) => i).sort(() => Math.random() - 0.5);
  return FW_EMAILS[mailDeck.pop()];
}
const shownThisSession = new Set();

function defaultLoadout(i) {
  return {
    hp: 100, armor: 0,
    weapons: [true, i >= 1, i >= 2],
    ammo: { sig: i >= 1 ? 16 : 0, cells: i >= 2 ? 60 : 0 },
    cur: i >= 2 ? 2 : i >= 1 ? 1 : 0
  };
}
function snapshot(p) {
  return { hp: p.hp, armor: p.armor, weapons: p.weapons.slice(), ammo: { ...p.ammo }, cur: p.cur };
}

function loadLevel(i, loadout) {
  levelIndex = i; mode = "campaign";
  loadMap(FW_LEVELS[i], LEVEL_LOOK[i] || LEVEL_LOOK[0], loadout);
}
function loadMap(L, lookSet, loadout) {
  look = lookSet;
  map = L.map.map(r => r.split(""));
  mapH = map.length; mapW = map[0].length;
  doors = new Map(); enemies = []; items = []; shots = []; puffs = []; messages = []; popups = [];
  seen = new Uint8Array(mapW * mapH);
  levelStart = snapshot(loadout);
  player = Object.assign({ x: 1.5, y: 1.5, a: 0, keys: {}, cool: 0, fireT: 0, bob: 0, hurtT: 0, grinT: 0, look: 0, lookT: 0, moving: false,
                           hits: [], backup: false, dmgMul: 1, coolMul: 1 }, snapshot(loadout));
  vulns = [];
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      const c = map[y][x];
      if ("DRBY".includes(c)) doors.set(y * mapW + x, { x, y, open: 0, state: 0, timer: 0, lock: c === "D" ? null : c });
      else if (c === "P") { player.x = x + 0.5; player.y = y + 0.5; map[y][x] = "."; }
      else if (c === "U") vulns.push({ x, y, t: 3, told: false });
      else if (c === "n") { for (const [ox, oy] of [[0, -0.25], [-0.25, 0.2], [0.25, 0.2]]) spawnEnemy(c, x + 0.5 + ox, y + 0.5 + oy); map[y][x] = "."; }
      else if (ENEMY[c]) { spawnEnemy(c, x + 0.5, y + 0.5); map[y][x] = "."; }
      else if (ITEM_DRAW[c]) { items.push({ ch: c, x: x + 0.5, y: y + 0.5, taken: false }); map[y][x] = "."; }
    }
  }
  player.a = facingOpen(player.x, player.y);
  stats = { kills: 0, total: enemies.length, items: 0, itemTotal: items.length, time: 0,
            phishOk: 0, phishTotal: map.reduce((n, r) => n + r.filter(c => c === "M").length, 0), quizOk: 0, quizTotal: 0,
            patched: 0, patchTotal: vulns.length };
  scan = { e: null, t: 0 };
  flow = null; flowTile = -1;
}
function facingOpen(x, y) {           // start the player looking down the longest corridor
  let best = 0, bestLen = -1;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2; let len = 0;
    while (len < 20 && !solid(Math.floor(x + Math.cos(a) * (len + 1)), Math.floor(y + Math.sin(a) * (len + 1)))) len++;
    if (len > bestLen) { bestLen = len; best = a; }
  }
  return best;
}
/* each monster is a real piece of malware from FW_HISTORY of the same kind;
   the boss is always the most notorious rootkit on the list */
function pickSpecimen(def) {
  const pool = FW_HISTORY.filter(h => h.kind === def.key);
  if (def.specimen) return FW_HISTORY.find(h => h.name === def.specimen) || pool[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
function spawnEnemy(ch, x, y, child = false) {
  const def = ENEMY[ch];
  const e = { ch, def, x, y, hp: def.hp, hist: pickSpecimen(def), awake: false, cd: rand(0.5, 1.5), t: 0, attackT: 0, pain: 0, flash: 0, dead: false, child, replicated: false, summonT: 6, disguised: ch === "t" };
  enemies.push(e);
  return e;
}

/* ================================================================== rules */
const isDoor = c => c === "D" || c === "R" || c === "B" || c === "Y";
function tile(x, y) { return x < 0 || y < 0 || x >= mapW || y >= mapH ? "#" : map[y][x]; }
function door(x, y) { return doors.get(y * mapW + x); }
function solid(x, y) {
  const c = tile(x, y);
  if (c === ".") return false;
  if (isDoor(c)) return door(x, y).open < 0.9;
  return true;
}
function blocked(x, y, r) {
  return solid(Math.floor(x - r), Math.floor(y - r)) || solid(Math.floor(x + r), Math.floor(y - r)) ||
         solid(Math.floor(x - r), Math.floor(y + r)) || solid(Math.floor(x + r), Math.floor(y + r));
}
function hitsBody(self, x, y, r) {
  if (self !== player && Math.hypot(player.x - x, player.y - y) < r + 0.25) return true;
  for (const e of enemies) {
    if (e === self || e.dead) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < r + e.def.radius * 0.8 && d < Math.hypot(e.x - self.x, e.y - self.y)) return true;   // may always move apart
  }
  return false;
}
function move(b, dx, dy, r) {
  if (!blocked(b.x + dx, b.y, r) && !hitsBody(b, b.x + dx, b.y, r)) b.x += dx;
  if (!blocked(b.x, b.y + dy, r) && !hitsBody(b, b.x, b.y + dy, r)) b.y += dy;
}
function lineOfSight(ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay), steps = Math.ceil(d / 0.2);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (solid(Math.floor(ax + (bx - ax) * t), Math.floor(ay + (by - ay) * t))) return false;
  }
  return true;
}
/* distance along a ray to the first wall, doors included */
function castRay(x, y, dx, dy) {
  let mx = Math.floor(x), my = Math.floor(y);
  const ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
  const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
  let sdx = (dx < 0 ? x - mx : mx + 1 - x) * ddx, sdy = (dy < 0 ? y - my : my + 1 - y) * ddy;
  for (let i = 0; i < 64; i++) {
    let side;
    if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
    const c = tile(mx, my);
    if (c === ".") continue;
    const dist = side === 0 ? sdx - ddx : sdy - ddy;
    if (isDoor(c)) {
      let wx = side === 0 ? y + dist * dy : x + dist * dx; wx -= Math.floor(wx);
      if (wx < door(mx, my).open) continue;
    }
    return { dist, mx, my, c };
  }
  return { dist: 64, mx, my, c: "#" };
}

function say(text) { messages.push({ text, t: 3.2 }); if (messages.length > 4) messages.shift(); }
function flash(color, t) { screenFlash = { color, t }; }

function tryOpen(d) {
  if (d.lock && !d.unlocked) {
    const key = { R: "k", B: "b", Y: "y" }[d.lock];
    if (!player.keys[key]) {
      say(T("needKey", { c: T({ R: "red", B: "blue", Y: "yellow" }[d.lock]) }));
      Sound.play("denied");
      return;
    }
    d.unlocked = true;
  }
  if (d.state === 0 || d.state === 3) { d.state = 1; Sound.play("door"); }
}
function use() {
  const dx = Math.cos(player.a), dy = Math.sin(player.a);
  const hit = castRay(player.x, player.y, dx, dy);
  if (hit.dist > 1.6) return;
  if (isDoor(hit.c)) tryOpen(door(hit.mx, hit.my));
  else if (hit.c === "M") openMail(hit.mx, hit.my);
  else if (hit.c === "U") {
    map[hit.my][hit.mx] = "Q"; stats.patched++;
    say(T("patched")); Sound.play("weapon"); flash("rgba(74,222,128,.25)", 0.2); player.grinT = 1.2;
  }
  else if (hit.c === "X") {
    if (enemies.some(e => e.def.boss && !e.dead)) { say(T("exitLocked", { n: enemies.find(e => e.def.boss && !e.dead).hist.name })); Sound.play("denied"); return; }
    finishLevel();
  }
}
/* an unpatched vulnerability lets a worm in every few seconds while you are near */
function updateVulns(dt) {
  const alive = enemies.filter(e => !e.dead).length;
  for (const v of vulns) {
    if (map[v.y][v.x] !== "U") continue;
    if (Math.hypot(v.x + 0.5 - player.x, v.y + 0.5 - player.y) > 11) continue;
    v.t -= dt;
    if (v.t > 0 || alive >= 40) continue;
    v.t = 9;
    const out = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [v.x + dx, v.y + dy]).filter(([x, y]) => tile(x, y) === ".")
      .sort((a, b) => Math.hypot(a[0] - player.x, a[1] - player.y) - Math.hypot(b[0] - player.x, b[1] - player.y));
    if (!out.length || blocked(out[0][0] + 0.5, out[0][1] + 0.5, 0.3) || hitsBody({}, out[0][0] + 0.5, out[0][1] + 0.5, 0.3)) continue;
    const w = spawnEnemy("w", out[0][0] + 0.5, out[0][1] + 0.5, true);
    w.awake = true; stats.total++;
    if (!v.told) { v.told = true; say(T("vulnOpen")); }
  }
}
function updateDoors(dt) {
  for (const d of doors.values()) {
    if (d.state === 1) { d.open += dt * 1.8; if (d.open >= 1) { d.open = 1; d.state = 2; d.timer = 4; } }
    else if (d.state === 2) {
      d.timer -= dt;
      if (d.timer <= 0) {
        const busy = [player, ...enemies.filter(e => !e.dead)].some(b => Math.floor(b.x) === d.x && Math.floor(b.y) === d.y);
        if (busy) d.timer = 1; else { d.state = 3; Sound.play("door"); }
      }
    } else if (d.state === 3) {
      const busy = [player, ...enemies.filter(e => !e.dead)].some(b => Math.abs(b.x - d.x - 0.5) < 0.9 && Math.abs(b.y - d.y - 0.5) < 0.9);
      if (busy) d.state = 1;
      else { d.open -= dt * 1.8; if (d.open <= 0) { d.open = 0; d.state = 0; } }
    }
  }
}

/* --- player */
const keys = new Set();
let mouseDown = false, touch = { mx: 0, my: 0, turn: 0, fire: false };
function updatePlayer(dt) {
  const p = player;
  let turn = 0, fwd = 0, side = 0;
  if (keys.has("ArrowLeft")) turn -= 1;
  if (keys.has("ArrowRight")) turn += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) fwd += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) fwd -= 1;
  if (keys.has("KeyA")) side -= 1;
  if (keys.has("KeyD")) side += 1;
  fwd += -touch.my; side += touch.mx;
  p.a += turn * 2.6 * dt + touch.turn; touch.turn = 0;
  const run = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 1.6 : 1;
  const len = Math.hypot(fwd, side);
  if (len > 1) { fwd /= len; side /= len; }
  const speed = 3.3 * run * dt, ca = Math.cos(p.a), sa = Math.sin(p.a);
  const dx = (ca * fwd - sa * side) * speed, dy = (sa * fwd + ca * side) * speed;
  move(p, dx, dy, 0.22);
  p.moving = len > 0.1;
  if (p.moving) p.bob += dt * 9 * run;

  p.cool -= dt; p.fireT -= dt; p.hurtT -= dt; p.grinT -= dt; p.lookT -= dt;
  if (p.lookT <= 0) { p.look = Math.floor(Math.random() * 3) - 1; p.lookT = rand(0.8, 2); }
  if (keys.has("Space") || keys.has("ControlLeft") || keys.has("ControlRight") || mouseDown || touch.fire) fire();

  for (const it of items) {
    if (!it.taken && Math.hypot(it.x - p.x, it.y - p.y) < 0.55) take(it);
  }
}
function take(it) {
  const p = player; let ok = true, snd = "pickup";
  switch (it.ch) {
    case "h": ok = p.hp < 100; if (ok) p.hp = Math.min(100, p.hp + 15); break;
    case "H": ok = p.hp < 100; if (ok) p.hp = Math.min(100, p.hp + 50); break;
    case "f": ok = p.armor < 200; if (ok) p.armor = Math.min(200, p.armor + 100); break;
    case "a": ok = p.ammo.sig < AMMO_MAX.sig; if (ok) p.ammo.sig = Math.min(AMMO_MAX.sig, p.ammo.sig + 8); break;
    case "c": ok = p.ammo.cells < AMMO_MAX.cells; if (ok) p.ammo.cells = Math.min(AMMO_MAX.cells, p.ammo.cells + 40); break;
    case "g": case "p": {
      const w = it.ch === "g" ? 1 : 2, fresh = !p.weapons[w];
      p.weapons[w] = true;
      if (w === 1) p.ammo.sig = Math.min(AMMO_MAX.sig, p.ammo.sig + 12);
      else p.ammo.cells = Math.min(AMMO_MAX.cells, p.ammo.cells + 40);
      if (fresh) { p.cur = w; p.grinT = 1.5; }
      snd = "weapon";
      break;
    }
    case "z": ok = !p.backup; if (ok) p.backup = true; snd = "key"; break;
    default: p.keys[it.ch] = true; snd = "key";
  }
  if (!ok) return;
  it.taken = true; stats.items++;
  say(T("p_" + it.ch)); Sound.play(snd); flash("rgba(250,204,21,.22)", 0.15);
}
function hasAmmo(w) { const def = WEAPONS[w]; return !def.ammo || player.ammo[def.ammo] > 0; }
function selectWeapon(w) {
  if (!player || !player.weapons[w] || player.cur === w) return;
  if (!hasAmmo(w)) { say(T("noAmmo")); return; }
  player.cur = w; player.cool = Math.max(player.cool, 0.2); Sound.play("click");
}
function cycleWeapon(dir) {
  for (let i = 1; i <= 3; i++) {
    const w = (player.cur + dir * i + 3) % 3;
    if (player.weapons[w] && hasAmmo(w)) { selectWeapon(w); return; }
  }
}
function fire() {
  const p = player;
  if (p.cool > 0) return;
  const def = WEAPONS[p.cur];
  if (!hasAmmo(p.cur)) {
    say(T("noAmmo"));
    for (let w = 2; w >= 0; w--) if (p.weapons[w] && hasAmmo(w)) { p.cur = w; break; }
    p.cool = 0.3; return;
  }
  if (def.ammo) p.ammo[def.ammo]--;
  p.cool = def.cool * p.coolMul; p.fireT = 0.12;
  Sound.play(def.sound);
  alertNearby(p.x, p.y);
  if (def.projectile) {
    const a = p.a + rand(-0.015, 0.015);
    shots.push({ x: p.x + Math.cos(a) * 0.35, y: p.y + Math.sin(a) * 0.35, vx: Math.cos(a) * def.speed, vy: Math.sin(a) * def.speed, dmg: rand(...def.dmg) * p.dmgMul, mine: true, spr: SPR.shot.player, life: 3 });
    return;
  }
  for (let i = 0; i < def.pellets; i++) hitscan(p.a + rand(-def.spread, def.spread), rand(...def.dmg) * p.dmgMul);
}
function hitscan(a, dmg) {
  const dx = Math.cos(a), dy = Math.sin(a), p = player;
  const wall = castRay(p.x, p.y, dx, dy).dist;
  let best = null, bestAlong = wall;
  for (const e of enemies) {
    if (e.dead) continue;
    const vx = e.x - p.x, vy = e.y - p.y, along = vx * dx + vy * dy;
    if (along <= 0 || along >= bestAlong) continue;
    if (Math.abs(vx * dy - vy * dx) < e.def.radius) { best = e; bestAlong = along; }
  }
  const d = best ? bestAlong - 0.1 : wall - 0.05;
  puffs.push({ x: p.x + dx * d, y: p.y + dy * d, t: 0.18, spr: best ? SPR.bits : SPR.spark, z: best ? best.def.z + 0.25 : 0.3 });
  if (best) hurtEnemy(best, player.cur === 0 && identified.has(best.def.key) ? dmg * 1.5 : dmg);
}
function alertNearby(x, y) {
  for (const e of enemies) {
    if (e.dead || e.awake) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < 5 || (d < 12 && lineOfSight(e.x, e.y, x, y))) wake(e);
  }
}
function wake(e) { e.awake = true; }
/* the monster under the crosshair, if any, within scanning range */
function crosshairTarget() {
  const p = player, dx = Math.cos(p.a), dy = Math.sin(p.a);
  const wall = castRay(p.x, p.y, dx, dy).dist;
  let best = null, bestAlong = Math.min(wall, 14);
  for (const e of enemies) {
    if (e.dead || e.disguised) continue;
    const vx = e.x - p.x, vy = e.y - p.y, along = vx * dx + vy * dy;
    if (along > 0 && along < bestAlong && Math.abs(vx * dy - vy * dx) < e.def.radius) { best = e; bestAlong = along; }
  }
  return best;
}
function updateScan(dt) {
  const e = crosshairTarget();
  if (!e || identified.has(e.def.key)) { scan = { e: null, t: 0 }; return; }
  if (scan.e !== e) scan = { e, t: 0 };
  scan.t += dt;
  if (scan.t >= SCAN_TIME) {
    identified.add(e.def.key);
    scan = { e: null, t: 0 };
    say(T("identified", { n: THREATS[e.def.key][lang][0] }));
    Sound.play("key");
    meetThreat(e.def.key, e);
  }
}
function hurtEnemy(e, dmg) {
  if (e.def.splits && !e.dead) {                       // ILOVEYOU sheds love letters as it is hurt
    e.nextSplit = e.nextSplit ?? 0.75;
    const max = e.def.hp * (e.hpScale || 1);
    if (e.hp - dmg > 0 && e.hp - dmg < max * e.nextSplit) {
      e.nextSplit -= 0.25;
      let n = 0;
      for (let k = 0; k < 2; k++) {
        const spot = freeSpotNear(e.x, e.y);
        if (spot) { const c = spawnEnemy("w", spot[0], spot[1], true); c.hist = e.hist; c.awake = true; stats.total++; n++; }
      }
      if (n) say(T("split"));
    }
  }
  if (e.def.swarm) for (const o of enemies) if (o.def.swarm && !o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 10) wake(o);
  e.hp -= dmg; e.flash = 0.1;
  if (e.disguised) reveal(e);
  wake(e);
  if (!e.def.boss && Math.random() < 0.35) e.pain = 0.22;
  if (e.hp <= 0) {
    e.dead = true; stats.kills++;
    say(T("removedMsg", { n: e.hist.name, y: e.hist.year }));
    if (!removed.has(e.hist.name)) { removed.add(e.hist.name); save(REMOVED_KEY, [...removed]); }
    if (mode === "survival") survival.score += e.def.boss ? 200 : 10;
    if (e.def.boss) { Sound.play("bossDie"); if (mode === "campaign") say(T("bossDown", { n: e.hist.name })); flash("rgba(255,255,255,.5)", 0.5); }
    else Sound.play("die");
  }
}
function reveal(e) {
  e.disguised = false; e.awake = true; e.cd = 0.6;
  say(T("reveal")); Sound.play("reveal");
}
function hurtPlayer(amount, src) {
  const p = player;
  if (p.hp <= 0) return;
  amount = Math.round(amount);
  if (p.armor > 0) { const soak = Math.min(p.armor, Math.floor(amount / 2)); p.armor -= soak; amount -= soak; }
  p.hp -= amount; p.hurtT = 0.4;
  flash("rgba(220,30,30,.35)", 0.2);
  Sound.play("hurt");
  if (src && src.x != null) p.hits.push({ a: Math.atan2(src.y - p.y, src.x - p.x), t: 0.9 });
  if (src && src.def.steals && !p.backup) {
    const taken = Math.min(p.ammo.sig, 4) + Math.min(p.ammo.cells, 15);
    p.ammo.sig = Math.max(0, p.ammo.sig - 4); p.ammo.cells = Math.max(0, p.ammo.cells - 15);
    if (taken) say(T("ransom"));
  }
  if (src && src.def.wipes && !p.backup && p.armor > 0) { p.armor = 0; say(T("wiped")); }
  if (src && src.def.popups && popups.length < 4) {
    const lines = T("popups");
    popups.push({ x: rand(40, SW - 300), y: rand(30, VIEW_H - 170), text: lines[Math.floor(Math.random() * lines.length)], t: 4, hue: Math.floor(rand(0, 360)) });
  }
  if (p.hp <= 0) { p.hp = 0; die(); }
}

/* --- monsters: a breadth-first distance map from the player steers them round corners */
function buildFlow() {
  const tx = Math.floor(player.x), ty = Math.floor(player.y), start = ty * mapW + tx;
  flow = new Int16Array(mapW * mapH).fill(-1);
  flow[start] = 0;
  const q = [start];
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % mapW, y = (i - x) / mapW;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, c = tile(nx, ny), n = ny * mapW + nx;
      if (flow[n] !== -1) continue;
      if (c !== "." && !(isDoor(c) && (!door(nx, ny).lock || door(nx, ny).unlocked))) continue;
      flow[n] = flow[i] + 1; q.push(n);
    }
  }
  flowTile = start;
}
function updateEnemies(dt) {
  flowTimer -= dt;
  const pt = Math.floor(player.y) * mapW + Math.floor(player.x);
  if (!flow || pt !== flowTile || flowTimer <= 0) { buildFlow(); flowTimer = 0.5; }
  const alive = enemies.filter(e => !e.dead).length;

  for (const e of enemies) {
    if (e.dead) continue;
    const def = e.def;
    e.t += dt; e.cd -= dt; e.flash -= dt; e.pain -= dt; e.attackT -= dt;
    const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy);
    const los = d < 18 && lineOfSight(e.x, e.y, player.x, player.y);

    if (e.disguised) { if (d < 3 || (e.awake && d < 5)) reveal(e); else continue; }
    if (!e.awake) { if (los && d < 14) { wake(e); Sound.play("wake"); } else continue; }
    if (e.pain > 0) continue;

    // a keylogger that can see you tells everything nearby where you are
    if (def.reports && los) {
      e.reportT = (e.reportT ?? 0.5) - dt;
      if (e.reportT <= 0) {
        e.reportT = 3;
        let told = 0;
        for (const o of enemies) if (o !== e && !o.dead && !o.awake && Math.hypot(o.x - e.x, o.y - e.y) < 14) { wake(o); told++; }
        if (told) { say(T("reported")); Sound.play("wake"); }
      }
    }

    // attack
    if (def.melee) {
      if (d < def.range + 0.25 && e.cd <= 0) { e.cd = def.cool; e.attackT = 0.3; Sound.play("bite"); hurtPlayer(rand(...def.dmg), e); }
    } else if (los && d < def.range && e.cd <= 0) {
      e.cd = def.cool * rand(0.7, 1.3); e.attackT = 0.35;
      const base = Math.atan2(dy, dx), n = def.spread || 1;
      for (let i = 0; i < n; i++) {
        const a = base + (n > 1 ? (i - (n - 1) / 2) * 0.16 : rand(-0.06, 0.06));
        shots.push({ x: e.x + Math.cos(a) * def.radius, y: e.y + Math.sin(a) * def.radius, vx: Math.cos(a) * def.shotSpeed, vy: Math.sin(a) * def.shotSpeed, dmg: rand(...def.dmg), mine: false, spr: SPR.shot[(VARIANTS[e.hist.name] || def).shot], src: e, life: 5, z: def.z + (def.boss ? 0.4 : 0.2) });
      }
      Sound.play("enemyShot");
    }
    if (e.attackT > 0.15 && !def.melee) continue;          // stand still while shooting

    // movement: straight at the player when close and visible, otherwise downhill on the flow map
    let tx, ty;
    const want = def.melee ? 0.6 : (los ? def.keep : 0);
    if (d > want) {
      if (los && d < 4) { tx = player.x; ty = player.y; }
      else {
        const ex = Math.floor(e.x), ey = Math.floor(e.y), here = flow[ey * mapW + ex];
        let best = here, bx = ex, by = ey;
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const v = flow[(ey + oy) * mapW + ex + ox];
          if (v >= 0 && (best < 0 || v < best)) { best = v; bx = ex + ox; by = ey + oy; }
        }
        if (bx === ex && by === ey) { tx = player.x; ty = player.y; }
        else {
          const c = tile(bx, by);
          if (isDoor(c) && door(bx, by).open < 0.9) tryDoorFor(door(bx, by));
          tx = bx + 0.5; ty = by + 0.5;
        }
      }
      const mdx = tx - e.x, mdy = ty - e.y, ml = Math.hypot(mdx, mdy) || 1;
      const sp = def.speed * dt;
      move(e, mdx / ml * sp, mdy / ml * sp, def.radius * 0.8);
    }

    // worms copy themselves; the rootkit spawns hidden processes
    if (e.ch === "w" && !e.child && !e.replicated && e.t > 7 && alive < 40) {
      e.replicated = true;
      const spot = freeSpotNear(e.x, e.y);
      if (spot) { const c = spawnEnemy("w", spot[0], spot[1], true); c.awake = true; stats.total++; say(T("wormCopy")); }
    }
    if (def.ransomNote && los) {
      e.noteT = (e.noteT ?? 6) - dt;
      if (e.noteT <= 0) {
        e.noteT = 14;
        if (player.backup) say(T("backupSaved"));
        else if (!popups.some(w => w.ransom)) { popups.push({ ransom: true, t: 3.5 }); Sound.play("reveal"); }
      }
    }
    if (def.summons) {
      e.summonT -= dt;
      if (e.summonT <= 0 && alive < 30) {
        e.summonT = 10;
        let n = 0;
        for (let k = 0; k < 2; k++) {
          const spot = freeSpotNear(e.x, e.y);
          if (spot) { const c = spawnEnemy(k ? "s" : "v", spot[0], spot[1], true); c.awake = true; stats.total++; n++; }
        }
        if (n) say(T("summon"));
      }
    }
  }
}
function tryDoorFor(d) { if (!d.lock || d.unlocked) { if (d.state === 0 || d.state === 3) d.state = 1; } }
function freeSpotNear(x, y) {
  for (let k = 0; k < 12; k++) {
    const a = Math.random() * TAU, r = rand(0.8, 1.8), nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
    if (!blocked(nx, ny, 0.3) && Math.hypot(nx - player.x, ny - player.y) > 1.2 &&
        lineOfSight(x, y, nx, ny) && !enemies.some(e => !e.dead && Math.hypot(e.x - nx, e.y - ny) < 0.6)) return [nx, ny];
  }
  return null;
}
function updateShots(dt) {
  for (const s of shots) {
    const steps = 4;
    for (let k = 0; k < steps && s.life > 0; k++) {
      s.x += s.vx * dt / steps; s.y += s.vy * dt / steps;
      if (solid(Math.floor(s.x), Math.floor(s.y))) {
        s.life = 0; puffs.push({ x: s.x - s.vx * 0.01, y: s.y - s.vy * 0.01, t: 0.18, spr: SPR.spark, z: 0.3 }); break;
      }
      if (s.mine) {
        for (const e of enemies) {
          if (!e.dead && Math.hypot(e.x - s.x, e.y - s.y) < e.def.radius + 0.08) {
            hurtEnemy(e, s.dmg); s.life = 0;
            puffs.push({ x: s.x, y: s.y, t: 0.18, spr: SPR.bits, z: e.def.z + 0.25 }); break;
          }
        }
      } else if (Math.hypot(player.x - s.x, player.y - s.y) < 0.3) {
        hurtPlayer(s.dmg, s.src); s.life = 0;
      }
    }
    s.life -= dt;
  }
  shots = shots.filter(s => s.life > 0);
  for (const p of puffs) p.t -= dt;
  puffs = puffs.filter(p => p.t > 0);
}

function update(dt) {
  stats.time += dt;
  updatePlayer(dt);
  if (state !== "play") return;
  updateDoors(dt);
  updateEnemies(dt);
  updateShots(dt);
  updateScan(dt);
  updateVulns(dt);
  for (const h of player.hits) h.t -= dt;
  player.hits = player.hits.filter(h => h.t > 0);
  if (mode === "survival" && state === "play") updateSurvival();
  for (const m of messages) m.t -= dt;
  messages = messages.filter(m => m.t > 0);
  if (screenFlash.t > 0) screenFlash.t -= dt;
  for (const w of popups) w.t -= dt;
  popups = popups.filter(w => w.t > 0);
}

/* =============================================================== renderer */
function render() {
  const p = player;
  const dirX = Math.cos(p.a), dirY = Math.sin(p.a);
  const planeX = -dirY * 0.66, planeY = dirX * 0.66;
  const fog = look.fog, ftex = look.floor, ctex = look.ceil;

  // floor and ceiling, one row at a time
  const r0x = dirX - planeX, r0y = dirY - planeY, r1x = dirX + planeX, r1y = dirY + planeY;
  for (let y = H / 2; y < H; y++) {
    const rowDist = (0.5 * H) / (y - H / 2 + 0.5);
    const stx = rowDist * (r1x - r0x) / W, sty = rowDist * (r1y - r0y) / W;
    let fx = p.x + rowDist * r0x, fy = p.y + rowDist * r0y;
    const f = clamp((1.3 - rowDist / 9) * fog, 0.1, 1);
    const fr = y * W, cr = (H - 1 - y) * W;
    for (let x = 0; x < W; x++) {
      const tx = (TEX * (fx - Math.floor(fx))) & 63, ty = (TEX * (fy - Math.floor(fy))) & 63;
      const i = ty * TEX + tx;
      pix[fr + x] = shade(ftex[i], f);
      pix[cr + x] = shade(ctex[i], f * 0.9);
      fx += stx; fy += sty;
    }
  }

  // walls
  for (let x = 0; x < W; x++) {
    const cam = 2 * x / W - 1, rdx = dirX + planeX * cam, rdy = dirY + planeY * cam;
    let mx = Math.floor(p.x), my = Math.floor(p.y);
    const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
    const sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
    let sdx = (rdx < 0 ? p.x - mx : mx + 1 - p.x) * ddx, sdy = (rdy < 0 ? p.y - my : my + 1 - p.y) * ddy;
    let side = 0, dist = 30, u = 0, tex = WALL_TEX[0];
    for (let i = 0; i < 64; i++) {
      if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
      if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) break;
      seen[my * mapW + mx] = 1;
      const c = map[my][mx];
      if (c === ".") continue;
      dist = side === 0 ? sdx - ddx : sdy - ddy;
      let wx = side === 0 ? p.y + dist * rdy : p.x + dist * rdx; wx -= Math.floor(wx);
      if (isDoor(c)) {
        const o = door(mx, my).open;
        if (wx < o) continue;
        u = wx - o;
      } else {
        u = wx;
        if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) u = 1 - u;
      }
      tex = WALL_TEX[WALL_CHARS.indexOf(c)];
      break;
    }
    zbuf[x] = dist;
    const lh = H / dist, top = H / 2 - lh / 2;
    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(H - 1, Math.floor(top + lh));
    const tx = Math.min(63, Math.floor(u * TEX));
    const f = clamp((1.3 - dist / 9) * fog, 0.1, 1) * (side ? 0.78 : 1);
    const step = TEX / lh;
    let tp = (y0 - top) * step;
    for (let y = y0; y <= y1; y++) {
      pix[y * W + x] = shade(tex[((tp | 0) & 63) * TEX + tx], f);
      tp += step;
    }
  }

  // sprites, far to near
  const list = [];
  for (const it of items) if (!it.taken) list.push({ x: it.x, y: it.y, spr: SPR.item[it.ch], scale: 0.42, z: 0 });
  for (const e of enemies) {
    if (e.dead && e.def.fileless) continue;
    if (e.dead) { list.push({ x: e.x, y: e.y, spr: spritesFor(e).corpse, scale: e.def.boss ? 1 : 0.55, z: 0 }); continue; }
    if (e.disguised) { list.push({ x: e.x, y: e.y, spr: SPR.gift, scale: 0.5, z: 0 }); continue; }
    const fr = e.attackT > 0 ? 2 : (e.awake && Math.floor(e.t * 4) % 2 ? 1 : 0);
    list.push({ x: e.x, y: e.y, spr: spritesFor(e)[fr], scale: e.def.scale, z: e.def.z + (e.ch === "s" ? Math.sin(e.t * 3) * 0.05 : 0), flash: e.flash > 0,
      ghost: e.ch === "s" ? 1 : e.def.fileless && e.attackT <= 0 && e.flash <= 0 && Math.hypot(e.x - p.x, e.y - p.y) > 3 ? 2 : 0 });
  }
  for (const s of shots) list.push({ x: s.x, y: s.y, spr: s.spr, scale: 0.28, z: s.z ?? 0.3, bright: true });
  for (const pf of puffs) list.push({ x: pf.x, y: pf.y, spr: pf.spr, scale: 0.3, z: pf.z, bright: true });
  for (const s of list) s.d = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
  list.sort((a, b) => b.d - a.d);
  const inv = 1 / (planeX * dirY - dirX * planeY);
  for (const s of list) drawSprite(s, inv, dirX, dirY, planeX, planeY, fog);

  vctx.putImageData(frame, 0, 0);
  drawWeapon();
}
function drawSprite(s, inv, dirX, dirY, planeX, planeY, fog) {
  const p = player, sx = s.x - p.x, sy = s.y - p.y;
  const tx = inv * (dirY * sx - dirX * sy), ty = inv * (-planeY * sx + planeX * sy);
  if (ty < 0.15) return;
  const cx = (W / 2) * (1 + tx / ty), unit = H / ty, size = unit * s.scale;
  const bottom = H / 2 + unit * (0.5 - s.z), top = bottom - size, left = cx - size / 2;
  const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(W - 1, Math.floor(left + size));
  const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(H - 1, Math.floor(bottom));
  const f = s.bright ? 1 : clamp((1.3 - ty / 9) * fog, 0.12, 1), data = s.spr.data, k = 64 / size;
  for (let x = x0; x <= x1; x++) {
    if (ty >= zbuf[x]) continue;
    const u = Math.min(63, ((x - left) * k) | 0);
    for (let y = y0; y <= y1; y++) {
      if (s.ghost === 1 ? (x + y) & 1 : s.ghost === 2 ? (x | y) & 1 : 0) continue;   // spyware is half there, fileless a quarter
      const v = Math.min(63, ((y - top) * k) | 0);
      const c = data[v * 64 + u];
      if ((c >>> 24) < 128) continue;
      pix[y * W + x] = s.flash ? 0xffffffff : f === 1 ? c : shade(c, f);
    }
  }
}
function drawWeapon() {
  const p = player, g = vctx, w = p.cur;
  const bx = p.moving ? Math.cos(p.bob) * 5 : 0, by = p.moving ? Math.abs(Math.sin(p.bob)) * 5 : 0;
  const firing = p.fireT > 0, kick = firing ? 6 : 0;
  const cx = 160 + bx, base = H + by + kick;
  if (w === 0) {
    if (firing) { circle(g, cx, base - 62, 10, "rgba(125,255,155,.5)"); circle(g, cx, base - 62, 5, "#eaffef"); g.fillStyle = "rgba(125,255,155,.6)"; g.fillRect(cx - 1, base - 110, 2, 48); }
    g.fillStyle = "#39414d"; g.fillRect(cx - 18, base - 55, 36, 55);
    g.fillStyle = "#4b5563"; g.fillRect(cx - 18, base - 55, 36, 4);
    g.fillStyle = "#0e3b24"; g.fillRect(cx - 12, base - 46, 24, 16);
    g.fillStyle = "#4ade80"; g.fillRect(cx - 10, base - 40, 20, 1); g.fillRect(cx - 10, base - 36, 12, 1);
    g.fillStyle = "#94a3b8"; g.fillRect(cx - 4, base - 62, 8, 8);
    g.fillStyle = "#c79a6b"; g.fillRect(cx - 26, base - 22, 14, 22); g.fillRect(cx + 12, base - 22, 14, 22);
  } else if (w === 1) {
    if (firing) { circle(g, cx, base - 78, 16, "rgba(255,160,40,.7)"); circle(g, cx, base - 78, 8, "#fff1c2"); }
    g.fillStyle = "#23272e"; g.fillRect(cx - 12, base - 75, 10, 75); g.fillRect(cx + 2, base - 75, 10, 75);
    g.fillStyle = "#3b414b"; g.fillRect(cx - 12, base - 75, 3, 75); g.fillRect(cx + 2, base - 75, 3, 75);
    g.fillStyle = "#f97316"; g.fillRect(cx - 16, base - 40, 32, 12);
    g.fillStyle = "#1a1a1a"; g.font = "bold 7px monospace"; g.fillText("FILTER", cx - 13, base - 31);
    g.fillStyle = "#c79a6b"; g.fillRect(cx - 30, base - 20, 16, 20); g.fillRect(cx + 14, base - 26, 16, 26);
  } else {
    const glow = firing ? "#e0fdff" : "#67e8f9";
    if (firing) circle(g, cx, base - 70, 12, "rgba(103,232,249,.6)");
    g.fillStyle = "#1e3a8a"; g.fillRect(cx - 22, base - 62, 44, 62);
    g.fillStyle = "#1e40af"; g.fillRect(cx - 22, base - 62, 44, 5);
    for (let i = 0; i < 4; i++) { g.fillStyle = glow; g.fillRect(cx - 22, base - 52 + i * 11, 44, 3); }
    g.fillStyle = "#0f172a"; g.fillRect(cx - 7, base - 70, 14, 10);
    circle(g, cx, base - 66, 4, glow);
    g.fillStyle = "#c79a6b"; g.fillRect(cx - 34, base - 24, 14, 24); g.fillRect(cx + 20, base - 24, 14, 24);
  }
}

/* ============================================================ status bar */
function hudLabel(text, x, y) {
  sctx.fillStyle = "#8ea3bd"; sctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  sctx.textAlign = "center"; sctx.fillText(text, x, y);
}
function hudNumber(text, x, y, color = "#ef4444") {
  sctx.fillStyle = "#000"; sctx.font = "bold 30px ui-monospace, Consolas, monospace"; sctx.textAlign = "center";
  sctx.fillText(text, x + 2, y + 2);
  sctx.fillStyle = color; sctx.fillText(text, x, y);
}
function drawHud() {
  const p = player, y0 = VIEW_H;
  sctx.fillStyle = "#1a1f27"; sctx.fillRect(0, y0, SW, SH - y0);
  sctx.fillStyle = "#3d5171"; sctx.fillRect(0, y0, SW, 2);
  const cells = [0, 104, 214, 290, 350, 462, 540, 640];
  sctx.fillStyle = "#0f1319";
  for (const x of cells.slice(1, -1)) sctx.fillRect(x - 1, y0 + 6, 2, 68);

  const def = WEAPONS[p.cur];
  hudNumber(def.ammo ? String(p.ammo[def.ammo]) : "∞", 52, y0 + 46);
  hudLabel(T("hudAmmo"), 52, y0 + 70);
  hudNumber(p.hp + "%", 159, y0 + 46, p.hp > 30 ? "#ef4444" : "#ff8080");
  hudLabel(T("hudHealth"), 159, y0 + 70);

  sctx.font = "bold 18px ui-monospace, Consolas, monospace"; sctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    sctx.fillStyle = p.cur === i ? "#facc15" : p.weapons[i] ? "#eaf1fb" : "#3d4756";
    sctx.fillText(String(i + 1), 230 + i * 22, y0 + 40);
  }
  hudLabel(T("hudArms"), 252, y0 + 70);

  drawFace(320, y0 + 40);

  hudNumber(p.armor + "%", 406, y0 + 46, "#f97316");
  hudLabel(T("hudArmor"), 406, y0 + 70);

  const kc = { k: "#e04a4a", b: "#3b82f6", y: "#facc15" };
  ["k", "b", "y"].forEach((k, i) => {
    sctx.fillStyle = p.keys[k] ? kc[k] : "#262e3a";
    sctx.fillRect(478 + i * 17, y0 + 22, 12, 22);
    if (p.keys[k]) { sctx.fillStyle = "#d8b24a"; sctx.fillRect(480 + i * 17, y0 + 26, 5, 4); }
  });
  hudLabel(T("hudKeys"), 501, y0 + 70);

  sctx.fillStyle = "#eaf1fb"; sctx.font = "bold 20px ui-monospace, Consolas, monospace"; sctx.textAlign = "center";
  sctx.fillText(mode === "survival" ? `${T("hudWave")} ${survival.wave}` : `${stats.kills}/${stats.total}`, 590, y0 + 36);
  sctx.fillStyle = "#45d0e0"; sctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
  sctx.fillText(mode === "survival" ? `${T("score")} ${survival.score}` : T("w_" + def.key), 590, y0 + 54, 92);
  hudLabel(mode === "survival" ? T("survival") : T("hudKills"), 590, y0 + 70);
  sctx.textAlign = "left";
}
/* the status-bar face is a CPU: it sweats, winces and grins like the original */
function drawFace(cx, cy) {
  const p = player, g = sctx;
  const col = p.hp > 60 ? "#22c55e" : p.hp > 30 ? "#f5a524" : "#ef4444";
  g.fillStyle = "#9aa3ad";
  for (let i = 0; i < 5; i++) {
    g.fillRect(cx - 18 + i * 8, cy - 31, 4, 5); g.fillRect(cx - 18 + i * 8, cy + 26, 4, 5);
    g.fillRect(cx - 31, cy - 18 + i * 8, 5, 4); g.fillRect(cx + 26, cy - 18 + i * 8, 5, 4);
  }
  rrect(g, cx - 26, cy - 26, 52, 52, 5, "#161b22");
  g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(cx - 23, cy - 23, 46, 46);
  const ex = p.look * 3;
  g.fillStyle = col;
  if (p.hp <= 0) {
    g.lineWidth = 3; g.strokeStyle = col;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 10 - 4, cy - 10); g.lineTo(cx + s * 10 + 4, cy - 2); g.moveTo(cx + s * 10 + 4, cy - 10); g.lineTo(cx + s * 10 - 4, cy - 2); g.stroke(); }
  } else if (p.hurtT > 0) {
    g.fillRect(cx - 15, cy - 6, 10, 3); g.fillRect(cx + 5, cy - 6, 10, 3);
  } else {
    g.fillRect(cx - 13 + ex, cy - 10, 6, 7); g.fillRect(cx + 7 + ex, cy - 10, 6, 7);
  }
  g.lineWidth = 3; g.strokeStyle = col; g.beginPath();
  if (p.grinT > 0) { g.arc(cx, cy + 4, 10, 0.15 * Math.PI, 0.85 * Math.PI); }
  else if (p.hurtT > 0 || p.hp <= 30) { g.arc(cx, cy + 16, 8, 1.15 * Math.PI, 1.85 * Math.PI); }
  else { g.moveTo(cx - 8, cy + 10); g.lineTo(cx + 8, cy + 10); }
  g.stroke();
  if (p.hp <= 30 && p.hp > 0) { g.fillStyle = "#45d0e0"; g.fillRect(cx + 18, cy - 16, 3, 6); }   // sweat
}
/* name the malware under the crosshair, like a scanner identifying a sample */
function drawTarget() {
  if (popups.some(w => w.ransom)) return;
  const best = crosshairTarget();
  if (!best) return;
  const known = identified.has(best.def.key);
  const label = known ? `${best.hist.name} · ${best.hist.year}` : `??? · ${T("scanning")}`;
  sctx.font = "600 14px ui-monospace, Consolas, monospace"; sctx.textAlign = "center";
  const w = sctx.measureText(label).width + 16;
  sctx.fillStyle = "rgba(5,8,12,.7)"; sctx.fillRect(SW / 2 - w / 2, VIEW_H / 2 + 18, w, 22);
  sctx.fillStyle = "#ef4444"; sctx.fillRect(SW / 2 - w / 2, VIEW_H / 2 + 18, 3, 22);
  sctx.fillStyle = "#eaf1fb"; sctx.fillText(label, SW / 2, VIEW_H / 2 + 34);
  if (!known && scan.e === best) {
    sctx.fillStyle = "#45d0e0"; sctx.fillRect(SW / 2 - w / 2, VIEW_H / 2 + 40, w * Math.min(1, scan.t / SCAN_TIME), 3);
  }
  sctx.textAlign = "left";
}
/* a hint when you stand in front of something you can use */
function drawPrompt() {
  const hit = castRay(player.x, player.y, Math.cos(player.a), Math.sin(player.a));
  if (hit.dist > 1.6 || !"MXU".includes(hit.c)) return;
  const text = T(hit.c === "M" ? "promptMail" : hit.c === "U" ? "promptPatch" : "promptExit");
  sctx.font = "600 15px ui-sans-serif, system-ui, sans-serif"; sctx.textAlign = "center";
  const w = sctx.measureText(text).width + 24;
  sctx.fillStyle = "rgba(5,8,12,.8)"; sctx.fillRect(SW / 2 - w / 2, VIEW_H - 74, w, 28);
  sctx.fillStyle = "#facc15"; sctx.fillText(text, SW / 2, VIEW_H - 55);
  sctx.textAlign = "left";
}
function drawRansomNote(w) {
  const x = 70, y = 60, pw = SW - 140, ph = 250;
  sctx.fillStyle = "rgba(127,29,29,.94)"; sctx.fillRect(x, y, pw, ph);
  sctx.strokeStyle = "#fca5a5"; sctx.lineWidth = 3; sctx.strokeRect(x + 1.5, y + 1.5, pw - 3, ph - 3);
  sctx.textAlign = "center";
  sctx.fillStyle = "#facc15";                                                 // a padlock
  sctx.fillRect(SW / 2 - 22, y + 44, 44, 34);
  sctx.strokeStyle = "#facc15"; sctx.lineWidth = 7; sctx.beginPath(); sctx.arc(SW / 2, y + 44, 14, Math.PI, 0); sctx.stroke();
  sctx.fillStyle = "#fff"; sctx.font = "bold 24px ui-sans-serif, system-ui, sans-serif"; sctx.fillText(T("ransomTitle"), SW / 2, y + 120, pw - 30);
  sctx.fillStyle = "#fecaca"; sctx.font = "16px ui-sans-serif, system-ui, sans-serif"; sctx.fillText(T("ransomText"), SW / 2, y + 150, pw - 30);
  sctx.fillStyle = "#facc15"; sctx.font = "bold 30px ui-monospace, Consolas, monospace"; sctx.fillText(`00:0${Math.ceil(w.t)}`, SW / 2, y + 192);
  sctx.fillStyle = "#fecaca"; sctx.font = "13px ui-sans-serif, system-ui, sans-serif"; sctx.fillText(T("ransomHint"), SW / 2, y + 226, pw - 30);
  sctx.textAlign = "left";
}
function drawBossBar() {
  const b = enemies.find(e => e.def.boss && !e.dead && e.awake);
  if (!b) return;
  const w = 300, x = SW / 2 - w / 2, y = VIEW_H - 34, frac = clamp(b.hp / (b.def.hp * (b.hpScale || 1)), 0, 1);
  sctx.fillStyle = "rgba(5,8,12,.75)"; sctx.fillRect(x - 6, y - 4, w + 12, 30);
  sctx.fillStyle = "#3f1d1d"; sctx.fillRect(x, y + 14, w, 8);
  sctx.fillStyle = "#ef4444"; sctx.fillRect(x, y + 14, w * frac, 8);
  sctx.fillStyle = "#fde68a"; sctx.font = "600 12px ui-sans-serif, system-ui, sans-serif"; sctx.textAlign = "center";
  sctx.fillText(`${b.hist.name} \u00b7 ${b.hist.year}`, SW / 2, y + 10);
  sctx.textAlign = "left";
}
function drawHitMarkers() {             // red wedges pointing at whoever just hit you
  for (const h of player.hits) {
    const rel = Math.atan2(Math.sin(h.a - player.a), Math.cos(h.a - player.a));
    const cx = SW / 2 + Math.sin(rel) * 110, cy = VIEW_H / 2 - Math.cos(rel) * 110;
    sctx.save(); sctx.translate(cx, cy); sctx.rotate(rel);
    sctx.globalAlpha = Math.min(1, h.t * 1.5);
    sctx.fillStyle = "#ef4444"; sctx.beginPath(); sctx.moveTo(0, -16); sctx.lineTo(12, 6); sctx.lineTo(-12, 6); sctx.fill();
    sctx.restore();
  }
  sctx.globalAlpha = 1;
}
function drawPopup(w) {
  const x = w.x, y = w.y, pw = 260, ph = 140;
  sctx.fillStyle = "rgba(0,0,0,.35)"; sctx.fillRect(x + 5, y + 5, pw, ph);
  sctx.fillStyle = "#f8fafc"; sctx.fillRect(x, y, pw, ph);
  sctx.fillStyle = `hsl(${w.hue}, 80%, 45%)`; sctx.fillRect(x, y, pw, 22);
  sctx.fillStyle = "#fff"; sctx.fillRect(x + pw - 20, y + 4, 15, 14);
  sctx.fillStyle = "#b91c1c"; sctx.font = "bold 12px sans-serif"; sctx.textAlign = "center"; sctx.fillText("\u00d7", x + pw - 12.5, y + 15.5);
  sctx.fillStyle = `hsl(${(w.hue + 180) % 360}, 85%, 40%)`; sctx.font = "bold 17px ui-sans-serif, system-ui, sans-serif";
  sctx.fillText(w.text, x + pw / 2, y + 66, pw - 20);
  sctx.fillStyle = "#16a34a"; sctx.fillRect(x + pw / 2 - 60, y + 84, 120, 28);
  sctx.fillStyle = "#fff"; sctx.font = "bold 14px sans-serif"; sctx.fillText("OK!!!", x + pw / 2, y + 103);
  sctx.fillStyle = "#64748b"; sctx.font = "11px sans-serif"; sctx.fillText(T("popupClose", { s: Math.ceil(w.t) }), x + pw / 2, y + ph - 8);
  sctx.textAlign = "left";
}
function drawMessages() {
  sctx.font = "600 15px ui-sans-serif, system-ui, sans-serif"; sctx.textAlign = "left";
  messages.forEach((m, i) => {
    sctx.globalAlpha = Math.min(1, m.t * 2);
    sctx.fillStyle = "#000"; sctx.fillText(m.text, 13, 25 + i * 20);
    sctx.fillStyle = "#facc15"; sctx.fillText(m.text, 12, 24 + i * 20);
  });
  sctx.globalAlpha = 1;
}
function drawMap() {
  const size = Math.min(300 / mapW, 300 / mapH), ox = SW - mapW * size - 12, oy = 12;
  sctx.fillStyle = "rgba(5,8,12,.8)"; sctx.fillRect(ox - 6, oy - 6, mapW * size + 12, mapH * size + 12);
  const col = { R: "#e04a4a", B: "#3b82f6", Y: "#facc15", D: "#f5a524", X: "#4ade80", M: "#60a5fa", N: "#475569", U: "#ff4d4d", Q: "#15803d" };
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      if (!seen[y * mapW + x]) continue;
      const c = map[y][x];
      sctx.fillStyle = c === "." ? "#1c2632" : col[c] || "#5b8db8";
      sctx.fillRect(ox + x * size, oy + y * size, size - 0.5, size - 0.5);
    }
  }
  const px = ox + player.x * size, py = oy + player.y * size;
  sctx.fillStyle = "#fff"; sctx.beginPath();
  sctx.moveTo(px + Math.cos(player.a) * size, py + Math.sin(player.a) * size);
  sctx.lineTo(px + Math.cos(player.a + 2.5) * size * 0.7, py + Math.sin(player.a + 2.5) * size * 0.7);
  sctx.lineTo(px + Math.cos(player.a - 2.5) * size * 0.7, py + Math.sin(player.a - 2.5) * size * 0.7);
  sctx.fill();
}
function present() {
  render();
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(view, 0, 0, SW, VIEW_H);
  if (screenFlash.t > 0) { sctx.fillStyle = screenFlash.color; sctx.fillRect(0, 0, SW, VIEW_H); }
  for (const w of popups) (w.ransom ? drawRansomNote : drawPopup)(w);
  if (state === "play") { drawHitMarkers(); drawBossBar(); }
  if (state === "play") {
    sctx.fillStyle = "rgba(255,255,255,.7)";
    sctx.fillRect(SW / 2 - 1, VIEW_H / 2 - 6, 2, 4); sctx.fillRect(SW / 2 - 1, VIEW_H / 2 + 2, 2, 4);
    sctx.fillRect(SW / 2 - 6, VIEW_H / 2 - 1, 4, 2); sctx.fillRect(SW / 2 + 2, VIEW_H / 2 - 1, 4, 2);
  }
  if (state === "play") { drawTarget(); drawPrompt(); }
  if (showMap) drawMap();
  drawMessages();
  drawHud();
}

/* ================================================================ threats */
let cardTimer = 0;
function meetThreat(key, e) {
  if (!intel.has(key)) { intel.add(key); save(INTEL_KEY, [...intel]); }
  if (shownThisSession.has(key)) return;
  shownThisSession.add(key);
  const [name, text] = THREATS[key][lang];
  $("fw-card-kicker").textContent = T("newThreat");
  $("fw-card-name").textContent = name;
  const names = FW_HISTORY.filter(h => h.kind === key).map(h => `${h.name} (${h.year})`).join(", ");
  $("fw-card-text").textContent = `${text} ${T("examples", { list: names })}`;
  const art = $("fw-card-art").getContext("2d"), ch = Object.keys(ENEMY).find(c => ENEMY[c].key === key);
  art.clearRect(0, 0, 64, 64); art.drawImage((e ? spritesFor(e) : SPR.enemy[ch])[0].canvas, 0, 0);
  $("fw-card").classList.remove("hidden");
  clearTimeout(cardTimer);
  cardTimer = setTimeout(() => $("fw-card").classList.add("hidden"), 8000);
}

/* ================================================================== flow */
function fmtTime(s) { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function statsHtml() {
  return `<span>${T("kills")} <b>${stats.kills}/${stats.total}</b></span>` +
         `<span>${T("items")} <b>${stats.items}/${stats.itemTotal}</b></span>` +
         (stats.phishTotal ? `<span>${T("phishStat")} <b>${stats.phishOk}/${stats.phishTotal}</b></span>` : "") +
         (stats.quizTotal ? `<span>${T("quizStat")} <b>${stats.quizOk}/${stats.quizTotal}</b></span>` : "") +
         (stats.patchTotal ? `<span>${T("patchStat")} <b>${stats.patched}/${stats.patchTotal}</b></span>` : "") +
         `<span>${T("time")} <b>${fmtTime(stats.time)}</b></span>`;
}
/* three stars: finish; remove 75%; judge every email right and pass the quiz */
function starChecks() {
  return [
    true,
    stats.kills >= Math.ceil(stats.total * 0.75),
    stats.phishOk === stats.phishTotal && stats.quizOk >= Math.min(2, stats.quizTotal)
  ];
}
function starsHtml() {
  const checks = starChecks(), n = checks.filter(Boolean).length;
  return `<p class="stars">${"\u2605".repeat(n)}${"\u2606".repeat(3 - n)}</p><ul class="fw-checks">` +
    checks.map((ok, i) => `<li class="${ok ? "ok" : ""}">${ok ? "\u2713" : "\u2717"} ${T("star" + (i + 1))}</li>`).join("") + "</ul>";
}

/* ---- Incident Response: endless waves, an upgrade between each */
const UPGRADES = {
  firewall: p => { p.armor = Math.min(200, p.armor + 75); },
  patch: p => { p.hp = Math.min(100, p.hp + 40); },
  sig: p => { p.dmgMul += 0.25; },
  clock: p => { p.coolMul *= 0.85; },
  ammo: p => { p.ammo.sig = Math.min(AMMO_MAX.sig, p.ammo.sig + 20); p.ammo.cells = Math.min(AMMO_MAX.cells, p.ammo.cells + 80); },
  backup: p => { p.backup = true; }
};
const WAVE_KINDS = ["v", "w", "s", "o", "t", "d", "n", "r", "l", "m", "x"];
function startSurvival() {
  loadMap(FW_ARENA, LEVEL_LOOK[3], { hp: 100, armor: 50, weapons: [true, true, true], ammo: { sig: 20, cells: 80 }, cur: 1 });
  mode = "survival"; levelIndex = -1;
  survival = { wave: 0, score: 0, choices: [], best: survivalBest() };
  state = "play"; hideOverlay(); $("fw-card").classList.add("hidden");
  nextWave();
  grabPointer();
}
function randomFloor(minDist) {
  for (let k = 0; k < 300; k++) {
    const x = 1 + Math.floor(Math.random() * (mapW - 2)), y = 1 + Math.floor(Math.random() * (mapH - 2));
    if (tile(x, y) !== "." || Math.hypot(x + 0.5 - player.x, y + 0.5 - player.y) < minDist) continue;
    if (enemies.some(e => !e.dead && Math.hypot(e.x - x - 0.5, e.y - y - 0.5) < 0.8)) continue;
    return [x + 0.5, y + 0.5];
  }
  return null;
}
function nextWave() {
  const w = ++survival.wave;
  enemies = enemies.filter(e => !e.dead);              // clear the old remains
  const kinds = WAVE_KINDS.slice(0, Math.min(WAVE_KINDS.length, 2 + w));
  const count = 3 + w * 2;
  for (let i = 0; i < count; i++) {
    const spot = randomFloor(7); if (!spot) break;
    const e = spawnEnemy(kinds[Math.floor(Math.random() * kinds.length)], spot[0], spot[1]);
    e.awake = true; e.disguised = false;
  }
  if (w % 5 === 0) {                                  // a boss every fifth wave
    const spot = randomFloor(8);
    if (spot) { const b = spawnEnemy("LWK"[(w / 5 - 1) % 3], spot[0], spot[1]); b.hpScale = 0.5 + w * 0.02; b.hp = b.def.hp * b.hpScale; b.awake = true; }
  }
  for (let i = 0; i < 2; i++) {                       // a couple of supplies each wave
    const spot = randomFloor(3);
    if (spot) items.push({ ch: "hacH"[Math.floor(Math.random() * 4)], x: spot[0], y: spot[1], taken: false });
  }
  stats.total = enemies.length; stats.kills = 0;
  say(T("waveStart", { n: w })); Sound.play("wake");
}
function updateSurvival() {
  if (enemies.some(e => !e.dead)) return;
  survival.score += survival.wave * 50;
  survival.choices = Object.keys(UPGRADES).filter(k => k !== "backup" || !player.backup).sort(() => Math.random() - 0.5).slice(0, 3);
  state = "upgrade"; mouseDown = false; keys.clear();
  releasePointer(); Sound.play("exit"); showOverlay();
}
function pickUpgrade(k) {
  UPGRADES[k](player);
  state = "play"; hideOverlay(); grabPointer();
  nextWave();
}
function survivalBest() { return load("firewall3d.survival", { wave: 0, score: 0 }); }

/* ---- phishing terminals */
function openMail(mx, my) {
  mail = { mx, my, m: nextEmail(), answered: false };
  state = "mail"; keys.clear(); mouseDown = false; touch.fire = false;
  releasePointer(); showOverlay();
}
function judgeMail(saysPhish) {
  const m = mail.m;
  mail.answered = true;
  mail.right = saysPhish === m.phish;
  mail.opened = !saysPhish;
  map[mail.my][mail.mx] = "N";
  if (mail.right) { stats.phishOk++; Sound.play("weapon"); } else Sound.play("denied");
  state = "verdict"; showOverlay();
}
function closeMail() {
  const m = mail.m;
  state = "play"; hideOverlay(); grabPointer();
  if (mail.right) { player.armor = Math.min(200, player.armor + 25); player.grinT = 1.5; say(T("rewardRight")); flash("rgba(74,222,128,.25)", 0.2); }
  else if (m.phish) {                          // opened a phishing email: a Trojan walks in
    const spot = freeSpotNear(player.x, player.y);
    if (spot) { const t = spawnEnemy("t", spot[0], spot[1], true); t.disguised = false; t.awake = true; t.cd = 1; stats.total++; }
    say(T("phishOpened")); Sound.play("reveal"); flash("rgba(220,30,30,.3)", 0.25);
  } else say(T("safeReported"));
  mail = null;
}
function mailHtml(m) {
  const box = document.createElement("div"); box.className = "fw-mail";
  const head = document.createElement("div"); head.className = "fw-mail-head";
  const row = (label, value) => { const d = document.createElement("div"); const l = document.createElement("span"); l.textContent = label + ": "; const v = document.createElement("b"); v.textContent = value; d.append(l, v); return d; };
  const t = m[lang] || m.en;
  head.append(row(T("mailFrom"), m.from), row(T("mailSubject"), t.subject));
  const body = document.createElement("p"); body.textContent = t.body;
  box.append(head, body);
  if (t.attach) { const a = document.createElement("div"); a.className = "fw-attach"; a.textContent = "\ud83d\udcce " + T("mailAttach") + ": " + t.attach; box.append(a); }
  return box;
}

/* ---- the security check after each sector */
function startQuiz() {
  const here = [...new Set(enemies.map(e => e.def.key))].sort(() => Math.random() - 0.5);
  const all = Object.keys(QUIZ);
  const picks = here.slice(0, 3);
  for (const k of all.sort(() => Math.random() - 0.5)) if (picks.length < 3 && !picks.includes(k)) picks.push(k);
  quiz = {
    i: 0, answered: false,
    qs: picks.map(k => ({ k, options: [k, ...all.filter(o => o !== k).sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5) }))
  };
  stats.quizOk = 0; stats.quizTotal = quiz.qs.length;
  state = "quiz"; showOverlay();
}
function answerQuiz(choice, buttons, replay = false) {
  if (quiz.answered && !replay) return;
  quiz.answered = true; quiz.choice = choice;
  const q = quiz.qs[quiz.i], right = choice === q.k;
  if (!replay) { if (right) { stats.quizOk++; Sound.play("pickup"); } else Sound.play("denied"); }
  for (const b of buttons) {
    b.disabled = true;
    if (b.dataset.k === q.k) b.classList.add("right");
    else if (b.dataset.k === choice) b.classList.add("wrong");
  }
  const note = document.createElement("p"); note.className = "fw-quiz-note " + (right ? "ok" : "bad");
  note.textContent = right ? T("quizRight") : T("quizWrong", { a: THREATS[q.k][lang][0] });
  $("fw-ov-extra").append(note);
  const b1 = $("fw-ov-primary");
  b1.hidden = false; b1.focus();
  b1.textContent = quiz.i < quiz.qs.length - 1 ? T("quizNext") : T("quizDone");
  b1.onclick = () => {
    if (quiz.i < quiz.qs.length - 1) { quiz.i++; quiz.answered = false; showOverlay(); }
    else finishResults();
  };
}
function finishResults() {
  const i = levelIndex, n = starChecks().filter(Boolean).length;
  progress.stars = progress.stars || {};
  progress.stars[i] = Math.max(progress.stars[i] || 0, n);
  save(PROGRESS_KEY, progress);
  quiz = null;
  state = i === FW_LEVELS.length - 1 ? "win" : "clear";
  showOverlay();
}
function finishLevel() {
  Sound.play("exit");
  const i = levelIndex;
  progress.unlocked = Math.max(progress.unlocked, Math.min(FW_LEVELS.length, i + 2));
  const prev = progress.best[i];
  if (!prev || stats.time < prev) progress.best[i] = Math.round(stats.time);
  save(PROGRESS_KEY, progress);
  releasePointer();
  startQuiz();
}
function die() {
  state = "dead";
  if (mode === "survival") {
    const best = survivalBest();
    survival.best = { wave: Math.max(best.wave, survival.wave), score: Math.max(best.score, survival.score) };
    save("firewall3d.survival", survival.best);
  }
  releasePointer();
  setTimeout(showOverlay, 700);
}
function restartCurrent() {
  if (mode === "survival") startSurvival(); else startLevel(levelIndex, levelStart);
}
function startLevel(i, loadout) {
  loadLevel(i, loadout || defaultLoadout(i));
  state = "play";
  hideOverlay();
  say(FW_LEVELS[i].name[lang]);
  $("fw-card").classList.add("hidden");
  grabPointer();
}
function pause() {
  if (state !== "play") return;
  state = "paused"; keys.clear(); mouseDown = false;
  showOverlay();
}
function resume() {
  if (state !== "paused") return;
  state = "play"; hideOverlay(); grabPointer();
}

let extraAfter = null;
function showOverlay() {
  const ov = $("fw-overlay"), L = FW_LEVELS[levelIndex];
  const title = $("fw-ov-title"), text = $("fw-ov-text"), st = $("fw-ov-stats"), extra = $("fw-ov-extra");
  const b1 = $("fw-ov-primary"), b2 = $("fw-ov-secondary");
  st.innerHTML = ""; extra.innerHTML = ""; b1.hidden = false; b2.hidden = false;
  if (state === "menu") {
    title.textContent = T("menuTitle");
    text.textContent = T("menuText");
    const i = Math.min(progress.unlocked, FW_LEVELS.length) - 1;
    extra.innerHTML = `<p class="muted">${T("level", { n: i + 1 })} · ${FW_LEVELS[i].name[lang]}</p>`;
    b1.textContent = T("start"); b1.onclick = () => startLevel(i);
    b2.textContent = T("pickLevel"); b2.onclick = openLevels;
    const best = survivalBest();
    const sv = document.createElement("div"); sv.className = "fw-survival-pitch";
    const sp = document.createElement("p"); sp.className = "muted";
    sp.textContent = T("survivalText") + (best.wave ? " " + T("survivalBest", { w: best.wave, s: best.score }) : "");
    const sb = document.createElement("button"); sb.className = "btn"; sb.textContent = T("survivalStart"); sb.onclick = startSurvival;
    sv.append(sp, sb);
    extraAfter = sv;
  } else if (state === "mail") {
    title.textContent = T("mailTitle");
    text.textContent = T("mailText");
    extra.append(mailHtml(mail.m));
    b1.textContent = T("reportBtn"); b1.onclick = () => judgeMail(true);
    b2.textContent = T("openBtn"); b2.onclick = () => judgeMail(false);
  } else if (state === "verdict") {
    title.textContent = mail.right ? T("mailRight") : T("mailWrong");
    text.textContent = mail.m.phish ? T("wasPhish") : T("wasSafe");
    const ul = document.createElement("ul"); ul.className = "fw-clues";
    for (const c of mail.m.clues[lang] || mail.m.clues.en) { const li = document.createElement("li"); li.textContent = c; ul.append(li); }
    extra.append(mailHtml(mail.m), ul);
    b1.textContent = T("carryOn"); b1.onclick = closeMail;
    b2.hidden = true;
  } else if (state === "quiz") {
    const q = quiz.qs[quiz.i];
    title.textContent = T("quizTitle", { n: quiz.i + 1, t: quiz.qs.length });
    text.textContent = T("quizAsk");
    const clue = document.createElement("p"); clue.className = "fw-clue"; clue.textContent = QUIZ[q.k][lang] || QUIZ[q.k].en;
    const opts = document.createElement("div"); opts.className = "fw-options";
    const buttons = q.options.map(k => {
      const b = document.createElement("button"); b.className = "btn fw-option"; b.dataset.k = k;
      b.textContent = THREATS[k][lang][0];
      b.onclick = () => answerQuiz(k, buttons);
      return b;
    });
    opts.append(...buttons);
    extra.append(clue, opts);
    b1.hidden = true; b2.hidden = true;
    if (quiz.answered) answerQuiz(quiz.choice, buttons, true);   // redrawn after a language switch
  } else if (state === "paused") {
    title.textContent = T("paused");
    text.textContent = T("pausedText");
    st.innerHTML = statsHtml();
    b1.textContent = T("resume"); b1.onclick = resume;
    b2.textContent = T("restart"); b2.onclick = restartCurrent;
  } else if (state === "dead" && mode === "survival") {
    title.textContent = T("survivalOver");
    text.textContent = T("survivalOverText", { w: survival.wave, s: survival.score, bw: survival.best.wave, bs: survival.best.score });
    b1.textContent = T("retry"); b1.onclick = startSurvival;
    b2.textContent = T("backToMenu"); b2.onclick = () => { loadLevel(0, defaultLoadout(0)); state = "menu"; showOverlay(); };
  } else if (state === "upgrade") {
    title.textContent = T("waveClear", { n: survival.wave });
    text.textContent = T("chooseUpgrade");
    st.innerHTML = `<span>${T("score")} <b>${survival.score}</b></span>`;
    const opts = document.createElement("div"); opts.className = "fw-options fw-upgrades";
    for (const k of survival.choices) {
      const [name, desc] = T("up_" + k).split("|");
      const b = document.createElement("button"); b.className = "btn fw-option";
      const strong = document.createElement("strong"); strong.textContent = name;
      const small = document.createElement("span"); small.textContent = desc;
      b.append(strong, small); b.onclick = () => pickUpgrade(k);
      opts.append(b);
    }
    extra.append(opts);
    b1.hidden = true; b2.hidden = true;
  } else if (state === "dead") {
    title.textContent = T("dead");
    text.textContent = T("deadText");
    st.innerHTML = statsHtml();
    b1.textContent = T("retry"); b1.onclick = () => startLevel(levelIndex, levelStart);
    b2.textContent = T("pickLevel"); b2.onclick = openLevels;
  } else if (state === "clear") {
    const next = FW_LEVELS[levelIndex + 1];
    title.textContent = `${T("clear")} — ${L.name[lang]}`;
    text.textContent = `${T("level", { n: levelIndex + 2 })}: ${next.name[lang]}. ${next.brief[lang]}`;
    st.innerHTML = statsHtml();
    extra.innerHTML = starsHtml();
    const carry = snapshot(player);
    b1.textContent = T("next"); b1.onclick = () => startLevel(levelIndex + 1, carry);
    b2.textContent = T("pickLevel"); b2.onclick = openLevels;
  } else if (state === "win") {
    title.textContent = T("win");
    text.textContent = T("winText");
    st.innerHTML = statsHtml();
    extra.innerHTML = starsHtml();
    b1.textContent = T("intel"); b1.onclick = openIntel;
    b2.textContent = T("playAgain"); b2.onclick = () => startLevel(0);
  }
  if (extraAfter) { extra.append(extraAfter); extraAfter = null; }
  if (state === "menu" || state === "dead" || state === "clear") {
    // the briefing for the level about to be played
    const i = state === "menu" ? Math.min(progress.unlocked, FW_LEVELS.length) - 1 : -1;
    if (i >= 0) extra.innerHTML += `<p>${FW_LEVELS[i].brief[lang]}</p>`;
  }
  ov.classList.remove("hidden");
}
function hideOverlay() { $("fw-overlay").classList.add("hidden"); }

function openLevels() {
  const list = $("fw-level-list"); list.innerHTML = "";
  FW_LEVELS.forEach((L, i) => {
    const b = document.createElement("button");
    b.className = "level-card";
    b.disabled = i >= progress.unlocked;
    const best = progress.best[i] != null ? T("best", { t: fmtTime(progress.best[i]) }) : (b.disabled ? T("locked") : "");
    const got = (progress.stars || {})[i] || 0;
    const stars = got ? `<span class="stars">${"\u2605".repeat(got)}${"\u2606".repeat(3 - got)}</span>` : "";
    b.innerHTML = `<span class="n">${T("level", { n: i + 1 })}</span><span class="t">${L.name[lang]}</span>${stars}<span class="best">${best}</span>`;
    b.onclick = () => { $("fw-levels-dialog").close(); startLevel(i); };
    list.appendChild(b);
  });
  const sb = document.createElement("button"), best = survivalBest();
  sb.className = "level-card";
  sb.innerHTML = `<span class="n">${T("endless")}</span><span class="t">${T("survival")}</span><span class="best">${best.wave ? T("survivalBest", { w: best.wave, s: best.score }) : ""}</span>`;
  sb.onclick = () => { $("fw-levels-dialog").close(); startSurvival(); };
  list.appendChild(sb);
  $("fw-levels-dialog").showModal();
}
function openIntel() {
  const list = $("fw-intel-list"); list.innerHTML = "";
  const listed = new Set();
  for (const [ch, def] of Object.entries(ENEMY)) {
    if (listed.has(def.key)) continue;          // the bosses share a kind with an ordinary monster
    listed.add(def.key);
    const known = intel.has(def.key);
    const row = document.createElement("div");
    row.className = "legend-item" + (known ? "" : " locked");
    const c = makeCanvas(64, 64);
    if (known) c.getContext("2d").drawImage(SPR.enemy[ch][0].canvas, 0, 0);
    else { const g = c.getContext("2d"); g.fillStyle = "#3d5171"; g.font = "bold 36px sans-serif"; g.fillText("?", 22, 46); }
    const [name, text] = THREATS[def.key][lang];
    const span = document.createElement("span");
    span.innerHTML = known ? `<b>${name}</b>${text}` : `<b>???</b>${T("unknown")}`;
    row.append(c, span);
    list.appendChild(row);
  }
  buildTimeline();
  $("fw-intel-dialog").showModal();
}
function buildTimeline() {
  $("fw-timeline-count").textContent = T("removedCount", { n: FW_HISTORY.filter(h => removed.has(h.name)).length, t: FW_HISTORY.length });
  const list = $("fw-timeline"); list.innerHTML = "";
  for (const h of FW_HISTORY) {
    const li = document.createElement("li"), got = removed.has(h.name);
    if (got) li.className = "got";
    const year = document.createElement("span"); year.className = "yr"; year.textContent = h.year;
    const ch = Object.keys(ENEMY).find(c => ENEMY[c].key === h.kind);
    const pic = makeCanvas(64, 64); pic.className = "pic";
    const bossCh = Object.keys(ENEMY).find(c => ENEMY[c].specimen === h.name);
    pic.getContext("2d").drawImage((SPR.variant[h.name] || SPR.enemy[bossCh || ch])[0].canvas, 0, 0);
    const head = document.createElement("b"); head.textContent = h.name;
    const kind = document.createElement("span"); kind.className = "kind k-" + h.kind; kind.textContent = THREATS[h.kind][lang][0];
    head.append(" ", kind);
    if (got) { const tick = document.createElement("span"); tick.className = "tick"; tick.textContent = "✓ " + T("removedMark"); head.append(" ", tick); }
    const text = document.createElement("p"); text.textContent = h[lang] || h.en;
    const body = document.createElement("div"); body.append(head, text);
    li.append(year, pic, body);
    list.appendChild(li);
  }
}

/* ================================================================== input */
function grabPointer() {
  if (matchMedia("(pointer: coarse)").matches) return;
  try { const r = screen.requestPointerLock && screen.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* not allowed here */ }
}
function releasePointer() { if (document.pointerLockElement) document.exitPointerLock(); }
const locked = () => document.pointerLockElement === screen;

document.addEventListener("pointerlockchange", () => {
  if (!locked()) { mouseDown = false; if (state === "play") pause(); }
});
document.addEventListener("mousemove", e => {
  if (locked() && state === "play") player.a += e.movementX * 0.0026;
});
screen.addEventListener("mousedown", e => {
  if (e.button !== 0 || state !== "play") return;
  if (!locked() && document.pointerLockElement === null && "requestPointerLock" in screen) {
    grabPointer();
    if (!locked()) mouseDown = true;       // pointer lock refused (an iframe, say): the click still fires
    return;
  }
  mouseDown = true;
});
window.addEventListener("mouseup", () => { mouseDown = false; });
screen.addEventListener("wheel", e => {
  if (state !== "play") return;
  e.preventDefault(); cycleWeapon(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

const GAME_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Tab"]);
window.addEventListener("keydown", e => {
  if (document.querySelector("dialog[open]")) return;
  if (e.code === "KeyF" && !e.ctrlKey && !e.metaKey) { toggleFullscreen(); return; }
  if (state !== "play") {
    const choosing = state === "mail" || state === "upgrade" || (state === "quiz" && !quiz.answered);
    if ((e.code === "Enter" || e.code === "Space") && !choosing && !$("fw-ov-primary").hidden && !$("fw-overlay").classList.contains("hidden")) { e.preventDefault(); $("fw-ov-primary").click(); }
    else if (e.code === "KeyP" && state === "paused") resume();
    return;
  }
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  keys.add(e.code);
  if (e.code === "KeyE" || e.code === "Enter") use();
  else if (e.code === "Digit1") selectWeapon(0);
  else if (e.code === "Digit2") selectWeapon(1);
  else if (e.code === "Digit3") selectWeapon(2);
  else if (e.code === "KeyQ") cycleWeapon(1);
  else if (e.code === "KeyM" || e.code === "Tab") showMap = !showMap;
  else if (e.code === "KeyP" || e.code === "Escape") { releasePointer(); pause(); }
});
window.addEventListener("keyup", e => keys.delete(e.code));
window.addEventListener("blur", () => { keys.clear(); mouseDown = false; pause(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

/* touch: a stick on the left, drag anywhere else on the view to turn */
(function touchControls() {
  const stick = $("fw-stick"), knob = stick.querySelector("span");
  let stickId = null, turnId = null, lastX = 0;
  stick.addEventListener("touchstart", e => { e.preventDefault(); stickId = e.changedTouches[0].identifier; moveStick(e.changedTouches[0]); }, { passive: false });
  stick.addEventListener("touchmove", e => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === stickId) moveStick(t);
  }, { passive: false });
  const endStick = e => {
    for (const t of e.changedTouches) if (t.identifier === stickId) { stickId = null; touch.mx = touch.my = 0; knob.style.transform = ""; }
  };
  stick.addEventListener("touchend", endStick); stick.addEventListener("touchcancel", endStick);
  function moveStick(t) {
    const r = stick.getBoundingClientRect();
    let dx = (t.clientX - r.left - r.width / 2) / (r.width / 2), dy = (t.clientY - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
    touch.mx = Math.abs(dx) > 0.2 ? dx : 0; touch.my = Math.abs(dy) > 0.2 ? dy : 0;
    knob.style.transform = `translate(${dx * 36}px, ${dy * 36}px)`;
  }
  screen.addEventListener("touchstart", e => { const t = e.changedTouches[0]; turnId = t.identifier; lastX = t.clientX; }, { passive: true });
  screen.addEventListener("touchmove", e => {
    for (const t of e.changedTouches) if (t.identifier === turnId) { touch.turn += (t.clientX - lastX) * 0.008; lastX = t.clientX; }
  }, { passive: true });
  screen.addEventListener("touchend", e => { for (const t of e.changedTouches) if (t.identifier === turnId) turnId = null; });
  for (const b of document.querySelectorAll(".fw-touch-buttons button")) {
    const act = b.dataset.act;
    b.addEventListener("touchstart", e => {
      e.preventDefault(); Sound.ensure();
      if (state !== "play") return;
      if (act === "fire") touch.fire = true;
      else if (act === "use") use();
      else cycleWeapon(1);
    }, { passive: false });
    b.addEventListener("touchend", () => { if (act === "fire") touch.fire = false; });
  }
})();

/* ============================================================ page chrome */
function fullscreenOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || document.body.classList.contains("fs"); }
function toggleFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    return;
  }
  const root = document.documentElement, req = root.requestFullscreen || root.webkitRequestFullscreen;
  document.body.classList.add("fs");
  if (req) { const r = req.call(root); if (r && r.catch) r.catch(() => {}); }
  applyText();
}
for (const ev of ["fullscreenchange", "webkitfullscreenchange"]) {
  document.addEventListener(ev, () => {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) document.body.classList.remove("fs");
    applyText();
  });
}
function applyText() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $("fw-tagline").textContent = T("tagline");
  $("fw-back").textContent = T("back");
  $("fw-lang").textContent = T("other");
  $("fw-levels").textContent = T("levels");
  $("fw-intel").textContent = T("intel");
  $("fw-sound").textContent = T(Sound.on ? "soundOn" : "soundOff");
  $("fw-sound").setAttribute("aria-pressed", String(Sound.on));
  $("fw-music").textContent = T(Music.on ? "musicOn" : "musicOff");
  $("fw-music").setAttribute("aria-pressed", String(Music.on));
  $("fw-full").textContent = T(fullscreenOn() ? "exitFull" : "full");
  $("fw-help").textContent = T("help");
  $("fw-keys").textContent = T("keys");
  $("fw-foot").textContent = T("foot");
  $("fw-disclaimer").innerHTML = `<strong>${T("disclaimerTitle")}</strong> ${T("disclaimer")}`;
  $("fw-levels-title").textContent = T("levels");
  $("fw-intel-title").textContent = T("intel");
  $("fw-intel-sub").textContent = T("intelSub");
  $("fw-timeline-btn").textContent = T("timeline");
  $("fw-timeline-title").textContent = T("timelineTitle");
  $("fw-timeline-sub").textContent = T("timelineSub");
  $("fw-source").textContent = T("source");
  $("fw-help-title").textContent = T("help");
  $("fw-help-body").innerHTML = T("helpHtml") + T("helpMore") + `<p class="fw-disclaimer"><strong>${T("disclaimerTitle")}</strong> ${T("disclaimer")}</p>`;
  for (const b of document.querySelectorAll(".fw-close")) b.textContent = T("close");
  if (state !== "play") showOverlay();
}
$("fw-lang").onclick = () => {
  lang = lang === "zh" ? "en" : "zh";
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage disabled */ }
  applyText();
};
$("fw-sound").onclick = () => { Sound.on = !Sound.on; save(SOUND_KEY, Sound.on); applyText(); if (Sound.on) Sound.play("pickup"); };
$("fw-full").onclick = toggleFullscreen;
$("fw-music").onclick = () => { Music.on = !Music.on; save("firewall3d.music", Music.on); applyText(); };
$("fw-levels").onclick = () => { pause(); openLevels(); };
$("fw-intel").onclick = () => { pause(); openIntel(); };
$("fw-timeline-btn").onclick = () => { pause(); openIntel(); $("fw-timeline-title").scrollIntoView(); };
$("fw-help").onclick = () => { pause(); $("fw-help-dialog").showModal(); };
document.addEventListener("click", () => Sound.ensure(), { once: true });
try { if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("theme-dark"); } catch (e) { /* storage disabled */ }

/* ================================================================== start */
loadLevel(Math.min(progress.unlocked, FW_LEVELS.length) - 1, defaultLoadout(0));
state = "menu";
applyText();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state === "play") update(dt);
  else if (state === "menu") player.a += dt * 0.15;   // a slow look around behind the title
  Music.set(state === "play" && Sound.on && Music.on);
  present();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// handy when poking at the game from the console or a test
window.FW = { get state() { return state; }, get player() { return player; }, get enemies() { return enemies; }, get map() { return map; }, startLevel, startSurvival, update, present };
})();
