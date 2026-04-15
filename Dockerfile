# 阶段1: 编译前端
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20.19.6-slim AS build-stage
ARG NPM_REGISTRY=https://registry.npmmirror.com
WORKDIR /app
COPY package*.json ./
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install
COPY . .
RUN npm run build

# 阶段2: 运行环境
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/python:3.10-slim
ARG PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
ARG PIP_TRUSTED_HOST=pypi.tuna.tsinghua.edu.cn
WORKDIR /app
RUN pip install \
    --no-cache-dir \
    -i "${PIP_INDEX_URL}" \
    --trusted-host "${PIP_TRUSTED_HOST}" \
    fastapi uvicorn requests opencv-python-headless
COPY --from=build-stage /app/dist ./dist
COPY server.py .

# 将你的整个 mock 图片文件夹复制进去
# 确保你的项目根目录有一个 mock_inputs 文件夹，里面放着 0.jpg 到 8.jpg
COPY public/mock/mock_inputs ./mock_inputs/ 

EXPOSE 8080
CMD ["python", "server.py"]
