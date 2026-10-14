import {
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  Like,
  Not,
  Repository,
} from "typeorm";
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
import { FindArticleQuery } from "./dto/find-article.dto.js";
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
   * 查询文章列表。
   * 注意：user 过滤是必选的，历史上该参数缺省会导致返回全库数据。
   */
  async findAll(user: number, _query?: Partial<FindArticleQuery>) {
    const query: FindOptionsWhere<ArticleEntity> = {
      user: { id: user },
      deleteTime: _query?.deleted ? Not(IsNull()) : IsNull(),
    };
    if (_query?.tag) query.tags = { content: _query.tag, user: { id: user } };
    if (_query?.content) query.content = Like(`%${_query.content}%`);

    const articleList = await this.repository.find({
      where: query,
      order: { updateTime: "DESC" },
      relations: ["user", "tags", "files"],
      withDeleted: true,
    });

    return articleList.map((article) => this.resolveFilePath(article));
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

  @Cron(CronExpression.EVERY_DAY_AT_4AM) // 每天半夜4点执行一次
  async deleteExpiredMemos() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.repository.delete({
      deleteTime: LessThan(thirtyDaysAgo),
    });
  }
}
