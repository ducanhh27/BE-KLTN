import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Orders, OrdersSchema } from 'src/schema/order/orders.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { Cart, CartSchema } from 'src/schema/cart/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Orders.name,
        schema: OrdersSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
