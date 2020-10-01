import { ErroresService } from './errores.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErroresEstandarizados } from 'src/schemas/errores-estandarizados.schema';

@Module({
  providers: [ErroresService],
  imports: [MongooseModule.forFeature([{ name: 'ErroresEstandarizados', schema: ErroresEstandarizados }])],
  exports: [ErroresService],
})
export class ErroresModule {}
