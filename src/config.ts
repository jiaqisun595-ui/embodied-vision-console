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
  rgb: "/embodied-vision-console/mock/rgb.webp",

  /**
   * Robot depth-map stream. Same service as rgb, different path.
   * Jet colourised, 640×480, MJPEG.
   *   GET http://<IP>:<PORT>/depth
   */
  depth: "/embodied-vision-console/mock/depth.webp",

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
  thoughtStream: "",

  /** Latest ASR command text for the top bar. Provided by Zebei. Optional. */
  asrLatest: "",
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
