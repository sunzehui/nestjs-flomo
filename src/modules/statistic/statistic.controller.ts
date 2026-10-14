import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StatisticService } from "./statistic.service";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { User } from "@/core/user/user.decorator";

@ApiTags("统计")
@Controller("statistic")
@UseGuards(JwtAuthGuard)
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  /** 前端 api/user.ts 中的 ApiUserStatistic 对应此接口 */
  @Get("grid")
  async grid(@User("id") userId: number) {
    return await this.statisticService.getGirdWithDate(userId);
  }
}
