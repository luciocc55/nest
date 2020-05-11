import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions } from 'src/schemas/roles-permission.schema';
import { PermissionsService } from './permissions.service';
import { FunctionsService } from '../functions';

@Module({
  providers: [PermissionsService, FunctionsService],
  imports: [MongooseModule.forFeature([{ name: 'Permissions', schema: Permissions }])],
  exports: [PermissionsService],
})
export class PermissionsModule {}
