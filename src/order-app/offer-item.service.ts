import { Injectable } from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OfferItem, OfferItemImage } from './entities/offer-item.entity';
import OfferItemsSearchService from 'src/search/search.service';
import { User } from 'src/users/entities/user.entity';
import { OfferItemDTO, OfferItemRequestDTO } from './dto/offer-item.dto';
import { UsersService } from 'src/users/users.service';
import LocalFilesService from 'src/files/localFiles.service';
import { AuthService } from 'src/common/auth/auth.service';



@Injectable()
export default class OfferItemsService {
    constructor(
        @InjectRepository(OfferItem)
        private offerItemRepository: Repository<OfferItem>,
        @InjectRepository(OfferItemImage)
        private offerItemImageRepository: Repository<OfferItemImage>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private postsSearchService: OfferItemsSearchService,
        private usersService: UsersService,
        private localFilesService: LocalFilesService,
        private readonly authenticationService: AuthService
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
            return offerItem;
        }
        catch (error) {
            return null;
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
        const searchResult = []
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
                where: { userID: In(ids), accountType:'vendor' }
            });
            await Promise.all(
                vendors.map(async (vendor) => {
                    const offerItems = await this.offerItemRepository.find({ where: { vendorID: vendor.userID },     relations: {
                        images: true,
                    } })
                    offerItems.map((itm)=>{
                        console.log(itm)
                    })
                    vendor.OfferItems = offerItems
                   
                    searchResult.push(vendor);
                })
            )

        console.log('results vendors', searchResult)

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

    async addOfferItemImages(offerItem: OfferItemRequestDTO, files: any) {
        // console.log('addOfferItemImages service files',files) 

        // 
        // console.log('avatar', avatar)
        // const newOfferItem = await this.createOfferItem(offerItem)
        // if (newOfferItem) {
        const newUser = await this.authenticationService.decodeUserToken(offerItem.authToken);
        console.log('authenticationService.decodeUserToken user', newUser)
        let newFiles = [];
        const newOfferItem = new OfferItem()
        newOfferItem.itemName = offerItem.itemName
        newOfferItem.itemCategory = offerItem.itemCategory
        newOfferItem.minimumPrice = offerItem.minimumPrice
        newOfferItem.vendorID = newUser.userID
        newOfferItem.vendor = newUser
        newOfferItem.quantity = offerItem.quantity
        newOfferItem.offeringStatus = offerItem.offeringStatus
        newOfferItem.quantity = offerItem.quantity
        await Promise.all(files.map(async (file: LocalFileDto) => {
            const image = {
                path: file.path,
                filename: file.filename,
                mimetype: file.mimetype,
                // offerItem: newOfferItem
            }
            const newImageSchema = await this.offerItemImageRepository.create(image)
            const newFile = await this.offerItemImageRepository.save(newImageSchema);

            newFiles.push(newFile);
        }));
        newOfferItem.images = newFiles

        console.log('newFiles', newFiles);
        newOfferItem.images = newFiles
        const updatedfferItem = await this.offerItemRepository.save(newOfferItem);
        // }
        // const updatedfferItem = await this.offerItemRepository.findOne({ where: { itemID: newOfferItem.itemID } })
        const indexed = await this.postsSearchService.indexOfferItem(updatedfferItem);
        console.log('indexed', indexed)
        console.log('updatedfferItem', updatedfferItem)
        return {
            status: 200,
            data: JSON.stringify(newOfferItem),
            error: null,
            errorMessage: null,
            successMessage: 'success'
        }


    }
}