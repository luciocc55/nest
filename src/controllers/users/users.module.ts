import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { UsersController } from './users.controller';
import { UsersServiceModule } from 'src/services/users/users.module';
import { LoggerModule } from 'src/services/logger/logger.module';

@Module({
  controllers: [UsersController],
  imports: [UsersServiceModule, LoggerModule, AuthModule],
})
export class UsersModule {}
