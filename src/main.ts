import {NestFactory} from '@nestjs/core';
import {TransformInterceptor} from './core/interceptor/transform.interceptor';
import {AppModule} from './app.module';

import {ConfigService} from '@nestjs/config';
import {LoggerErrorInterceptor} from 'nestjs-pino';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
    // 创建时就指定logger, 所有框架消息都能打印
    const app = await NestFactory.create(AppModule, {
        // bufferLogs: true,
        // logger: false,
    });
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
    // app.useLogger(app.get(Logger));
    const configService = app.get(ConfigService);
    // 全局注册拦截器
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    // 兼容zeabur
    const isZeabur = process.env.NODE_ENV === 'zeabur';
    if (isZeabur) {
        app.enableCors();
        app.setGlobalPrefix('api');
    }
    await app.listen(process.env.PORT || 3000);
    return configService;
}

bootstrap().then((configService) => {
    console.log(
        `🤩 应用程序接口地址： http://localhost:${process.env.PORT}`,
    );
    console.log('🚀 服务应用已经成功启动！');
});
