import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { User } from "@/core/user/user.decorator";
import { DataService } from "./data.service";

@ApiTags("数据导入导出")
@Controller("data")
@UseGuards(JwtAuthGuard)
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get("export")
  async export(
    @User("id") userId: number,
    @Query("format") format?: string,
  ) {
    return await this.dataService.export(
      userId,
      format === "md" ? "md" : "json",
    );
  }

  @Post("import")
  async import(@User("id") userId: number, @Body() body: unknown) {
    return await this.dataService.import(userId, body as never);
  }
}
