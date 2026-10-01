/* ============================================================================
   BIT BUILDER — Level data
   ----------------------------------------------------------------------------
   Every level is an ASCII map. One character = one tile.

   LEGEND
     ' '  floor                     '#'  wall / server rack
     'P'  technician (start)        'O'  pushable crate
     'c'  HARDWARE part             's'  SOFTWARE part
     'S'  assembly socket (opens only when every part is collected)
     'X'  power button (level exit)
     '+'  help terminal (shows the level hint)
     '~'  coolant spill  (deadly without the Coolant Seal)
     '*'  overheat zone  (deadly without the Heatsink)
     '.'  cryo ice       (you slide unless you wear Grip Pads)
     '1'  ice corner NW   '2' ice corner NE   '3' ice corner SE   '4' ice corner SW
     '<' '>' '^' 'v'  data bus — carries you along unless you wear Mag Grips
     '!'  power-surge trap (one-shot: destroys whatever steps on it)
     'T'  scrubber — wipes every tool from your belt (access cards survive)
     '0'  network port (teleporter — throws you out of the next port)
     'k'  toggle switch  '-' toggle wall (solid)  '|' toggle wall (open)
     'r' 'b' 'y' 'g'  access cards  (red / blue / yellow / GREEN = root, reusable)
     'R' 'B' 'Y' 'G'  locked ports  (matching colour)
     'F'  Coolant Seal   'H' Heatsink   'K' Grip Pads   'M' Mag Grips
     '@'  Bug (hugs the left wall)      '%' Glitch (hugs the right wall)
     '&'  Trojan (hunts you)            '$' Packet (flies straight, bounces)
   ========================================================================== */

