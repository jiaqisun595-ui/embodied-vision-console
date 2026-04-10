# Embodied Vision Console

具身智能实时可视化控制台 —— 用于展厅大屏展示机器人的第一人称视角（RGB / 深度流）、3D 世界重建模型以及大脑思维链推理过程。

## 技术栈

- **React 18** + **TypeScript**（strict 模式）
- **Vite 5** 开发 & 构建
- **Tailwind CSS** 样式
- **@google/model-viewer** 3D GLB 模型渲染

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建 & 预览
npm run build
npm run preview
```

启动后访问 `http://localhost:8080/embodied-vision-console/` 即可看到看板。

所有接口默认运行在 Mock 模式（本地占位数据），无需后端即可查看完整 UI。

## 接口对接说明

所有外部接口统一在 `src/config.ts` 的 `ENDPOINTS` 对象中配置。**URL 留空 = Mock 模式，填入真实地址 = 自动切换到线上接口**，组件代码无需任何修改。

### 1. RGB 视频流（✅ 已对接）

| 项目 | 说明 |
|------|------|
| 字段 | `ENDPOINTS.rgb` |
| 请求方式 | `GET http://<IP>:<PORT>/rgb` |
| 响应类型 | `multipart/x-mixed-replace`（MJPEG 推流） |
| 分辨率 | 640×480 |
| 前端实现 | 浏览器 `<img>` 直接消费 MJPEG，零代码解析 |
| Mock 状态 | 本地 webp 占位图 |

### 2. 深度图视频流（✅ 已对接）

| 项目 | 说明 |
|------|------|
| 字段 | `ENDPOINTS.depth` |
| 请求方式 | `GET http://<IP>:<PORT>/depth` |
| 响应类型 | `multipart/x-mixed-replace`（MJPEG 推流） |
| 分辨率 | 640×480（Jet 色彩映射，越红越近） |
| 前端实现 | 与 RGB 共用 `StreamFrame` 组件，逻辑完全一致 |
| Mock 状态 | 本地 webp 占位图 |

> RGB 和深度图在断连时会自动每 4 秒重试（`RETRY_INTERVAL_MS`），面板显示 `OFFLINE → CONNECTING → LIVE` 状态流转。

### 3. 3D 世界重建模型（🆕 已预留，待接入真实接口）

| 项目 | 说明 |
|------|------|
| 字段 | `ENDPOINTS.worldModel` |
| 建议接口 | `GET <base>/api/world/latest` |
| 建议返回体 | `{ "url": "http://.../xxx.glb", "timestamp": 1744200622 }` |
| 文件格式 | GLB（glTF 二进制打包，包含几何体 + 材质 + 贴图） |
| 轮询频率 | 每 5 秒（`WORLD_POLL_INTERVAL_MS`） |
| 前端实现 | `<model-viewer>` 渲染 GLB，支持自动旋转、鼠标拖拽、环境光照 |
| Mock 状态 | ✅ 本地 `public/mock/world.glb`（DamagedHelmet 示例模型） |

**3D 重建服务参考**：LYB 老师部署在 `172.28.4.23:15364`，调用方式为 `POST /reconstruct`，上传多张 JPG 图片，返回 .glb 二进制文件。该服务需要由工程侧负责定时采集 RGB 图片并调用，将产出的 GLB 存放到前端可访问的 URL。

### 4. 思考决策流（✅ 已预留，待接入真实接口）

| 项目 | 说明 |
|------|------|
| 字段 | `ENDPOINTS.thoughtStream` |
| 请求方式 | `GET <base>/api/brain/latest` |
| 响应格式 | `application/json` |
| 轮询频率 | 每 2.5 秒（`THOUGHT_POLL_INTERVAL_MS`） |
| 前端实现 | 轮询 Hook + 指纹去重 + 静默容错，卡片按角色着色 |
| Mock 状态 | ✅ 内置 18 条示例思维卡片，自动循环播放 |

返回体格式：

```json
{
  "role":    "brain" | "world" | "act" | "done",
  "label":   "parse_cmd",
  "content": "Heard: walk to the farthest chair",
  "code":    "POST /nav_aim { target: 'c3' }"
}
```

- `role`：决定卡片颜色（brain 品红 / world 青 / act 琥珀 / done 翠绿）
- `label`：短标签，显示在卡片上方
- `content`：主体描述文本
- `code`：可选，代码块展示

### 5. ASR 语音识别（可选）

| 项目 | 说明 |
|------|------|
| 字段 | `ENDPOINTS.asrLatest` |
| 用途 | 顶栏显示当前语音指令文本 |
| 状态 | 可选接口，暂未对接 |

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `RETRY_INTERVAL_MS` | 4000 | RGB / 深度流断连后重试间隔（毫秒） |
| `THOUGHT_POLL_INTERVAL_MS` | 2500 | 思考决策流轮询间隔（毫秒） |
| `WORLD_POLL_INTERVAL_MS` | 5000 | 3D 世界模型轮询间隔（毫秒） |

## 项目结构

```
src/
  config.ts                 # ⭐ 全局配置中心（接口地址 + 轮询间隔）
  App.tsx                   # 入口
  main.tsx                  # React 挂载点
  pages/
    Index.tsx               # 主页面布局（单屏 1920×1080 展厅模式）
  components/
    StreamFrame.tsx          # MJPEG 视频流通用组件（含自动重试）
    RGBVideo.tsx             # RGB 视频面板
    DepthVideo.tsx           # 深度图视频面板
    WorldModel3D.tsx         # 3D 世界重建模型（model-viewer GLB 渲染）
    ThoughtStream.tsx        # 思考决策流卡片
  hooks/
    useBrainLatest.ts        # 思考决策流轮询 Hook
    useWorldLatest.ts        # 3D 世界模型轮询 Hook
  data/
    mockThoughts.ts          # 内置 mock 思维数据（18 条）
  types/
    model-viewer.d.ts        # model-viewer 组件 TS 类型声明
```
