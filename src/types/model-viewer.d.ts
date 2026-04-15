// Type declarations for <model-viewer> custom element in JSX/TSX.
// See https://modelviewer.dev for full attribute reference.

import "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          "shadow-intensity"?: number | string;
          exposure?: number | string;
          ar?: boolean | string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}
