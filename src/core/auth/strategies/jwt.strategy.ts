import { UserStatusDTO } from "@/core/user/dto/user-status.dto.js";
import { UserService } from "@/core/user/user.service";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "flomo",
    });
  }

  async validate(payload: UserStatusDTO) {
    const id = payload.id;
    return await this.userService.findUser(id);
  }
}
