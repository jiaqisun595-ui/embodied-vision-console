# Embodied Vision Console

具身智能实时可视化控制台 —— 用于展厅大屏展示机器人的第一人称视角（RGB / 深度流）、3D 世界模型点云以及大脑思维链推理过程。

## 技术栈

- **React 18** + **TypeScript**（strict 模式）
- **Vite** 开发 & 构建
- **Tailwind CSS** 样式
- **Canvas 2D** 3D 点云渲染（无 Three.js 依赖）

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（默认 http://localhost:5173）
npm run dev

# 生产构建 & 预览
npm run build
npm run preview
```

## 配置真实接口

编辑 `src/config.ts` 中的 `ENDPOINTS` 对象，将 mock 地址替换为真实服务地址：

| 字段 | 说明 | 示例 |
|------|------|------|
| `rgb` | 机器人第一人称 RGB 视频流（MJPEG，640x480） | `http://192.168.1.10:8080/rgb` |
| `depth` | 深度图视频流（Jet 着色，MJPEG，640x480） | `http://192.168.1.10:8080/depth` |
| `thoughtStream` | 大脑思维链接口，轮询获取最新推理卡片（JSON） | `http://192.168.1.20:5000/api/brain/latest` |
| `asrLatest` | ASR 语音识别最新指令文本（可选） | `http://192.168.1.20:5000/api/asr/latest` |

- `rgb` / `depth`：浏览器通过 `<img>` 直接消费 MJPEG 流，无需额外处理。留空则对应面板显示 OFFLINE。
- `thoughtStream`：每 2.5 秒轮询一次，返回 JSON 格式 `{ role, label, content, code? }`。留空则使用内置 mock 数据循环播放。
- `asrLatest`：用于顶栏显示当前语音指令，可选。

同文件中还可调整 `RETRY_INTERVAL_MS`（视频流断线重试间隔）和 `THOUGHT_POLL_INTERVAL_MS`（思维链轮询间隔）。

## 项目结构

```
src/
  config.ts              # 全局配置（接口地址、轮询间隔）
  App.tsx                # 入口，ErrorBoundary 包裹
  main.tsx               # React 挂载点
  pages/
    Index.tsx            # 主页面布局（单屏展厅模式）
  components/
    ErrorBoundary.tsx    # React 错误边界
    StreamFrame.tsx      # MJPEG 视频流通用组件（含指数退避重试）
    RGBVideo.tsx         # RGB 视频面板
    DepthVideo.tsx       # 深度图视频面板
    WorldModel3D.tsx     # 3D 世界模型点云（Canvas 2D 渲染）
    ThoughtStream.tsx    # 大脑思维链卡片流
  hooks/
    useBrainLatest.ts    # 轮询思维链接口的 Hook
  data/
    mockThoughts.ts      # 内置 mock 思维数据
```
