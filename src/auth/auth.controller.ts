import { AuthService } from './auth.service';

import { Controller, Get, Post, Body } from '@nestjs/common';
import { LoginUserDto } from '@user/dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
