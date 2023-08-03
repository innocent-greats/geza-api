import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { OfferItemDTO } from './dto/offer-item.dto';


@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    ) {}
    

  // getAccountOrders
  @Post('get-all-account-orders')
getAccountOrders(@Body() requestToTradeCommodityDTO: any) {
  console.log('getAccountOrders')
  console.log(requestToTradeCommodityDTO)
  return this.orderService.getAccountOrders(requestToTradeCommodityDTO);
}
// get-all-account-orders
@Post('get-all-account-orders-by-status')
getAllAccountOrdersByStatus(@Body() requestToTradeCommodityDTO: any) {
  console.log('requestToTradeCommodityDTO')
  console.log(requestToTradeCommodityDTO)
  return this.orderService.getAllAccountOrdersByStatus(requestToTradeCommodityDTO);
}


}
