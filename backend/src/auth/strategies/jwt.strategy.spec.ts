import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  const mockAuthService = {
    findUserById: jest.fn(),
    isTokenInvalidated: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer test-token',
      },
    };

    const mockPayload = {
      sub: 'user-id',
      email: 'test@example.com',
      role: 'USER',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate and return user for valid token', async () => {
      mockAuthService.isTokenInvalidated.mockReturnValue(false);
      mockAuthService.findUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockRequest, mockPayload);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.isTokenInvalidated).toHaveBeenCalledWith(
        'test-token',
      );
      expect(mockAuthService.findUserById).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException for invalidated token', async () => {
      mockAuthService.isTokenInvalidated.mockReturnValue(true);

      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        'Token has been invalidated',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthService.isTokenInvalidated.mockReturnValue(false);
      mockAuthService.findUserById.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle request without token', async () => {
      const requestWithoutToken = {
        headers: {},
      };

      mockAuthService.isTokenInvalidated.mockReturnValue(false);
      mockAuthService.findUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(requestWithoutToken, mockPayload);

      expect(result).toEqual(mockUser);
    });
  });
});
