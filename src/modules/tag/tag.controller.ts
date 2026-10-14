import { User } from '@/core/user/user.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './pojo/create-tag.dto';
import { UpdateTagDto } from './pojo/update-tag.dto';

@Controller('tag')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @User('id') userId: number) {
    return this.tagService.create(createTagDto, userId);
  }

  @Get()
  findAll(@User('id') userId: number) {
    return this.tagService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId: number) {
    return this.tagService.findOne(id, userId);
  }

  @Patch(':content')
  update(
    @Param('content') content: string,
    @Body() updateTagDto: UpdateTagDto,
    @User('id') userId: number,
  ) {
    return this.tagService.update(userId, content, updateTagDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('id') userId: number) {
    return this.tagService.remove(id, userId);
  }
}
