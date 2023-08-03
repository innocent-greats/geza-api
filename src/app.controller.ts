import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('httpConnection')
  callAPiServer(): string {
    console.log('data')
    return this.appService.getHello();
  }
  @Post('postConnection')
  postConnection(@Body() data) {
    console.log('data')
    console.log(data)
    return this.appService.getHello();
  }
}

