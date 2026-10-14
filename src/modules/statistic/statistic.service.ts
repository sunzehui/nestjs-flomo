import { Between, IsNull, Repository } from "typeorm";
import { subDays, addDays } from "date-fns";

import { Tag } from "@modules/tag/entities/tag.entity";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { UserEntity } from "@/core/user/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { daysPassedSince, formatDate } from "@utils/date";

export interface WeeklyTrendItem {
  week: string;
  label: string;
  count: number;
}

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

  /** 返回最近 days 天的热力图数据：{ 'yyyy-MM-dd': 文章数 } */
  async getGirdWithDate(userId: number, days = 84) {
    const DateRange = (date: Date) =>
      Between(subDays(date, days - 6), addDays(date, 5));
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

  /**
   * 连续记录天数：从今天（或昨天）往前数，连续有 memo 的天数。
   * 今天还没写不算断签，所以允许从昨天起算。
   */
  private calcStreak(grid: Record<string, number>) {
    let streak = 0;
    const cursor = new Date();
    if (!grid[cursor.toISOString().slice(0, 10)]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (!grid[key]) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  /** 最近 N 周的记录趋势 */
  async getWeeklyTrend(userId: number, weeks = 12): Promise<WeeklyTrendItem[]> {
    const size = Math.min(52, Math.max(1, weeks));
    const since = subDays(new Date(), size * 7).toISOString().slice(0, 10);

    const rows: Array<{ week: string; count: number }> =
      await this.articleRepository.query(
        `SELECT strftime('%Y-%W', article.createTime) AS week, COUNT(*) AS count
         FROM article
         WHERE article.userId = ? AND article.deleteTime IS NULL
           AND date(article.createTime) >= date(?)
         GROUP BY week
         ORDER BY week ASC`,
        [userId, since],
      );

    return rows.map((row) => ({
      week: row.week,
      label: `W${String(row.week).split("-")[1] ?? row.week}`,
      count: Number(row.count),
    }));
  }

  /** 标签使用分布（按命中 memo 数倒序） */
  async getTagDistribution(userId: number, topN = 10) {
    const limit = Math.min(50, Math.max(1, topN));
    const rows: Array<{ content: string; count: number }> =
      await this.articleRepository.query(
        `SELECT tag.content AS content, COUNT(DISTINCT article.id) AS count
         FROM article
         INNER JOIN article_tag atg ON atg.article = article.id
         INNER JOIN tag ON tag.id = atg.tag
         WHERE article.userId = ? AND article.deleteTime IS NULL AND tag.userId = ?
         GROUP BY tag.content
         ORDER BY count DESC, tag.content ASC
         LIMIT ?`,
        [userId, userId, limit],
      );

    return rows.map((row) => ({
      content: row.content,
      count: Number(row.count),
    }));
  }

  /** 洞察面板聚合数据 */
  async getOverview(userId: number) {
    const base = await this.getUserStatistic(userId);
    const grid = await this.getGirdWithDate(userId);
    const [weeklyTrend, tagDistribution] = await Promise.all([
      this.getWeeklyTrend(userId, 12),
      this.getTagDistribution(userId, 10),
    ]);

    return {
      ...base,
      streak: this.calcStreak(grid),
      activeDays: Object.keys(grid).length,
      weeklyTrend,
      tagDistribution,
    };
  }
}
