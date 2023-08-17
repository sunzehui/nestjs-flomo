import { UserStatusDTO } from "../user/dto/user-status.dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "../user/dto/login-user.dto";
import { UserService } from "../user/user.service";
import * as _ from "lodash";
import * as bcrypt from "bcryptjs";

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
      throw new UnauthorizedException("用户名或密码不能为空");
    }
    const user = await this.userService.findLoginUser(username);
    if (user === null) {
      throw new UnauthorizedException("用户不存在");
    }
    const isValidPwd = await bcrypt.compare(password, user.password);
    if (!isValidPwd) {
      throw new UnauthorizedException("账号或密码错误");
    }
    return {
      id: user.id,
      username: user.username,
    };
  }

  async login(userInfo: UserStatusDTO) {
    return this.createToken(userInfo);
  }

  createToken({ username, id }: UserStatusDTO) {
    const token = this.jwtService.sign({ username, id });
    const expires = process.env.JWT_EXPIRE;
    return {
      token,
      expires,
    };
  }

  recordLogin(userInfo: UserStatusDTO) {
    const { id } = userInfo;
    return this.userService.recordLogin(id);
  }
}
