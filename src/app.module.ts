import { Module, } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from '@modules/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { ArticleModule } from '@modules/article/article.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { pinoHttpOption } from './core/logger.config';
import { StatisticModule } from '@modules/statistic/statistic.module';
import { User } from './core/user/entities/user.entity';
import { Tag } from '@modules/tag/entities/tag.entity';
import { Article } from '@modules/article/entities/article.entity';
import connectionCfg from '../ormconfig';
import { Config } from './types/config-service';
import { ShareModule } from './modules/share/share.module';
import { ShareController } from './modules/share/share.controller';
import { ShareService } from './modules/share/share.service';

const envFilePath =['.env', `.env.${process.env.NODE_ENV}`]

@Module({
    imports: [
        TypeOrmModule.forRoot(connectionCfg),
        TypeOrmModule.forFeature([Article, Tag, User]),
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<Config>) => {
                const env = configService.get<Config['NODE_ENV']>('NODE_ENV');
                return { pinoHttp: pinoHttpOption(env) };
            },
        }),

        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath
        }),
        TagModule,
        UserModule,
        AuthModule,
        ArticleModule,
        StatisticModule,
        ShareModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
