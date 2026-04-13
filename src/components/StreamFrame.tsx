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
import DecoratedPanel from "./DecoratedPanel";

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
    <DecoratedPanel
      label={label}
      subLabel={subLabel}
      statusText={statusStyle.text}
      statusClassName={statusStyle.className}
      statusDotClassName={statusStyle.dotClass}
    >
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
    </DecoratedPanel>
  );
};

export default StreamFrame;
