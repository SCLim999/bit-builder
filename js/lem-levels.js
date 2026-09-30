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


/* The OSI reference model, top to bottom as it is usually drawn. Each level
   below names the layer(s) its concept lives on in `osi`, with `osiWhy`
   saying why, and the OSI panel lists which levels touch each layer. */
const OSI_SOURCES = [
  { title: "The OSI Model Explained — Network Supply",
    url: "https://www.network-supply.com/blogs/knowledge/the-osi-model-explained" },
  { title: "TCP/IP protocols — IBM CICS Transaction Server 5.5 documentation",
    url: "https://www.ibm.com/docs/en/cics-ts/5.5.0?topic=concepts-tcpip-protocols" },
  { title: "What is the OSI model? — Cloudflare Learning Center",
    url: "https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/" }
];

/* The four-layer TCP/IP model the Internet actually runs on, with the OSI
   layers each one covers. */
const TCPIP_LAYERS = [
  { name: { en: "Application", zh: "应用层" }, osi: [7, 6, 5],
    job: { en: "Protocols programs use directly.", zh: "程序直接使用的协议。" }, eg: "HTTP · SMTP · DNS · FTP · Telnet" },
  { name: { en: "Transport", zh: "传输层" }, osi: [4],
    job: { en: "Delivery between programs, identified by port numbers.", zh: "程序之间的传输，用端口号区分。" }, eg: "TCP · UDP" },
  { name: { en: "Internet", zh: "网际层" }, osi: [3],
    job: { en: "IP addressing and routing packets across networks.", zh: "IP 寻址，并在网络之间路由数据包。" }, eg: "IP · ICMP" },
  { name: { en: "Link (network access)", zh: "链路层（网络接入层）" }, osi: [2, 1],
    job: { en: "Getting frames onto the local wire or radio.", zh: "把数据帧送上本地线路或无线信道。" }, eg: "Ethernet · Wi-Fi" }
];

const OSI_LAYERS = [
  { n: 7, name: { en: "Application", zh: "应用层" }, pdu: { en: "Data", zh: "数据" },
    job: { en: "Where network services meet the programs people use: web pages, email, name lookups.", zh: "网络服务与人们使用的程序相接的地方：网页、电子邮件、域名解析。" },
    eg: "HTTP · HTTPS · SMTP · DNS · FTP" },
  { n: 6, name: { en: "Presentation", zh: "表示层" }, pdu: { en: "Data", zh: "数据" },
    job: { en: "Translates data into a format both ends understand, and handles encryption and compression.", zh: "把数据转换成双方都能理解的格式，并负责加密和压缩。" },
    eg: "TLS/SSL · UTF-8 · JPEG · MPEG" },
  { n: 5, name: { en: "Session", zh: "会话层" }, pdu: { en: "Data", zh: "数据" },
    job: { en: "Opens, keeps track of and closes the conversation between two applications.", zh: "建立、维持并关闭两个应用程序之间的会话。" },
    eg: "RPC · NetBIOS · PPTP" },
  { n: 4, name: { en: "Transport", zh: "传输层" }, pdu: { en: "Segment / datagram", zh: "段 / 数据报" },
    job: { en: "End-to-end delivery between programs: splits data into segments, numbers them with ports, and handles error recovery and flow control.", zh: "程序之间的端到端传输：把数据切分成段，用端口标识，并负责差错恢复和流量控制。" },
    eg: "TCP · UDP" },
  { n: 3, name: { en: "Network", zh: "网络层" }, pdu: { en: "Packet", zh: "数据包（分组）" },
    job: { en: "Logical addresses and routing: gets each packet from one network to another, hop by hop.", zh: "逻辑地址与路由：让每个数据包一跳一跳地从一个网络到达另一个网络。" },
    eg: "IP · ICMP · IPsec · routers" },
  { n: 2, name: { en: "Data Link", zh: "数据链路层" }, pdu: { en: "Frame", zh: "帧" },
    job: { en: "Moves frames between neighbouring devices on the same link, using MAC addresses, and detects transmission errors.", zh: "用 MAC 地址在同一链路上的相邻设备之间传送数据帧，并检测传输错误。" },
    eg: "Ethernet · Wi-Fi (802.11) · switches · bridges" },
  { n: 1, name: { en: "Physical", zh: "物理层" }, pdu: { en: "Bits", zh: "比特" },
    job: { en: "Turns bits into signals — voltage on copper, light in fibre, radio waves — and back again.", zh: "把比特变成信号 —— 铜线上的电压、光纤中的光、无线电波 —— 再还原回来。" },
    eg: "cables · connectors · hubs · repeaters" }
];

