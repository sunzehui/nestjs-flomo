import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserEntity } from "./entities/user.entity";

export const User = createParamDecorator(
  (query: keyof UserEntity, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user?.[query];
  },
);
