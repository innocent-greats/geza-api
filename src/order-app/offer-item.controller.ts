import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor, Query, Body, Post, Req, UploadedFile, UploadedFiles, Param, Res,
  } from '@nestjs/common';
import OfferItemsSearchService from 'src/search/search.service';
import OfferItemsService from './offer-item.service';
import { OfferItemDTO, OfferItemRequestDTO } from './dto/offer-item.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import RequestWithUser, { RequestWithOfferItem } from 'src/users/dto/requestWithUser.interface';

   
  @Controller('offer-items')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class OfferItemController {
    constructor(
      private readonly offerItemsService: OfferItemsService
    ) {}


    @Get('offerItems/:fileId')
    async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
      res.sendFile(fileId, { root: 'uploadedFiles/offerItems'});
    }

    // storage: diskStorage({
    //   destination: './uploadedFiles/avatars',
    //   filename: (req, file, cb) => {
    //     const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
    //     return cb(null, `${randomName}${extname(file.originalname)}`)
    //   }

    // })   
    @Post('add-offer-items-images')
    // @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/offerItems',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }

      })
    }))
    async addOfferItemImages(@Req() request: RequestWithOfferItem, @UploadedFiles() files:  Array<Express.Multer.File>) {
        console.log('addOfferItemImages offerItem',request.headers.cookie) 
        const req:OfferItemRequestDTO = JSON.parse(request.headers.cookie)
        console.log('addOfferItemImages offerItem',req.itemCategory) 
        return this.offerItemsService.addOfferItemImages(req, files);
    }
   
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