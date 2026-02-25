import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'order-id-123',
    description: 'The ID of the order to create payment for',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    example: 'usd',
    description: 'Currency code (default: usd)',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;
}
