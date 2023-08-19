
import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import Message from './entities/message.entity';
import { MessageDTO, PlaceOrderSocketDTO } from './dto/create-user.input';
import { UsersService } from './users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/order-app/entities/order.entity';
import { OfferItem } from 'src/order-app/entities/offer-item.entity';
import { ClassSerializerInterceptor, Controller, UseInterceptors } from '@nestjs/common';
import OfferItemsService from 'src/order-app/offer-item.service';
const connectUsers = []


@Controller('offer-items')
@UseInterceptors(ClassSerializerInterceptor)
export default class OfferItemController {
  constructor(
    private readonly offerItemsService: OfferItemsService
  ) { }


}

@WebSocketGateway({ transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
    @InjectRepository(OfferItem)
    private readonly OfferItemRepository: Repository<OfferItem>,
    private readonly chatService: ChatService,
    private readonly userService: UsersService
  ) {
  }

  // throw new WsException('Invalid credentials.');
  // console.log('Invalid credentials.')
  // else{
  //   await this.handleConnection(socket)
  //   await connectUsers.find(userConnected => {
  //     if (userConnected.userID == messageDTO.senderID) {
  //       userConnected.socketID = userConnected.socketID
  //       console.log('@notifyOnlineStatus handleConnection', userConnected)
  //       return userConnected
  //     }
  //   })
  // }
  async socketRegisterUser(user, socket: Socket, status: string) {
    try {
      const connectUser = {
        socketID: socket.id,
        userID: user.userID,
        userPhone: user.phone,
      }
      console.log('connectUser.', connectUser);
      const userExist = await connectUsers.find(userConnected => {
        if (userConnected.userID == user.userID) {
          userConnected.socketID = connectUser.socketID
          return true
        }
      })

      if (userExist) {
        if (status == 'offline') {
          connectUsers.splice(connectUsers.indexOf(userExist), 1);
        }
        [connectUser, ...connectUsers.filter(i => i.userID !== connectUser.userID)]
      } else {
        connectUsers.push(connectUser);
      }
      console.log('connectUsers.', connectUsers)

      return connectUser;
    } catch (error) {

    }
  }
  async handleConnection(socket: Socket) {
    console.log('handleConnection')
    const connectedUser = await this.chatService.getUserFromSocket(socket);

    if (!connectedUser) { } else {
      await this.socketRegisterUser(connectedUser, socket, 'online')
    }
  }

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() messageDTO: MessageDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const reciever = await connectUsers.find(userConnected => {
      if (userConnected.userPhone == messageDTO.recieverPhone) {
        return userConnected
      }
    })
    const data = {
      "reciever": reciever.socketID,
      "sender": '',
      "message": true,
    }

    this.server.sockets.to(reciever.socketID).emit('receive_message', JSON.stringify(data))
    // this.server.sockets.emit('receive_message', messageDTO.content);

    return messageDTO;
  }

  @SubscribeMessage('request_all_messages')
  async requestAllMessages(
    @MessageBody() messageDTO: MessageDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.chatService.getUserFromSocket(socket);
    const messages = await this.chatService.getAllMessages();

    socket.emit('send_all_messages', messages);
  }


  @SubscribeMessage('notify-online-status')
  async notifyOnlineStatus(
    @MessageBody() messageDTO: MessageDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('@notifyOnlineStatus', messageDTO)
    const user = await this.userService.getUserByID(messageDTO.senderID)
    let sender: any;
    sender = await this.socketRegisterUser(user, socket, messageDTO.content)
    console.log('@notifyOnlineStatus sender', sender)
    const data = {
      "to": sender.socketID,
      "message": 'you have no request',
    }
    this.server.sockets.to(sender.socketID).emit('update-online-status', JSON.stringify(data))
  }


  @SubscribeMessage('get-vendors')
  async getVendors(
    @MessageBody() messageDTO: MessageDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('@getVendors', messageDTO)
    // await this.handleConnection(socket)
    let vendors = await this.userRepository.find({ where: { accountType: 'vendor' } })
    vendors.map((user) => {
      let matchingObject = connectUsers.find(userConnected => userConnected.userID === user.userID);
      if (matchingObject) {
        user.onlineStatus = true;
      } else {
        user.onlineStatus = false;
      }
    })
    vendors.sort((a, b) => (a.onlineStatus === b.onlineStatus ? 0 : a.onlineStatus ? -1 : 1));

    const sender = await connectUsers.find(userConnected => {
      if (userConnected.userPhone == messageDTO.senderPhone) {
        return userConnected
      }
    })

    const data = {
      "to": sender.socketID,
      "message": 'success',
      "vendors": JSON.stringify(vendors),
    }
    this.server.sockets.to(sender.socketID).emit('receive-vendors', JSON.stringify(data))
  }

  @SubscribeMessage('get-account-orders')
  async getOrders(
    @MessageBody() messageDTO: any,
    @ConnectedSocket() socket: Socket,
  ) {
    let orders: Order[]
    const account = await this.socketRegisterUser(messageDTO, socket, messageDTO.content)

    if (messageDTO.accountType == 'vendor') {
      orders = await this.OrderRepository.find({
        relations: { offerItem: true, customer: true, vendor: true },
        where: {
          vendor: {
            userID: account.userID
          },
        }, take: 20,
      });
    }
    if (messageDTO.accountType == 'client') {
      orders = await this.OrderRepository.find({
        relations: { offerItem: true, customer: true, vendor: true },
        where: {
          customer: {
            userID: account.userID
          },
        }, take: 20,
      });
    }
    console.log('@getOrders', orders)

    const data = {
      "orders": JSON.stringify(orders),
    }
    this.server.sockets.to(account.socketID).emit('receive_account_orders', JSON.stringify(data))
  }

  @SubscribeMessage('get-account-offer-items')
  async getOfferItems(
    @MessageBody() messageDTO: any,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('@getOfferItems clientID', messageDTO.clientID)
    const user = new User()
    user.userID = messageDTO.userID
    user.phone = messageDTO.phone

    const vendor = await this.socketRegisterUser(user, socket, messageDTO.content)
    console.log('@getOfferItems vendor', connectUsers)
    const orders = await this.OfferItemRepository.find({
      relations: { orders: true },
      where: {
        vendor: {
          userID: messageDTO.clientID
        }
      }, take: 20,
    });

    const data = {
      "orders": JSON.stringify(orders),
    }
    this.server.sockets.to(vendor.socketID).emit('account-orders', JSON.stringify(data))
  }

  @SubscribeMessage('place-order')
  async placeOrder(
    @MessageBody() messageDTO: PlaceOrderSocketDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log('@SubscribeMessag placeOrder ')
    console.log('@MessageBody() ', messageDTO)
    const client = await this.userRepository.findOneBy({ userID: messageDTO.clientID })
    const offerItem = await this.OfferItemRepository.findOneBy({ vendorID: messageDTO.vendorID })
    const newOrder = {
      totalAmount: messageDTO.order.totalAmount,
      customer: client,
      bookedServiceDate: new Date,
      offerItem: offerItem,
      orderStatus: 'client-request'
    }
    const newOrderSchema = this.OrderRepository.create(newOrder);
    const orderItem = await this.OrderRepository.save(newOrderSchema);
    console.log('vendorID', orderItem.offerItem.vendorID)
    var vendor;
    await connectUsers.find(userConnected => {
      if (userConnected.userID == orderItem.offerItem.vendorID) {
        console.log('vendorID socket userConnected', userConnected)
        vendor = userConnected
      }
    })
    let order = await this.OrderRepository.findOne({ where: { orderID: orderItem.orderID },
                relations: { vendor: true, customer: true, offerItem: true } })
    console.log('vendorID order', order)

    const data = {
      "clientID": messageDTO.clientID,
      "order": JSON.stringify(order),
    }
    if (vendor != null) {
      this.server.sockets.to(vendor.socketID).emit('receive_order-request', JSON.stringify(data))
    }
    // this.server.sockets.emit('receive_message', messageDTO.content);

    return messageDTO;
  }

  @SubscribeMessage('accept-order')
  async acceptorder(
    @MessageBody() messageDTO: any,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('@connectUsers messageDTO 1 ', messageDTO.clientID)
    const vendor = await connectUsers.find(userConnected => {
      if (userConnected.userID == messageDTO.clientID) {
        return userConnected
      }
    })
    console.log('@connectUsers messageDTO ', messageDTO)
    console.log('@connectUsers', connectUsers)
    console.log('@connectUsers vendor', vendor)

    const order = await this.OrderRepository.findOne({where:{orderID: messageDTO.orderID},relations:{customer:true, vendor:true,offerItem:true}});
    console.log('@acceptorder order', order)
    order.orderStatus = 'vendor-accepted'
    order.vendor = await this.userRepository.findOne({ where: { userID: messageDTO.vendorID } })

    await this.OrderRepository.update(order.orderID, order);
    const updatedorder = await this.OrderRepository.findOne({where:{orderID: messageDTO.orderID},relations:{customer:true, vendor:true,offerItem:true}});
    const data = {
      "order": JSON.stringify(updatedorder),
    }
    this.server.sockets.to(vendor.socketID).emit('order-request-accepted', JSON.stringify(data))
  }

}