// StreamFrame — shared chrome around the robot's RGB and depth MJPEG feeds.
//
// The robot service (Kai) exposes two MJPEG endpoints:
//   GET http://<IP>:<PORT>/rgb     · 640×480 · multipart/x-mixed-replace
//   GET http://<IP>:<PORT>/depth   · 640×480 · multipart/x-mixed-replace
//
// Because MJPEG works in a plain <img>, this component is intentionally tiny:
// set `src` and the browser does the rest. No fallback image, no retry state
// machine — the old scaffolding for that was removed once the endpoint URLs
// were confirmed. If the stream is empty or errors, we just overlay an
// OFFLINE badge and let the component self-heal on the next cache-busted
// retry scheduled via RETRY_INTERVAL_MS.

import { useEffect, useRef, useState } from "react";
import { RETRY_INTERVAL_MS } from "@/config";

type Status = "live" | "loading" | "offline";

interface Props {
  /** Short label shown top-left, e.g. "RGB · FPV". */
  label: string;
  /** Optional sub-label shown next to the main label. */
  subLabel?: string;
  /** MJPEG stream URL. Empty string means "no endpoint configured". */
  src: string;
  /** Optional custom object-fit. Defaults to "cover". */
  fit?: "cover" | "contain";
}

const StreamFrame = ({ label, subLabel, src, fit = "cover" }: Props) => {
  const [status, setStatus] = useState<Status>(src ? "loading" : "offline");
  const [imgSrc, setImgSrc] = useState<string>(src);
  const retryTimer = useRef<number | null>(null);
  const retryDelayRef = useRef(RETRY_INTERVAL_MS);
  const retryCountRef = useRef(0);

  // Whenever the configured src changes (HMR after editing config.ts), reset.
  useEffect(() => {
    if (retryTimer.current) {
      window.clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    retryDelayRef.current = RETRY_INTERVAL_MS;
    retryCountRef.current = 0;
    if (src) {
      setStatus("loading");
      setImgSrc(src);
    } else {
      setStatus("offline");
      setImgSrc("");
    }
    return () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    };
  }, [src]);

  const handleLoad = () => {
    // <img> load fires once the first MJPEG frame arrives.
    if (src) {
      setStatus("live");
      retryDelayRef.current = RETRY_INTERVAL_MS;
      retryCountRef.current = 0;
    }
  };

  const MAX_RETRY_DELAY = 60_000;
  const MAX_RETRY_COUNT = 10;

  const handleError = () => {
    if (!src) return;
    retryCountRef.current += 1;
    if (retryCountRef.current > MAX_RETRY_COUNT) {
      setStatus("offline");
      return;
    }
    setStatus("offline");
    const delay = retryDelayRef.current;
    retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);
    retryTimer.current = window.setTimeout(() => {
      setStatus("loading");
      setImgSrc(`${src}${src.includes("?") ? "&" : "?"}_r=${Date.now()}`);
    }, delay);
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
    offline: {
      text: "OFFLINE",
      className: "bg-rose-500/10 text-rose-300 border-rose-400/40",
      dotClass: "bg-rose-400",
    },
  }[status];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[#00E5FF]/25 bg-[#0A0E1A]">
      {/* Stream layer. Only mount the <img> when we actually have a URL,
          otherwise we'd get a broken-image icon flashing behind the overlay. */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={label}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
          draggable={false}
        />
      )}

      {/* Offline placeholder — plain HUD text, no external asset needed. */}
      {status === "offline" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center font-mono text-[11px] tracking-[0.3em] text-[#00E5FF]/50">
            <div className="text-[#00E5FF]/80">NO SIGNAL</div>
            <div className="mt-1 text-[9px] text-[#00E5FF]/40">
              waiting for {label}
            </div>
          </div>
        </div>
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
