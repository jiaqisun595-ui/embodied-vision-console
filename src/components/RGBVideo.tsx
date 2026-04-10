// RGBVideo — robot first-person RGB feed.
// Source of truth for the endpoint lives in src/config.ts (ENDPOINTS.rgb).

import StreamFrame from "./StreamFrame";
import { ENDPOINTS } from "@/config";

const RGBVideo = () => (
  <StreamFrame
    label="RGB · FPV"
    subLabel="ROBOT EYE"
    src={ENDPOINTS.rgb}
    fit="cover"
  />
);

export default RGBVideo;
