import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles } from 'src/schemas/roles.schema';
import { FunctionsService } from '../functions';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [RolesService, FunctionsService],
  imports: [MongooseModule.forFeature([{ name: 'Roles', schema: Roles }]), PermissionsModule],
  exports: [RolesService],
})
export class RolesServiceModule {}
