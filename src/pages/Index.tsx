import { useEffect } from "react";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import ThinkingMode from "@/components/ThinkingMode";
import PerceptionMode from "@/components/PerceptionMode";
import DoneScreen from "@/components/DoneScreen";
import { useTimeline } from "@/hooks/useTimeline";

const Index = () => {
  const tl = useTimeline();
  const { currentFrame, frameIndex, elapsed, globalTime, playing } = tl;
  const mode = currentFrame.mode;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          tl.togglePlay();
          break;
        case "r":
        case "R":
          tl.reset();
          break;
        case "ArrowRight":
          tl.nextFrame();
          break;
        case "ArrowLeft":
          tl.prevFrame();
          break;
        case "t":
        case "T":
          // Jump to nearest thinking frame
          {
            const idx = [0, 2, 4, 6].find((i) => i >= frameIndex) ?? 0;
            tl.goToFrame(idx);
          }
          break;
        case "p":
        case "P":
          // Jump to nearest perception frame
          {
            const idx = [1, 3, 5].find((i) => i >= frameIndex) ?? 1;
            tl.goToFrame(idx);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tl, frameIndex]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background bg-grid">
      <TopBar
        mode={mode}
        timer={currentFrame.timer}
        playing={playing}
        onToggle={tl.nextFrame}
        onPlayPause={tl.togglePlay}
      />
      <div className="flex-1 min-h-0 relative">
        {/* THINKING */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: mode === "thinking" ? 1 : 0,
            pointerEvents: mode === "thinking" ? "auto" : "none",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {mode === "thinking" && (
            <ThinkingMode frame={currentFrame} elapsed={elapsed} />
          )}
        </div>

        {/* PERCEPTION */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: mode === "perception" ? 1 : 0,
            pointerEvents: mode === "perception" ? "auto" : "none",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {mode === "perception" && (
            <PerceptionMode frame={currentFrame} elapsed={elapsed} />
          )}
        </div>

        {/* DONE */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: mode === "done" ? 1 : 0,
            pointerEvents: mode === "done" ? "auto" : "none",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {mode === "done" && <DoneScreen elapsed={elapsed} />}
        </div>
      </div>
      <BottomBar frameIndex={frameIndex} globalTime={globalTime} />
    </div>
  );
};

export default Index;
