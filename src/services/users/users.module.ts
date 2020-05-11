import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesServiceModule } from '../roles/roles.module';
import { Users } from 'src/schemas/users.schema';
import { UsersService } from './users.service';
import { FunctionsService } from '../functions';
import { AtributosUser } from 'src/schemas/users-atributos.schema';

@Module({
  providers: [UsersService, FunctionsService],
  exports: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: Users }]),
    RolesServiceModule,
    MongooseModule.forFeature([
      { name: 'AtributosUser', schema: AtributosUser },
    ]),
  ],
})
export class UsersServiceModule {}
