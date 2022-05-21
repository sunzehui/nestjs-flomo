import { UserStatusDTO } from './../user/dto/user-status.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '@user/dto/login-user.dto';
import { UserService } from '@user/user.service';
import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<UserStatusDTO> {
    const username = loginUserDto.username;
    const password = loginUserDto.password;
    if (_.isEmpty(username) || _.isEmpty(password)) {
      throw new BadRequestException('user is required!');
    }
    const user = await this.userService.findLoginUser(username);
    if (_.isEmpty(user)) {
      throw new BadRequestException('user not found!');
    }
    const isValidPwd = await bcrypt.compare(password, user.password);
    if (!isValidPwd) {
      throw new BadRequestException('password is not valid!');
    }
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      memo_count: user.memo_count,
      day_count: user.day_count,
      tag_count: user.tag_count,
      month_sign_id: user.month_sign_id,
      last_login: user.last_login,
    };
    return sanitizedUser;
  }

  async login(userInfo: UserStatusDTO) {
    const token = this.createToken(userInfo);

    return {
      userInfo,
      ...token,
    };
  }
  createToken({ username, id }: UserStatusDTO) {
    const token = this.jwtService.sign({ username, id });
    const expires = process.env.expiresTime;

    return {
      token,
      expires,
    };
  }
}
