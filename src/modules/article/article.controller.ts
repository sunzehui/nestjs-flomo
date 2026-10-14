import { User } from "@/core/user/user.decorator";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
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
  Query,
} from "@nestjs/common";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { BatchTagDto } from "./dto/batch-tag.dto";
import { FindArticleQuery } from "./dto/find-article.dto.js";

@Controller("article")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @User("id") userId: number,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    try {
      const createdArticle = await this.articleService.create(
        userId,
        createArticleDto,
      );

      return await this.articleService.findOneWithFilesFormat(
        createdArticle.id,
        userId,
      );
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUserArticle(
    @User("id") user: number,
    @Query() findQuery: FindArticleQuery,
  ) {
    return await this.articleService.findAll(user, findQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/restore")
  async restore(@Param("id") id: string, @User("id") userId: number) {
    return await this.articleService.restore(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("batch/tag")
  async batchTag(@User("id") userId: number, @Body() body: BatchTagDto) {
    return await this.articleService.batchTag(userId, body.ids, {
      add: body.add,
      remove: body.remove,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @User("id") userId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    await this.articleService.update(id, userId, updateArticleDto);
    return await this.articleService.findOneWithFilesFormat(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @User("id") userId: number) {
    try {
      return await this.articleService.remove(id, userId);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
