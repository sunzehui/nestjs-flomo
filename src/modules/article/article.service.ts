import { In, LessThan, Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { ArticleEntity } from "./entities/article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "@modules/tag/entities/tag.entity";
import { FileEntity } from "@modules/file-management/entities/file.entity";
import { ConfigService } from "@nestjs/config";
import {
  DEFAULT_PAGE_SIZE,
  FindArticleQuery,
  MAX_PAGE_SIZE,
  TagFilterMode,
} from "./dto/find-article.dto.js";
import { sanitizeHtml } from "@utils/sanitize";
import { parseId } from "@utils/id";
import { uniqByContent } from "@utils/collection";
import { isNotNil } from "@utils/type";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: number, createArticleDto: CreateArticleDto) {
    const article = this.repository.create({
      content: sanitizeHtml(createArticleDto.content),
      user: { id: userId },
      tags: [],
      files: (createArticleDto.images ?? []).map(
        (imageId) => new FileEntity({ id: Number(imageId) }),
      ),
    });

    // 文章所属 tag：存在的复用，不存在的新建
    const tagContents = createArticleDto.tags ?? [];
    if (tagContents.length > 0) {
      const existTags = await this.findExistTags(tagContents, userId);
      const attached: Tag[] = [...existTags];
      const known = new Set(existTags.map((tag) => tag.content));

      for (const content of tagContents) {
        if (known.has(content)) continue;
        known.add(content);
        attached.push(
          this.tagRepo.create({ content, user: { id: userId }, deleteTime: null }),
        );
      }

      article.tags = attached;
    }

    return await this.repository.save(article);
  }

  /** 拼接静态资源访问地址，避免出现双斜杠 */
  private resolveAssetUrl(filePath: string) {
    const prefix = (this.configService.get<string>("SERVER_URL") ?? "").replace(
      /\/+$/,
      "",
    );
    const path = filePath.replace(/^\/+/, "");
    return prefix ? `${prefix}/${path}` : `/${path}`;
  }

  resolveFilePath(article: ArticleEntity) {
    // 将每个article的每个file的url加上前缀
    const images = (article.files ?? []).map((file) => {
      file.filePath = this.resolveAssetUrl(file.filePath);
      return file;
    });
    return {
      ...article,
      images,
    };
  }

  /**
   * 查询文章列表（分页）。
   * 注意：user 过滤是必选的，历史上该参数缺省会导致返回全库数据。
   */
  async findAll(user: number, query: FindArticleQuery = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE),
    );

    // content 保持整串短语匹配（向后兼容），keywords 支持多词 AND
    const phrases = query.content?.trim() ? [query.content.trim()] : [];
    const keywords = (query.keywords ?? "")
      .split(/[\s,]+/)
      .map((word) => word.trim())
      .filter(Boolean);

    // tag 为单标签兼容字段，tags 为逗号分隔的多标签
    const tagList = Array.from(
      new Set(
        [query.tag ?? "", ...(query.tags ?? "").split(",")]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
    const tagMode: TagFilterMode = query.tagMode ?? "or";

    const qb = this.repository
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.tags", "tag")
      .leftJoinAndSelect("article.files", "file")
      .leftJoinAndSelect("article.user", "owner")
      .withDeleted()
      .where("owner.id = :userId", { userId: user });

    if (query.deleted) {
      qb.andWhere("article.deleteTime IS NOT NULL");
    } else {
      qb.andWhere("article.deleteTime IS NULL");
    }

    [...phrases, ...keywords].forEach((word, index) => {
      qb.andWhere(`article.content LIKE :kw${index}`, {
        [`kw${index}`]: `%${word}%`,
      });
    });

    if (tagList.length > 0) {
      if (tagMode === "and") {
        tagList.forEach((content, index) => {
          qb.andWhere(
            `EXISTS (
               SELECT 1 FROM article_tag at_${index}
               INNER JOIN tag tg_${index} ON tg_${index}.id = at_${index}.tag
               WHERE at_${index}.article = article.id
                 AND tg_${index}.content = :tg_${index}
                 AND tg_${index}.userId = :userId
             )`,
            { [`tg_${index}`]: content },
          );
        });
      } else {
        qb.andWhere(
          `EXISTS (
             SELECT 1 FROM article_tag at_or
             INNER JOIN tag tg_or ON tg_or.id = at_or.tag
             WHERE at_or.article = article.id
               AND tg_or.content IN (:...tagList)
               AND tg_or.userId = :userId
           )`,
          { tagList },
        );
      }
    }

    if (query.from) {
      qb.andWhere("date(article.createTime) >= date(:from)", {
        from: query.from,
      });
    }
    if (query.to) {
      qb.andWhere("date(article.createTime) <= date(:to)", { to: query.to });
    }

    if (query.hasImage) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM article_file af WHERE af.article = article.id)`,
      );
    }

    qb.orderBy("article.is_topic", "DESC")
      .addOrderBy(
        "article.updateTime",
        query.sort === "time_asc" ? "ASC" : "DESC",
      )
      .addOrderBy("article.id", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    return {
      list: list.map((article) => this.resolveFilePath(article)),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async findOne(id: string | number, userId?: number) {
    const article = await this.repository.findOne({
      where: { id: parseId(id) },
      relations: ["tags", "user", "files"],
      withDeleted: true,
    });
    if (!article) {
      throw new UnprocessableEntityException("文章不存在");
    }
    // 传入 userId 时校验归属，避免越权访问
    if (isNotNil(userId) && Number(article.user?.id) !== Number(userId)) {
      throw new ForbiddenException("无权访问该文章");
    }
    return article;
  }

  async findOneWithFilesFormat(id: string | number, userId?: number) {
    const articleEntity = await this.findOne(id, userId);
    return this.resolveFilePath(articleEntity);
  }

  // 物理存在，包括软删除
  findExistTags(tags: string[], userId: number) {
    return this.tagRepo.find({
      where: { content: In(tags), user: { id: userId } },
      withDeleted: true,
    });
  }

  async update(
    id: string | number,
    userId: number,
    updateArticleDto: UpdateArticleDto,
  ) {
    const articleEntity = await this.findOne(id, userId);

    // 恢复操作
    const isRecycle = updateArticleDto.recycle;
    if (isRecycle) {
      articleEntity.deleteTime = null;
      return await this.repository.save(articleEntity);
    }
    const tags = updateArticleDto.tags;
    const content = updateArticleDto.content;
    const is_topic = updateArticleDto.is_topic;
    const images = updateArticleDto.images;
    if (isNotNil(tags)) {
      articleEntity.tags = await this.tagInsert(tags, userId);
    }
    if (isNotNil(content)) {
      articleEntity.content = sanitizeHtml(content);
    }
    if (isNotNil(is_topic)) {
      articleEntity.is_topic = is_topic;
    }
    if (isNotNil(images)) {
      articleEntity.files = images.map(
        (imgId) => new FileEntity({ id: Number(imgId) }),
      );
    }

    return await this.repository.save(articleEntity);
  }

  async findOrCreate(tag: string, userId: number) {
    let tagEntity = await this.tagRepo.findOne({
      where: { content: tag, user: { id: userId } },
      withDeleted: true,
    });
    // 不存在创建，存在返回
    if (!tagEntity) {
      tagEntity = await this.tagRepo.save(
        this.tagRepo.create({ content: tag, user: { id: userId } }),
      );
    }
    return tagEntity;
  }

  async tagInsert(tags: string[], userId: number) {
    const tagEntities: Tag[] = [];
    for (const tag of tags) {
      // 查找标签是否存在，最终必返回标签实体
      const tagEntity = await this.findOrCreate(tag, userId);
      tagEntities.push(tagEntity);
    }
    return uniqByContent(tagEntities);
  }

  /**
   *
   * @param id 文章id
   * @returns 删除成功实体
   * @description 删除文章，保留标签
   */
  async remove(id: string | number, userId: number) {
    const article = await this.findOne(id, userId);
    return await this.repository.softRemove(article);
  }

  /** 显式从回收站恢复（语义比 PATCH { recycle: true } 更清晰） */
  async restore(id: string | number, userId: number) {
    const article = await this.findOne(id, userId);
    article.deleteTime = null;
    await this.repository.save(article);
    return await this.findOneWithFilesFormat(id, userId);
  }

  /** 批量给多条 memo 加/去标签 */
  async batchTag(
    userId: number,
    articleIds: Array<string | number>,
    payload: { add?: string[]; remove?: string[] },
  ) {
    const ids = Array.from(new Set(articleIds.map((item) => parseId(item))));
    if (ids.length === 0) {
      throw new UnprocessableEntityException("请选择要操作的 memo");
    }

    const articles = await this.repository.find({
      where: { id: In(ids), user: { id: userId } },
      relations: ["tags"],
      withDeleted: true,
    });
    // 只要有一条不属于当前用户就整体拒绝，避免越权写入
    if (articles.length !== ids.length) {
      throw new ForbiddenException("存在无权操作的 memo");
    }

    const addTags = await this.tagInsert(payload.add ?? [], userId);
    const removeNames = new Set(
      (payload.remove ?? []).map((name) => name.trim()).filter(Boolean),
    );

    for (const article of articles) {
      const kept = (article.tags ?? []).filter(
        (tag) => !removeNames.has(tag.content),
      );
      const keptNames = new Set(kept.map((tag) => tag.content));
      article.tags = [
        ...kept,
        ...addTags.filter((tag) => !keptNames.has(tag.content)),
      ];
    }

    await this.repository.save(articles);
    return { affected: articles.length };
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM) // 每天半夜4点执行一次
  async deleteExpiredMemos() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.repository.delete({
      deleteTime: LessThan(thirtyDaysAgo),
    });
  }
}
