import { Between, IsNull } from "typeorm";
import { subDays, addDays, format, parseISO } from "date-fns";

import { Tag } from "@modules/tag/entities/tag.entity";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { UserEntity } from "@/core/user/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as _ from "lodash";
import { daysPassedSince, formatDate } from "@utils/date";

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserStatistic(userId: string) {
    const tagCount = await this.tagRepository.countBy({
      user: { id: userId },
    });
    const memoCount = await this.articleRepository.countBy({
      user: { id: userId },
      deleteTime: IsNull(),
    });
    const userEntity = await this.userRepository.findOneBy({ id: userId });
    if (!userEntity) throw new Error("用户不存在");
    // 用户注册时间-当前时间
    const day = daysPassedSince(new Date(userEntity.createTime));
    return {
      tagCount,
      memoCount,
      day: day > 0 ? day : 1,
    };
  }
  async getGirdWithDate(userId: string) {
    const DateRange = (date: Date) =>
      Between(subDays(date, 78), addDays(date, 5));
    // 时间在区间范围内的文章数量

    const StatisticList = await this.articleRepository
      .createQueryBuilder("article")
      .groupBy("DATE(createTime)")
      .where({
        createTime: DateRange(new Date()),
        user: { id: userId },
      })
      .select("article.*")
      .addSelect("count(article.id)", "count")
      .getRawMany();

    return _.reduce(
      StatisticList,
      (accumulator, item) => {
        const date = formatDate(item.createTime);
        
        return _.assign(accumulator, { [date]: _.toNumber(item.count) });
      },
      {},
    );
  }
}
