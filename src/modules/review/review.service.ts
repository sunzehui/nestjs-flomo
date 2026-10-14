import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { ArticleService } from "@modules/article/article.service";
import { parseId } from "@utils/id";
import { ReviewLog } from "./entities/review-log.entity";

const DEFAULT_REVIEW_COUNT = 6;
const MAX_REVIEW_COUNT = 20;

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(ReviewLog)
    private readonly logRepo: Repository<ReviewLog>,
    private readonly articleService: ArticleService,
  ) {}

  /** 今天（服务器时区）的 yyyy-MM-dd */
  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * 抽取今日回顾的 memo。
   * 随机抽取当前用户未删除、且今天尚未回顾过的内容。
   */
  async getDaily(userId: number, count?: number) {
    const reviewDate = this.today();
    const size = Math.min(
      MAX_REVIEW_COUNT,
      Math.max(1, Number(count) || DEFAULT_REVIEW_COUNT),
    );

    const reviewed = await this.logRepo.find({
      where: { userId, reviewDate },
      select: ["articleId"],
    });
    const excludeIds = reviewed.map((log) => Number(log.articleId));

    const qb = this.articleRepo
      .createQueryBuilder("article")
      .select("article.id", "id")
      .where("article.userId = :userId", { userId })
      .andWhere("article.deleteTime IS NULL");
    if (excludeIds.length > 0) {
      qb.andWhere("article.id NOT IN (:...excludeIds)", { excludeIds });
    }

    const rows = await qb
      .orderBy("RANDOM()")
      .limit(size)
      .getRawMany<{ id: number }>();

    const ids = rows.map((row) => Number(row.id));
    if (ids.length === 0) return [];

    const articles = await this.articleRepo.find({
      where: { id: In(ids) },
      relations: ["tags", "files", "user"],
      withDeleted: false,
    });

    // 保持随机顺序
    const map = new Map(articles.map((article) => [Number(article.id), article]));
    return ids
      .map((id) => map.get(id))
      .filter((article): article is ArticleEntity => Boolean(article))
      .map((article) => this.articleService.resolveFilePath(article));
  }

  /** 记录「今日回顾已完成」，同一天同一篇只记一次 */
  async markReviewed(userId: number, articleIds: Array<string | number>) {
    const reviewDate = this.today();
    const values = Array.from(
      new Set(articleIds.map((id) => parseId(id))),
    ).map((articleId) => ({ userId, articleId, reviewDate }));

    if (values.length === 0) return { affected: 0 };

    await this.logRepo
      .createQueryBuilder()
      .insert()
      .into(ReviewLog)
      .values(values)
      .orIgnore()
      .execute();

    return { affected: values.length };
  }

  /** 最近的回顾历史 */
  async getHistory(userId: number, limit = 30) {
    return await this.logRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: Math.min(200, Math.max(1, limit)),
    });
  }
}
