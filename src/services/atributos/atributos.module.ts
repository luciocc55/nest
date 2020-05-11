import { Module } from '@nestjs/common';
import { AtributosService } from './atributos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FunctionsService } from '../functions';
import { Atributos } from 'src/schemas/atributos.schema';

@Module({
  providers: [AtributosService, FunctionsService],
  exports: [AtributosService],
  imports: [MongooseModule.forFeature([{ name: 'Atributos', schema: Atributos }])],
})
export class AtributosServiceModule {}
