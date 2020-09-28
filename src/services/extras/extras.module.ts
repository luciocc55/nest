import { ExtrasService } from './extras.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TiposExtras } from 'src/schemas/tiposExtras.schema';
import { Module } from '@nestjs/common';

@Module({
  providers: [ExtrasService],
  exports: [ExtrasService],
  imports: [MongooseModule.forFeature([{ name: 'TiposExtras', schema: TiposExtras }])],
})
export class ExtrasModule {}
