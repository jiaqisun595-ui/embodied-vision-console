from http.server import HTTPServer, BaseHTTPRequestHandler
import json, time

THOUGHTS = [
    {"role":"brain","label":"语音识别","content":"收到指令：「走到最远的那把椅子旁边，然后回到起点后面的桌子」"},
    {"role":"brain","label":"指令解析","content":"正在解析自然语言指令...识别出 2 个子目标：① 找到最远的椅子 ② 回到起点后方的桌子"},
    {"role":"brain","label":"任务规划","content":"制定执行计划：先扫描环境 → 定位所有椅子 → 计算距离 → 导航到最远椅子 → 回溯到起点后方桌子"},
    {"role":"world","label":"环境扫描","content":"启动 RGB + 深度相机扫描...检测到 4 把椅子、2 张桌子、1 个沙发"},
    {"role":"world","label":"目标排序","content":"计算当前位置到每把椅子的距离","code":"椅子列表 = [{\"编号\":\"C1\",\"距离\":\"1.8m\"},{\"编号\":\"C2\",\"距离\":\"3.2m\"},{\"编号\":\"C3\",\"距离\":\"4.7m\"},{\"编号\":\"C4\",\"距离\":\"2.4m\"}]"},
    {"role":"brain","label":"决策","content":"目标 A 确定 = 椅子 C3（距离 4.7 米，最远）"},
    {"role":"act","label":"导航启动","content":"向椅子 C3 出发，启动自主导航...","code":"POST /nav_aim  { target: 'C3', mode: 'walk' }"},
    {"role":"world","label":"行进中","content":"行走中... 1.2m / 4.7m · 前方通道无障碍物"},
    {"role":"world","label":"行进中","content":"行走中... 3.8m / 4.7m · 即将到达目标"},
    {"role":"world","label":"避障","content":"检测到右侧 0.6m 处有障碍物（沙发扶手），微调路径向左偏移 0.3m"},
    {"role":"done","label":"子目标1完成","content":"已到达椅子 C3，子目标 ① 完成 ✓"},
    {"role":"brain","label":"空间回忆","content":"正在回忆起点位置...通过空间记忆定位「起点后面的桌子」"},
    {"role":"world","label":"记忆检索","content":"起点坐标 = (0.00, 0.00)，桌子 T1 位于 (-0.40, -1.10)，方位：起点正后方"},
    {"role":"brain","label":"决策","content":"目标 B 确定 = 桌子 T1"},
    {"role":"act","label":"导航启动","content":"向桌子 T1 出发，启动自主导航...","code":"POST /nav_aim  { target: 'T1', mode: 'walk' }"},
    {"role":"world","label":"转向","content":"需要转向 168°...正在重新规划绕过沙发的路径"},
    {"role":"world","label":"3D重建","content":"上传当前视角图像进行实时 3D 重建...","code":"POST /reconstruct  { frames: [rgb_0042.jpg, rgb_0043.jpg] }"},
    {"role":"world","label":"行进中","content":"行走中... 2.1m / 5.9m · 路径畅通"},
    {"role":"world","label":"行进中","content":"行走中... 5.4m / 5.9m · 最终接近"},
    {"role":"done","label":"子目标2完成","content":"已到达桌子 T1，子目标 ② 完成 ✓"},
    {"role":"brain","label":"任务完成","content":"所有子目标已完成！总行走距离 10.6 米，用时 47 秒。等待下一条指令..."},
    {"role":"brain","label":"待命","content":"系统待命中，可以说出下一条指令"},
]

cursor = 0

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        global cursor
        if self.path == "/api/brain/latest":
            thought = THOUGHTS[cursor % len(THOUGHTS)]
            cursor += 1
            data = json.dumps(thought, ensure_ascii=False)
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type","application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(data.encode("utf-8"))
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")

    def log_message(self, format, *args):
        pass

print("Mock 后端已启动，共 22 条思考卡片，循环播放")
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
