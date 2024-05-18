# nestjs-flomo
浮墨后端项目
## Instruction
使用 nestjs + typeorm + sqlite 实现

## Install
### docker一键部署
```bash
docker-compose up -d
```

### 服务器安装
1. 安装依赖
```bash
yarn install
```
2. 配置环境变量
```bash
mv ./env.example ./env
mv ./env.development.example ./env.development
mv ./env.production.example ./env.production
```
3. 编译并迁移数据库
```
yarn migration:run
```
4. 运行程序
```bash
yarn start:prod
```
