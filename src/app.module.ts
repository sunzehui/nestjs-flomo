import { Module, ModuleMetadata } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ArticleModule } from './article/article.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { pinoHttpOption } from './logger.config';
import { StatisticModule } from './statistic/statistic.module';
import { ArticleStatisticService } from './article-statistic/article-statistic.service';
import { User } from '@user/entities/user.entity';
import { Tag } from './tag/entities/tag.entity';
import { Article } from './article/entities/article.entity';
import { Statistic } from './statistic/entities/statistic.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([Statistic, Article, Tag, User]),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return { pinoHttp: pinoHttpOption(configService.get('NODE_ENV')) };
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TagModule,
    UserModule,
    AuthModule,
    ArticleModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService, ArticleStatisticService],
})
export class AppModule {}
