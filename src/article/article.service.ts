// import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { In, Repository } from 'typeorm';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Tag } from 'src/tag/entities/tag.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}
  async create(userId: string, createArticleDto: CreateArticleDto) {
    const articleDO = {
      title: createArticleDto.title,
      content: createArticleDto.content,
      createTime: new Date().toString(),
      updateTime: new Date().toString(),
      user: { id: userId },
      tags: [],
    };
    const article = this.repository.create(articleDO);

    if (!_.isEmpty(createArticleDto.tags)) {
      // 文章所属tag，存在则保留，不存在即添加
      const existTags = await this.findExistTags(createArticleDto.tags);
      // 将所有tag重新添加回来
      existTags.forEach((tag) => {
        tag.deleteTime = null;
      });
      const recivedTags = createArticleDto.tags.map((content) => ({
        content,
        user: { id: userId },
      }));
      const beInsertTags = _.xorBy(recivedTags, existTags, 'content');
      // 将需要添加到数据库的tag添加到article的tags中

      const beInsertTagEntities = beInsertTags.map((tag) =>
        this.tagRepo.create(tag),
      );
      article.tags = _.uniqBy(
        _.concat(beInsertTagEntities, existTags),
        'content',
      );
    }

    return await this.repository.save(article);
  }

  findAll(user: string, inTrash = false) {
    return this.repository.find({
      where: { user: { id: user } },
      relations: ['user', 'tags'],
      withDeleted: inTrash,
    });
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id }, relations: ['tags'] });
  }
  // 物理存在，包括软删除
  findExistTags(tags: String[]) {
    return this.tagRepo.find({
      where: { content: In(tags) },
      withDeleted: true,
    });
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const tags = await this.tagInsert(updateArticleDto.tags);
    const articleDO: Partial<Article> = {
      id: id,
      title: updateArticleDto.title,
      content: updateArticleDto.content,
      updateTime: new Date().toString(),
      tags,
    };
    return await this.repository.save(articleDO);
  }

  async findOrCreate(tag: string) {
    let tagEntity = await this.tagRepo.findOne({
      where: { content: tag },
    });
    // 不存在创建，存在返回
    if (!tagEntity) {
      tagEntity = await this.tagRepo.save({ content: tag });
    }
    return tagEntity;
  }

  async tagInsert(tags: string[]) {
    const tagEntities = [];
    for (const tag of tags) {
      // 查找标签是否存在，最终必返回标签实体
      const tagEntity = await this.findOrCreate(tag);
      await this.repository.save(tagEntity);
      tagEntities.push(tagEntity);
    }
    return tagEntities;
  }

  async remove(id: string) {
    const article = await this.repository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (_.isEmpty(article)) {
      throw new UnprocessableEntityException('文章不存在！');
    }
    return this.repository.softRemove(article);
  }
}
