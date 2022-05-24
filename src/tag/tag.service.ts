import { UserService } from './../user/user.service';
import { ArticleService } from './../article/article.service';
import {
  Inject,
  Injectable,
  NotAcceptableException,
  UnprocessableEntityException,
} from '@nestjs/common';
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

  // 物理存在，包括软删除
  findExistTags(tags: String[]) {
    return this.repository.find({
      where: { content: In(tags) },
      withDeleted: true,
    });
  }

  async findAll(userId: string) {
    // 去查该用户下的标签
    const q = this.repository
      .createQueryBuilder('tag')
      .where('user.id = :userId', { userId })
      .leftJoinAndSelect('tag.user', 'user');
    return await q.execute();

    // SELECT `tag`.`id` AS `tag_id`, `tag`.`content` AS `tag_content`, `tag`.`is_topics` AS `tag_is_topics`, `tag`.`deleteTime` AS `tag_deleteTime`, `tag`.`userId` AS `tag_userId`, `tag`.`userUsername` AS `tag_userUsername`, `user`.`id` AS `user_id`, `user`.`username` AS `user_username`, `user`.`password` AS `user_password`, `user`.`memo_count` AS `user_memo_count`, `user`.`day_count` AS `user_day_count`, `user`.`tag_count` AS `user_tag_count`, `user`.`month_sign_id` AS `user_month_sign_id`, `user`.`last_login` AS `user_last_login` FROM `tag` `tag` LEFT JOIN `user` `user` ON `user`.`id`=`tag`.`userId` AND `user`.`username`=`tag`.`userUsername` WHERE ( `user`.`id` = ? ) AND ( `tag`.`deleteTime` IS NULL )
  }
  upsert(article, tagEntity: Tag[]) {
    return this.repository.upsert({ ...tagEntity, articles: [article] }, [
      'id',
    ]);
  }
  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const updateStatus = await this.repository.update({ id }, updateTagDto);
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
