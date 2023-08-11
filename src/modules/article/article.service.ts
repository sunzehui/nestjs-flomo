import { In, Repository } from 'typeorm';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Tag } from '@modules/tag/entities/tag.entity';
import { FileEntity } from '@modules/file-management/entities/file.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, createArticleDto: CreateArticleDto) {
    const articleDO = {
      content: createArticleDto.content,
      user: { id: userId },
      tags: [],
      files: createArticleDto.images.map(
        (imageId) => new FileEntity({ id: Number(imageId) }),
      ),
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

  resolveFilePath(article: ArticleEntity) {
 // 将每个article的每个file的url加上前缀
    const prefix = this.configService.get('IMG_SERVER');
    
    const images = article.files.map((file) => {
        file.filePath = `${prefix}/${file.filePath}`;
        return file;
      });
      return {
        ...article,
        images,
      }
      
}
  async findAll(
    user: string,
    _query: { inTrash: boolean; tag: string } = { inTrash: false, tag: '' },
  ) {
    const inTrash = _query.inTrash;
    const query = { user: { id: user }, tags: undefined };
    query.tags = _query.tag ? { content: _query.tag } : void 0;

    const articleList = await this.repository.find({
      where: { ...query },
      order: { updateTime: 'DESC' },
      relations: ['user', 'tags', 'files'],
      withDeleted: inTrash,
    });
   
    return articleList.map((article) => {
        return this.resolveFilePath(article); 
    });
  }

  async findOne(id: string) {
    const article = await this.repository.findOne({ where: { id }, relations: ['tags','user','files'] });
    return this.resolveFilePath(article);
  }
  

  // 物理存在，包括软删除
  findExistTags(tags: String[]) {
    return this.tagRepo.find({
      where: { content: In(tags) },
      withDeleted: true,
    });
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const articleEntity = await this.repository.findOneBy({ id });
    const tags = updateArticleDto.tags;
    const content = updateArticleDto.content;
    const is_topic = updateArticleDto.is_topic;
    if (!_.isNil(tags)) {
      articleEntity['tags'] = await this.tagInsert(updateArticleDto.tags);
    }
    if (!_.isNil(content)) {
      articleEntity['content'] = content;
    }
    if (!_.isNil(is_topic)) {
      articleEntity['is_topic'] = is_topic;
    }
    return await this.repository.save(articleEntity);
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

  /**
   *
   * @param id 文章id
   * @returns 删除成功实体
   * @description 删除文章，保留标签
   */
  async remove(id: string) {
    const article = await this.repository.findOne({
      where: { id },
    });
    if (_.isEmpty(article)) {
      throw new UnprocessableEntityException('文章不存在！');
    }
    return this.repository.softRemove(article);
  }
}