const OSI_EXTRA = {
  encap: {
    en: "<b>Encapsulation.</b> On the way out, data travels <b>down</b> the stack and each layer wraps it with its own header: the transport layer makes a segment, the network layer a packet, the data link layer a frame, and the physical layer sends bits. The receiver travels back <b>up</b>, each layer unwrapping its own header.",
    zh: "<b>封装。</b>发送时，数据沿协议栈<b>向下</b>传递，每一层加上自己的首部：传输层形成段，网络层形成数据包，数据链路层形成帧，物理层把比特发出去。接收方则<b>向上</b>逐层拆掉对应的首部。"
  },
  attacks: {
    en: "<b>Attacks by layer.</b> Knowing the layer tells you where to defend. A SYN flood exhausts connections at the Transport layer (4); an HTTP flood swamps a web server with requests at the Application layer (7); volumetric floods simply fill the link at layers 3 and 4.",
    zh: "<b>按层看攻击。</b>知道攻击发生在哪一层，就知道该在哪里防御。SYN 洪水在传输层（第 4 层）耗尽连接；HTTP 洪水在应用层（第 7 层）用大量请求压垮网页服务器；流量型洪水则在第 3、4 层直接塞满链路。"
  },
  mnemonic: {
    en: "<b>Remember it.</b> Layers 1 → 7: <i>Please Do Not Throw Sausage Pizza Away</i> — Physical, Data Link, Network, Transport, Session, Presentation, Application.",
    zh: "<b>记忆口诀。</b>从第 1 层到第 7 层：<i>Please Do Not Throw Sausage Pizza Away</i> —— 物理、数据链路、网络、传输、会话、表示、应用。"
  },
  tcpip: {
    en: "<b>OSI and TCP/IP.</b> OSI is a teaching and troubleshooting model. The Internet actually runs on the four-layer TCP/IP model, which folds OSI layers 5–7 into one Application layer and layers 1–2 into one Link layer.",
    zh: "<b>OSI 与 TCP/IP。</b>OSI 是用于教学和排错的参考模型。互联网实际运行的是四层的 TCP/IP 模型，它把 OSI 第 5–7 层合并为应用层，把第 1–2 层合并为链路层。"
  },
  tcpudp: {
    en: "<b>TCP or UDP.</b> TCP is <b>connection-oriented</b>: it sets up a connection first, numbers every byte, resends anything lost and delivers it in order — right for web pages and email. UDP is <b>connectionless</b>: it sends datagrams with no set-up and no guarantee of arrival or order — lighter and faster, right for video calls, games and DNS lookups.",
    zh: "<b>TCP 还是 UDP。</b>TCP 是<b>面向连接</b>的：先建立连接，为每个字节编号，丢失就重传，并按顺序交付 —— 适合网页和电子邮件。UDP 是<b>无连接</b>的：不建立连接就直接发送数据报，不保证送达也不保证顺序 —— 更轻、更快，适合视频通话、游戏和 DNS 查询。"
  },
  sockets: {
    en: "<b>Ports and sockets.</b> An IP address finds the computer; a <b>port</b> number finds the program on it (80 for HTTP, 443 for HTTPS, 25 for SMTP). An IP address plus a port is a <b>socket</b>, and a TCP connection is a pair of sockets, one at each end.",
    zh: "<b>端口与套接字。</b>IP 地址找到计算机，<b>端口</b>号找到其上的程序（HTTP 用 80，HTTPS 用 443，SMTP 用 25）。IP 地址加端口号就是一个<b>套接字</b>，一条 TCP 连接由两端各一个套接字组成。"
  }
};

const PACKET_LEVELS = [
  {
    id: "drop",
    osi: [3],
    osiWhy: {
      en: "A <b>packet</b> is the unit of data at the Network layer: it carries the source and destination IP addresses that routers read.",
      zh: "<b>数据包</b>是网络层的数据单位：它携带源 IP 地址和目的 IP 地址，路由器正是根据这些地址转发它。"
    },
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
    osi: [3, 4],
    osiWhy: {
      en: "A basic packet-filtering firewall decides using the Network layer (IP addresses) and the Transport layer (TCP/UDP ports).",
      zh: "基础的包过滤防火墙依据网络层（IP 地址）和传输层（TCP/UDP 端口）来决定放行还是拦截。"
    },
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
    osi: [2],
    osiWhy: {
      en: "Bridges and switches work at the Data Link layer: they forward <b>frames</b> by MAC address and never look at IP addresses.",
      zh: "网桥和交换机工作在数据链路层：它们按 MAC 地址转发<b>帧</b>，并不关心 IP 地址。"
    },
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
    osi: [3, 6],
    osiWhy: {
      en: "An IPsec VPN tunnels whole packets inside other packets at the Network layer; the encryption itself is a Presentation-layer job in OSI terms.",
      zh: "IPsec VPN 在网络层把整个数据包封装进另一个数据包里；而加密本身在 OSI 模型中属于表示层的职责。"
    },
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
    osi: [4],
    osiWhy: {
      en: "Buffering and <b>flow control</b> belong to the Transport layer: TCP keeps a receive buffer and tells the sender how much more it can take.",
      zh: "缓冲和<b>流量控制</b>属于传输层：TCP 维护一个接收缓冲区，并告诉发送方它还能接收多少数据。"
    },
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
    osi: [7],
    osiWhy: {
      en: "Buffer overflows are bugs in program code, so attacks on them usually arrive through the Application layer — a crafted request to a web or mail server.",
      zh: "缓冲区溢出是程序代码中的缺陷，所以针对它的攻击通常经由应用层到来 —— 例如发给网页或邮件服务器的恶意请求。"
    },
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
    osi: [1, 2, 3, 4, 5, 6, 7],
    osiWhy: {
      en: "This level uses the whole stack: every one of the seven OSI layers has to do its job for a single web page to load.",
      zh: "这一关用到了整个协议栈：打开一个网页，OSI 的七层每一层都必须完成自己的工作。"
    },
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
      en: "The <b>OSI model</b> splits networking into seven layers: Physical, Data Link, Network, Transport, Session, Presentation and Application. Sending data wraps it layer by layer on the way down, and receiving unwraps it on the way up. Each layer does one job and relies on the one below it — just like each packet here does one job.",
      zh: "<b>OSI 模型</b>把网络通信分成七层：物理层、数据链路层、网络层、传输层、会话层、表示层和应用层。发送时数据自上而下逐层封装，接收时自下而上逐层拆封。每一层只做一件事，并依赖下面那一层 —— 就像这里每个数据包只负责一项工作。"
    }
  }
];

if (typeof module !== "undefined") module.exports = { PACKET_LEVELS, OSI_LAYERS, OSI_SOURCES, OSI_EXTRA, TCPIP_LAYERS };
