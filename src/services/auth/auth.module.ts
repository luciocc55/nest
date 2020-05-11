import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import environment from 'src/env';
import { UsersServiceModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: environment.secretKey,
      signOptions: { expiresIn: '60m' },
    }),
    UsersServiceModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
