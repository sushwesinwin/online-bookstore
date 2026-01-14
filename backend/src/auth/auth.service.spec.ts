import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fc from 'fast-check';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: online-bookstore-system, Property 1: User Registration Integrity
     * For any valid user registration data, creating an account should result in a new user record 
     * with securely hashed password and no plain text password storage.
     * Validates: Requirements 1.1, 1.5
     */
    it('should maintain user registration integrity for all valid inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 20 }),
            firstName: fc.string({ minLength: 1, maxLength: 10 }),
            lastName: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          async (userData) => {
            // Setup mocks
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Pre-hash password to avoid timeout
            const hashedPassword = await bcrypt.hash(userData.password, 12);

            mockPrismaService.user.create.mockImplementation(async (args) => {
              return {
                id: 'test-id',
                email: args.data.email,
                password: hashedPassword,
                firstName: args.data.firstName,
                lastName: args.data.lastName,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData as CreateUserDto);

            // Verify user creation was called
            expect(mockPrismaService.user.create).toHaveBeenCalled();

            // Verify password was hashed (not plain text)
            const createCall = mockPrismaService.user.create.mock.calls[0][0];
            expect(createCall.data.password).not.toBe(userData.password);
            expect(createCall.data.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern

            // Verify response doesn't contain password
            expect(result.user).not.toHaveProperty('password');
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.user.email).toBe(userData.email);
          }
        ),
        { numRuns: 20 } // Reduced runs due to bcrypt performance
      );
    }, 30000); // Increased timeout for bcrypt operations

    /**
     * Feature: online-bookstore-system, Property 2: Authentication Round Trip
     * For any registered user, successful login followed by accessing protected resources 
     * should maintain consistent user identity and permissions throughout the session.
     * Validates: Requirements 1.2, 1.4
     */
    it('should maintain authentication round trip consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 20 }),
            firstName: fc.string({ minLength: 1, maxLength: 10 }),
            lastName: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          async (userData) => {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const mockUser = {
              id: 'test-id',
              email: userData.email,
              password: hashedPassword,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock login
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('test-token');

            const loginResult = await service.login({
              email: userData.email,
              password: userData.password,
            } as LoginDto);

            // Verify login success
            expect(loginResult.user.email).toBe(userData.email);
            expect(loginResult.accessToken).toBeDefined();
            expect(loginResult.refreshToken).toBeDefined();

            // Mock findUserById for token validation
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const foundUser = await service.findUserById('test-id');

            // Verify consistent user identity
            expect(foundUser).toBeDefined();
            expect(foundUser!.email).toBe(loginResult.user.email);
            expect(foundUser!.id).toBe(loginResult.user.id);
            expect(foundUser).not.toHaveProperty('password');
          }
        ),
        { numRuns: 20 } // Reduced runs due to bcrypt performance
      );
    }, 30000); // Increased timeout for bcrypt operations

    /**
     * Feature: online-bookstore-system, Property 3: Session Lifecycle Management
     * For any authenticated user session, logout should invalidate the session 
     * such that subsequent requests with that session token are rejected.
     * Validates: Requirements 1.6
     */
    it('should maintain session lifecycle management consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 50 }),
          async (tokenId) => {
            // Setup mocks
            mockConfigService.get.mockReturnValue('test-secret');
            mockJwtService.decode.mockReturnValue({ tokenId });

            // Test logout
            const logoutResult = await service.logout(tokenId);
            expect(logoutResult.message).toBe('Successfully logged out');

            // Test that token is now invalidated
            const isInvalidated = service.isTokenInvalidated(tokenId);
            expect(isInvalidated).toBe(true);

            // Test that the same token remains invalidated on subsequent checks
            const stillInvalidated = service.isTokenInvalidated(tokenId);
            expect(stillInvalidated).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    }, 15000); // Increased timeout

    /**
     * Feature: online-bookstore-system, Property 4: Password Reset Security
     * For any user requesting password reset, the system should generate a unique, 
     * time-limited reset token and send it via email without exposing sensitive information.
     * Validates: Requirements 1.3
     */
    it('should maintain password reset security for all users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Setup mocks
            const mockUser = {
              id: 'test-id',
              email,
              password: 'hashed-password',
              firstName: 'Test',
              lastName: 'User',
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

            const result = await service.forgotPassword({ email } as ForgotPasswordDto);

            // Verify response doesn't reveal if email exists
            expect(result.message).toBe('If the email exists, a password reset link has been sent');

            // Verify email service was called with email and a token
            expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
              email,
              expect.any(String)
            );

            // Verify token is a hex string (crypto.randomBytes output)
            const callArgs = mockEmailService.sendPasswordResetEmail.mock.calls[0];
            const token = callArgs[1];
            expect(token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
          }
        ),
        { numRuns: 100 }
      );
    }, 15000); // Increased timeout
  });

  describe('Unit Tests', () => {
    describe('register', () => {
      describe('email validation', () => {
        it('should throw ConflictException when user already exists', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          };

          mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

          await expect(service.register(userData)).rejects.toThrow(ConflictException);
          await expect(service.register(userData)).rejects.toThrow('User with this email already exists');
        });

        it('should accept valid email formats during registration', async () => {
          const validEmails = [
            'user@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
            'user_name@example-domain.com',
            'user123@test.org',
          ];

          for (const email of validEmails) {
            const userData: CreateUserDto = {
              email,
              password: 'password123',
              firstName: 'Test',
              lastName: 'User',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
              id: 'new-user-id',
              email: userData.email,
              password: 'hashed-password',
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData);

            expect(result.user.email).toBe(email);
            expect(result.accessToken).toBeDefined();
          }
        });

        it('should handle various email lengths within valid range', async () => {
          const testEmails = [
            'a@b.co', // Short email
            'user@example.com', // Standard email
            'very.long.email.address.with.multiple.dots@example-domain.com', // Long email
            `${'a'.repeat(50)}@example.com`, // Long local part
          ];

          for (const email of testEmails) {
            const userData: CreateUserDto = {
              email,
              password: 'password123',
              firstName: 'Test',
              lastName: 'User',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
              id: 'new-user-id',
              email: userData.email,
              password: 'hashed-password',
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData);

            expect(result.user.email).toBe(email);
            expect(result.accessToken).toBeDefined();
          }
        });

        it('should handle email case sensitivity during registration', async () => {
          const userData: CreateUserDto = {
            email: 'Test@Example.COM',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.email).toBe('Test@Example.COM');
        });
      });

      describe('password validation', () => {
        it('should accept minimum length password (8 characters)', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'pass1234', // Exactly 8 characters
            firstName: 'Test',
            lastName: 'User',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.email).toBe(userData.email);
          expect(result.accessToken).toBeDefined();
        });

        it('should accept maximum length password (100 characters)', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'p'.repeat(100), // Exactly 100 characters
            firstName: 'Test',
            lastName: 'User',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.email).toBe(userData.email);
          expect(result.accessToken).toBeDefined();
        });

        it('should accept passwords at various lengths within valid range', async () => {
          const testPasswords = [
            'pass1234', // 8 chars (min)
            'password123', // 11 chars
            'mySecurePassword2024!', // 21 chars
            'p'.repeat(50), // 50 chars (mid-range)
            'p'.repeat(99), // 99 chars (just under max)
            'p'.repeat(100), // 100 chars (max)
          ];

          for (const password of testPasswords) {
            const userData: CreateUserDto = {
              email: `user${password.length}@example.com`,
              password,
              firstName: 'Test',
              lastName: 'User',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
              id: 'new-user-id',
              email: userData.email,
              password: 'hashed-password',
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData);

            expect(result.user.email).toBe(userData.email);
            expect(result.accessToken).toBeDefined();
            expect(password.length).toBeGreaterThanOrEqual(8);
            expect(password.length).toBeLessThanOrEqual(100);
          }
        });

        it('should hash passwords regardless of length', async () => {
          const testPasswords = ['pass1234', 'mediumPassword123', 'p'.repeat(100)];

          for (const password of testPasswords) {
            const userData: CreateUserDto = {
              email: `user${password.length}@example.com`,
              password,
              firstName: 'Test',
              lastName: 'User',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockImplementation(async (args) => {
              // Verify password is hashed
              expect(args.data.password).not.toBe(password);
              expect(args.data.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern

              return {
                id: 'new-user-id',
                email: args.data.email,
                password: args.data.password,
                firstName: args.data.firstName,
                lastName: args.data.lastName,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            });
            mockJwtService.sign.mockReturnValue('test-token');

            await service.register(userData);
          }
        });
      });

      describe('name validation', () => {
        it('should accept valid firstName and lastName', async () => {
          const validNames = [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Mary-Jane', lastName: "O'Brien" },
            { firstName: 'José', lastName: 'García' },
            { firstName: 'A', lastName: 'B' }, // Minimum length
            { firstName: 'X'.repeat(50), lastName: 'Y'.repeat(50) }, // Maximum length
          ];

          for (const names of validNames) {
            const userData: CreateUserDto = {
              email: `${names.firstName.toLowerCase()}@example.com`,
              password: 'password123',
              firstName: names.firstName,
              lastName: names.lastName,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
              id: 'new-user-id',
              email: userData.email,
              password: 'hashed-password',
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData);

            expect(result.user.firstName).toBe(names.firstName);
            expect(result.user.lastName).toBe(names.lastName);
          }
        });

        it('should accept minimum length names (1 character)', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'A',
            lastName: 'B',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.firstName).toBe('A');
          expect(result.user.lastName).toBe('B');
          expect(result.user.firstName.length).toBe(1);
          expect(result.user.lastName.length).toBe(1);
        });

        it('should accept maximum length names (50 characters)', async () => {
          const maxFirstName = 'A'.repeat(50);
          const maxLastName = 'B'.repeat(50);
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: maxFirstName,
            lastName: maxLastName,
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.firstName).toBe(maxFirstName);
          expect(result.user.lastName).toBe(maxLastName);
          expect(result.user.firstName.length).toBe(50);
          expect(result.user.lastName.length).toBe(50);
        });

        it('should accept names at various lengths within valid range', async () => {
          const testCases = [
            { firstName: 'Jo', lastName: 'Li' }, // 2 chars
            { firstName: 'John', lastName: 'Doe' }, // 4 chars
            { firstName: 'Alexander', lastName: 'Rodriguez' }, // 9-10 chars
            { firstName: 'A'.repeat(25), lastName: 'B'.repeat(25) }, // Mid-range
            { firstName: 'A'.repeat(49), lastName: 'B'.repeat(49) }, // Just under max
          ];

          for (const names of testCases) {
            const userData: CreateUserDto = {
              email: `user${names.firstName.length}@example.com`,
              password: 'password123',
              firstName: names.firstName,
              lastName: names.lastName,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
              id: 'new-user-id',
              email: userData.email,
              password: 'hashed-password',
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.register(userData);

            expect(result.user.firstName).toBe(names.firstName);
            expect(result.user.lastName).toBe(names.lastName);
            expect(result.user.firstName.length).toBeGreaterThanOrEqual(1);
            expect(result.user.firstName.length).toBeLessThanOrEqual(50);
            expect(result.user.lastName.length).toBeGreaterThanOrEqual(1);
            expect(result.user.lastName.length).toBeLessThanOrEqual(50);
          }
        });

        it('should preserve name formatting and whitespace', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John Paul',
            lastName: 'Van Der Berg',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.firstName).toBe('John Paul');
          expect(result.user.lastName).toBe('Van Der Berg');
        });

        it('should store names exactly as provided', async () => {
          const userData: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'UPPERCASE',
            lastName: 'lowercase',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);
          mockPrismaService.user.create.mockResolvedValue({
            id: 'new-user-id',
            email: userData.email,
            password: 'hashed-password',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.register(userData);

          expect(result.user.firstName).toBe('UPPERCASE');
          expect(result.user.lastName).toBe('lowercase');
        });
      });

      it('should successfully register a new user', async () => {
        const userData: CreateUserDto = {
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.user.create.mockResolvedValue({
          id: 'new-user-id',
          email: userData.email,
          password: 'hashed-password',
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockJwtService.sign.mockReturnValue('test-token');

        const result = await service.register(userData);

        expect(result.user.email).toBe(userData.email);
        expect(result.user).not.toHaveProperty('password');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(mockPrismaService.user.create).toHaveBeenCalled();
      });
    });

    describe('login', () => {
      describe('email validation', () => {
        it('should throw UnauthorizedException when user not found', async () => {
          const loginData: LoginDto = {
            email: 'test@example.com',
            password: 'wrongpassword',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);

          await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
          await expect(service.login(loginData)).rejects.toThrow('Email Not Found, Register first!');
        });

        it('should handle valid email formats correctly', async () => {
          const validEmails = [
            'user@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
            'user_name@example-domain.com',
          ];

          for (const email of validEmails) {
            const password = 'password123';
            const hashedPassword = await bcrypt.hash(password, 12);
            const loginData: LoginDto = {
              email,
              password,
            };

            mockPrismaService.user.findUnique.mockResolvedValue({
              id: 'test-id',
              email: loginData.email,
              password: hashedPassword,
              firstName: 'Test',
              lastName: 'User',
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.login(loginData);

            expect(result.user.email).toBe(email);
            expect(result.accessToken).toBeDefined();
          }
        });

        it('should handle various email lengths within valid range', async () => {
          const testEmails = [
            'a@b.co', // Short email
            'user@example.com', // Standard email
            'very.long.email.address.with.multiple.dots@example-domain.com', // Long email
            `${'a'.repeat(50)}@example.com`, // Long local part
          ];

          for (const email of testEmails) {
            const password = 'password123';
            const hashedPassword = await bcrypt.hash(password, 12);
            const loginData: LoginDto = {
              email,
              password,
            };

            mockPrismaService.user.findUnique.mockResolvedValue({
              id: 'test-id',
              email: loginData.email,
              password: hashedPassword,
              firstName: 'Test',
              lastName: 'User',
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.login(loginData);

            expect(result.user.email).toBe(email);
            expect(result.accessToken).toBeDefined();
          }
        });

        it('should handle case-sensitive email lookup', async () => {
          const loginData: LoginDto = {
            email: 'Test@Example.COM',
            password: 'password123',
          };

          mockPrismaService.user.findUnique.mockResolvedValue(null);

          await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
          await expect(service.login(loginData)).rejects.toThrow('Email Not Found, Register first!');
        });
      });

      describe('password validation', () => {
        it('should accept minimum length password (8 characters)', async () => {
          const password = 'pass1234'; // Exactly 8 characters
          const hashedPassword = await bcrypt.hash(password, 12);
          const loginData: LoginDto = {
            email: 'test@example.com',
            password,
          };

          mockPrismaService.user.findUnique.mockResolvedValue({
            id: 'test-id',
            email: loginData.email,
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.login(loginData);

          expect(result.user.email).toBe(loginData.email);
          expect(result.accessToken).toBeDefined();
        });

        it('should accept maximum length password (100 characters)', async () => {
          const password = 'p'.repeat(100); // Exactly 100 characters
          const hashedPassword = await bcrypt.hash(password, 12);
          const loginData: LoginDto = {
            email: 'test@example.com',
            password,
          };

          mockPrismaService.user.findUnique.mockResolvedValue({
            id: 'test-id',
            email: loginData.email,
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          mockJwtService.sign.mockReturnValue('test-token');

          const result = await service.login(loginData);

          expect(result.user.email).toBe(loginData.email);
          expect(result.accessToken).toBeDefined();
        });

        it('should accept passwords at various lengths within valid range', async () => {
          const testPasswords = [
            'pass1234', // 8 chars (min)
            'password123', // 11 chars
            'mySecurePassword2024!', // 21 chars
            'p'.repeat(50), // 50 chars (mid-range)
            'p'.repeat(99), // 99 chars (just under max)
            'p'.repeat(100), // 100 chars (max)
          ];

          for (const password of testPasswords) {
            const hashedPassword = await bcrypt.hash(password, 12);
            const loginData: LoginDto = {
              email: `user${password.length}@example.com`,
              password,
            };

            mockPrismaService.user.findUnique.mockResolvedValue({
              id: 'test-id',
              email: loginData.email,
              password: hashedPassword,
              firstName: 'Test',
              lastName: 'User',
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.login(loginData);

            expect(result.user.email).toBe(loginData.email);
            expect(result.accessToken).toBeDefined();
            expect(password.length).toBeGreaterThanOrEqual(8);
            expect(password.length).toBeLessThanOrEqual(100);
          }
        });
      });

      it('should throw UnauthorizedException for invalid password', async () => {
        const loginData: LoginDto = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        const hashedPassword = await bcrypt.hash('correctpassword', 12);
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'test-id',
          email: loginData.email,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(service.login(loginData)).rejects.toThrow(UnauthorizedException);
        await expect(service.login(loginData)).rejects.toThrow('Email and Password do not match!');
      });

      it('should successfully login with valid credentials', async () => {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);
        const loginData: LoginDto = {
          email: 'test@example.com',
          password,
        };

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'test-id',
          email: loginData.email,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockJwtService.sign.mockReturnValue('test-token');

        const result = await service.login(loginData);

        expect(result.user.email).toBe(loginData.email);
        expect(result.user).not.toHaveProperty('password');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });
    });

    describe('refreshToken', () => {
      it('should throw UnauthorizedException for invalid token', async () => {
        const refreshTokenDto: RefreshTokenDto = {
          refreshToken: 'invalid-token',
        };

        mockJwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
        await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
      });

      it('should throw UnauthorizedException for invalidated token', async () => {
        const refreshTokenDto: RefreshTokenDto = {
          refreshToken: 'valid-but-invalidated-token',
        };

        mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
        mockConfigService.get.mockReturnValue('test-secret');

        // Manually add token to invalidated set
        (service as any).invalidatedTokens.add('valid-but-invalidated-token');

        await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      });

      it('should throw UnauthorizedException when user not found', async () => {
        const refreshTokenDto: RefreshTokenDto = {
          refreshToken: 'valid-token',
        };

        mockJwtService.verify.mockReturnValue({ sub: 'non-existent-user' });
        mockConfigService.get.mockReturnValue('test-secret');
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      });

      it('should successfully refresh token', async () => {
        const refreshTokenDto: RefreshTokenDto = {
          refreshToken: 'valid-token',
        };

        mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
        mockConfigService.get.mockReturnValue('test-secret');
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'user-id',
          email: 'test@example.com',
          password: 'hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockJwtService.sign.mockReturnValue('new-token');

        const result = await service.refreshToken(refreshTokenDto);

        expect(result.user.email).toBe('test@example.com');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(service.isTokenInvalidated(refreshTokenDto.refreshToken)).toBe(true);
      });
    });

    describe('logout', () => {
      it('should successfully logout with valid token', async () => {
        const token = 'valid-token';
        mockJwtService.decode.mockReturnValue({ tokenId: 'token-123' });

        const result = await service.logout(token);

        expect(result.message).toBe('Successfully logged out');
        expect(service.isTokenInvalidated('token-123')).toBe(true);
      });

      it('should handle logout with invalid token gracefully', async () => {
        const token = 'invalid-token';
        mockJwtService.decode.mockReturnValue(null);

        const result = await service.logout(token);

        expect(result.message).toBe('Successfully logged out');
      });
    });

    describe('forgotPassword', () => {
      it('should send reset email when user exists', async () => {
        const forgotPasswordDto: ForgotPasswordDto = {
          email: 'test@example.com',
        };

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'user-id',
          email: forgotPasswordDto.email,
          password: 'hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

        const result = await service.forgotPassword(forgotPasswordDto);

        expect(result.message).toBe('If the email exists, a password reset link has been sent');
        expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          forgotPasswordDto.email,
          expect.any(String)
        );
      });

      it('should not reveal if email does not exist', async () => {
        const forgotPasswordDto: ForgotPasswordDto = {
          email: 'nonexistent@example.com',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const result = await service.forgotPassword(forgotPasswordDto);

        expect(result.message).toBe('If the email exists, a password reset link has been sent');
        expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      });

      it('should handle email sending failure gracefully', async () => {
        const forgotPasswordDto: ForgotPasswordDto = {
          email: 'test@example.com',
        };

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'user-id',
          email: forgotPasswordDto.email,
          password: 'hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockEmailService.sendPasswordResetEmail.mockRejectedValue(new Error('Email service error'));

        const result = await service.forgotPassword(forgotPasswordDto);

        expect(result.message).toBe('If the email exists, a password reset link has been sent');
      });
    });

    describe('resetPassword', () => {
      it('should throw BadRequestException for invalid token', async () => {
        const resetPasswordDto: ResetPasswordDto = {
          token: 'invalid-token',
          newPassword: 'newPassword123',
        };

        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired reset token');
      });

      it('should throw BadRequestException for expired token', async () => {
        const resetPasswordDto: ResetPasswordDto = {
          token: 'expired-token',
          newPassword: 'newPassword123',
        };

        // Manually add an expired token
        const expiredDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        (service as any).resetTokens.set('expired-token', {
          email: 'test@example.com',
          expires: expiredDate,
        });

        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired reset token');
      });

      it('should throw NotFoundException when user not found', async () => {
        const resetPasswordDto: ResetPasswordDto = {
          token: 'valid-token',
          newPassword: 'newPassword123',
        };

        // Add valid token
        (service as any).resetTokens.set('valid-token', {
          email: 'test@example.com',
          expires: new Date(Date.now() + 60 * 60 * 1000),
        });

        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(NotFoundException);
        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('User not found');
      });

      it('should successfully reset password', async () => {
        const resetPasswordDto: ResetPasswordDto = {
          token: 'valid-token',
          newPassword: 'newPassword123',
        };

        // Add valid token
        (service as any).resetTokens.set('valid-token', {
          email: 'test@example.com',
          expires: new Date(Date.now() + 60 * 60 * 1000),
        });

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'user-id',
          email: 'test@example.com',
          password: 'old-hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockPrismaService.user.update.mockResolvedValue({
          id: 'user-id',
          email: 'test@example.com',
          password: 'new-hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await service.resetPassword(resetPasswordDto);

        expect(result.message).toBe('Password successfully reset');
        expect(mockPrismaService.user.update).toHaveBeenCalled();
        expect((service as any).resetTokens.has('valid-token')).toBe(false);
      });
    });

    describe('validateUser', () => {
      it('should validate user with correct credentials', async () => {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);
        const mockUser = {
          id: 'test-id',
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.validateUser('test@example.com', password);

        expect(result).toBeDefined();
        expect(result!.email).toBe('test@example.com');
        expect(result).not.toHaveProperty('password');
      });

      it('should return null for invalid user validation', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const result = await service.validateUser('test@example.com', 'password');

        expect(result).toBeNull();
      });

      it('should return null for incorrect password', async () => {
        const hashedPassword = await bcrypt.hash('correctpassword', 12);
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'test-id',
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await service.validateUser('test@example.com', 'wrongpassword');

        expect(result).toBeNull();
      });
    });

    describe('findUserById', () => {
      it('should return user without password', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'user-id',
          email: 'test@example.com',
          password: 'hashed-password',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await service.findUserById('user-id');

        expect(result).toBeDefined();
        expect(result!.email).toBe('test@example.com');
        expect(result).not.toHaveProperty('password');
      });

      it('should return null when user not found', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const result = await service.findUserById('non-existent-id');

        expect(result).toBeNull();
      });
    });

    describe('isTokenInvalidated', () => {
      it('should return true for invalidated token', () => {
        const token = 'test-token';
        mockJwtService.decode.mockReturnValue({ tokenId: token });
        service.logout(token);

        expect(service.isTokenInvalidated(token)).toBe(true);
      });

      it('should return false for valid token', () => {
        const token = 'valid-token';

        expect(service.isTokenInvalidated(token)).toBe(false);
      });
    });
  });
});