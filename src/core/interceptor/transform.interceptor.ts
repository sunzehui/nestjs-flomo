import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(
    TransformInterceptor.name,
  ) as unknown as PinoLogger;

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          message: '请求成功',
        };
      }),
    );
  }
}
