import {
  Injectable,
  NotAcceptableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { CreateTagDto } from "./pojo/create-tag.dto";
import { UpdateTagDto } from "./pojo/update-tag.dto";
import { Tag } from "./entities/tag.entity";
import { parseId } from "@utils/id";
import { uniqByContent } from "@utils/collection";

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
  ) {}

  /** 创建标签；若该用户下已存在（含软删除）则复用/恢复 */
  async create(createTagDto: CreateTagDto, userId: number) {
    const exist = await this.repository.findOne({
      where: { content: createTagDto.content, user: { id: userId } },
      withDeleted: true,
    });
    if (exist) {
      if (exist.deleteTime) await this.repository.restore(parseId(exist.id));
      return await this.repository.findOneBy({ id: parseId(exist.id) });
    }
    return await this.repository.save(
      this.repository.create({ ...createTagDto, user: { id: userId } }),
    );
  }

  /** 按用户维度查找或创建标签 */
  async findOrCreate(content: string, userId: number) {
    let tagEntity = await this.repository.findOne({
      where: { content, user: { id: userId } },
      withDeleted: true,
    });
    if (!tagEntity) {
      tagEntity = await this.repository.save(
        this.repository.create({ content, user: { id: userId } }),
      );
    }
    return tagEntity;
  }

  async insert(tags: string[], userId: number) {
    const tagEntities: Tag[] = [];
    for (const tag of tags) {
      tagEntities.push(await this.findOrCreate(tag, userId));
    }
    return uniqByContent(tagEntities);
  }

  /** 只返回当前用户自己的标签（@DeleteDateColumn 已自动过滤软删除） */
  findAll(userId: number) {
    return this.repository.find({
      where: { user: { id: userId } },
      order: { content: "ASC" },
    });
  }

  async findOne(id: string | number, userId: number) {
    const tag = await this.repository.findOne({
      where: { id: parseId(id), user: { id: userId } },
    });
    if (!tag) {
      throw new UnprocessableEntityException("标签不存在！");
    }
    return tag;
  }

  async update(
    userId: number,
    oldContent: string,
    updateTagDto: UpdateTagDto,
  ) {
    // 必须限定在当前用户名下，避免跨用户改名/置顶
    const tag = await this.repository.findOne({
      where: { content: oldContent, user: { id: userId } },
    });
    if (!tag) {
      throw new UnprocessableEntityException("标签不存在！");
    }

    try {
      const payload: UpdateTagDto = { ...updateTagDto };
      // parentId 需要额外校验：不能指向自己，父标签必须属于同一用户
      if (payload.parentId !== undefined && payload.parentId !== null) {
        const parentId = parseId(payload.parentId);
        if (parentId === Number(tag.id)) {
          throw new NotAcceptableException("不能把标签设为自己的子标签");
        }
        const parent = await this.repository.findOne({
          where: { id: parentId, user: { id: userId } },
        });
        if (!parent) {
          throw new NotAcceptableException("父标签不存在");
        }
        payload.parentId = parentId;
      }

      const updateStatus = await this.repository.update(
        { id: tag.id },
        payload,
      );
      if (updateStatus.affected === 0) {
        throw new NotAcceptableException("更新失败");
      }
    } catch (error) {
      // 同用户下已存在同名标签时，唯一索引会报错
      if (error instanceof QueryFailedError) {
        throw new NotAcceptableException("同名标签已存在");
      }
      throw error;
    }

    return { code: 0 };
  }

  async remove(id: string | number, userId: number) {
    const tag = await this.findOne(id, userId);
    return this.repository.softRemove(tag);
  }
}
