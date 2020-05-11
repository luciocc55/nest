import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FunctionsService } from 'src/services/functions';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { Practicas } from 'src/schemas/practicas.schema';
import { MasterPracticas } from 'src/schemas/master-practicas.schema';
import { PracticasController } from './practicas.controller';
import { PracticasService } from './practicas.service';

@Module({
  controllers: [PracticasController],
  providers: [PracticasService, FunctionsService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Practicas', schema: Practicas },
    ]),
    MongooseModule.forFeature([
      {
        name: 'MasterPracticas',
        schema: MasterPracticas,
      },
    ]),
    AuthModule,
    LoggerModule,
  ],
  exports: [PracticasService],
})
export class PracticasModule {}
