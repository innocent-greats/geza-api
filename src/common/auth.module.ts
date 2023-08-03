import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from './config.module';
import { AuthService } from './auth/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy.service';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '6000s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers:[AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
  ],
  exports: [AuthService],
})
export class AuthModule {}
