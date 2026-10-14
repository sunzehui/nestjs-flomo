import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { User } from "@/core/user/user.decorator";
import { MarkReviewDto } from "./dto/mark-review.dto";
import { ReviewService } from "./review.service";

@ApiTags("每日回顾")
@Controller("review")
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /** 抽取今日回顾的 memo 列表 */
  @Get("daily")
  async daily(@User("id") userId: number, @Query("count") count?: string) {
    return await this.reviewService.getDaily(userId, Number(count));
  }

  /** 标记本轮回顾已完成 */
  @Post("log")
  async log(@User("id") userId: number, @Body() body: MarkReviewDto) {
    return await this.reviewService.markReviewed(userId, body.articleIds);
  }

  /** 回顾历史 */
  @Get("history")
  async history(@User("id") userId: number, @Query("limit") limit?: string) {
    return await this.reviewService.getHistory(userId, Number(limit) || 30);
  }
}
