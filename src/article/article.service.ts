// import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { UserService } from './../user/user.service';
import { TagService } from './../tag/tag.service';
import { Repository } from 'typeorm';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly tagService: TagService,
    private readonly userService: UserService,
  ) {}
  async create(userId: string, createArticleDto: CreateArticleDto) {
    const user = await this.userService.findUser(userId);
    const articleDO = {
      title: createArticleDto.title,
      content: createArticleDto.content,
      createTime: new Date().toString(),
      updateTime: new Date().toString(),
      user,
      tags: [],
    };
    const article = this.repository.create(articleDO);

    if (!_.isEmpty(createArticleDto.tags)) {
      // 文章所属tag，存在则保留，不存在即添加
      const existTags = await this.tagService.findExistTags(
        createArticleDto.tags,
      );
      // 将所有tag重新添加回来
      existTags.forEach((tag) => {
        tag.deleteTime = null;
      });
      const recivedTags = createArticleDto.tags.map((content) => ({
        content,
        user,
      }));
      const beInsertTags = _.xorBy(recivedTags, existTags, 'content');
      // 将需要添加到数据库的tag添加到article的tags中

      const beInsertTagEntities = beInsertTags.map((tag) =>
        this.tagService.rawCreate(tag),
      );
      article.tags = _.uniqBy(
        _.concat(beInsertTagEntities, existTags),
        'content',
      );
    }

    return await this.repository.save(article);
  }

  findAll(user: string) {
    return this.repository.find({
      where: { user: { id: user } },
      relations: ['user', 'tags'],
    });
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id }, relations: ['tags'] });
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const tags = await this.tagService.insert(updateArticleDto.tags);
    const articleDO: Partial<Article> = {
      id: id,
      title: updateArticleDto.title,
      content: updateArticleDto.content,
      updateTime: new Date().toString(),
      tags,
    };
    return await this.repository.save(articleDO);
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
