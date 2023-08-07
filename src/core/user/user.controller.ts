import {
  Controller,
  Get,
  Post,
  Body, UseGuards, Req, Put
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { Request } from "express";
import { User } from "@/core/user/user.decorator";
import { StatisticService } from "@modules/statistic/statistic.service";
import { UpdateUserDto } from "@/core/user/dto/update-user.dto";

@Controller("user")
export class UserController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly userService: UserService) {

  }

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @Get("hello")
  hello(@Body() createUserDto: CreateUserDto) {
    return "hello";
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async me(@User("id") userId: string) {
    const userInfo = await this.userService.findUser(userId);
    const dailyGrid = await this.statisticService.getGirdWithDate(userId);
    const userRecord = await this.statisticService.getUserStatistic(userId);
    return {
      userInfo, userRecord: {
        ...userRecord, dailyGrid
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@User('id') userId,@Body() userDto:UpdateUserDto){
    return await this.userService.updateUser(userId,userDto)
  }
}
