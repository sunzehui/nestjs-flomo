import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as express from "express";
import { resolve } from "path";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/** 未配置 CORS_ORIGINS 时，开发环境默认放行的本地地址 */
const DEV_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

async function bootstrap() {
  // 创建时就指定logger, 所有框架消息都能打印
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    // logger: false,
  });

  const configService = app.get(ConfigService);

  // 设置/uploads目录为静态文件目录
  app.use("/uploads", express.static(resolve("uploads")));

  // CORS：只放行白名单来源，避免任意站点跨域携带凭据调用接口
  const configuredOrigins = (configService.get<string>("CORS_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProduction = configService.get<string>("NODE_ENV") === "production";
  app.enableCors({
    origin:
      configuredOrigins.length > 0
        ? configuredOrigins
        : isProduction
          ? false
          : DEV_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("flomo API")
    .setDescription("浮墨笔记后端接口文档")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("doc", app, document);

  const port = configService.get<number>("port") ?? 3000;
  await app.listen(port);
  Logger.log(`🤩 应用程序接口地址: ${await app.getUrl()}`, "Bootstrap");
  Logger.log("🚀 服务应用已经成功启动！", "Bootstrap");
}

bootstrap();
