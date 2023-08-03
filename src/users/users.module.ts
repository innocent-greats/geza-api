import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/common/auth.module';
import { UsersController } from './users.controller';
import { Order } from 'src/order-app/entities/order.entity';
import  { OfferItem, OfferItemImage } from 'src/order-app/entities/offer-item.entity';
import Message, { OTP } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { OrderController } from 'src/order-app/order.controller';
import { OrderService } from 'src/order-app/order.service';
import OfferItemController from 'src/order-app/offer-item.controller';
import OfferItemsService from 'src/order-app/offer-item.service';
import OfferItemsSearchService from 'src/search/search.service';
import { SearchModule } from 'src/search/search.module';
import LocalFilesService from 'src/files/localFiles.service';
import LocalFile from 'src/files/localFile.entity';


@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    TypeOrmModule.forFeature([User, Order, OfferItem, OfferItemImage, Message, OTP, LocalFile ]),
  ],
  providers: [UsersService, ChatService, ChatGateway, OrderService, OfferItemsService, OfferItemsSearchService, LocalFilesService ],
  exports: [UsersService, TypeOrmModule, OrderService, OfferItemsService, LocalFilesService],
  controllers: [UsersController, OrderController, OfferItemController],
})
export class UsersModule {}
