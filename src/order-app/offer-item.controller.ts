import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor, Query, Body, Post,
  } from '@nestjs/common';
import OfferItemsSearchService from 'src/search/search.service';
import OfferItemsService from './offer-item.service';
import { OfferItemDTO } from './dto/offer-item.dto';

   
  @Controller('offer-items')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class OfferItemController {
    constructor(
      private readonly offerItemsService: OfferItemsService
    ) {}
   
    @Post('get-offer-items')
    async getOfferItem(@Body() search: string) {
     
      if (search.length !== 0) {
        return this.offerItemsService.searchForOfferItems(search);
      }
      return this.offerItemsService.getAllOfferItems();
    }
   
    @Post('add-new-item')
    addNewOfferItem(@Body() offerItemDTO: OfferItemDTO) {
    return this.offerItemsService.createOfferItem(offerItemDTO);
    }
    
    @Post('get-account-offer-items')
    getAccountOfferItems(@Body() vendor: any) {
    return this.offerItemsService.getAccountOfferItems(vendor.vendorID);
    }   
  }