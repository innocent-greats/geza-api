import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import LocalFilesInterceptor from 'src/localFiles.interceptor';
import RequestWithUser, { RequestWithOfferItem } from './dto/requestWithUser.interface';
import JwtAuthenticationGuard from 'src/common/auth/jwt-authentication.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from 'src/common/auth/auth.service';
import { extname } from 'path';
import { CreateUserDTO } from './dto/create-user.input';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService,private readonly authenticationService: AuthService) {}
  
    @Get('avatars/:fileId')
    async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
      res.sendFile(fileId, { root: 'uploadedFiles/avatars'});
    }

    @Post('avatar')
    // @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })
    }))
    async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
        console.log('addAvatar request request',request)
        const newUser = await this.authenticationService.decodeUserToken(request.headers.cookie);
        console.log('authenticationService.decodeUserToken user', newUser)      
        return this.usersService.addAvatar(newUser.userID, {
        path: file.path,
        filename: file.filename,
        mimetype: file.mimetype
      });
    }

    @Post('add-employee')
    // @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname+'.jpeg')}`)
        }

      })
    }))
    async addEmployee(@Req() request: RequestWithOfferItem, @UploadedFiles() files:  Array<Express.Multer.File>) {
        console.log('addEmployee emp request',request) 
        const req:CreateUserDTO = JSON.parse(request.body['employee'])
        console.log('addEmployee emp',req) 
        return this.usersService.addEmployee(req, files);
    }



    @Post('getUserByID')
    getUserByID(@Body() data) {
        console.log('getUserByID')
        console.log(data)
        return this.usersService.getUserByID(data.userID);
    }
    @Get('get-users')
    getUsers() {
        console.log('getting users')
        return this.usersService.getAllClients();
    }
    @Get('getClientsList')
    getAllClients() {
      return this.usersService.getAllClients();
    }

    @Get('get-all-employees')
    getAllEmployees() {
      return this.usersService.getAllEmployees();
    }

    
    @Get('get-all-vendors')
    getAllVendors() {
      return this.usersService.getAllVendors();
    }
    @Post('get-requested-service-providers')
    getServiceProviders(@Body() data) {
        console.log('get Service Providers')
        console.log(data)
        return this.usersService.getServiceProviders(data);
    }
    
}
