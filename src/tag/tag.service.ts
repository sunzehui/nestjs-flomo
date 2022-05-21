import { ArticleService } from './../article/article.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from './pojo/create-tag.dto';
import { UpdateTagDto } from './pojo/update-tag.dto';
import { Tag } from './entities/tag.entity';
import * as _ from 'lodash';
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
  ) {}
  create(createTagDto: CreateTagDto) {
    return this.repository.create(createTagDto);
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
    if (!tagEntity) {
      tagEntity = await this.repository.save({ content: tag });
    }
    return tagEntity;
  }

  async insert(tags: string[]) {
    const tagEntities = [];
    for (const tag of tags) {
      const tagEntity = await this.findOrCreate(tag);
      await this.repository.save(tagEntity);
      tagEntities.push(tagEntity);
    }
    return tagEntities;
  }

  findExistTags(tags: String[]) {
    return this.repository.find({
      where: { content: In(tags) },
    });
  }

  findAll() {
    const user_id = 1;
    // 去查该用户下的标签
    return this.repository.find();
  }
  upsert(article, tagEntity: Tag[]) {
    return this.repository.upsert({ ...tagEntity, articles: [article] }, [
      'id',
    ]);
  }
  findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.repository.update({ id }, updateTagDto);
  }

  remove(id: number) {
    return this.repository.delete({ id });
  }
}
