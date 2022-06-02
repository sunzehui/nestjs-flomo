import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserStatusDTO } from './../user/dto/user-status.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';

import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user: UserStatusDTO;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    const isLogin = await this.authService.login(req.user);
    if (isLogin.token) {
      await this.authService.recordLogin(req.user);
    }
    return isLogin;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  me(@Req() req: Request) {
    return req.user;
  }
}
