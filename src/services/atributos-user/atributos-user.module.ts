import { AtributosUserService } from './atributos-user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FunctionsService } from '../functions';
import { AtributosUser } from 'src/schemas/users-atributos.schema';
import { PrestadoresServiceModule } from '../prestadores/prestadores.module';

@Module({
  providers: [AtributosUserService, FunctionsService],
  exports: [AtributosUserService],
  imports: [MongooseModule.forFeature([{ name: 'AtributosUser', schema: AtributosUser }]), PrestadoresServiceModule],
})
export class AtributosUserModule {}
