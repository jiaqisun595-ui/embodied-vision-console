// ============================================================================
// GLOBAL CONFIG — the single "control panel" for this exhibition display.
//
// On-site, the ONLY file you should need to edit is this one:
//   1. Paste the three video / stream URLs into ENDPOINTS.
//   2. (Optional) Paste the thought-stream endpoint once the brain module
//      team exposes one.
//   3. Save. `npm run dev` (or `npm run build && npm run preview`) picks it up.
//
// If a URL is empty or the stream fails to load, the corresponding component
// automatically falls back to the matching image in FALLBACKS below.
// ============================================================================

export const ENDPOINTS = {
  /** Robot first-person RGB stream. MJPEG served by Kai's on-robot service. */
  rgb: "http://10.100.129.68:8001/rgb",

  /** Robot depth-map stream. Same service as rgb, different path. */
  depth: "http://10.100.129.68:8001/depth",

  /** World-model 3D rendering. Provided by teacher LYB — URL TBD. */
  worldModel3D: "",

  /** Brain-module thought stream. Provided by teacher Yiqun — URL TBD. */
  thoughtStream: "",

  /** Latest ASR command text for the top bar. Provided by Zebei. Optional. */
  asrLatest: "",
} as const;

// NOTE: Vite is configured with `base: "/embodied-vision-console/"` in
// vite.config.ts, so any asset under /public must be referenced with
// `import.meta.env.BASE_URL` as a prefix — otherwise a leading "/" resolves
// to the server root and 404s (which is exactly what made all three video
// slots go blank during the local preview).
const BASE = import.meta.env.BASE_URL; // e.g. "/embodied-vision-console/"

export const FALLBACKS = {
  rgb: `${BASE}mock/rgb-feed.gif`,
  depth: `${BASE}mock/depth-placeholder.svg`,
  worldModel3D: `${BASE}mock/world-placeholder.svg`,
} as const;

/**
 * How often each video component retries a broken stream (ms).
 * Keeps the display self-healing if the robot briefly drops connection.
 */
export const RETRY_INTERVAL_MS = 4000;
