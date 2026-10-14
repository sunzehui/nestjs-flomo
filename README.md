# nestjs-flomo

浮墨（flomo）后端项目，基于 NestJS + TypeORM + SQLite 实现。

## 环境要求

- Node.js >= 18（建议使用 18 / 20 LTS，`sqlite3` 是原生模块，Node 版本过高可能需要本地编译工具链）

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
cp .env.development.example .env.development
```

> ⚠️ 必须把 `JWT_SECRET` 改成你自己的长随机字符串。缺失该变量时服务会**拒绝启动**（不再有弱默认值兜底）。

3. 初始化数据库（首次运行）

```bash
npm run migration:run
```

4. 启动

```bash
npm run dev
```

- 接口地址：http://localhost:3000
- Swagger 文档：http://localhost:3000/doc

## 生产部署

```bash
npm run build
npm run start:prod
```

## Docker 一键部署

```bash
cp .env.example .env   # 并修改 JWT_SECRET / SERVER_URL / CORS_ORIGINS
docker compose up -d
```

`docker-compose.yaml` 会同时构建前后端，**前端项目需要位于上一级的 `vue3-flomo` 目录**：

- `website`：nginx，暴露 80 端口，托管前端静态文件并把 `/api` 转发到后端
- `nest-server`：NestJS 服务，容器启动时自动执行 migration；`uploads` 与 sqlite 数据库通过命名卷持久化

如果只想单独构建后端镜像：

```bash
docker build -t nest-server:v0.1 .
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式（watch） |
| `npm run build` | 编译到 `dist` |
| `npm run start:prod` | 以 production 模式运行编译产物 |
| `npm run migration:run` | 执行数据库迁移 |
| `npm run migration:generate` | 根据实体差异生成迁移 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行 e2e 测试（当前仓库暂无用例） |

## 主要目录

```
src/
├── core/           # 用户、鉴权、日志、迁移等核心能力
├── modules/        # 业务模块：article / tag / share / file-management / statistic
├── utils/          # 通用工具（含 HTML 清洗 sanitize.ts）
├── main.ts         # 入口：CORS、全局校验管道、Swagger
└── app.module.ts
ormconfig.ts        # TypeORM 数据源配置
```

## 安全说明

- 所有写操作接口都要求 `Authorization: Bearer <token>`
- 用户提交的 memo 内容会在服务端做白名单清洗后再入库，防止存储型 XSS
- 跨域来源由 `CORS_ORIGINS` 控制；未配置时生产环境不放行任何来源
