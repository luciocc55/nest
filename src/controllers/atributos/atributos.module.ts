import { Module } from '@nestjs/common';
import { AtributosController } from './atributos.controller';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { RolesServiceModule } from 'src/services/roles/roles.module';
import { AtributosServiceModule } from 'src/services/atributos/atributos.module';
import { AtributosEstaticosModule } from 'src/services/atributos-estaticos/atributos-estaticos.module';

@Module({
  controllers: [AtributosController],
  imports: [
    AuthModule,
    LoggerModule,
    RolesServiceModule,
    AtributosServiceModule,
    AtributosEstaticosModule,
  ],
})
export class AtributosModule {}
