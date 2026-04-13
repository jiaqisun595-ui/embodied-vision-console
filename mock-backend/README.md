# Mock Backend for Embodied Vision Console

这是一个模拟后端服务器，为 Embodied Vision Console 提供测试用的 API 数据。

## 功能

- 提供 `/api/brain/latest` 端点，返回模拟的"思考"数据
- 数据循环播放，模拟连续的思考流
- 支持 CORS，允许前端跨域访问

## 安装和运行

### 依赖
- Python 3.x

### 启动服务器
```bash
python server.py
```

服务器将在 `http://localhost:9001` 启动。

## API 文档

### GET `/api/brain/latest`
返回一条模拟的思考记录。

**响应示例:**
```json
{
  "role": "brain",
  "label": "语音识别",
  "content": "收到指令：「走到最远的那把椅子旁边，然后回到起点后面的桌子」"
}
```

**思考卡片包括:**
- `role`: 角色（brain/world/act/done）
- `label`: 标签，描述当前思考类型
- `content`: 内容描述
- `code`: 可选字段，显示相关代码/指令

## 文件说明

- `server.py`: 主服务器文件
- `server_output.log`: 服务器输出日志（git忽略）
- `nohup.out`: nohup 输出文件（git忽略）
- `__pycache__/`: Python 缓存目录（git忽略）

## 注意事项

1. 服务器默认端口为 9001
2. 数据会循环播放，共 22 条思考卡片
3. 每次调用 `/api/brain/latest` 会返回下一条思考
4. 支持 CORS，允许所有来源访问