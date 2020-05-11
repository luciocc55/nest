import { AtributosEstaticosService } from './atributos-estaticos.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AtributosEstaticos } from 'src/schemas/atributos-estaticos.schema';
import { FunctionsService } from '../functions';

@Module({
  providers: [AtributosEstaticosService, FunctionsService],
  imports: [MongooseModule.forFeature([{ name: 'AtributosEstaticos', schema: AtributosEstaticos }])],
  exports: [AtributosEstaticosService],
})
export class AtributosEstaticosModule {}
