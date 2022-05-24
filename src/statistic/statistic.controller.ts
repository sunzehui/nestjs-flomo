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
import { StatisticService } from './statistic.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { User } from '@user/user.decorator';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStatisticDto: CreateStatisticDto) {
    const { userId, articleId } = createStatisticDto;
    // return this.statisticService.gridPush(userId, articleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User('id') userId: string) {
    return await this.statisticService.findAll(userId);
  }

  @Get('grid')
  async findOne(@User('id') userId: string) {
    return await this.statisticService.gird(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStatisticDto: UpdateStatisticDto,
  ) {
    return this.statisticService.update(+id, updateStatisticDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statisticService.remove(+id);
  }
}
