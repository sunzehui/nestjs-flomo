import { Module } from "@nestjs/common";
import { AppController } from "@/app.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { AppService } from "@/app.service";
import { TagModule } from "@modules/tag/tag.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@/core/user/user.module";
import { AuthModule } from "@/core/auth/auth.module";
import { ArticleModule } from "@modules/article/article.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerErrorInterceptor, LoggerModule } from "nestjs-pino";
import { pinoHttpOption } from "@/core/logger.config";
import { StatisticModule } from "@modules/statistic/statistic.module";
import { dataSource } from "@/../ormconfig";
import { Config } from "@/types/config-service";
import { ShareModule } from "@modules/share/share.module";
import { FileManagementModule } from "@modules/file-management/file-management.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TransformInterceptor } from "./core/interceptor/transform.interceptor.js";

const environmentFilePath = [".env", `.env.${process.env.NODE_ENV}`];

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSource),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => {
        const environment = configService.get<Config["NODE_ENV"]>("NODE_ENV");
        return { pinoHttp: pinoHttpOption(environment) };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: environmentFilePath,
    }),
    ScheduleModule.forRoot(),
    TagModule,
    UserModule,
    AuthModule,
    ArticleModule,
    StatisticModule,
    ShareModule,
    FileManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
