import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";

import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpCode,
} from "@nestjs/common";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() request: Request) {
    // LocalAuthGuard 已保证走到这里时 request.user 必然存在
    const isLogin = await this.authService.login(request.user!);
    await this.authService.recordLogin(request.user!);
    return isLogin;
  }
}
