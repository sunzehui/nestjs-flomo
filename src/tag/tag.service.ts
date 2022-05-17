import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
  ) {}
  create(createTagDto: CreateTagDto) {
    return this.repository.create(createTagDto);
  }

  findAll() {
    const user_id = 1;
    // 去查该用户下的标签
    return this.repository.find();
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
