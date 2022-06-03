import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Article } from 'src/article/entities/article.entity';
import { Statistic } from 'src/statistic/entities/statistic.entity';
import { Repository } from 'typeorm';

import * as moment from 'moment';
@Injectable()
export class ArticleStatisticService {
  constructor(
    @InjectRepository(Statistic)
    private readonly statisticRepository: Repository<Statistic>, // @InjectRepository(User) // private readonly userRepository: Repository<User>,
  ) {}

  async gridPush(userId: string, articleId: string) {
    // 有记录则increament 1 否则创建初始值1
    const statistic = await this.statisticRepository.findOne({
      where: {
        user: { id: userId },
        date: moment().format('YYYY-MM-DD'),
      },
    });
    if (statistic) {
      statistic.count++;
      this.statisticRepository.save(statistic);
    } else {
      const newStatistic = {
        user: { id: userId },
        article: {
          id: articleId,
        },
        count: 1,
        date: moment().format('YYYY-MM-DD'),
      };
      // newStatistic.user = ({ id: userId });
      // newStatistic.article = await this.articleRepository.findOneBy({
      //   id: articleId,
      // });
      // newStatistic.count = 1;
      this.statisticRepository.save(newStatistic);
    }
    return statistic;
  }
}
