import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserDto } from '../dto/auth-user.dto';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUserDto | undefined,
    ctx: ExecutionContext,
  ): AuthUserDto | AuthUserDto[keyof AuthUserDto] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUserDto }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
