/* ============================================================================
   PACKET RUSH — levels
   The world is 400 x 200 pixels. Terrain is a list of rectangles painted in
   order: m 1 = silicon (diggable, the default), m 2 = shielded steel (nothing
   digs it), m 0 = cut a hole. `hatch` is where packets drop in, `exit` is the
   feet position of the server port they must reach, `hazards` are live wires
that short out any packet touching them, `rate` is the number of
   ticks between releases (20 ticks = one second), `ttl` is the time limit in
   seconds. Every level is proven winnable by tools/lem-check.js.
   ========================================================================== */

const STEEL = 2;

const PACKET_LEVELS = [
  {
    id: "drop",
    name: { en: "Packet Drop", zh: "数据包下沉" },
    count: 10, need: 6, rate: 40, ttl: 150,
    hatch: { x: 120, y: 60 },
    exit: { x: 320, y: 149 },
    skills: { pipe: 2 },
    terrain: [
      { x: 0, y: 150, w: 400, h: 50 },
      { x: 40, y: 100, w: 320, h: 20 },
      { x: 30, y: 60, w: 10, h: 60, m: STEEL },
      { x: 360, y: 60, w: 10, h: 60, m: STEEL }
    ],
    goal: {
      en: "The packets are stuck pacing a shelf. Give one the <b>Pipe</b> skill so it digs straight down, and the rest follow it to the server below.",
      zh: "数据包被困在一块平台上来回踱步。给其中一个分配<b>管道</b>技能，让它向下挖通，其他数据包就能跟着落到下方的服务器。"
    },
    note: {
      en: "Data never travels as one big lump. It is cut into small <b>packets</b>, each carrying its own destination address, and each finds its own way there. A <b>pipe</b> (the | in a command line) passes one program's output straight down to the next.",
      zh: "数据从来不是整块传输的，而是被切成许多小<b>数据包</b>，每个包都带着自己的目的地址，各自寻路到达。<b>管道</b>（命令行里的 |）把一个程序的输出直接往下传给下一个程序。"
    }
  },
  {
    id: "firewall",
    name: { en: "Firewall", zh: "防火墙" },
    count: 10, need: 8, rate: 36, ttl: 120,
    hatch: { x: 230, y: 100 },
    exit: { x: 50, y: 139 },
    skills: { firewall: 1 },
    terrain: [
      { x: 0, y: 140, w: 310, h: 20 },
      { x: 0, y: 160, w: 60, h: 40 }
    ],
    goal: {
      en: "Packets head right, straight off the edge of the network. Put up a <b>Firewall</b> near the drop to turn the traffic back towards the server.",
      zh: "数据包一路向右，直接掉出网络边缘。在悬崖附近设一道<b>防火墙</b>，把流量挡回服务器那一边。"
    },
    note: {
      en: "A <b>firewall</b> sits between networks and checks every packet against a set of rules. Traffic that is not allowed through is dropped or turned away. Here the one packet that becomes the firewall is lost, but it protects everyone behind it.",
      zh: "<b>防火墙</b>位于网络之间，按照一组规则检查每一个数据包，不被允许的流量会被丢弃或挡回。在这里，变成防火墙的那个数据包会牺牲，但它保护了身后所有的数据包。"
    }
  },
  {
    id: "bridge",
    name: { en: "Bridge the Gap", zh: "搭建网桥" },
    count: 10, need: 7, rate: 80, ttl: 150,
    hatch: { x: 60, y: 85 },
    exit: { x: 340, y: 129 },
    skills: { bridge: 3 },
    terrain: [
      { x: 0, y: 130, w: 180, h: 20 },
      { x: 200, y: 130, w: 200, h: 20 }
    ],
    goal: {
      en: "Two network segments with nothing between them. Have the first packet build a <b>Bridge</b> right at the edge — the others will walk across it.",
      zh: "两个网段之间什么都没有。让第一个数据包在边缘<b>搭桥</b>，其余的数据包就能走过去。"
    },
    note: {
      en: "A <b>network bridge</b> joins two separate segments so that they behave as one network. It learns which devices live on which side and forwards frames across only when they need to cross.",
      zh: "<b>网桥</b>把两个独立的网段连接起来，让它们像一个网络一样工作。它会记住哪些设备在哪一侧，只有需要跨越时才转发数据帧。"
    }
  },
  {
    id: "tunnel",
    name: { en: "Tunnel Vision", zh: "隧道穿越" },
    count: 10, need: 8, rate: 40, ttl: 150,
    hatch: { x: 70, y: 95 },
    exit: { x: 330, y: 139 },
    skills: { tunnel: 2 },
    terrain: [
      { x: 0, y: 140, w: 400, h: 60 },
      { x: 180, y: 60, w: 40, h: 80 },
      { x: 140, y: 40, w: 120, h: 20, m: STEEL }
    ],
    goal: {
      en: "A solid block of silicon stands between the packets and the server, and it is far too tall to step over. Dig a <b>Tunnel</b> through it.",
      zh: "一整块硅挡在数据包和服务器之间，太高了跨不过去。用<b>隧道</b>技能从中间穿过去。"
    },
    note: {
      en: "A <b>tunnel</b> wraps one kind of traffic inside another so it can cross a network that would otherwise block it. A VPN is a tunnel: your packets travel encrypted inside other packets, and nobody on the way can read them.",
      zh: "<b>隧道</b>把一种流量封装在另一种流量里面，使它能穿过原本会阻挡它的网络。VPN 就是一种隧道：你的数据包被加密后装在别的数据包里传输，途中没有人能读懂。"
    }
  },
  {
    id: "uplink",
    name: { en: "Uplink", zh: "上行链路" },
    count: 6, need: 5, rate: 50, ttl: 150,
    hatch: { x: 50, y: 120 },
    exit: { x: 320, y: 179 },
    skills: { uplink: 6, buffer: 6 },
    terrain: [
      { x: 0, y: 170, w: 150, h: 30 },
      { x: 150, y: 60, w: 12, h: 140, m: STEEL },
      { x: 162, y: 180, w: 238, h: 20 }
    ],
    goal: {
      en: "The server sits behind a shielded wall, and on the far side is a long drop. Each packet needs an <b>Uplink</b> to climb and a <b>Buffer</b> to land safely — a packet can hold both.",
      zh: "服务器在一堵屏蔽墙后面，墙的另一边是很深的落差。每个数据包都需要<b>上行链路</b>来攀爬，还需要<b>缓冲区</b>来安全落地 —— 一个数据包可以同时拥有两者。"
    },
    note: {
      en: "A <b>buffer</b> is a small piece of memory that absorbs a burst of data arriving faster than it can be handled. Without one, the extra data is simply lost. Video players buffer ahead for exactly this reason.",
      zh: "<b>缓冲区</b>是一小块内存，用来吸收来得比处理速度更快的突发数据。没有缓冲区，多出来的数据就会丢失。视频播放器预先缓冲正是这个道理。"
    }
  },
  {
    id: "overflow",
    name: { en: "Stack Overflow", zh: "栈溢出" },
    count: 10, need: 7, rate: 36, ttl: 180,
    hatch: { x: 240, y: 95 },
    exit: { x: 40, y: 139 },
    skills: { firewall: 1, overflow: 2 },
    terrain: [
      { x: 0, y: 140, w: 330, h: 20 },
      { x: 0, y: 160, w: 330, h: 40, m: STEEL },
      { x: 110, y: 60, w: 6, h: 80 },
      { x: 60, y: 40, w: 120, h: 20, m: STEEL }
    ],
    goal: {
      en: "Hold the crowd back from the cliff with a <b>Firewall</b>, then send one packet into an <b>Overflow</b> next to the thin silicon wall to blast a way through.",
      zh: "先用<b>防火墙</b>把数据包挡在悬崖前，再让一个数据包在薄硅墙旁边<b>溢出</b>，炸开一条通路。"
    },
    note: {
      en: "A <b>buffer overflow</b> happens when a program writes more data into a buffer than it can hold, and the extra spills over whatever sits next to it in memory. It is one of the oldest and most exploited security bugs there is.",
      zh: "当程序向缓冲区写入超出其容量的数据时，多出来的部分会覆盖内存中相邻的内容，这就是<b>缓冲区溢出</b>。它是历史最悠久、被利用得最多的安全漏洞之一。"
    }
  },
  {
    id: "stack",
    name: { en: "Full Stack", zh: "全栈" },
    count: 12, need: 8, rate: 70, ttl: 240,
    hatch: { x: 40, y: 50 },
    exit: { x: 340, y: 154 },
    skills: { bridge: 2, tunnel: 2, pipe: 2, firewall: 1 },
    hazards: [{ x: 100, y: 140, w: 60, h: 15 }],
    terrain: [
      { x: 0, y: 100, w: 120, h: 20 },
      { x: 140, y: 100, w: 260, h: 15 },
      { x: 200, y: 50, w: 30, h: 50 },
      { x: 180, y: 30, w: 80, h: 20, m: STEEL },
      { x: 390, y: 20, w: 10, h: 80, m: STEEL },
      { x: 0, y: 155, w: 400, h: 45 }
    ],
    goal: {
      en: "Everything at once: bridge the gap, tunnel through the wall, then pipe down through the floor to the server underneath.",
      zh: "综合运用：先搭桥越过缺口，再挖隧道穿墙，最后用管道向下挖到下方的服务器。"
    },
    note: {
      en: "Networks are built as a <b>stack of layers</b>: the physical wire, the link between neighbours, routing across networks, reliable delivery, and finally the application. Each layer does one job and trusts the one below it — just like each packet here does one job.",
      zh: "网络是按<b>分层协议栈</b>构建的：物理线路、相邻设备之间的链路、跨网络的路由、可靠传输，最后才是应用程序。每一层只做一件事，并信任下面那一层 —— 就像这里每个数据包只负责一项工作。"
    }
  }
];

if (typeof module !== "undefined") module.exports = { PACKET_LEVELS };
