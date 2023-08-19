import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as express from "express";
import { resolve } from "path";
import { ConfigService } from "@nestjs/config";
import { LoggerErrorInterceptor } from "nestjs-pino";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { TransformInterceptor } from "./core/interceptor/transform.interceptor.js";

async function bootstrap() {
  // 创建时就指定logger, 所有框架消息都能打印
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    // logger: false,
  });
  // 设置/uploads目录为静态文件目录
  app.use("/uploads", express.static(resolve("uploads")));

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  // 兼容zeabur
  const isZeabur = process.env.NODE_ENV === "zeabur";
  if (isZeabur) {
    app.enableCors();
    app.setGlobalPrefix("api");
  }
  const config = new DocumentBuilder()
    .setTitle("Cats example")
    .setDescription("The cats API description")
    .setVersion("1.0")
    .addTag("cats")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  const port = process.env.PORT || configService.get("PORT") || 3000;
  await app.listen(port);
  console.log(
    `🤩 应用程序接口地址： ${await app.getUrl()}`,
  );
  console.log("🚀 服务应用已经成功启动！");
  return configService;
}

bootstrap();
