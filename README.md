# Embodied Vision Console

实时机器人视觉监控控制台，展示 RGB/Depth 视频流、Thought Stream 和 3D 世界模型重建。

## 快速开始

### 一键构建并运行

```bash
./build_and_run.sh
```

访问：`http://localhost:8080/embodied-vision-console/`

### 局域网访问

1. 查找本机 IP：
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. 同一 WiFi 下的设备访问：
```
http://你的IP:8080/embodied-vision-console/
```

## 配置

### 默认配置

```bash
STREAM_HOST=10.110.12.58    # 机器人 IP
STREAM_PORT=8001            # 视频流端口
THOUGHT_PORT=8080           # Thought 流端口
HOST_PORT=8080              # 本地访问端口
```

### 自定义配置

**指定机器人 IP：**
```bash
STREAM_HOST=192.168.1.100 ./build_and_run.sh
```

**指定视频流端口：**
```bash
STREAM_PORT=9001 ./build_and_run.sh
```

**指定 Thought 流端口：**
```bash
THOUGHT_PORT=9002 ./build_and_run.sh
```

**修改本地访问端口：**
```bash
HOST_PORT=3000 ./build_and_run.sh
```

**完整自定义示例：**
```bash
STREAM_HOST=192.168.1.100 STREAM_PORT=9001 THOUGHT_PORT=9002 HOST_PORT=3000 ./build_and_run.sh
```

**常用场景：**

切换到不同的host：
```bash
STREAM_HOST=192.168.1.200 ./build_and_run.sh
```

使用非标准端口：
```bash
STREAM_HOST=10.110.12.58 STREAM_PORT=8002 THOUGHT_PORT=8081 ./build_and_run.sh
```

## 功能模块

### 1. RGB 视频流
- 机器人第一人称视角
- MJPEG 流，实时显示
- 端点：`http://${STREAM_HOST}:${STREAM_PORT}/rgb`

### 2. Depth 视频流
- 深度图像流
- 范围：0.2m - 8.0m
- 端点：`http://${STREAM_HOST}:${STREAM_PORT}/depth`

### 3. Thought Stream
- 实时显示机器人思考过程
- 自动解码 UTF-8 中文
- 显示北京时间戳
- 端点：`http://${STREAM_HOST}:${THOUGHT_PORT}/api/logging/logging_show_stream`

### 4. 3D 世界模型
- 实时 3D 场景重建
- 基于多帧图像重建
- 自动旋转展示
- 重建频率：每 15.5 秒

## 管理命令

### 查看日志
```bash
docker logs -f vision-console
```

### 停止容器
```bash
docker stop vision-console
```

### 删除容器
```bash
docker rm vision-console
```

### 重启服务
```bash
docker restart vision-console
```

## 性能优化

### 3D 重建配置

```bash
# 降低重建频率（减少带宽占用）
RECON_MAX_FRAMES=3 ./build_and_run.sh

# 调整采样间隔
RECON_FRAME_INTERVAL=1.0 ./build_and_run.sh
```

### 轮询间隔

- Thought Stream：2.5 秒
- World Model：5 秒
- 可在 `src/config.ts` 中修改

## 故障排查

### RGB/Depth 视频不显示

1. 检查机器人视频流服务是否运行
2. 直接访问测试：`http://${STREAM_HOST}:${STREAM_PORT}/rgb`
3. 检查网络连接：`ping ${STREAM_HOST}`

### Thought Stream 不显示

1. 检查 THOUGHT_URL 配置
2. 查看容器日志：`docker logs -f vision-console`
3. 检查上游服务：`curl http://${STREAM_HOST}:${THOUGHT_PORT}/api/logging/logging_show_stream`

### 3D 模型不更新

1. 查看重建日志：`docker logs -f vision-console | grep "成功更新"`
2. 检查 GPU 服务器连接
3. 确认 RECON_MODE=REAL

### 局域网无法访问

1. 检查防火墙：`sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate`
2. 确认在同一 WiFi 网络
3. 确认容器端口映射：`docker ps | grep vision-console`

## 技术栈

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: Python + FastAPI + Uvicorn
- **3D 渲染**: Google Model Viewer
- **容器化**: Docker

## 目录结构

```
embodied-vision-console/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   └── pages/              # 页面
├── server.py               # 后端服务
├── Dockerfile              # Docker 配置
├── build_and_run.sh        # 一键构建脚本
└── README.md               # 本文档
```

## 开发

### 本地开发（不使用 Docker）

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 启动后端服务
python server.py
```

### 重新构建

```bash
./build_and_run.sh
```

## License

MIT
