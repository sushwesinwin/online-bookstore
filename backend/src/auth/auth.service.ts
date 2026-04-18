import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const authUserSelect = {
  id: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const publicAuthUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;


type PublicAuthUserRecord = Prisma.UserGetPayload<{
  select: typeof publicAuthUserSelect;
}>;
type SafeAuthUser = PublicAuthUserRecord;

interface AuthResult {
  user: SafeAuthUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private invalidatedTokens = new Set<string>(); // In production, use Redis
  private resetTokens = new Map<string, { email: string; expires: Date }>(); // In production, use Redis

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private getJwtSecret(): string | undefined {
    return this.configService.get<string>('JWT_SECRET');
  }

  private getRefreshJwtSecret(): string | undefined {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.getJwtSecret()
    );
  }

  private toSafeAuthUser(user: PublicAuthUserRecord): SafeAuthUser {
    return user;
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResult> {
    const { email, password, firstName, lastName, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        ...(role && { role }), // Only include role if provided, otherwise uses default USER
      },
      select: authUserSelect,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.toSafeAuthUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Email Not Found, Register first!');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email and Password do not match!');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.toSafeAuthUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResult> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshJwtSecret(),
      });

      // Check if token is invalidated
      if (this.invalidatedTokens.has(refreshToken)) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: authUserSelect,
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate old refresh token
      this.invalidatedTokens.add(refreshToken);

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        user: this.toSafeAuthUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      // Decode token to get refresh token info
      const payload = this.jwtService.decode(token) as any;

      if (payload && payload.tokenId) {
        // Add token to invalidated list
        this.invalidatedTokens.add(payload.tokenId);
      }

      return { message: 'Successfully logged out' };
    } catch (error) {
      // Even if token is invalid, consider logout successful
      return { message: 'Successfully logged out' };
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (in production, use Redis with TTL)
    this.resetTokens.set(resetToken, { email, expires });

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to avoid revealing email existence
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Validate reset token
    const resetData = this.resetTokens.get(token);
    if (!resetData || resetData.expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: resetData.email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Remove reset token
    this.resetTokens.delete(token);

    return { message: 'Password successfully reset' };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeAuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return this.toSafeAuthUser(user);
    }
    return null;
  }

  async findUserById(id: string): Promise<SafeAuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicAuthUserSelect,
    });

    if (!user) {
      return null;
    }

    return this.toSafeAuthUser(user);
  }

  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeAuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.profileImage !== undefined && {
          profileImage: dto.profileImage,
        }),
      },
      select: publicAuthUserSelect,
    });
    return this.toSafeAuthUser(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const selectedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!selectedUser) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      selectedUser.password,
    );
    if (!isValid)
      throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Password changed successfully' };
  }

  private generateTokens(user: Pick<User, 'id' | 'email' | 'role'>): {
    accessToken: string;
    refreshToken: string;
  } {
    const jwtSecret = this.getJwtSecret();
    const refreshSecret = this.getRefreshJwtSecret();

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
