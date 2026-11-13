export const PEN_WIPE = { x1: 700.3, y1: 363, x2: 469.6, y2: 859, width: 320 };
export const NIB_WIPE = { x1: 479.7, y1: 837.2, x2: 417.8, y2: 970.5, width: 220 };

export const VIEW = {
  mc: {
    box: "20 80 1030 910",
    w: 1030,
    h: 910,
    shadow: { dy: 3, std: 5, o: 0.4 },
    sheen: { x: -310, w: 330, y: -500, h: 2200, travel: 1700 },
  },
  dc: {
    box: "0 0 1054 340",
    w: 1054,
    h: 340,
    shadow: { dy: 1.2, std: 1.6, o: 0.45 },
    sheen: { x: -130, w: 130, y: -300, h: 900, travel: 1340 },
  },
} as const;
