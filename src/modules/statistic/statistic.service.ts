import {Between} from 'typeorm';
import {subDays, addDays, format} from 'date-fns';

import {Tag} from '@modules/tag/entities/tag.entity';
import {Article} from '@modules/article/entities/article.entity';
import {User} from '@/core/user/entities/user.entity';
import {Injectable} from '@nestjs/common';
import {CreateStatisticDto} from './dto/create-statistic.dto';
import {UpdateStatisticDto} from './dto/update-statistic.dto';
import {Repository} from 'typeorm';
import {Statistic} from './entities/statistic.entity';
import {InjectRepository} from '@nestjs/typeorm';
import * as _ from 'lodash';

@Injectable()
export class StatisticService {
    constructor(
        @InjectRepository(Statistic)
        private readonly statisticRepository: Repository<Statistic>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    create(createStatisticDto: CreateStatisticDto) {
        return 'This action adds a new statistic';
    }

    async findAll(userId: string) {
        // tagcount 直接带userid查
        // memocount直接带userid查
        // day去查use对应staticstic下的记录数量
        const tagCount = await this.tagRepository.countBy({
            user: {id: userId},
        });
        const memoCount = await this.articleRepository.countBy({
            user: {id: userId},
        });
        const day = await this.statisticRepository.countBy({
            user: {id: userId},
        });
        return {
            tagCount,
            memoCount,
            day,
        };
    }

    async gird(userId: string) {
        /**
         * {
          "daily_memo_count": {
              "2022-03-17": 84
          }
      }
         daily_memo_count: 日记录数 区间 [now - 78 , now + 5] userid  select
         */
        const DateRange = (date: Date) =>
            Between(subDays(date, 78), addDays(date, 5));
        // 时间在区间范围内的文章数量
        const StatisticList = await this.statisticRepository
            .createQueryBuilder()
            .groupBy('date')
            .where({
                date: DateRange(new Date()),
                user: await this.userRepository.findOneBy({id: userId}),
            })
            .select('date,sum(count)', 'count')
            .getRawMany();

        return _.reduce(
            StatisticList,
            (acc, item) => {
                const date = format(item.date, 'yyyy-MM-dd');
                return _.assign(acc, {[date]: _.toNumber(item.count)});
            },
            {},
        );

    }

    findOne(id: number) {
        return `This action returns a #${id} statistic`;
    }

    update(id: number, updateStatisticDto: UpdateStatisticDto) {
        return `This action updates a #${id} statistic`;
    }

    remove(id: number) {
        return `This action removes a #${id} statistic`;
    }
}
