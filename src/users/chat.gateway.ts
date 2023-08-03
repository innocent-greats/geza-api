
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
const connectUsers = []
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

  async handleConnection(socket: Socket) {
    console.log('handleConnection')
    const connectedUser = await this.chatService.getUserFromSocket(socket);

    if (!connectedUser) {
      // throw new WsException('Invalid credentials.');
      // console.log('Invalid credentials.')
    } else {
      const connectUser = {
        socketID: socket.id,
        userID: connectedUser.userID,
        userPhone: connectedUser.phone,
      }
      console.log('connectUser.', connectUser);
      const userExist = await connectUsers.find(userConnected => {
        if (userConnected.userID == connectedUser.userID) {
          userConnected.socketID = connectUser.socketID
          return true
        }
      })

      if (userExist) {
        [connectUser, ...connectUsers.filter(i => i.userID !== connectUser.userID)]
      } else {
        connectUsers.push(connectUser);
      }

      console.log('connectUsers.', connectUsers)
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
    const sender = await connectUsers.find(userConnected => {
      if (userConnected.userPhone == messageDTO.senderPhone) {
        return userConnected
      }
    })
    const orders = await this.OrderRepository.find();
    const data = {
      "to": sender.socketID,
      "message": 'you have no request',
      "serviceRequest": JSON.stringify(orders),
    }
    this.server.sockets.to(sender.socketID).emit('service-requests', JSON.stringify(data))
  }

  @SubscribeMessage('accept-order')
  async acceptorder(
    @MessageBody() messageDTO: any,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('@acceptorder', messageDTO)
    const vendor = await connectUsers.find(userConnected => {
      if (userConnected.userID == messageDTO.clientID) {
        return userConnected
      }
    })
    const order = await this.OrderRepository.findOneBy({orderID: messageDTO.orderID});
    console.log('@acceptorder order', order.customer)

    const data = {
      "order": JSON.stringify(order),
    }
    this.server.sockets.to(vendor.socketID).emit('order-request-accepted', JSON.stringify(data))
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
      }else{
        user.onlineStatus= false;
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

  @SubscribeMessage('place-order')
  async placeOrder(
    @MessageBody() messageDTO: PlaceOrderSocketDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log('@SubscribeMessag placeOrder ')
    // console.log('@MessageBody() ', messageDTO)
    const client = await this.userRepository.findOneBy({userID: messageDTO.clientID})
    const offerItem = await this.OfferItemRepository.findOneBy({vendorID: messageDTO.vendorID})
    const newOrder = {totalAmount: messageDTO.order.totalAmount,
      customer: client,bookedServiceDate: new Date,offerItem: offerItem,
    }
        const newOrderSchema = this.OrderRepository.create(newOrder);
        const orderItem = await this.OrderRepository.save(newOrderSchema);
        console.log('@placeOrder orderItem', orderItem)
        console.log('vendorID', orderItem.offerItem.vendorID)
        const vendor = await connectUsers.find(userConnected => {
          if (userConnected.userID == orderItem.offerItem.vendorID) {
            console.log('@vendor socket', userConnected)
            return userConnected
          }else{
            console.log('@vendor socket', userConnected)

          }
        })
    console.log('@vendor socket', vendor)
    const data = {
      "clientID": messageDTO.clientID,
      "order":JSON.stringify(orderItem),
    }

    this.server.sockets.to(vendor.socketID).emit('receive_order-request', JSON.stringify(data))
    // this.server.sockets.emit('receive_message', messageDTO.content);

    return messageDTO;
  }
}