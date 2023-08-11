import { ArticleEntity } from '../article/entities/article.entity';
import { UserService } from '@/core/user/user.service';
import {
  Injectable,
  NotAcceptableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './pojo/create-tag.dto';
import { UpdateTagDto } from './pojo/update-tag.dto';
import { Tag } from './entities/tag.entity';
import * as _ from 'lodash';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    private userService: UserService,
  ) {}

  rawCreate(createTagDto: CreateTagDto) {
    return this.repository.create(createTagDto);
  }

  async create(createTagDto: CreateTagDto, userId: string) {
    const user = await this.userService.findUser(userId);
    return this.repository.create({ ...createTagDto, user });
  }

  // 整理出加入文章表关联的格式
  async createTags(tagDto: CreateTagDto[] | CreateTagDto[][]) {
    const tagDtoArray = tagDto.flat(2);
    const tagsDO = _.map(tagDtoArray, (tag) => _.omit(tag, 'id'));
    const tagEntities = tagsDO.map((tagDO) => this.repository.create(tagDO));
    await this.repository.save(tagEntities);
    return tagEntities;
  }

  async findOrCreate(tag: string) {
    let tagEntity = await this.repository.findOne({
      where: { content: tag },
    });
    // 不存在创建，存在返回
    if (!tagEntity) {
      tagEntity = await this.repository.save({ content: tag });
    }
    return tagEntity;
  }

  async insert(tags: string[]) {
    const tagEntities = [];
    for (const tag of tags) {
      // 查找标签是否存在，最终必返回标签实体
      const tagEntity = await this.findOrCreate(tag);
      await this.repository.save(tagEntity);
      tagEntities.push(tagEntity);
    }
    return tagEntities;
  }

  async findAll(userId: string) {
    // 去查该用户下的标签
    const q = this.repository
      .createQueryBuilder('tag')
      .where('article.userId = :userId', { userId })
      .andWhere('tag.deleteTime IS NULL')
      .andWhere('article.deleteTime IS NULL')
      .leftJoinAndSelect('tag.articles', 'article')
      .getMany();
    return await q;
  }

  upsert(article, tagEntity: Tag[]) {
    return this.repository.upsert({ ...tagEntity, articles: [article] }, [
      'id',
    ]);
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(content: string, updateTagDto: UpdateTagDto) {
    const updateStatus = await this.repository.update(
      { content },
      updateTagDto,
    );
    if (updateStatus.affected === 0) {
      throw new NotAcceptableException('更新失败');
    }
    return {
      code: 0,
    };
  }

  async remove(id: string) {
    const tag = await this.repository.findOneBy({ id });
    if (_.isEmpty(tag)) {
      throw new UnprocessableEntityException('标签不存在！');
    }
    return this.repository.softRemove(tag);
  }
}
