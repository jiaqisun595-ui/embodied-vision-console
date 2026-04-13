// Single-screen layout for the exhibition hall display (1920x1080).
// No mode switching, no timeline-driven visibility — every zone runs at once.

import ThoughtStream from "@/components/ThoughtStream";
import StreamFrame from "@/components/StreamFrame";
import WorldModel3D from "@/components/WorldModel3D";
import Starfield from "@/components/Starfield";
import { useAsrLatest } from "@/hooks/useAsrLatest";
import { ENDPOINTS, ASR_POLL_INTERVAL_MS } from "@/config";
import {
  ConnectionStatusProvider,
  useConnectionStatus,
  type SourceName,
  type SourceStatus,
} from "@/contexts/ConnectionStatus";

const ICON: Record<SourceStatus, string> = {
  live: "\u2713",
  connecting: "\u223C",
  offline: "\u2717",
  mock: "\u2500",
};

const StatusFooter = () => {
  const statuses = useConnectionStatus();
  const entries = Object.entries(statuses) as [SourceName, SourceStatus][];

  const allMock = entries.every(([, s]) => s === "mock");
  const allLive = entries.every(([, s]) => s === "live");

  let summary: string;
  if (allMock) {
    summary = "STATUS: MOCK MODE";
  } else if (allLive) {
    summary = "STATUS: ALL SYSTEMS LIVE";
  } else {
    const detail = entries
      .map(([name, s]) => `${name} ${ICON[s]}`)
      .join("  ");
    summary = `STATUS: PARTIAL \u00B7 ${detail}`;
  }

  return (
    <footer className="h-8 shrink-0 border-t border-accent/30 flex items-center justify-between px-8 text-xs opacity-70">
      <span>{summary}</span>
      <span>1920 &times; 1080 &middot; EXHIBITION DISPLAY</span>
    </footer>
  );
};

const IndexContent = () => {
  const asrText = useAsrLatest(ENDPOINTS.asrLatest, ASR_POLL_INTERVAL_MS);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-accent font-sans">
      <Starfield />
      {/* ---------- TopBar ---------- */}
      <header className="h-16 shrink-0 border-b border-accent/30 flex items-center justify-between px-8">
        <div className="text-xl tracking-widest">
          EMBODIED VISION CONSOLE
        </div>
        <div className="text-sm opacity-80">
          CMD: &gt; {asrText ?? "\u7B49\u5F85\u8BED\u97F3\u6307\u4EE4\u2026"}
        </div>
      </header>

      {/* ---------- Main grid ---------- */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3">
        {/* Left column · ThoughtStream (≈1/3) */}
        <section className="col-span-4 min-h-0 overflow-hidden rounded-md border border-accent/40 bg-surface">
          <ThoughtStream />
        </section>

        {/* Right column (≈2/3) */}
        <section className="col-span-8 min-h-0 grid grid-rows-5 gap-3">
          {/* RGB video — top, larger */}
          <div className="row-span-3 min-h-0">
            <StreamFrame label="RGB · FPV" subLabel="MJPEG" src={ENDPOINTS.rgb} fit="cover" sourceId="RGB" />
          </div>

          {/* Depth + World Model — bottom, side by side */}
          <div className="row-span-2 grid grid-cols-2 gap-3 min-h-0">
            <StreamFrame label="DEPTH MAP" subLabel="JET" src={ENDPOINTS.depth} fit="contain" sourceId="DEPTH" />
            <WorldModel3D />
          </div>
        </section>
      </main>

      {/* ---------- BottomBar ---------- */}
      <StatusFooter />
    </div>
  );
};

const Index = () => (
  <ConnectionStatusProvider>
    <IndexContent />
  </ConnectionStatusProvider>
);

export default Index;
