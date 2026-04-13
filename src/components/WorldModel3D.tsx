// WorldModel3D — GLB viewer for the real-time 3D world reconstruction.
//
// Uses <model-viewer> (@google/model-viewer) to render the GLB file with
// camera-controls and auto-rotate. The GLB URL comes from useWorldLatest:
// when ENDPOINTS.worldModel is empty, falls back to the local mock file.
//
// HUD chrome (border, corner brackets, vignette, scanlines, label, status
// badge) mirrors StreamFrame.tsx for visual consistency.

import { useEffect } from "react";
import "@google/model-viewer";
import { ENDPOINTS } from "@/config";
import { useWorldLatest } from "@/hooks/useWorldLatest";
import { useReportConnection } from "@/contexts/ConnectionStatus";
import DecoratedPanel from "./DecoratedPanel";

const WorldModel3D = () => {
  const { modelUrl, connected } = useWorldLatest();
  const isMock = !ENDPOINTS.worldModel;

  const report = useReportConnection();
  useEffect(() => {
    report("WORLD", isMock ? "mock" : connected ? "live" : "connecting");
  }, [isMock, connected, report]);

  const statusStyle = isMock
    ? {
        text: "MOCK",
        className: "bg-accent/10 text-accent border-accent/40",
        dotClass: "bg-accent animate-pulse",
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
    <DecoratedPanel
      label="WORLD MODEL"
      subLabel="3D RECON"
      statusText={statusStyle.text}
      statusClassName={statusStyle.className}
      statusDotClassName={statusStyle.dotClass}
    >
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
    </DecoratedPanel>
  );
};

export default WorldModel3D;
