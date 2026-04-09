// DepthVideo — robot depth-map stream.
// Source of truth for the endpoint + fallback lives in src/config.ts.

import StreamFrame from "./StreamFrame";
import { ENDPOINTS, FALLBACKS } from "@/config";

const DepthVideo = () => (
  <StreamFrame
    label="DEPTH"
    subLabel="0.2m — 8.0m"
    src={ENDPOINTS.depth}
    fallbackSrc={FALLBACKS.depth}
    fit="cover"
  />
);

export default DepthVideo;
