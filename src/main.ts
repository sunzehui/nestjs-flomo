import { NestFactory } from '@nestjs/core';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
  // 创建时就指定logger, 所有框架消息都能打印
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    // logger: false,
  });
  // app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(configService.get('port'));
  return configService;
}
bootstrap().then((configService) => {
  console.log(
    `🤩 应用程序接口地址： http://localhost:${configService.get<number>(
      'port',
    )}`,
  );
  console.log('🚀 服务应用已经成功启动！');
});
