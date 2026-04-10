// WorldModel3D — GLB viewer for the real-time 3D world reconstruction.
//
// Uses <model-viewer> (@google/model-viewer) to render the GLB file with
// camera-controls and auto-rotate. The GLB URL comes from useWorldLatest:
// when ENDPOINTS.worldModel is empty, falls back to the local mock file.
//
// HUD chrome (border, corner brackets, vignette, scanlines, label, status
// badge) mirrors StreamFrame.tsx for visual consistency.

import "@google/model-viewer";
import { ENDPOINTS } from "@/config";
import { useWorldLatest } from "@/hooks/useWorldLatest";

const WorldModel3D = () => {
  const { modelUrl, connected } = useWorldLatest();
  const isMock = !ENDPOINTS.worldModel;

  const statusStyle = isMock
    ? {
        text: "MOCK",
        className: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/40",
        dotClass: "bg-[#00E5FF] animate-pulse",
      }
    : connected
      ? {
          text: "LIVE",
          className: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
          dotClass: "bg-emerald-400 animate-pulse",
        }
      : {
          text: "CONNECTING",
          className: "bg-amber-400/15 text-amber-300 border-amber-400/40",
          dotClass: "bg-amber-400 animate-pulse",
        };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[#00E5FF]/25 bg-[#0A0E1A]">
      {/* GLB viewer */}
      {modelUrl && (
        <model-viewer
          src={modelUrl}
          alt="World Model 3D reconstruction"
          camera-controls=""
          auto-rotate=""
          auto-rotate-delay="0"
          rotation-per-second="12deg"
          exposure="1"
          shadow-intensity="0.6"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            // remove default model-viewer gradient
            ["--poster-color" as string]: "transparent",
          }}
        />
      )}

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

      {/* Top-right status pill */}
      <div
        className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest ${statusStyle.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dotClass}`} />
        {statusStyle.text}
      </div>
    </div>
  );
};

export default WorldModel3D;
