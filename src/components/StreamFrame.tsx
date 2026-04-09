// StreamFrame — shared base used by RGBVideo / DepthVideo / WorldModel3D.
//
// Behaviour:
//   • If `src` is non-empty, render it inside an <img> (works for MJPEG
//     streams and static images alike).
//   • On load error OR empty src, swap to `fallbackSrc` so the display never
//     goes blank during the demo.
//   • After a failure, re-attempt the live stream every RETRY_INTERVAL_MS —
//     this way the UI self-heals when Kai's robot service comes back online
//     mid-show without anyone having to refresh the page.
//
// Visuals: every frame carries a thin cyan border, corner brackets, a label
// badge, and a "LIVE" / "FALLBACK" / "OFFLINE" status pill so viewers can
// immediately tell whether what they're seeing is real or placeholder.

import { useEffect, useRef, useState } from "react";
import { RETRY_INTERVAL_MS } from "@/config";

type Status = "live" | "fallback" | "loading";

interface Props {
  /** Short label shown top-left, e.g. "RGB · FPV". */
  label: string;
  /** Optional sub-label shown next to the main label. */
  subLabel?: string;
  /** Live stream / image URL. Empty string is treated as "no endpoint yet". */
  src: string;
  /** Local placeholder served from /public. */
  fallbackSrc: string;
  /** Optional custom object-fit. Defaults to "cover". */
  fit?: "cover" | "contain";
}

const StreamFrame = ({
  label,
  subLabel,
  src,
  fallbackSrc,
  fit = "cover",
}: Props) => {
  const [status, setStatus] = useState<Status>(src ? "loading" : "fallback");
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const retryTimer = useRef<number | null>(null);

  // Whenever the configured src changes (e.g. HMR after editing config.ts),
  // reset state and try the live stream again.
  useEffect(() => {
    if (retryTimer.current) {
      window.clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (src) {
      setStatus("loading");
      setCurrentSrc(src);
    } else {
      setStatus("fallback");
      setCurrentSrc(fallbackSrc);
    }
    return () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    };
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    // An <img> load event fires once the first MJPEG frame arrives.
    if (currentSrc === src && src) setStatus("live");
  };

  const handleError = () => {
    setStatus("fallback");
    setCurrentSrc(fallbackSrc);
    if (src) {
      // Schedule a silent retry of the real endpoint.
      retryTimer.current = window.setTimeout(() => {
        setStatus("loading");
        // Cache-bust so the browser actually refetches.
        setCurrentSrc(`${src}${src.includes("?") ? "&" : "?"}_r=${Date.now()}`);
      }, RETRY_INTERVAL_MS);
    }
  };

  const statusStyle = {
    live: {
      text: "LIVE",
      className: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
      dotClass: "bg-emerald-400 animate-pulse",
    },
    loading: {
      text: "CONNECTING",
      className: "bg-amber-400/15 text-amber-300 border-amber-400/40",
      dotClass: "bg-amber-400 animate-pulse",
    },
    fallback: {
      text: src ? "OFFLINE" : "MOCK",
      className: "bg-[#00E5FF]/10 text-[#00E5FF]/80 border-[#00E5FF]/30",
      dotClass: "bg-[#00E5FF]/70",
    },
  }[status];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[#00E5FF]/25 bg-[#0A0E1A]">
      {/* Image/stream layer */}
      <img
        src={currentSrc}
        alt={label}
        onLoad={handleLoad}
        onError={handleError}
        className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
        draggable={false}
      />

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
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-[#00E5FF]/60">· {subLabel}</span>
        )}
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

export default StreamFrame;
