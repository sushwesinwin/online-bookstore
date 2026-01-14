import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newSecurePassword123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}