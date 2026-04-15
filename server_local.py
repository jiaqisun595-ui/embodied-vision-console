import os
from pathlib import Path

import requests
import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles


ROOT = Path(__file__).resolve().parent
DIST_DIR = ROOT / "dist"
PUBLIC_DIR = ROOT / "public"
RECONSTRUCTED_GLB = DIST_DIR / "reconstructed.glb"

APP_BASE = "/embodied-vision-console"
DEFAULT_WORLD_URL = f"{APP_BASE}/mock/world.glb"

app = FastAPI()


def has_dist() -> bool:
    return DIST_DIR.exists() and (DIST_DIR / "index.html").exists()


@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.get("/api/config")
async def get_config():
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
        try:
            for line in upstream.iter_lines(decode_unicode=True):
                if line is None:
                    continue
                yield f"{line}\n"
        finally:
            upstream.close()

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@app.get("/api/world/latest")
async def get_world_latest():
    if RECONSTRUCTED_GLB.exists():
        ts = int(RECONSTRUCTED_GLB.stat().st_mtime)
        url = f"{APP_BASE}/reconstructed.glb?t={ts}"
        return {"url": url, "timestamp": ts}

    return {"url": DEFAULT_WORLD_URL, "timestamp": 0}


@app.get("/")
async def root():
    if has_dist():
        return RedirectResponse(url=f"{APP_BASE}/")

    return PlainTextResponse(
        "dist/ not found. Run `npm install && npm run build` first, then restart server_local.py.",
        status_code=503,
    )


if PUBLIC_DIR.exists():
    app.mount(f"{APP_BASE}/mock", StaticFiles(directory=PUBLIC_DIR / "mock"), name="mock")

if has_dist():
    app.mount(APP_BASE, StaticFiles(directory=DIST_DIR, html=True), name="ui")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
