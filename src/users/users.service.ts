import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { AuthService } from 'src/common/auth/auth.service';
import LocalFilesService from 'src/files/localFiles.service';
import { CreateUserDTO } from './dto/create-user.input';
import LocalFile from 'src/files/localFile.entity';
import { OfferItem } from 'src/order-app/entities/offer-item.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private localFilesService: LocalFilesService,
    @InjectRepository(LocalFile)
    private localFilesRepository: Repository<LocalFile>,
    @InjectRepository(OfferItem)
    private offerItemRepository: Repository<OfferItem>,

  ) { }


  async getServiceProviders(filter: any): Promise<any> {
    console.log('getAllAuctionFloors serviceCategory')
    console.log(filter.serviceCategory)

    try {
      let providers = await this.userRepository.find({ where: { accountType: filter.serviceInRequest } })
      console.log('providers')
      console.log(providers)

      if (providers.length === 0) {
        return {
          status: 404,
          error: 'providers not found',
          data: null,
          message: `providers not found`
        };
      }

      return {
        status: 200,
        error: null,
        data: providers,
        message: ''
      };

    } catch (error) {
      return {
        status: 305,
        error: 'providers fetching fialed',
        data: null,
        message: 'providers fetching fialed'
      };

    }
  }

  async getVendors(filter: any): Promise<any> {
    console.log('getVendors')
    console.log(filter.serviceCategory)

    try {
      let vendors = await this.userRepository.find({ where: { accountType: 'vendor' } })
      if (vendors.length === 0) {
        return {
          status: 404,
          error: 'vendors not found',
          data: null,
          message: `vendors not found`
        };
      }

      return {
        status: 200,
        error: null,
        data: vendors,
        message: ''
      };

    } catch (error) {
      return {
        status: 305,
        error: 'vendors fetching fialed',
        data: null,
        message: 'vendors fetching fialed'
      };

    }
  }
  async getAllClients(): Promise<Array<User>> {
    let clients = await this.userRepository.find({ where: { role: 'client' } })

    if (!clients) {
      throw new NotFoundException(`Clients not found`);
    } else {
      console.log('clients')
      console.log(clients)
    }
    return clients;
  }

  
  async getAllEmployees() {
    let employees = await this.userRepository.find({ where: { accountType: 'employee' } })

    if (!employees) {
      throw new NotFoundException(`Employees not found`);
    } else {
      console.log('employees')
      console.log(employees)
      return {
        status: 200,
        error: null,
        data: JSON.stringify(employees),
        message: ''
      };
    }

  }
  async getAllVendors() {
    const searchResult = []
    const vendors = await this.userRepository
    .find({
        where: {accountType: 'vendor' }
    });
await Promise.all(
    vendors.map(async (vendor) => {
        const offerItems = await this.offerItemRepository.find({
            where: { vendorID: vendor.userID }, relations: {
                images: true,
            }
        })
        offerItems.map((itm) => {
            console.log(itm)
        })
        vendor.OfferItems = offerItems

        searchResult.push(vendor);
    })
)
    if (!vendors) {
      throw new NotFoundException(`vendors not found`);
    } else {
      console.log('vendors')
      console.log(vendors)
      return {
        status: 200,
        error: null,
        data: JSON.stringify(vendors),
        message: ''
      };
    }

  }
  async update(
    userID: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    console.log(updateUserInput)
    const user = await this.userRepository.preload({
      userID: userID,
      ...updateUserInput,
    });

    if (!user) {
      throw new NotFoundException(`User #${userID} not found`);
    }
    return this.userRepository.save(user);
  }

  // get all entity objects
  async findAll(): Promise<Array<User>> {
    return await this.userRepository.find();
  }

  async getUserByID(userID: string): Promise<User> {
    if (userID == 'admin') {
      console.log('createOfferItem userID', userID)
      try {
        const user = await this.userRepository.findOne({
          where: { accountType: 'admin' },
        });
        console.log('getUserByID user', user)
        return user;
      } catch (error) {
        console.log('error', error)

      }

    }
    const user = await this.userRepository.findOne({
      where: { userID: userID },
    });

    console.log('getUserByID user')
    console.log(user)
    return user

  }
  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new NotFoundException(`User #${email} not found`);
    }
    return user;
  }

  async getUserProfile(token: string): Promise<User> {
    const decodedser = await this.authService.decodeUserToken(token);
    let user;
    if (decodedser) {
      user = await this.userRepository.findOne({
        where: { userID: decodedser.sub },
      });
      console.log('getUserProfile');
      console.log(decodedser.sub);
    } else {
      throw new NotFoundException(`User token #${token} not valid`);
    }

    if (!user) {
      throw new NotFoundException(`User #${decodedser.sub} not found`);
    }
    return user;
  }


  async findOneByPhone(phone: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { phone: phone } });
    if (!user || user === null) {
      // throw new NotFoundException(`User #${phone} not found`);
      return null
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (!user || user === null) {
      return null
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return user;
  }

  async updateUser(userData) {
    console.log('usr', userData)
    try {
      const user = await this.userRepository.findOne({ where: { userID: userData.userID } });
      user.accountType = userData.accountType
      user.role = userData.role
      const data = await this.userRepository.update(user.userID, user);
      return {
        status: 200,
        error: null,
        data: data,
        message: ''
      };
    } catch (error) {
    }
  }

  async remove(userID: string): Promise<boolean> {
    const user = await this.getUserByID(userID);
    await this.userRepository.remove(user);
    return true;
  }
  async addAvatar(userId: string, fileData: LocalFileDto) {
    const avatar = await this.localFilesService.saveLocalFileData(fileData);
    console.log('avatar', avatar)
    const notUpdatedUser = await this.userRepository.findOne({ where: { userID: userId } });
    notUpdatedUser.avatarId = avatar.id;
    notUpdatedUser.onlineStatus = true
    notUpdatedUser.password = null
    notUpdatedUser.email = null
    notUpdatedUser.profileImage = avatar.filename,
      notUpdatedUser.deletedDate = null
    notUpdatedUser.role = null
    console.log('notUpdatedUser', notUpdatedUser)

    const updateUser = await this.userRepository.update(notUpdatedUser.userID, notUpdatedUser)

    const updatedUser = await this.userRepository.findOne({ where: { userID: userId } });
    console.log('updateUser', updateUser)
    return {
      status: 200,
      data: JSON.stringify(updatedUser),
      error: null,
      errorMessage: null,
      successMessage: 'success'
    }


  }

  // async addEmployee(userId: string, fileData: LocalFileDto) {
  //   const avatar = await this.localFilesService.saveLocalFileData(fileData);
  //   console.log('avatar', avatar)
  //   const notUpdatedUser = await this.userRepository.findOne({ where: { userID: userId } });
  //   notUpdatedUser.avatarId = avatar.id;
  //   notUpdatedUser.onlineStatus = true
  //   notUpdatedUser.password = null
  //   notUpdatedUser.email = null
  //   notUpdatedUser.profileImage = avatar.filename,
  //     notUpdatedUser.deletedDate = null
  //   notUpdatedUser.role = null
  //   console.log('notUpdatedUser', notUpdatedUser)

  //   const updateUser = await this.userRepository.update(notUpdatedUser.userID, notUpdatedUser)

  //   const updatedUser = await this.userRepository.findOne({ where: { userID: userId } });
  //   console.log('updateUser', updateUser)
  //   return {
  //     status: 200,
  //     data: JSON.stringify(updatedUser),
  //     error: null,
  //     errorMessage: null,
  //     successMessage: 'success'
  //   }
  // }
  async addEmployee(employee:CreateUserDTO, files: any) {
    const newUser = await this.authService.decodeUserToken(employee.authToken);
    console.log('authenticationService.decodeUserToken user', newUser)
    let newFiles = [];
    const user = new User()
    user.firstName = employee.firstName
    user.lastName = employee.lastName
    user.streetAddress = employee.streetAddress
    user.phone =employee.phone
    user.neighbourhood = employee.neighbourhood
    user.city = employee.city
    user.accountType = employee.accountType
    user.department = employee.department
    user.jobRole = employee.jobRole
    user.deploymentStatus = employee.deploymentStatus
    console.log('updatedUser files', files)
    await Promise.all(files.map(async (file: LocalFileDto) => {
        const image = {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
        }
        const newFile =  this.localFilesRepository.create(image)
        await this.localFilesRepository.save(newFile);
        newFiles.push(newFile);
    }));
   

    user.profileImage = newFiles[0].filename

    const updatedUser = await this.userRepository.save(user);

    console.log('updatedUser', updatedUser)
    return {
        status: 200,
        data: JSON.stringify(updatedUser),
        error: null,
        errorMessage: null,
        successMessage: 'success'
    }


}
}
