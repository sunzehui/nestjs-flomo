import {Module,} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TagModule} from '@modules/tag/tag.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserModule} from './core/user/user.module';
import {AuthModule} from './core/auth/auth.module';
import {ArticleModule} from '@modules/article/article.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {pinoHttpOption} from './core/logger.config';
import {StatisticModule} from '@modules/statistic/statistic.module';
import {ArticleStatisticService} from '@modules/article-statistic/article-statistic.service';
import {User} from './core/user/entities/user.entity';
import {Tag} from '@modules/tag/entities/tag.entity';
import {Article} from '@modules/article/entities/article.entity';
import {Statistic} from '@modules/statistic/entities/statistic.entity';
import connectionCfg from '../ormconfig';

@Module({
    imports: [
        TypeOrmModule.forRoot(connectionCfg),
        TypeOrmModule.forFeature([Statistic, Article, Tag, User]),
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {pinoHttp: pinoHttpOption(configService.get('NODE_ENV'))};
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
export class AppModule {
}
