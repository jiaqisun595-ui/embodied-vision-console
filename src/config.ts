// src/config.ts

// 这些是基础默认值
export let ENDPOINTS = {
  rgb: "/embodied-vision-console/mock/rgb.webp",
  depth: "/embodied-vision-console/mock/depth.webp",
  thoughtStream: "",
  worldModel: "/api/world/latest",
  asrLatest: "",
};

// 增加一个自动初始化函数，从 Python 后端拉取上海同事配置的环境变量
export const initConfig = async () => {
  try {
    const res = await fetch("/api/config");
    const remoteConfig = await res.json();
    // 用上海同事填写的真实 URL 覆盖默认值
    ENDPOINTS.rgb = remoteConfig.rgb;
    ENDPOINTS.depth = remoteConfig.depth;
    ENDPOINTS.thoughtStream = remoteConfig.thoughtStream
      ? "/api/logging/logging_show_stream"
      : "";
    console.log("Runtime config loaded:", ENDPOINTS);
  } catch (e) {
    console.warn("Using default/mock config");
  }
};

export const RETRY_INTERVAL_MS = 4000;
export const THOUGHT_POLL_INTERVAL_MS = 2500;
export const WORLD_POLL_INTERVAL_MS = 5000;
