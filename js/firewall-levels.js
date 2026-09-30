/* Firewall 3D — the maps.
 *
 * One character per tile. Walls:
 *   #  circuit board     1  server rack      2  firewall brick    3  code wall
 *   D  door (press E)    R/B/Y  door locked by the red / blue / yellow key
 *   X  reboot terminal — the exit. Walk up to it and press E.
 *   M  mail terminal — press E to judge an email: phishing or genuine?
 *   U  unpatched vulnerability — lets worms in until you press E on it to patch it
 * Floor: "." plus anything below, which stands on a floor tile.
 *   P  you
 *   v  virus   w  worm   t  trojan   s  spyware   r  ransomware   K  rootkit (boss)
 *   d  adware   l  keylogger   n  bots (a swarm of three)   m  fileless malware
 *   x  wiper    o  mobile malware
 *   L  ILOVEYOU (boss)   W  WannaCry (boss)   z  backup drive
 *   h  patch (+15)   H  security update (+50)   f  firewall (+100 armour)
 *   a  signatures (shotgun ammo)   c  energy cells (cannon ammo)
 *   g  Packet Filter (shotgun)     p  Quarantine Cannon
 *   k  red key   b  blue key   y  yellow key
 *
 * tools/check-firewall.js proves every map can be finished: the keys are
 * collected in an order that opens the way to the terminal.
 */
const FW_LEVELS = [
  {
    name: { en: "Inbox Zero", zh: "清空收件箱" },
    brief: {
      en: "The mail server has been opening attachments again. Clear the infection, find the red key and reach the reboot terminal.",
      zh: "邮件服务器又乱开附件了。清除感染，找到红色密钥，抵达重启终端。"
    },
    map: [
      "########################",
      "#P...#.....a...#.......#",
      "#....#.........#...s...#",
      "#..h.D....v....D.......#",
      "#....#.........#...v...#",
      "##M###.........#########",
      "#..g.#1..1..1..#.......#",
      "#....#.........#...t...#",
      "#.v..D....s....D.......#",
      "#....#.........#..h.a..#",
      "####D#####M#############",
      "#......#.......#.......#",
      "#..v...#...k...U..d....#",
      "#......D.......#.......#",
      "#..a...#...v...R.......#",
      "#......#.......#...v...#",
      "#####D##########....h..#",
      "#......#.......#...L...#",
      "#..h...D...l...#..f....#",
      "#......#.......#.......#",
      "#..a...#..H....#...n...#",
      "####################X###"
    ]
  },
  {
    name: { en: "Packet Storm", zh: "数据包风暴" },
    brief: {
      en: "Worms are copying themselves across the switch. The blue key opens the uplink, the yellow key opens the exit hall.",
      zh: "蠕虫正在交换机里自我复制。蓝色密钥打开上行链路，黄色密钥打开出口大厅。"
    },
    map: [
      "#########3##################",
      "#......a.3......n.#..r....H#",
      "#.P...z..3..1..1..#........#",
      "#........D....w...B....y...#",
      "#.....v..3..1..1..#........#",
      "#.h......3.a......#......w.#",
      "####D####3###D##M###########",
      "#........3.h.....w#.......o#",
      "#......v.3..1..1..#..t.....#",
      "#..t.....D....r...Y........X",
      "#........3..1..1..#....Wr..#",
      "#.p...c..3w.......#.f.....a#",
      "3333D333333333333333333M3333",
      "#.w.....hU.......cU.o.....f#",
      "#........3...m....#......c.#",
      "#....b...D........D...d....#",
      "#........3......t.#...H..a.#",
      "#..l...w.3.a......#.....n..#",
      "#####M###3##################"
    ]
  },
  {
    name: { en: "Kernel Space", zh: "内核空间" },
    brief: {
      en: "A rootkit has buried itself in the kernel. The terminal stays locked until it is gone.",
      zh: "一个 Rootkit 藏进了内核。消灭它之前，重启终端一直锁着。"
    },
    map: [
      "###############################",
      "2.......a.#....h...s#.d.....f.2",
      "2.P.z.c...#..1...1..U.........2",
      "2.........D....r....#....k....2",
      "2....l....#.........Y.........2",
      "2..H....y.U..1...1..#.....w...2",
      "2.........#.x.......#.c.....r.2",
      "22222M2222#2222R2222#2222222222",
      "2.............................2",
      "2..H.....x.....f.....o.....H..2",
      "2.....3.................3.....2",
      "2..............m..............2",
      "2...n......3.......3......n...2",
      "2.............................2",
      "2..........3...K...3..........2",
      "2.....3.................3.....2",
      "2..c.....a...........a.....c..2",
      "2.............................2",
      "222222222222222X222222222M22222"
    ]
  }
];

/* Incident Response (endless mode) is played here: an open server hall with
   pillars for cover. Waves are spawned by the game, so the map only needs a
   start and a few supplies. */
const FW_ARENA = {
  name: { en: "Incident Response", zh: "应急响应" },
  map: [
    "2222222222222222222222222",
    "2.......................2",
    "2..h....1.......1....a..2",
    "2.......................2",
    "2...33.....3...3.....33.2",
    "2...3.................3.2",
    "2.........1.....1.......2",
    "2.1.....................2",
    "2.......3.......3.....1.2",
    "2..........1.1..........2",
    "2...1...................2",
    "2.........3.....3.......2",
    "2...........P...........2",
    "2.........3.....3.......2",
    "2...................1...2",
    "2..........1.1..........2",
    "2.1.....3.......3.......2",
    "2.....................1.2",
    "2.......1.....1.........2",
    "2...3.................3.2",
    "2...33.....3...3.....33.2",
    "2.......................2",
    "2..c....1.......1....h..2",
    "2.......................2",
    "2222222222222222222222222"
  ]
};

if (typeof module !== "undefined") { module.exports = { FW_LEVELS, FW_ARENA }; }
