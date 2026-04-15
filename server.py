import os, time, threading, requests, uvicorn, glob, logging, tempfile, shutil
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

# 配置 logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- 配置 ---
RECONSTRUCT_URL = "http://ss.4paradigm.com:15364/reconstruct"
MODE = os.getenv("RECON_MODE", "MOCK")
MOCK_DIR = "./mock_inputs"
OUTPUT_GLB = "./dist/reconstructed.glb"

latest_ts = 0


def reconstruction_loop():
    global latest_ts

    # --- 从环境变量获取 REAL 模式参数 ---
    # x: 参与重建的帧数, y: 采样间隔时间
    MAX_FRAMES = int(os.getenv("RECON_MAX_FRAMES", 3))
    FRAME_INTERVAL = float(os.getenv("RECON_FRAME_INTERVAL", 1.0))
    ROBOT_RGB_URL = os.getenv("RGB_URL", "")

    # MOCK 模式准备
    mock_images = sorted(glob.glob(f"{MOCK_DIR}/*.jpg"))
    mock_index = 0

    if not mock_images and MODE == "MOCK":
        logger.warning(f"{MOCK_DIR} 目录下没有找到 .jpg 图片！")

    while True:
        try:
            files_to_send = []
            cycle_start = time.time()

            if MODE == "REAL":
                import cv2 

                logger.info(
                    f"[{MODE}] 正在从实时流抓取 {MAX_FRAMES} 帧图像 (间隔 {FRAME_INTERVAL}s)..."
                )

                for i in range(MAX_FRAMES):
                    cap = cv2.VideoCapture(ROBOT_RGB_URL)
                    if not cap.isOpened():
                        logger.error(f"无法连接到 RGB 流: {ROBOT_RGB_URL}")
                        break

                    ret, frame = cap.read()
                    if ret:
                        # 在内存中将图片编码为 JPG
                        _, img_encoded = cv2.imencode(".jpg", frame)
                        # 将字节流添加到发送列表，文件名后缀带上索引
                        files_to_send.append(
                            (
                                "files",
                                (f"frame_{i}.jpg", img_encoded.tobytes(), "image/jpeg"),
                            )
                        )

                    cap.release()  # 立即关闭连接，防止占用缓存或连接数

                    if i < MAX_FRAMES - 1:
                        time.sleep(FRAME_INTERVAL)

                if not files_to_send:
                    logger.warning("抓取图像失败，等待下轮尝试")
                    time.sleep(5)
                    continue

            elif MODE == "MOCK" and mock_images:
                image_path = mock_images[mock_index % len(mock_images)]
                logger.info(
                    f"[{MODE}] 正在发送第 {mock_index % len(mock_images) + 1} 张图片: {os.path.basename(image_path)}"
                )

                with open(image_path, "rb") as f:
                    # 注意：requests 传多文件时格式为 [ (key, (name, content, type)), ... ]
                    files_to_send.append(
                        (
                            "files",
                            (os.path.basename(image_path), f.read(), "image/jpeg"),
                        )
                    )
                mock_index += 1
            else:
                time.sleep(5)
                continue

            # 发送请求至 GPU 服务器
            # 注意：files_to_send 是一个包含多个同名 key ('files') 的列表，requests 会处理为多文件上传
            gpu_start = time.time()
            resp = requests.post(RECONSTRUCT_URL, files=files_to_send, timeout=90)
            gpu_time = time.time() - gpu_start

            # 显式清理图像数据列表，帮助内存回收
            del files_to_send

            # 处理响应 (成功后更新 GLB)
            if resp.status_code == 200:
                # 写入临时文件
                with tempfile.NamedTemporaryFile(
                    mode='wb',
                    dir='./dist',
                    delete=False,
                    suffix='.glb'
                ) as tmp:
                    tmp.write(resp.content)
                    tmp_path = tmp.name
                
                # 原子重命名（覆盖旧文件）
                shutil.move(tmp_path, OUTPUT_GLB)
                latest_ts = int(time.time())
                cycle_time = time.time() - cycle_start
                logger.info(
                    f"成功更新 3D 模型: {latest_ts}, "
                    f"GPU耗时: {gpu_time:.2f}s, "
                    f"GLB大小: {len(resp.content)/1024:.1f}KB, "
                    f"总周期: {cycle_time:.2f}s"
                )
            else:
                logger.error(f"重建服务返回错误: {resp.status_code} - {resp.text}")

        except Exception as e:
            logger.exception("重建循环异常")

        # 完成一次重建任务后（无论成功失败）的冷却时间
        time.sleep(10)


# 启动重建线程
threading.Thread(target=reconstruction_loop, daemon=True).start()


@app.get("/api/config")
async def get_cfg():
    return {
        "rgb": os.getenv("RGB_URL", ""),
        "depth": os.getenv("DEPTH_URL", ""),
        "thoughtStream": os.getenv("THOUGHT_URL", ""),
    }


@app.get("/api/logging/logging_show_stream")
async def get_logging_show_stream():
    thought_url = os.getenv("THOUGHT_URL", "").rstrip("/")
    if not thought_url:
        return JSONResponse({"error": "THOUGHT_URL is not configured"}, status_code=404)

    try:
        upstream = requests.get(
            f"{thought_url}/api/logging/logging_show_stream", stream=True, timeout=30
        )
    except requests.RequestException as exc:
        return JSONResponse({"error": f"upstream request failed: {exc}"}, status_code=502)

    if upstream.status_code != 200:
        return JSONResponse(
            {"error": f"upstream returned {upstream.status_code}"},
            status_code=upstream.status_code,
        )

    def generate():
        import json as json_module
        try:
            for line in upstream.iter_lines(decode_unicode=True):
                if line is None:
                    continue
                
                try:
                    data = json_module.loads(line)
                    if 'message' in data:
                        # 提取 message 并确保 UTF-8 编码正确
                        message = data['message']
                        # 如果 message 包含转义序列，解码它
                        if '\\x' in message:
                            # 将转义序列转换为字节再解码
                            message = message.encode('latin1').decode('unicode_escape').encode('latin1').decode('utf-8')
                        logger.info(f"[THOUGHT] {message}")
                        # 只发送 message 内容给前端，使用 json.dumps 确保正确转义
                        yield f'{json_module.dumps({"message": message})}\n'
                    else:
                        logger.info(f"[THOUGHT] {line}")
                        yield f"{line}\n"
                except Exception as e:
                    logger.warning(f"解析 thought 失败: {e}, 原始内容: {line}")
                    yield f"{line}\n"
        finally:
            upstream.close()

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@app.get("/api/world/latest")
async def get_world():
    return {
        "url": f"/embodied-vision-console/reconstructed.glb?t={latest_ts}",
        "timestamp": latest_ts,
    }


# 静态文件挂载
if os.path.exists("./dist"):
    app.mount(
        "/embodied-vision-console",
        StaticFiles(directory="./dist", html=True),
        name="ui",
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)