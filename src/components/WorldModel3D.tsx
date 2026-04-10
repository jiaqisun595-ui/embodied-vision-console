// WorldModel3D — simulated real-time 3D world reconstruction.
//
// Previously this just rendered a static placeholder SVG via <StreamFrame>.
// Until teacher LYB's real endpoint is ready, we fake the look of a live
// reconstructed scene by rendering it ourselves on a <canvas>:
//
//   • a perspective ground grid (the "floor" being mapped)
//   • a few wireframe boxes that stand in for detected obstacles / buildings
//   • a drifting point cloud that slowly "fills in" the space, like a SLAM
//     reconstruction accumulating points over time
//   • a moving robot marker + trajectory trail
//   • a slow orbital camera so the scene feels alive
//
// All drawing is plain 2D canvas with a hand-rolled 3×projection — no extra
// dependencies. Visual chrome (border, corner brackets, label, status pill)
// mirrors StreamFrame so it sits cleanly next to the RGB / depth panels.

import { useEffect, useRef } from "react";

type Vec3 = [number, number, number];

// Maximum number of points the accumulated point cloud can hold.
const MAX_POINTS = 520;
// Distance from the camera to the scene origin (controls zoom level).
const CAM_DIST = 14;
// Half-extent of the ground grid (grid spans from -GRID_SIZE to +GRID_SIZE).
const GRID_SIZE = 10;
// Spacing between ground grid lines.
const GRID_STEP = 1;
// Camera orbit yaw speed (radians per second).
const ORBIT_YAW_SPEED = 0.15;
// Camera pitch oscillation speed (radians per second).
const PITCH_OSCILLATION_SPEED = 0.4;
// Box glow pulsation speed (radians per second).
const BOX_GLOW_SPEED = 1.2;

