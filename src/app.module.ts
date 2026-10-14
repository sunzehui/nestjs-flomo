import { Module } from "@nestjs/common";
import { AppController } from "@/app.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { AppService } from "@/app.service";
import { TagModule } from "@modules/tag/tag.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@/core/user/user.module";
import { AuthModule } from "@/core/auth/auth.module";
import { ArticleModule } from "@modules/article/article.module";
import { ConfigModule } from "@nestjs/config";
import { LoggerErrorInterceptor, LoggerModule } from "nestjs-pino";
import { pinoHttpOption } from "@/core/logger.config";
import { StatisticModule } from "@modules/statistic/statistic.module";
import { ReviewModule } from "@modules/review/review.module";
import { DataModule } from "@modules/data/data.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { dataSource } from "@/../ormconfig";
import { Config } from "@/types/config-service";
import { ShareModule } from "@modules/share/share.module";
import { FileManagementModule } from "@modules/file-management/file-management.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { TransformInterceptor } from "@/core/interceptor/transform.interceptor";

const environmentFilePath = [".env", `.env.${process.env.NODE_ENV}`];

@Module({
  imports: [
    // ConfigModule 必须最先注册，保证后续模块能读到 .env 中的变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: environmentFilePath,
    }),
    TypeOrmModule.forRoot(dataSource),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        return { pinoHttp: pinoHttpOption(process.env.NODE_ENV as Config["NODE_ENV"]) };
      },
    }),
    ScheduleModule.forRoot(),
    // 基础限流：单 IP 每分钟 120 次
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TagModule,
    UserModule,
    AuthModule,
    ArticleModule,
    StatisticModule,
    ShareModule,
    FileManagementModule,
    ReviewModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerErrorInterceptor,
    },
  ],
})
export class AppModule {}
