import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { PermissionsModule } from 'src/services/permissions/permissions.module';
import { PermissionsController } from './permission.controller';

@Module({
  controllers: [PermissionsController],
  imports: [PermissionsModule, AuthModule, LoggerModule],
})
export class PermisosModule {}
