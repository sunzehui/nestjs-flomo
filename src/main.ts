import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as express from "express";
import { resolve } from "path";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  // 创建时就指定logger, 所有框架消息都能打印
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    // logger: false,
  });
  app.enableCors();

  // 设置/uploads目录为静态文件目录
  app.use("/uploads", express.static(resolve("uploads")));
  if(process.env.NODE_ENV === 'preview'){
    app.setGlobalPrefix('/api')
  }

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Cats example")
    .setDescription("The cats API description")
    .setVersion("1.0")
    .addTag("cats")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("doc", app, document);
  const port = configService.get<number>("port");
  await app.listen(port || 3000);
  console.log(`🤩 应用程序接口地址: ${await app.getUrl()}`);
  console.log("🚀 服务应用已经成功启动！");
  return configService;
}

bootstrap();
