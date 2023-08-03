import { Injectable } from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OfferItem } from './entities/offer-item.entity';
import OfferItemsSearchService from 'src/search/search.service';
import { User } from 'src/users/entities/user.entity';
import { OfferItemDTO } from './dto/offer-item.dto';
import { UsersService } from 'src/users/users.service';



@Injectable()
export default class OfferItemsService {
    constructor(
        @InjectRepository(OfferItem)
        private offerItemRepository: Repository<OfferItem>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private postsSearchService: OfferItemsSearchService,
        private usersService: UsersService,
    ) { }

    async createOfferItem(offerItemDTO: OfferItemDTO) {
        try {
            const vendor = await this.usersService.getUserByID(offerItemDTO.vendorID);
            const newOffer = {
                itemName: offerItemDTO.itemName,
                itemCategory: offerItemDTO.itemCategory,
                vendorID: offerItemDTO.vendorID,
                offeringStatus: offerItemDTO.offeringStatus,
                quantity: offerItemDTO.quantity,
                minimumPrice: offerItemDTO.minimumPrice,
                vendor: vendor,
            }

            const newOfferSchema = this.offerItemRepository.create(newOffer);
            const offerItem = await this.offerItemRepository.save(newOfferSchema);
            console.log('newOffer', vendor)

            const indexed = await this.postsSearchService.indexOfferItem(offerItem);
            console.log('indexed', indexed)
            return {
                status: 201,
                data: JSON.stringify(offerItem),
                error: null,
                errorMessage: null,
                successMessage: 'new item added'
            }
        }
        catch (error) {
            return {
                status: 500,
                data: '',
                error: true,
                errorMessage: 'item could not be added, try again.',
                successMessage: null
            }
        }
    }
    async getAccountOfferItems(vendorID: string) {
        const offerItems = await this.offerItemRepository.find(
            { where: { vendorID: vendorID } })
        return {
            status: 201,
            data: JSON.stringify(offerItems),
            error: null,
            errorMessage: null,
            successMessage: 'success'
        }
    }
    async searchForOfferItems(search: any) {
        const text = search.text
        console.log('text', text)
        const results = await this.postsSearchService.search(text.toString());
        const ids = results.map(result => result['vendorID']
      );
        console.log('results ids', ids)

        if (!ids.length) {
            return {
                status: 200,
                data: JSON.stringify([]),
                error: null,
                errorMessage: null,
                successMessage: 'success'
    
              };
        }
        const vendors = await this.userRepository
        .find({
            where: { userID: In(ids) }
        });
        console.log('results vendors', vendors)
        return {
            status: 200,
            data: JSON.stringify(vendors),
            error: null,
            errorMessage: null,
            successMessage: 'success'

          }
        return vendors
    }
    async getAllOfferItems() {
        return await this.offerItemRepository.find();
    }
}