const WorldModel3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const t0 = performance.now();

    // ---------- scene definition ----------
    // Obstacle boxes: [cx, cz, w, d, h]
    const boxes: Array<[number, number, number, number, number]> = [
      [-4, -2, 2, 2, 1.6],
      [3, -3, 1.6, 3, 2.4],
      [-2, 4, 3, 1.4, 1.2],
      [5, 3, 1.2, 1.2, 0.9],
      [0, -6, 2.4, 1.2, 1.8],
    ];

    // Persistent point cloud — grows as the robot "scans" the world.
    const cloud: Vec3[] = [];

    // Trajectory trail of the moving robot marker.
    const trail: Array<[number, number]> = [];

    // Seed a handful of initial points so the first frame isn't empty.
    for (let i = 0; i < 80; i++) {
      cloud.push([
        (Math.random() - 0.5) * 16,
        Math.random() * 0.4,
        (Math.random() - 0.5) * 16,
      ]);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---------- projection ----------
    // World -> camera (orbit around origin, looking down slightly) -> screen.
    const project = (
      p: Vec3,
      camYaw: number,
      camPitch: number,
      W: number,
      H: number,
    ): [number, number, number] | null => {
      const [x, y, z] = p;
      // Orbit yaw around Y.
      const cy = Math.cos(camYaw);
      const sy = Math.sin(camYaw);
      const xr = cy * x + sy * z;
      const zr = -sy * x + cy * z;
      const yr = y;
      // Pitch around X.
      const cp = Math.cos(camPitch);
      const sp = Math.sin(camPitch);
      const yr2 = cp * yr - sp * zr;
      const zr2 = sp * yr + cp * zr;
      // Pull scene in front of camera.
      const camDist = CAM_DIST;
      const zc = zr2 + camDist;
      if (zc <= 0.1) return null;
      const f = Math.min(W, H) * 0.9;
      const sx = W / 2 + (xr * f) / zc;
      const sy2 = H / 2 + (-yr2 * f) / zc;
      return [sx, sy2, zc];
    };

    const drawLine = (
      a: Vec3,
      b: Vec3,
      yaw: number,
      pitch: number,
      W: number,
      H: number,
      stroke: string,
      width = 1,
    ) => {
      const pa = project(a, yaw, pitch, W, H);
      const pb = project(b, yaw, pitch, W, H);
      if (!pa || !pb) return;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    };

    const drawBoxWire = (
      [cx, cz, w, d, h]: [number, number, number, number, number],
      yaw: number,
      pitch: number,
      W: number,
      H: number,
      glow: number,
    ) => {
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      const z0 = cz - d / 2;
      const z1 = cz + d / 2;
      const y0 = 0;
      const y1 = h;
      const v: Vec3[] = [
        [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
        [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
      ];
      const edges: Array<[number, number]> = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      const base = `rgba(0,229,255,${0.55 + glow * 0.35})`;
      for (const [i, j] of edges) {
        drawLine(v[i], v[j], yaw, pitch, W, H, base, 1.1);
      }
      // Fill top face faintly so boxes read as solid volumes.
      const top = [v[4], v[5], v[6], v[7]]
        .map((p) => project(p, yaw, pitch, W, H))
        .filter(Boolean) as Array<[number, number, number]>;
      if (top.length === 4) {
        ctx.fillStyle = `rgba(0,229,255,${0.05 + glow * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(top[0][0], top[0][1]);
        for (let k = 1; k < 4; k++) ctx.lineTo(top[k][0], top[k][1]);
        ctx.closePath();
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const t = (now - t0) / 1000;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      // Slow orbit + gentle breathing pitch.
      const yaw = t * ORBIT_YAW_SPEED;
      const pitch = 0.55 + Math.sin(t * PITCH_OSCILLATION_SPEED) * 0.04;

      // Background — deep space gradient.
      const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H));
      g.addColorStop(0, "#0B1424");
      g.addColorStop(1, "#05080F");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Ground grid.
      const GRID = GRID_SIZE;
      const STEP = GRID_STEP;
      ctx.lineWidth = 1;
      for (let i = -GRID; i <= GRID; i += STEP) {
        drawLine(
          [i, 0, -GRID],
          [i, 0, GRID],
          yaw,
          pitch,
          W,
          H,
          `rgba(0,229,255,${i === 0 ? 0.55 : 0.14})`,
          i === 0 ? 1.3 : 1,
        );
        drawLine(
          [-GRID, 0, i],
          [GRID, 0, i],
          yaw,
          pitch,
          W,
          H,
          `rgba(0,229,255,${i === 0 ? 0.55 : 0.14})`,
          i === 0 ? 1.3 : 1,
        );
      }

      // Boxes (wireframe obstacles).
      boxes.forEach((b, idx) => {
        const glow = 0.5 + 0.5 * Math.sin(t * BOX_GLOW_SPEED + idx);
        drawBoxWire(b, yaw, pitch, W, H, glow);
      });

      // Grow the point cloud over time — points clustered near the boxes
      // so it looks like the scan is "locking on" to obstacles.
      if (cloud.length < MAX_POINTS && Math.random() < 0.85) {
        const b = boxes[Math.floor(Math.random() * boxes.length)];
        const [cx, cz, w, d, h] = b;
        // Bias points to the surfaces of the box.
        const face = Math.random();
        let px: number, py: number, pz: number;
        if (face < 0.25) {
          px = cx + (Math.random() - 0.5) * w;
          py = Math.random() * h;
          pz = cz - d / 2;
        } else if (face < 0.5) {
          px = cx + (Math.random() - 0.5) * w;
          py = Math.random() * h;
          pz = cz + d / 2;
        } else if (face < 0.75) {
          px = cx - w / 2;
          py = Math.random() * h;
          pz = cz + (Math.random() - 0.5) * d;
        } else {
          px = cx + w / 2;
          py = Math.random() * h;
          pz = cz + (Math.random() - 0.5) * d;
        }
        cloud.push([
          px + (Math.random() - 0.5) * 0.1,
          py,
          pz + (Math.random() - 0.5) * 0.1,
        ]);
        // Plus some floor scatter.
        if (cloud.length < MAX_POINTS && Math.random() < 0.4) {
          cloud.push([
            (Math.random() - 0.5) * 16,
            Math.random() * 0.08,
            (Math.random() - 0.5) * 16,
          ]);
        }
      }

      // Draw point cloud.
      for (let i = 0; i < cloud.length; i++) {
        const p = project(cloud[i], yaw, pitch, W, H);
        if (!p) continue;
        const [sx, sy, zc] = p;
        const size = Math.max(0.6, 2.4 - zc * 0.08);
        const a = Math.max(0.15, 0.9 - zc * 0.04);
        // Hue splits between cyan and a hint of magenta for depth variety.
        const hue = (i * 17) % 360 < 40 ? "255,110,220" : "0,229,255";
        ctx.fillStyle = `rgba(${hue},${a})`;
        ctx.fillRect(sx, sy, size, size);
      }

      // Robot path — a slow lissajous curve on the ground.
      const rx = Math.cos(t * 0.5) * 5.5;
      const rz = Math.sin(t * 0.35) * 4.5;
      trail.push([rx, rz]);
      if (trail.length > 120) trail.shift();

      // Trail line.
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < trail.length; i++) {
        const [tx, tz] = trail[i];
        const proj = project([tx, 0.02, tz], yaw, pitch, W, H);
        if (!proj) continue;
        if (!started) {
          ctx.moveTo(proj[0], proj[1]);
          started = true;
        } else {
          ctx.lineTo(proj[0], proj[1]);
        }
      }
      ctx.strokeStyle = "rgba(255,110,220,0.75)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Robot marker — pulsing ring + center dot.
      const rp = project([rx, 0.15, rz], yaw, pitch, W, H);
      if (rp) {
        const pulse = 4 + Math.sin(t * 4) * 1.5;
        ctx.strokeStyle = "rgba(255,110,220,0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rp[0], rp[1], pulse + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#FF6EDC";
        ctx.beginPath();
        ctx.arc(rp[0], rp[1], 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scan sweep — a rotating radial line from the robot.
      if (rp) {
        const sweepAngle = t * 2.2;
        const sweepLen = 3.2;
        const tip: Vec3 = [
          rx + Math.cos(sweepAngle) * sweepLen,
          0.02,
          rz + Math.sin(sweepAngle) * sweepLen,
        ];
        const tipP = project(tip, yaw, pitch, W, H);
        if (tipP) {
          const grad = ctx.createLinearGradient(rp[0], rp[1], tipP[0], tipP[1]);
          grad.addColorStop(0, "rgba(0,229,255,0.55)");
          grad.addColorStop(1, "rgba(0,229,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rp[0], rp[1]);
          ctx.lineTo(tipP[0], tipP[1]);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Chrome (border / brackets / label / status pill) mirrors StreamFrame
  // so this panel sits visually identical next to the RGB + depth feeds.
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[#00E5FF]/25 bg-[#0A0E1A]">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Vignette + scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,229,255,0.05)_0px,rgba(0,229,255,0.05)_1px,transparent_1px,transparent_3px)] mix-blend-overlay" />

      {/* Corner brackets */}
      <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]/70" />
      <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#00E5FF]/70" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#00E5FF]/70" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]/70" />

      {/* Top-left label */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-[#00E5FF]">
        <span className="font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]">
          WORLD MODEL
        </span>
        <span className="text-[10px] text-[#00E5FF]/60">· 3D RECON</span>
      </div>

      {/* Top-right status pill — simulated, so we flag it as SIM. */}
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-[#00E5FF]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
        SIM
      </div>

      {/* Bottom-left tiny HUD text — adds to the "real system" feel. */}
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] leading-tight tracking-widest text-[#00E5FF]/60">
        <div>SLAM · ACTIVE</div>
        <div>POINTS · STREAMING</div>
      </div>
    </div>
  );
};

export default WorldModel3D;
