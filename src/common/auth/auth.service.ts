import { forwardRef, Inject, Injectable, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDTO } from 'src/users/dto/create-user.input';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDTO, VerifyOTPDTO } from 'src/users/dto/login-user.input';
import { User } from 'src/users/entities/user.entity';
import { OTP } from 'src/users/entities/message.entity';
import { diskStorage } from 'multer';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from 'src/users/dto/requestWithUser.interface';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private jwtTokenService: JwtService,
  ) { }
  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploadedFiles/avatars'
    })
  }))
  // async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
  //   return this.usersService.addAvatar(request.user.userID, {
  //     path: file.path,
  //     filename: file.originalname,
  //     mimetype: file.mimetype
  //   });
  // }

  async generateOTP(phone: string): Promise<any> {
    try {
      const newOTP = {
        otp: '0000',
        phone: phone
      }
      const dbotp = await this.otpRepository.insert(newOTP);
      const otp = await this.otpRepository.findOneBy({ otpID: dbotp.identifiers[0].otpID })
      console.log('dbotp otpID')
      console.log(otp)
      return {
        status: 201,
        data: JSON.stringify(otp),
        error: null,
        errorMessage: null,
        successMessage: 'new user added, enter OTP send to your number'
      }
    } catch (error) {
      console.log('error',error)
      return {
        status: 500,
        data: '',
        error: true,
        errorMessage: 'user could not be added, try again.',
        successMessage: null

      }
    }
  }
  async register(createUserDTO: CreateUserDTO) {
    try {
      let response;

      console.log('create User AccountDTO')
      console.log(createUserDTO)
      const user = await this.usersService.findOneByPhone(createUserDTO.phone);

      if (!user) {
        console.log('adding new user')
        try {
          const userSchema = this.userRepository.create(createUserDTO);
          const newUser = await this.userRepository.save(userSchema);
          if (newUser) {
            console.log('registered newUser')
            return this.generateOTP(newUser.phone)
          }
        } catch (error) {
          return {
            status: 500,
            data: '',
            error: true,
            errorMessage: 'user could not be added, try again.',
            successMessage: null

          }
        }
      } else {
        console.log('user already exists')
        let response = {
          status: 500,
          data: '',
          error: true,
          errorMessage: 'user already exists, do you you want to login?',
          successMessage: null
        }
        return response
      }
    } catch (error) {

      console.log('error exists', error)
      return {
        status: 404,
        data: '',
        error: true,
        errorMessage: 'User #00000 not found',
        successMessage: null,
      }
    }
  }
  

  async loginUser(loginUserInput: LoginUserDTO) {
    console.log('loginUserInput')
    console.log(loginUserInput)
    let response;
    const user = await this.usersService.findOneByPhone(loginUserInput.phone);

    if (!user) {
      console.log('Phone or password are invalid')
      let response = {
        status: 405,
        data: '',
        err: 'Authentication failed, submitted credential are invalid'
      }
      return response

    }
    if (user) {
      let loggedUser = await this.generateUserCredentials(user)

      response = {
        status: 200,
        data: JSON.stringify({ ...user, token: loggedUser.access_token },
        ),
        err: null
      }
      return response;
    }

  }

  async verifyUser(phone: string, otp: string): Promise<any> {
    console.log('getting User')
    console.log(phone)
    const user = await this.usersService.findOneByPhone(phone);
    const dbotp = await this.otpRepository.findOne({ where: { phone: phone } });
    console.log(user)
    if (user) {
      console.log('bcrypt.compare')
      console.log(user)
      console.log(otp, '--------', dbotp.otp)
      if (otp == dbotp.otp) {
        return user;
      }
    } else {
      console.log('User not found')
      return null;
    }
    return null;
  }
  async onVerifyOTP(verifyOTPDTO: VerifyOTPDTO): Promise<any> {
    console.log('onVerifyOTP')
    console.log(verifyOTPDTO.phone)
    const dbotp = await this.otpRepository.findOne({ where: { phone: verifyOTPDTO.phone } });
    if (verifyOTPDTO.otp == dbotp.otp) {
      const user = await this.usersService.findOneByPhone(verifyOTPDTO.phone);
      await this.otpRepository.remove(dbotp);
      return this.loginUser({ phone: verifyOTPDTO.phone });
    }
    else {
      console.log('otp not found')
      return {
        status: 404,
        data: '',
        error: true,
        errorMessage: 'otp not found',
        successMessage: null
      }
    }
  }


  async decodeUserToken(token: string): Promise<any> {
    const user = this.jwtTokenService.decode(token);
    if (user) {
      return user;
    }

    return null;
  }

  async generateUserCredentials(user: User) {
    const payload = {
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      sub: user.userID,
      userID: user.userID,
    };

    return {
      access_token: this.jwtTokenService.sign(payload),
    };
  }


}
