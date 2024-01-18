import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const token = context.switchToWs().getClient().handshake.auth.token; // token saved as `Bearer ${token}`
    try {
      const payload = await this.authService.checkTokenValidity(
        token,
        process.env.APP_SECRET,
      );
      const user = await this.userService.getUser(payload.id);
      // context.switchToWs().getData().user = user; // save user info to a user object.
      return true;
    } catch (ex) {
      throw new WsException(ex.message);
    }
  }
}
