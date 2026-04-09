// RGBVideo — robot first-person RGB feed.
// Source of truth for the endpoint + fallback lives in src/config.ts.

import StreamFrame from "./StreamFrame";
import { ENDPOINTS, FALLBACKS } from "@/config";

const RGBVideo = () => (
  <StreamFrame
    label="RGB · FPV"
    subLabel="ROBOT EYE"
    src={ENDPOINTS.rgb}
    fallbackSrc={FALLBACKS.rgb}
    fit="cover"
  />
);

export default RGBVideo;
