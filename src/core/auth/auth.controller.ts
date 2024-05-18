import { UserStatusDTO } from "../user/dto/user-status.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";

import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Body,
} from "@nestjs/common";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() request: Request) {
    if (!request.user) return false;
    const isLogin = await this.authService.login(request.user);
    if (isLogin.token) {
      await this.authService.recordLogin(request.user);
    }
    return isLogin;
  }
}
