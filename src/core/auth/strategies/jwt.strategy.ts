import { UserStatusDTO } from "@/core/user/dto/user-status.dto";
import { UserService } from "@/core/user/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    // 不再回退到 'flomo' 这类可猜密钥
    if (!secret) {
      throw new Error("缺少环境变量 JWT_SECRET，请在 .env 中配置后重新启动服务");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: UserStatusDTO) {
    const id = payload.id;
    const user = await this.userService.findUser(id);
    // 用户已被删除时直接判定为未授权
    if (!user) {
      throw new UnauthorizedException("登录状态已失效，请重新登录");
    }
    return user;
  }
}
