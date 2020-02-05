import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from 'src/services/auth/auth.module';

@Module({
  controllers: [LoginController],
  imports: [AuthModule],
})
export class LoginModule {}