const LEVELS = [
  {
    name: "Boot Camp",
    hint: "Collect every hardware and software part, then walk through the assembly socket to the power button.",
    time: 120,
    par: 54,
    kinds: {
      c: ["mobo", "cpu", "ram", "psu"],
      s: ["os", "driver"]
    },
    map: [
      "###############",
      "#P    #   c   #",
      "# ### #  ###  #",
      "# #   s  #    #",
      "# #   #  #  c #",
      "# c   #  #  ###",
      "# ##### ##    #",
      "#     #  ###  #",
      "# #s# #    c  #",
      "# #   #####   #",
      "#SX############"
    ]
  },

  {
    name: "Access Control",
    hint: "An access card is used up the moment it opens a port. Look before you spend one.",
    time: 160,
    par: 55,
    kinds: {
      c: ["mobo", "cpu", "ram", "ssd"],
      s: ["os", "driver", "antivirus"],
      x: ["ram"],
      z: ["browser"]
    },
    map: [
      "#################",
      "#P  #  y  #  c  #",
      "# b B     Y     #",
      "#   #  c  #  r  #",
      "#####  s  ### ###",
      "#     #####     #",
      "#  c  #   R  s  #",
      "# x   #   #  z  #",
      "#  s  #   #  c  #",
      "#######   #######",
      "#      +      SX#",
      "#################"
    ]
  },

  {
    name: "Coolant Spill",
    hint: "Shove a crate into coolant and it plugs the leak. The Coolant Seal lets you wade in yourself.",
    time: 200,
    par: 76,
    _bridge: [[2, 4]],
    kinds: {
      c: ["gpu", "cpu", "psu"],
      s: ["os", "driver", "database"],
      x: ["fan"],
      z: ["browser"]
    },
    map: [
      "#################",
      "#P   #   c   #s #",
      "# OO #~~~~~~~#  #",
      "#  c #~~~~~~~#  #",
      "##~~##~~~~~~~## #",
      "#     ~~~~~~~  c#",
      "#  F  ~~~~~~~   #",
      "##   #~~~~~~~## #",
      "# O  #~~~~~~~#  #",
      "#  s #~~~~~~~#s #",
      "# x+ #~~~~~~~#z #",
      "#    #########  #",
      "#    #  X    S  #",
      "#################"
    ]
  },

  {
    name: "Thermal Runaway",
    hint: "The Heatsink makes overheat zones harmless. Surge traps are one-shot — never step on one.",
    time: 200,
    par: 73,
    kinds: {
      c: ["mobo", "cpu", "ram", "ram", "psu"],
      s: ["os", "driver", "antivirus", "compiler", "database"],
      x: ["ram", "gpu"],
      z: ["browser"]
    },
    map: [
      "#################",
      "#P  #  c  #  s  #",
      "# x #     #    z#",
      "# H #  s  #  c  #",
      "#   #     #     #",
      "##  ##***##  ####",
      "#    *****      #",
      "# c  *****  s   #",
      "#    *****      #",
      "##  ##***##  ####",
      "# + #  c  #    x#",
      "# s #     #  c  #",
      "#   #  !  #  s  #",
      "#  SX######     #",
      "#################"
    ]
  },

  {
    name: "Cryo Vault",
    hint: "On cryo ice you keep going until something stops you. Grip Pads let you walk it like floor.",
    time: 220,
    par: 64,
    kinds: {
      c: ["mobo", "cpu", "ram", "ssd"],
      s: ["os", "driver", "antivirus"],
      x: ["cpu"],
      z: ["compiler"]
    },
    map: [
      "###################",
      "#P  x #     c     #",
      "#     #  1.....2  #",
      "#  c  #  ....... z#",
      "#     #  .......  #",
      "##  ###  .......  #",
      "#   s    .......  #",
      "#        .......  #",
      "#  K ##  4.....3  #",
      "#     #     s     #",
      "#  c  #############",
      "#        s     c  #",
      "#   ##            #",
      "#  SX##  +        #",
      "###################"
    ]
  },

  {
    name: "Data Bus",
    hint: "A data bus carries you one tile per beat and will not let go. Mag Grips ignore it.",
    time: 220,
    par: 71,
    kinds: {
      c: ["mobo", "cpu", "ram", "ssd", "fan"],
      s: ["os", "driver", "compiler", "antivirus"],
      x: ["fan"],
      z: ["database"]
    },
    map: [
      "#################",
      "#P  #  c  #  s  #",
      "# x #           #",
      "# c v  s  ^  c  #",
      "#   v     ^     #",
      "##  v     ^    ##",
      "#   >>>>>>>>>>  #",
      "#   <<<<<<<<<<  #",
      "#  M            #",
      "##  #### ####  ##",
      "#   #   c   # z #",
      "# s #   +   #  c#",
      "#   #   s   #   #",
      "#  SX############",
      "#################"
    ]
  },

  {
    name: "Malware Outbreak",
    hint: "Bugs hug the left wall, glitches hug the right wall, packets fly straight and bounce.",
    time: 200,
    par: 68,
    kinds: {
      c: ["mobo", "cpu", "ram", "gpu", "psu"],
      s: ["os", "driver", "antivirus", "compiler", "browser"],
      x: ["ram"],
      z: ["database"]
    },
    map: [
      "#################",
      "#P Qx#  c  #  s #",
      "#    #  @  #    #",
      "# c  #     #  c #",
      "###  ##   ##   ##",
      "#     $         #",
      "#  s     %   s  #",
      "#          $    #",
      "##   ###  ###  ##",
      "#  c #  +  #  c #",
      "#    #     # Q z#",
      "#  s##  s  #    #",
      "#  SX#######    #",
      "#################"
    ]
  },

  {
    name: "Firewall",
    hint: "Root access is green: it opens every green port and is never used up. The rest are one-shot.",
    time: 240,
    par: 81,
    kinds: {
      c: ["mobo", "cpu", "ram", "ram", "gpu"],
      s: ["os", "driver", "antivirus", "database", "compiler"],
      x: ["ssd"],
      z: ["browser"]
    },
    map: [
      "###################",
      "#P x#  c  #  s    #",
      "#   #     #       #",
      "# g #  s  #  c    #",
      "#   #     ### #####",
      "##G##  b  #     z #",
      "#      c  B       #",
      "#  &   #  #  s    #",
      "#      #  ###### ##",
      "##G##  s  #  c    #",
      "#   #     Y       #",
      "# y #  c  #  s    #",
      "#   #     #  +    #",
      "#  SX##############",
      "###################"
    ]
  },

  {
    name: "Network Ports",
    hint: "A network port throws you out of the next one in line. The toggle switch flips every toggle wall.",
    time: 260,
    par: 89,
    kinds: {
      c: ["mobo", "cpu", "ram", "ram", "nic"],
      s: ["os", "driver", "browser", "antivirus", "database"],
      x: ["nic"],
      z: ["compiler"]
    },
    map: [
      "###################",
      "#P  #   c   #  0x #",
      "#   #       #     #",
      "# 0 #   s   |  c  #",
      "#   #########-#####",
      "# z #   k   #  s  #",
      "##|##   c   #     #",
      "#  c    +   #  c  #",
      "##-##       #     #",
      "#   #   0   #-#####",
      "#   #########  s  #",
      "# s #       |     #",
      "#   #   s   #  0  #",
      "#  SX##############",
      "###################"
    ]
  },

  {
    name: "Final Assembly",
    hint: "Everything at once: bridge the coolant, ride the ice, cross the heat, mind the clock.",
    time: 340,
    par: 125,
    _bridge: [[8, 3]],
    kinds: {
      c: ["mobo", "cpu", "ram", "ram", "gpu", "ssd", "psu", "fan"],
      s: ["os", "driver", "antivirus", "compiler", "database", "browser"],
      x: ["ram", "psu"],
      z: ["browser"]
    },
    map: [
      "###################",
      "#P    #  c  #  s  #",
      "#     # ~~~~# y   #",
      "# O     ~F~~B  c  #",
      "# O   # ~~~~# %   #",
      "#  c  #  b  #     #",
      "### ##### ##### ###",
      "# s   #0 & Q#H   x#",
      "# ... #     ~     #",
      "#c...    +  ##***##",
      "# ... #  s  ## c ##",
      "#   K #     ## s ##",
      "### #####Y#########",
      "# c z #  c  #  c  #",
      "#  x  # $   # T   #",
      "#####             #",
      "#XS   #  s  #  s  #",
      "###   #     #   0 #",
      "###################"
    ]
  },

  {
    name: "Keen 1: Invasion of the Vorticons",
    hint: "Commander Keen's four ship parts, rebuilt as a computer: Battery = PSU, Vacuum Cleaner = fan, Joystick = driver, Everclear = OS. Dodge the Vorticon.",
    time: 150,
    par: 54,
    kinds: {
      c: ["mobo", "cpu", "psu", "fan"],
      s: ["driver", "os"]
    },
    map: [
      "###############",
      "#P    #   c   #",
      "# ### #  ###  #",
      "# #   s  #  @ #",
      "# #   #  #  c #",
      "# c   #  #  ###",
      "# ##### ##    #",
      "#     #  ###  #",
      "# #s# #    c  #",
      "# #   #####   #",
      "#SX############"
    ]
  }
];

if (typeof module !== "undefined") { module.exports = { LEVELS }; }
