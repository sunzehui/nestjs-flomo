import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "@/core/auth/guards/jwt-auth.guard";
import { User } from "@/core/user/user.decorator";
import { StatisticService } from "@modules/statistic/statistic.service";
import { UpdateUserDto } from "@/core/user/dto/update-user.dto";
import { ChangePasswordDto } from "@/core/user/dto/change-password.dto";

@Controller("user")
export class UserController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly userService: UserService,
  ) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async me(@User("id") userId: number) {
    const userInfo = await this.userService.findUser(userId);
    const dailyGrid = await this.statisticService.getGirdWithDate(userId);
    const userRecord = await this.statisticService.getUserStatistic(userId);
    return {
      userInfo,
      userRecord: {
        ...userRecord,
        dailyGrid,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  async updateProfile(
    @User("id") userId: number,
    @Body() userDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("password")
  async changePassword(
    @User("id") userId: number,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
  }
}
