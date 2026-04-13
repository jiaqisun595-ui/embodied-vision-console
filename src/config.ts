// ============================================================================
// GLOBAL CONFIG — the single "control panel" for this exhibition display.
//
// On-site, the ONLY file you should need to edit is this one:
//   1. Paste the RGB + depth MJPEG URLs into ENDPOINTS.
//   2. (Optional) Paste the thought-stream endpoint once the brain module
//      team exposes one.
//   3. Save. `npm run dev` (or `npm run build && npm run preview`) picks it up.
//
// If a stream is empty or fails to load, the corresponding panel shows an
// "OFFLINE" overlay — we no longer ship placeholder images for RGB / depth,
// because once the robot service is up it just works.
// ============================================================================

export const ENDPOINTS = {
  /**
   * Robot first-person RGB stream. MJPEG (`multipart/x-mixed-replace`,
   * 640×480) served by Kai's on-robot service.
   *   GET http://<IP>:<PORT>/rgb
   */
  rgb: import.meta.env.VITE_RGB_ENDPOINT || "/mock/rgb.webp",

  /**
   * Robot depth-map stream. Same service as rgb, different path.
   * Jet colourised, 640×480, MJPEG.
   *   GET http://<IP>:<PORT>/depth
   */
  depth: import.meta.env.VITE_DEPTH_ENDPOINT || "/mock/depth.webp",

  /**
   * Brain-module thought stream. Provided by teacher Yiqun.
   *
   * Contract (as agreed with the brain team):
   *   GET http://<brain-host>:<port>/api/brain/latest
   *   Polled every THOUGHT_POLL_INTERVAL_MS. Returns the single most-recent
   *   thought as JSON:
   *     {
   *       "role":    "brain" | "world" | "act" | "done",
   *       "label":   "parse_cmd",                  // short tag
   *       "content": "Heard: walk to the farthest chair",
   *       "code":    "POST /nav_aim { target: 'c3' }"   // optional
   *     }
   *
   * Leave empty to run the built-in mock loop instead.
   */
  thoughtStream: import.meta.env.VITE_THOUGHT_STREAM_ENDPOINT || "/proxy",

  /**
   * World-model GLB endpoint. Provided by teacher LYB.
   *
   * Contract:
   *   GET <base>/api/world/latest
   *   Returns JSON: { url: string, timestamp: number }
   *
   * Leave empty to fall back to the local mock GLB.
   */
  worldModel: import.meta.env.VITE_WORLD_MODEL_ENDPOINT || "",

  /**
   * ASR latest command endpoint. Provided by Zebei.
   *
   * Contract:
   *   GET http://<asr-host>/api/asr/latest
   *   Returns JSON: { text: string }
   *
   * Leave empty to show the default placeholder text.
   */
  asrLatest: import.meta.env.VITE_ASR_ENDPOINT || "",
} as const;

/**
 * How often each video component retries a broken stream (ms).
 * Keeps the display self-healing if the robot briefly drops connection.
 */
export const RETRY_INTERVAL_MS = 4000;

/**
 * How often the ThoughtStream polls `ENDPOINTS.thoughtStream` for the latest
 * brain card (ms). The brain team suggested 2–3 s; 2500 ms splits the diff.
 */
export const THOUGHT_POLL_INTERVAL_MS = 2500;

/**
 * How often the WorldModel3D polls `ENDPOINTS.worldModel` for the latest
 * GLB URL (ms).
 */
export const WORLD_POLL_INTERVAL_MS = 5000;

/**
 * How often the header polls `ENDPOINTS.asrLatest` for the latest
 * ASR command text (ms).
 */
export const ASR_POLL_INTERVAL_MS = 3000;

// --- 展示调参 ---
export const CARD_INTERVAL_MS = 1800;
export const MAX_VISIBLE_CARDS = 40;
export const MAX_RETRY_DELAY = 60_000;
export const MAX_RETRY_COUNT = 10;
export const STAR_COUNT = 80;
export const STREAM_COUNT = 3;
export const PARTICLES_PER_STREAM = 30;
