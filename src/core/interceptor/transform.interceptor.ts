import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Logger } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { SKIP_TRANSFORM_KEY } from "./skip-transform.decorator";
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    // RSS 等接口需要原样返回文本，跳过统一包装
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle();

    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          message: "请求成功",
        };
      }),
    );
  }
}
