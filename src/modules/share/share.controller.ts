import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ShareService } from "./share.service";
import { FindArticleQuery } from "@modules/article/dto/find-article.dto";
import { CreateSelectionDto } from "./dto/create-selection.dto";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { User } from "@/core/user/user.decorator";
import { SkipTransform } from "@/core/interceptor/skip-transform.decorator";
import { parseId } from "@utils/id";

@ApiTags("分享")
@Controller("share")
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get("/user")
  async findUserShared(
    @Query("user_id") userId: string,
    @Query() query: FindArticleQuery,
  ) {
    try {
      return await this.shareService.findUserShared(parseId(userId), query);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }

  /** RSS 输出（公开，返回原始 XML，跳过统一响应包装） */
  @SkipTransform()
  @Header("Content-Type", "application/rss+xml; charset=utf-8")
  @Get("/feed/:userId.xml")
  async feed(@Param("userId") userId: string) {
    return await this.shareService.buildFeed(parseId(userId));
  }

  /** 创建精选分享 */
  @UseGuards(JwtAuthGuard)
  @Post("/selection")
  async createSelection(
    @User("id") userId: number,
    @Body() body: CreateSelectionDto,
  ) {
    return await this.shareService.createSelection(userId, body);
  }

  /** 读取精选分享（公开） */
  @Get("/selection/:token")
  async getSelection(@Param("token") token: string) {
    return await this.shareService.getSelection(token);
  }

  /** 撤销精选分享 */
  @UseGuards(JwtAuthGuard)
  @Delete("/selection/:token")
  async revokeSelection(
    @User("id") userId: number,
    @Param("token") token: string,
  ) {
    return await this.shareService.revokeSelection(userId, token);
  }
}
