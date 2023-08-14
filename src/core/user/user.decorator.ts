import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // if route is protected, there is a user set in auth.middleware
    if (request.user) {
      return data ? request.user[data] : request.user;
    }
  },
);
