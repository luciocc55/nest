import { Module } from '@nestjs/common';
import { PermissionsFrontServiceModule } from 'src/services/permission-front-service/permission-front-service.module';
import { PermissionsFrontController } from './permission-front.controller';

@Module({
  controllers: [PermissionsFrontController],
  imports: [PermissionsFrontServiceModule]
})
export class PermissionsFrontModule {}
