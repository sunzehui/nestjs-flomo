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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    try {
      return this.authService.login(req.user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  me(@Req() req: Request) {
    return req.user;
  }
}
