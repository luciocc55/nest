import { SinonimosService } from './sinonimos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Sinonimos } from 'src/schemas/sinonimos.schema';

@Module({
  providers: [SinonimosService],
  exports: [SinonimosService],
  imports: [MongooseModule.forFeature([{ name: 'Sinonimos', schema: Sinonimos }])],
})
export class SinonimosModule {}
