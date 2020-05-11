import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { RolesServiceModule } from 'src/services/roles/roles.module';

@Module({
  controllers: [RolesController],
  imports: [
    AuthModule,
    LoggerModule,
    RolesServiceModule,
  ],
})
export class RolesModule {}
