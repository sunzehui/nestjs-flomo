import {Article} from '../article/entities/article.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Module} from '@nestjs/common';
import {StatisticService} from './statistic.service';
import {StatisticController} from './statistic.controller';
import {User} from '@/core/user/entities/user.entity';
import {Statistic} from './entities/statistic.entity';
import {Tag} from 'src/modules/tag/entities/tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Statistic, User, Article, Tag])],
    controllers: [StatisticController],
    providers: [StatisticService],
})
export class StatisticModule {
}
