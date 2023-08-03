import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { TextDecoder } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OfferItemDTO } from './dto/offer-item.dto';
import { OfferItem, OfferItemImage } from './entities/offer-item.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';


const utf8Decoder = new TextDecoder();

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
  ) { }

  async getAllAccountOrdersByStatus(request: any) {
    console.log('getOrdersByAccountIDAndServiceInRequestStatus Request')
    console.log(request)
    const orders = await this.OrderRepository.find(
      { where: { customer: request.servingAccountID, orderID: request.servingStatus, updatedStatus: 'false' } })

    console.log('orders')
    console.log(orders)
    return { status: 200, data: { orders }, err: null }
  }
  
  async getAccountOrders(request: any) {
    console.log(`Get ${request.servingStatus}Account Order Lists Request`)
    console.log(request)

    const orders = await this.OrderRepository.find(
      { where: { vendor: request.servingAccountID, updatedStatus: 'false' } })
    console.log(request.servingStatus, 'Order Lists Request')
    console.log(orders)
    return { status: 200, data: { orders }, err: null }
  }
}


