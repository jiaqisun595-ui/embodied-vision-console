// Timeline data for all 7 frames

export type CardRole = "brain" | "world" | "act" | "done";

export interface TimelineCard {
  time: string;
  role: CardRole;
  label: string;
  content: string;
  code?: string;
  waiting?: boolean;
  richTags?: { label: string; value: string }[];
  thumbnails?: boolean; // show small FOV snap placeholders
}

export interface Detection {
  label: string;
  confidence?: number;
  distance?: string;
  isTarget?: boolean;
}

export interface FrameData {
  id: string;
  mode: "thinking" | "perception" | "done";
  startTime: number; // seconds
  endTime: number;
  cycle: string; // e.g. "1/3"
  cycleLabel: string;
  timer: string; // display timer
  cards?: TimelineCard[];
  canvasId?: string; // which spatial canvas variant
  detections?: Detection[];
  hud?: string[];
  hudStatus?: string;
}

export const frames: FrameData[] = [
  // Frame A: THINKING · Cycle 1 (0-8s)
  {
    id: "A",
    mode: "thinking",
    startTime: 0,
    endTime: 8,
    cycle: "1/3",
    cycleLabel: "理解指令 & 搜寻",
    timer: "00:06",
    canvasId: "cycle1",
    cards: [
      {
        time: "00:03",
        role: "brain",
        label: "query",
        content: 'find(label="chair") — "我需要先看看周围有没有椅子"',
      },
      {
        time: "00:04",
        role: "world",
        label: "reply",
        content: "当前 FOV 扫描：NOT_FOUND",
        thumbnails: true,
      },
      {
        time: "00:05",
        role: "act",
        label: "→ /nav",
        content: "spin_360() · 启动旋转扫描",
      },
      {
        time: "00:06",
        role: "world",
        label: "background",
        content: "旋转中累积 SSM 地图… 发现 3 个候选",
        richTags: [
          { label: "chair_A", value: "(3.2, 0.5)" },
          { label: "chair_B", value: "(1.1, −1.0)" },
          { label: "table_A", value: "(0.0, −2.3)" },
        ],
      },
    ],
  },
  // Frame B: PERCEPTION · Cycle 1 (8-18s)
  {
    id: "B",
    mode: "perception",
    startTime: 8,
    endTime: 18,
    cycle: "1/3",
    cycleLabel: "旋转扫描",
    timer: "00:12",
    detections: [
      { label: "chair", confidence: 0.94, distance: "d≈3.2m" },
      { label: "chair", confidence: 0.88, distance: "d≈1.5m" },
      { label: "table", confidence: 0.91 },
    ],
    hud: [
      "pose (0,0)",
      "heading 218°",
      "spin 218°/360°",
      "detections chair×2 table×1",
    ],
    hudStatus: "SCANNING",
  },
  // Frame C: THINKING · Cycle 2 (18-22s)
  {
    id: "C",
    mode: "thinking",
    startTime: 18,
    endTime: 22,
    cycle: "2/3",
    cycleLabel: "选择最远椅子",
    timer: "00:21",
    canvasId: "cycle2",
    cards: [
      {
        time: "00:19",
        role: "brain",
        label: "query",
        content: "已检测到 2 把椅子，要去最远的那把。",
        code: 'get_target(label="chair", constraint="max_distance", ref="current_pose")',
      },
      {
        time: "00:20",
        role: "world",
        label: "computing…",
        content: "computing distances from (0,0) ",
        waiting: true,
      },
      {
        time: "00:20",
        role: "world",
        label: "reply",
        content: "chair_A = 3.24m  chair_B = 1.49m → target = chair_A",
        richTags: [{ label: "target", value: "(3.2, 0.5)" }],
      },
      {
        time: "00:21",
        role: "act",
        label: "→ /nav_aim",
        content: "navigate_to((3.2, 0.5))",
      },
    ],
  },
  // Frame D: PERCEPTION · Cycle 2 (22-32s)
  {
    id: "D",
    mode: "perception",
    startTime: 22,
    endTime: 32,
    cycle: "2/3",
    cycleLabel: "行走中",
    timer: "00:27",
    detections: [
      { label: "chair_A", distance: "d≈1.6m", isTarget: true },
    ],
    hud: [
      "pose (1.8, 0.3) → (3.2, 0.5)",
      "heading 008°",
      "target chair_A 🎯",
      "ETA ~2s",
    ],
    hudStatus: "NAVIGATING",
  },
  // Frame E: THINKING · Cycle 3 (32-38s)
  {
    id: "E",
    mode: "thinking",
    startTime: 32,
    endTime: 38,
    cycle: "3/3",
    cycleLabel: "回忆出发点",
    timer: "00:35",
    canvasId: "cycle3",
    cards: [
      {
        time: "00:32",
        role: "done",
        label: "✅ 完成",
        content:
          "子目标 A 完成：已到达 chair_A (3.2, 0.5)。现在执行子目标 B：找出发前身后的桌子",
      },
      {
        time: "00:33",
        role: "brain",
        label: "query",
        content:
          'get_target(label="table", constraint="relative_behind", ref="pose_at_time_0")',
      },
      {
        time: "00:34",
        role: "world",
        label: "recalling…",
        content: "recall pose_at_time_0 ",
        waiting: true,
      },
      {
        time: "00:34",
        role: "world",
        label: "reply",
        content:
          "pose_0 = (0,0)，朝向 0°。table_A 在 pose_0 后方 (0, −2.3)",
        richTags: [
          { label: "pose_0", value: "(0, 0)" },
          { label: "target", value: "(0, −2.3)" },
        ],
      },
      {
        time: "00:35",
        role: "act",
        label: "→ /nav_aim",
        content: "turn 180° & navigate_to((0, −2.3))",
      },
    ],
  },
  // Frame F: PERCEPTION · Cycle 3 (38-52s)
  {
    id: "F",
    mode: "perception",
    startTime: 38,
    endTime: 52,
    cycle: "3/3",
    cycleLabel: "转向行走",
    timer: "00:45",
    detections: [
      { label: "table_A", distance: "d≈1.2m", isTarget: true },
    ],
    hud: [
      "pose (1.2, −0.8) → (0.0, −2.3)",
      "heading 192°",
      "target table_A 🎯",
      "ETA ~3s",
    ],
    hudStatus: "NAVIGATING",
  },
  // Frame G: DONE (52-60s)
  {
    id: "G",
    mode: "done",
    startTime: 52,
    endTime: 60,
    cycle: "—",
    cycleLabel: "DONE",
    timer: "00:57",
  },
];

export const TOTAL_DURATION = 60; // seconds
