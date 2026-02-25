import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentService } from './payment.service';
import { CartModule } from '../cart/cart.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CartModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService, PaymentService],
})
export class OrdersModule {}
