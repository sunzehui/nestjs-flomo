import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123',
    });
  }

  async validate(payload: any) {
    return true;
    // const existUser = this.userService.findOne(payload.sub);

    // if (!existUser) {
    //   throw new UnauthorizedException();
    // }

    // return { ...payload, id: payload.sub };
  }
}
