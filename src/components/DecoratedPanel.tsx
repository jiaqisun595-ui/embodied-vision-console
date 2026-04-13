// DecoratedPanel — shared chrome for StreamFrame and WorldModel3D components.
// Extracts common UI elements: corner brackets, vignette, scanlines, label area, and status badge.
//
// Usage:
//   <DecoratedPanel
//     label="PANEL TITLE"
//     subLabel="optional subtitle"
//     statusText="LIVE"
//     statusClassName="bg-emerald-400/15 text-emerald-300 border-emerald-400/40"
//     statusDotClassName="bg-emerald-400 animate-pulse"
//   >
//     {/* Your content here */}
//   </DecoratedPanel>

interface Props {
  /** Main label shown top-left */
  label: string;
  /** Optional sub-label shown next to the main label */
  subLabel?: string;
  /** Status text shown in the top-right badge */
  statusText: string;
  /** CSS classes for the status badge */
  statusClassName: string;
  /** CSS classes for the status dot */
  statusDotClassName: string;
  /** Panel content */
  children: React.ReactNode;
  /** Optional custom label element (overrides label/subLabel) */
  labelElement?: React.ReactNode;
  /** Optional custom status element (overrides status badge) */
  statusElement?: React.ReactNode;
}

const DecoratedPanel = ({
  label,
  subLabel,
  statusText,
  statusClassName,
  statusDotClassName,
  children,
  labelElement,
  statusElement,
}: Props) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-accent/25 bg-base">
      {/* Content layer */}
      {children}

      {/* Vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />

      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,229,255,0.05)_0px,rgba(0,229,255,0.05)_1px,transparent_1px,transparent_3px)] mix-blend-overlay" />

      {/* Corner brackets */}
      <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-accent/70" />
      <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-accent/70" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-accent/70" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-accent/70" />

      {/* Top-left label area */}
      {labelElement ? (
        labelElement
      ) : (
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-accent">
          <span className="font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]">
            {label}
          </span>
          {subLabel && (
            <span className="text-[10px] text-accent/60">· {subLabel}</span>
          )}
        </div>
      )}

      {/* Top-right status area */}
      {statusElement ? (
        statusElement
      ) : (
        <div
          className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest ${statusClassName}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClassName}`} />
          {statusText}
        </div>
      )}
    </div>
  );
};

export default DecoratedPanel;