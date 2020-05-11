import { Module } from '@nestjs/common';
import { OrigenesService } from './origenes.service';
import { Origenes } from 'src/schemas/origenes.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  providers: [OrigenesService],
  imports: [MongooseModule.forFeature([{ name: 'Origenes', schema: Origenes }])],
  exports: [OrigenesService],
})
export class OrigenesModule {}
