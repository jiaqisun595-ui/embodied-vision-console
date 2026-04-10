// DepthVideo — robot depth-map stream.
// Source of truth for the endpoint lives in src/config.ts (ENDPOINTS.depth).

import StreamFrame from "./StreamFrame";
import { ENDPOINTS } from "@/config";

const DepthVideo = () => (
  <StreamFrame
    label="DEPTH"
    subLabel="0.2m — 8.0m"
    src={ENDPOINTS.depth}
    fit="cover"
  />
);

export default DepthVideo;
