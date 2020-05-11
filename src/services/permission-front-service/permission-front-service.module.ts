import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsFront } from 'src/schemas/permission-front.schema';
import { PermissionsFrontServiceService } from './permission-front-service.service';

@Module({
  providers: [PermissionsFrontServiceService],
  imports: [MongooseModule.forFeature([{ name: 'PermissionsFront', schema: PermissionsFront }])],
  exports: [PermissionsFrontServiceService],
})
export class PermissionsFrontServiceModule {}
