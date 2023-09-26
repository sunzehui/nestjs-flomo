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
import { FindArticleQuery } from "./dto/find-article.dto.js";

@Controller("article")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@User("id") userId, @Body() createArticleDto: CreateArticleDto) {
    try {
      const createdArticle = await this.articleService.create(
        userId,
        createArticleDto,
      );

      return await this.articleService.findOneWithFilesFormat(createdArticle.id)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUserArticle(
    @User("id") user,
    @Query() findQuery: Record<keyof FindArticleQuery, string>,
  ) {
    return await this.articleService.findAll(user, {
      ...findQuery,
      deleted: findQuery.deleted === "true",
    });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateArticleDto: UpdateArticleDto) {
    await this.articleService.update(id, updateArticleDto);
    return await this.articleService.findOneWithFilesFormat(id)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      return await this.articleService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
