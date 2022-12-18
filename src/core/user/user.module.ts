import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {User} from './entities/user.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import { StatisticService } from "@modules/statistic/statistic.service";
import { Statistic } from "@modules/statistic/entities/statistic.entity";
import { Article } from "@modules/article/entities/article.entity";
import { Tag } from "@modules/tag/entities/tag.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User,Statistic, User, Article, Tag])],
    controllers: [UserController],
    providers: [UserService,StatisticService],
    exports: [UserService],
})
export class UserModule {
}
