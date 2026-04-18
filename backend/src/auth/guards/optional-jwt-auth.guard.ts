import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Attempt authentication but don't fail if it doesn't succeed
    try {
      await super.canActivate(context);
    } catch {
      // Ignore authentication errors - this is optional auth
    }
    return true;
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser | null {
    // Don't throw on errors - just return null for unauthenticated requests
    if (err || !user) {
      return null;
    }
    return user;
  }
}
