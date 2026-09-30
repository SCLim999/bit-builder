/* Firewall 3D — the maps.
 *
 * One character per tile. Walls:
 *   #  circuit board     1  server rack      2  firewall brick    3  code wall
 *   D  door (press E)    R/B/Y  door locked by the red / blue / yellow key
 *   X  reboot terminal — the exit. Walk up to it and press E.
 * Floor: "." plus anything below, which stands on a floor tile.
 *   P  you
 *   v  virus   w  worm   t  trojan   s  spyware   r  ransomware   K  rootkit (boss)
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
      "######.........#########",
      "#..g.#1..1..1..#.......#",
      "#....#.........#...t...#",
      "#.v..D....s....D.......#",
      "#....#.........#..h.a..#",
      "####D###################",
      "#......#.......#.......#",
      "#..v...#...k...#..v....#",
      "#......D.......#.......#",
      "#..a...#...v...R.......#",
      "#......#.......#...v...#",
      "#####D##########....h..#",
      "#......#.......#.......#",
      "#..h...D...v...#..f....#",
      "#......#.......#.......#",
      "#..a...#..H....#...v...#",
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
      "#......a.3......s.#..r....H#",
      "#.P......3..1..1..#........#",
      "#........D....w...B....y...#",
      "#.....v..3..1..1..#........#",
      "#.h......3.a......#......w.#",
      "####D####3###D##############",
      "#........3.h.....w#.......s#",
      "#......v.3..1..1..#..t.....#",
      "#..t.....D....r...Y........X",
      "#........3..1..1..#.....r..#",
      "#.p...c..3w.......#.f.....a#",
      "3333D33333333333333333333333",
      "#.w.....h3.......c#.v.....f#",
      "#........3...r....#......c.#",
      "#....b...D........D...H....#",
      "#........3......t.#......a.#",
      "#..s...w.3.a......#.....v..#",
      "#########3##################"
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
      "2.......a.#....h...s#.r.....f.2",
      "2.P...c...#..1...1..#.........2",
      "2.........D....r....#....k....2",
      "2....w....#.........Y.........2",
      "2..H....y.#..1...1..#.....w...2",
      "2.........#.t.......#.c.....r.2",
      "2222222222#2222R2222#2222222222",
      "2.............................2",
      "2..H...........f...........H..2",
      "2.....3.................3.....2",
      "2..............s..............2",
      "2...v......3.......3......v...2",
      "2.............................2",
      "2..........3...K...3..........2",
      "2.....3.................3.....2",
      "2..c.....a...........a.....c..2",
      "2.............................2",
      "222222222222222X222222222222222"
    ]
  }
];

if (typeof module !== "undefined") { module.exports = { FW_LEVELS }; }
