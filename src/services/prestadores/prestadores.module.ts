import { PrestadoresService } from './prestadores.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FunctionsService } from '../functions';
import { AtributosPrestador } from 'src/schemas/prestadores-attributes.schema';
import { Prestadores } from 'src/schemas/prestadores.schema';

@Module({
  providers: [PrestadoresService, FunctionsService],
  exports: [PrestadoresService],
  imports: [
    MongooseModule.forFeature([{ name: 'Prestadores', schema: Prestadores }]),
    MongooseModule.forFeature([
      { name: 'AtributosPrestador', schema: AtributosPrestador },
    ]),
  ],
})
export class PrestadoresServiceModule {}
