import { ArticleStatisticService } from './../article-statistic/article-statistic.service';
import { Article } from './entities/article.entity';
import { User } from '@user/user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
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
  BadRequestException,
  Req,
  Inject,
  forwardRef,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,

    private readonly articleStatisticService: ArticleStatisticService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@User('id') userId, @Body() createArticleDto: CreateArticleDto) {
    try {
      const { id: articleId } = await this.articleService.create(
        userId,
        createArticleDto,
      );
      if (!articleId) {
        return null;
      }
      this.articleStatisticService.gridPush(userId, articleId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUserArticle(
    @User('id') user,
    @Query('tag') tag: string,
    @Query('inTrash') inTrash: boolean,
  ) {
    return await this.articleService.findAll(user, {
      tag,
      inTrash,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.articleService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
