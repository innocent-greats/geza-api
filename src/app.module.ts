import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';
import OfferItemsSearchService from './search/search.service';
import OfferItemController from './order-app/offer-item.controller';
import OfferItemsService from './order-app/offer-item.service';


@Module({
  imports: [CommonModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}
