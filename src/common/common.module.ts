import { Module } from '@nestjs/common';
import { ConfigModule } from './config.module';
import { AuthModule } from './auth.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
  exports: [ConfigModule, DatabaseModule, AuthModule],
})
export class CommonModule {}
