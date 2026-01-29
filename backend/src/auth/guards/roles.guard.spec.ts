import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext({ role: 'USER' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);

      const context = createMockExecutionContext({ role: 'USER' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has ADMIN role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext({ role: 'ADMIN' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext({ role: 'USER' });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);

      const context = createMockExecutionContext({ role: undefined });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['USER', 'ADMIN']);

      const context = createMockExecutionContext({ role: 'ADMIN' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle user without role property', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);

      const context = createMockExecutionContext({});
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
