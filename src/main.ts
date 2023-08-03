import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Get, Ip} from "@nestjs/common"
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploadedFiles'),{
    prefix: '/uploadedFiles/',
  });;
  app.enableCors({
    "origin": "*",
  });


  await app.listen(4001);
}

bootstrap();
