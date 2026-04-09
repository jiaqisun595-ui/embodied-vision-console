// WorldModel3D — reconstructed 3D world model preview.
// Source of truth for the endpoint + fallback lives in src/config.ts.
// Currently placeholder-only; real URL will come from teacher LYB.

import StreamFrame from "./StreamFrame";
import { ENDPOINTS, FALLBACKS } from "@/config";

const WorldModel3D = () => (
  <StreamFrame
    label="WORLD MODEL"
    subLabel="3D RECON"
    src={ENDPOINTS.worldModel3D}
    fallbackSrc={FALLBACKS.worldModel3D}
    fit="cover"
  />
);

export default WorldModel3D;
