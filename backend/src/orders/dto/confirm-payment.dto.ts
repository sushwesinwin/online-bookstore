import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
    @ApiProperty({
        example: 'pi_1234567890',
        description: 'The Stripe payment intent ID'
    })
    @IsString()
    paymentIntentId: string;
}
