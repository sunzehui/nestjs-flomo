# ---------- 构建阶段 ----------
# 注意：构建阶段必须安装 devDependencies（@nestjs/cli、typescript 都在 devDependencies 里）
FROM node:18-alpine AS builder

WORKDIR /app

# 国内镜像加速（原 registry.npm.taobao.org 已下线，改用 npmmirror）
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist

# sqlite3 需要在运行期能读写数据库文件
RUN mkdir -p /app/src/core/sql /app/uploads

EXPOSE 3000

# 启动前先跑 migration（dist/ormconfig.js 已是 JS，无需 ts-node），再启动服务
CMD ["sh", "-c", "npx typeorm migration:run -d dist/ormconfig.js && node dist/src/main"]
