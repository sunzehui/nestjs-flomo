import { User } from './../user/user.decorator';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './pojo/create-tag.dto';
import { UpdateTagDto } from './pojo/update-tag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTagDto: CreateTagDto, @User('id') userId) {
    return this.tagService.create(createTagDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User('id') userId) {
    return this.tagService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
