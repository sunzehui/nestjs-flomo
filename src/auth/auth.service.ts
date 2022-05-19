import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '@user/dto/login-user.dto';
import { UserService } from '@user/user.service';
import _ from 'lodash';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<LoginUserDto> {
    const username = loginUserDto.username;
    const password = loginUserDto.password;
    if (_.isEmpty(username) || _.isEmpty(password)) {
      throw new BadRequestException('user is required!');
    }
    const user = await this.userService.findLoginUser(username);
    if (_.isEmpty(user)) {
      throw new BadRequestException('user not found!');
    }
    const isValidPwd = bcrypt.compare(user.password, password);
    if (!isValidPwd) {
      throw new BadRequestException('password is not valid!');
    }
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto);
    const token = this.createToken(user);
    return {
      user,
      ...token,
    };
  }
  createToken({ username }: LoginUserDto) {
    const token = this.jwtService.sign(username);
    const expires = process.env.expiresTime || 10000;
    return {
      token,
      expires,
    };
  }
}
