import { Between, IsNull, Repository } from "typeorm";
import { subDays, addDays } from "date-fns";

import { Tag } from "@modules/tag/entities/tag.entity";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { UserEntity } from "@/core/user/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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

  async getUserStatistic(userId: number) {
    const tagCount = await this.tagRepository.countBy({
      user: { id: userId },
    });
    const memoCount = await this.articleRepository.countBy({
      user: { id: userId },
      deleteTime: IsNull(),
    });
    const userEntity = await this.userRepository.findOneBy({ id: userId });
    if (!userEntity) throw new NotFoundException("用户不存在");
    // 用户注册时间-当前时间
    const day = daysPassedSince(new Date(userEntity.createTime));
    return {
      tagCount,
      memoCount,
      day: day > 0 ? day : 1,
    };
  }

  /** 返回最近 12 周的热力图数据：{ 'yyyy-MM-dd': 文章数 } */
  async getGirdWithDate(userId: number) {
    const DateRange = (date: Date) =>
      Between(subDays(date, 78), addDays(date, 5));
    // 时间在区间范围内的文章数量

    const statisticList = await this.articleRepository
      .createQueryBuilder("article")
      .select("article.createTime", "createTime")
      .addSelect("count(article.id)", "count")
      .where({
        createTime: DateRange(new Date()),
        user: { id: userId },
        deleteTime: IsNull(),
      })
      .groupBy("DATE(article.createTime)")
      .getRawMany<{ createTime: string; count: string }>();

    const grid: Record<string, number> = {};
    for (const item of statisticList) {
      grid[formatDate(item.createTime)] = Number(item.count);
    }
    return grid;
  }
}
