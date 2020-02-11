import { Module } from '@nestjs/common';
import { PermisosFrontServiceService } from './permisos-front-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsFront } from 'src/schemas/permission-front.schema';

@Module({
  providers: [PermisosFrontServiceService],
  imports: [MongooseModule.forFeature([{ name: 'PermissionsFront', schema: PermissionsFront }])],
  exports: [PermisosFrontServiceService],
})
export class PermisosFrontServiceModule {}
