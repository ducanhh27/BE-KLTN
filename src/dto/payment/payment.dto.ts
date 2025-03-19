import { IsString, IsNotEmpty, IsEmail, IsArray, IsEnum, IsMongoId, IsNumber } from "class-validator";
import { Types } from "mongoose";

class OrderItemDto {
  @IsMongoId()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productImage: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @IsMongoId()
  customerId?: string;

  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  priceOders: number;

  @IsArray()
  items: OrderItemDto[];


  @IsEnum(["Chưa thanh toán","Đã thanh toán"])
  status: string;

  @IsEnum(["Chưa giao hàng","Đã giao hàng"])
  deliveryStatus:string


  @IsString()
  paymentMethod :string
}
