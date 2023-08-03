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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private localFilesService: LocalFilesService

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
    console.log('avatar',avatar)
    const notUpdatedUser = await this.userRepository.findOne({ where: { userID: userId } });
    notUpdatedUser.avatarId = avatar.id;
    notUpdatedUser.onlineStatus = true
    notUpdatedUser.password = null
    notUpdatedUser.email = null
    notUpdatedUser.profileImage= avatar.filename,
    notUpdatedUser.deletedDate=null
    notUpdatedUser.role=null
    console.log('notUpdatedUser', notUpdatedUser)

    const updateUser =  await this.userRepository.update(notUpdatedUser.userID, notUpdatedUser)

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
}
