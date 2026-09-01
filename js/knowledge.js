/* ============================================================================
   BIT BUILDER — component knowledge
   Every part, tool and piece of malware in the game is a real thing. This file
   holds what each one actually is, in English and Mandarin, and it feeds three
   places: the field note shown when you pick something up, the knowledge base
   dialog, and the knowledge check after a level.
   ========================================================================== */

const KNOWLEDGE = {
  /* ------------------------------------------------------------- hardware */
  cpu: {
    group: "hardware",
    en: { name: "CPU", note: "The processor. It runs one instruction cycle over and over — fetch, decode, execute, write back. Core count and clock speed decide how much work it gets through per second." },
    zh: { name: "中央处理器 (CPU)", note: "处理器。它不断重复同一个指令周期：取指、译码、执行、写回。核心数量与时钟频率决定它每秒能完成多少运算。" }
  },
  ram: {
    group: "hardware",
    en: { name: "RAM module", note: "Working memory. Programs and their data live here while running, and it is volatile — cut the power and the contents are gone. Your C++ variables sit in RAM; the disk is not involved." },
    zh: { name: "内存条 (RAM)", note: "工作内存。程序运行时的代码与数据都放在这里，而且它是易失性的：一断电内容就消失。C++ 里的变量就存在内存中，与硬盘无关。" }
  },
  gpu: {
    group: "hardware",
    en: { name: "Graphics card", note: "Thousands of small cores running the same operation on many values at once. Built for pixels, now also used for anything wide and parallel — physics, video, machine learning." },
    zh: { name: "显卡 (GPU)", note: "由成千上万个小核心组成，能同时对大量数据执行相同的运算。原本为图形而生，如今也用于一切高度并行的工作：物理模拟、视频处理、机器学习。" }
  },
  ssd: {
    group: "hardware",
    en: { name: "SSD", note: "Non-volatile flash storage: it keeps your files with the power off. No moving parts, so it finds data in microseconds where a spinning hard disk needs milliseconds." },
    zh: { name: "固态硬盘 (SSD)", note: "非易失性的闪存存储：断电后文件依然保留。没有机械部件，寻址只需微秒，而机械硬盘需要毫秒。" }
  },
  psu: {
    group: "hardware",
    en: { name: "Power supply", note: "Converts AC from the wall into the steady DC rails the machine needs — 12 V, 5 V and 3.3 V. Rated in watts: the total the rest of the build is allowed to draw." },
    zh: { name: "电源 (PSU)", note: "把市电的交流电转换成机器需要的稳定直流电：12V、5V 与 3.3V。它以瓦特标定，也就是整机允许消耗的总功率。" }
  },
  fan: {
    group: "hardware",
    en: { name: "Cooling fan", note: "Moves heat away from the chips. Silicon slows itself down when it gets too hot — that is thermal throttling — so cooling is what lets a fast processor stay fast." },
    zh: { name: "散热风扇", note: "把芯片产生的热量带走。硅芯片过热时会自动降频，也就是“温度墙”，所以散热决定了高性能处理器能否持续保持高性能。" }
  },
  nic: {
    group: "hardware",
    en: { name: "Network card", note: "Turns data into signals on a cable or radio and back again. It carries a MAC address, the hardware identity a local network uses to deliver frames to this machine." },
    zh: { name: "网卡 (NIC)", note: "把数据转换成网线或无线电上的信号，再转换回来。它拥有一个 MAC 地址，也就是局域网用来把数据帧送到这台机器的硬件标识。" }
  },
  mobo: {
    group: "hardware",
    en: { name: "Motherboard", note: "The board everything plugs into. Its chipset and buses carry data between CPU, memory, storage and expansion slots — nothing in the machine talks to anything else without it." },
    zh: { name: "主板", note: "所有部件插入的电路板。它的芯片组与总线在 CPU、内存、存储和扩展插槽之间传输数据——没有它，机器里的任何部件都无法互相通信。" }
  },

  /* ------------------------------------------------------------- software */
  os: {
    group: "software",
    en: { name: "OS image", note: "The operating system: it schedules processes onto the CPU, hands out memory, and presents disks as files. Your program never touches the hardware directly — it asks the OS." },
    zh: { name: "操作系统镜像", note: "操作系统负责把进程调度到 CPU 上、分配内存、并把磁盘呈现为文件。你的程序从不直接操作硬件，而是向操作系统提出请求。" }
  },
  driver: {
    group: "software",
    en: { name: "Device driver", note: "The translator between the OS and one specific device. Same printer, different driver per operating system — the device speaks its own protocol and the driver speaks it for you." },
    zh: { name: "驱动程序", note: "操作系统与某个具体设备之间的翻译官。同一台打印机在不同操作系统上需要不同的驱动：设备只懂自己的协议，驱动替你去说这种语言。" }
  },
  compiler: {
    group: "software",
    en: { name: "Compiler", note: "Translates source code into machine code before the program runs. `g++ main.cpp -o main` preprocesses, compiles, assembles and links — errors are caught here, not while running." },
    zh: { name: "编译器", note: "在程序运行之前，把源代码翻译成机器码。`g++ main.cpp -o main` 会依次完成预处理、编译、汇编与链接——语法错误在这一步就被发现，而不是运行时。" }
  },
  antivirus: {
    group: "software",
    en: { name: "Antivirus", note: "Looks for malicious code, by signature (does this match known malware?) and by behaviour (why is this program encrypting every file?). Quarantine isolates a suspect file instead of deleting it." },
    zh: { name: "杀毒软件", note: "通过特征码（是否与已知恶意程序匹配）和行为分析（这个程序为何在加密所有文件）来查找恶意代码。隔离是把可疑文件封存起来，而不是直接删除。" }
  },
  database: {
    group: "software",
    en: { name: "Database", note: "Storage you can question. Rows live in tables, an index makes lookups fast without scanning everything, and a query — `SELECT name FROM students WHERE mark > 80` — says what you want, not how to find it." },
    zh: { name: "数据库", note: "可以被查询的存储系统。数据以行的形式存放在表中，索引让查找无需扫描全部记录；而查询语句 `SELECT name FROM students WHERE mark > 80` 只说明你要什么，不必说明怎么找。" }
  },
  browser: {
    group: "software",
    en: { name: "Browser", note: "Fetches pages over HTTP, parses HTML into a document tree, styles it with CSS and runs the JavaScript. This game is a browser program: no install, no plugin, just files it downloads." },
    zh: { name: "浏览器", note: "通过 HTTP 获取网页，把 HTML 解析成文档树，用 CSS 排版，并运行 JavaScript。这个游戏本身就是浏览器程序：无需安装、无需插件，只是它下载的一些文件。" }
  },

  /* ---------------------------------------------------------------- tools */
  F: {
    group: "tool",
    en: { name: "Coolant Seal", note: "Liquid cooling really is used in machine rooms: a pumped loop carries heat away far better than air. Spilled coolant is still a liquid near live electronics, hence the seal." },
    zh: { name: "冷却液防护", note: "机房中确实会使用液冷：泵送的冷却回路带走热量的效率远高于风冷。但泄漏的冷却液依然是靠近带电设备的液体，所以需要防护。" }
  },
  H: {
    group: "tool",
    en: { name: "Heatsink", note: "A block of finned metal that spreads heat over a large surface so air can carry it off. Thermal paste fills the microscopic gaps between chip and heatsink." },
    zh: { name: "散热器", note: "带鳍片的金属块，把热量分散到很大的表面，让空气带走。硅脂用来填补芯片与散热器之间肉眼看不见的缝隙。" }
  },
  K: {
    group: "tool",
    en: { name: "Grip Pads", note: "Server rooms are kept cold on purpose — cool air removes heat faster. Data centres often run a cold aisle in front of the racks and a hot aisle behind them." },
    zh: { name: "防滑垫", note: "机房刻意保持低温，因为冷空气带走热量更快。数据中心常采用冷热通道分离：机柜正面是冷通道，背面是热通道。" }
  },
  M: {
    group: "tool",
    en: { name: "Mag Grips", note: "A bus is the shared set of wires that carries data between parts. Its width (how many bits at once) and clock rate set how much can move per second." },
    zh: { name: "磁力手套", note: "总线是部件之间共享的一组导线。它的位宽（一次能传多少位）与时钟频率共同决定了每秒可以传输多少数据。" }
  },
  Q: {
    group: "tool",
    en: { name: "Quarantine kit", note: "Quarantine is what real antivirus does to a suspect file: move it somewhere it cannot run, rather than deleting it, in case the detection was wrong." },
    zh: { name: "隔离工具包", note: "隔离正是真实杀毒软件对可疑文件的处理方式：把它移到无法运行的地方，而不是直接删除，以防误判。" }
  },

  /* -------------------------------------------------------------- malware */
  "monster:@": {
    group: "malware",
    en: { name: "Bug", note: "A bug is a mistake in code, not an attacker. The name stuck after a moth was found jamming a relay in the Harvard Mark II in 1947 — the log entry reads 'first actual case of bug being found'." },
    zh: { name: "臭虫 (Bug)", note: "Bug 指的是代码里的错误，而不是攻击者。1947 年，一只飞蛾卡在 Harvard Mark II 的继电器里，日志写着“第一次真正发现 bug”，这个说法从此流传下来。" }
  },
  "monster:&": {
    group: "malware",
    en: { name: "Trojan", note: "Malware that hides inside something you wanted to run. Unlike a worm it does not spread by itself — it needs you to open it, which is why it hunts you here." },
    zh: { name: "木马", note: "伪装在你想运行的程序里的恶意软件。与蠕虫不同，它不会自行传播，而是需要你亲手打开它——所以在游戏里它会主动追着你跑。" }
  },
  "monster:%": {
    group: "malware",
    en: { name: "Glitch", note: "Not every failure is malicious. A cosmic ray flipping one bit of RAM is a real phenomenon, which is why servers use ECC memory that detects and corrects single-bit errors." },
    zh: { name: "故障 (Glitch)", note: "并非所有故障都是恶意的。宇宙射线翻转内存中的某一位是真实存在的现象，因此服务器使用 ECC 内存来检测并纠正单比特错误。" }
  },
  "monster:$": {
    group: "malware",
    en: { name: "Packet", note: "Networks send data in packets: a header saying where it is going, then the payload. A flood of them is how a denial-of-service attack drowns a server." },
    zh: { name: "数据包", note: "网络以数据包的形式传输数据：包头说明去向，之后是负载。当数据包如洪水般涌来时，就构成了拒绝服务（DoS）攻击，把服务器淹没。" }
  }
};

/* Kinds the knowledge check can ask about. */
const QUIZ_KINDS = Object.keys(KNOWLEDGE).filter(k => KNOWLEDGE[k].group === "hardware" || KNOWLEDGE[k].group === "software");

function knowledgeFor(id, lang) {
  const entry = KNOWLEDGE[id];
  if (!entry) return null;
  return entry[lang] || entry.en;
}

if (typeof module !== "undefined") { module.exports = { KNOWLEDGE, QUIZ_KINDS, knowledgeFor }; }
