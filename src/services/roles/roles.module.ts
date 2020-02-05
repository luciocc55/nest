import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles } from 'src/schemas/roles.schema';

@Module({
  providers: [RolesService],
  imports: [MongooseModule.forFeature([{ name: 'Roles', schema: Roles }])],
  exports: [RolesService],
})
export class RolesModule {}
