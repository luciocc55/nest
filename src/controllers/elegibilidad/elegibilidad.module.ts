import { ElegibilidadController } from './elegibilidad.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { AtributosServiceModule } from 'src/services/atributos/atributos.module';
import { AtributosEstaticosModule } from 'src/services/atributos-estaticos/atributos-estaticos.module';
import { FunctionsService } from 'src/services/functions';
import { OrigenesModule } from 'src/services/origenes/origenes.module';
import { AtributosUserModule } from 'src/services/atributos-user/atributos-user.module';
import { PrestadoresServiceModule } from 'src/services/prestadores/prestadores.module';
import { UsersServiceModule } from 'src/services/users/users.module';
import { FederadaHttpModule } from 'src/services/federada-http/federada-http.module';

@Module({
  controllers: [ElegibilidadController],
  providers: [FunctionsService],
  imports: [
    LoggerModule,
    AuthModule,
    AtributosEstaticosModule,
    OrigenesModule,
    AtributosUserModule,
    PrestadoresServiceModule,
    UsersServiceModule,
    FederadaHttpModule,
  ],
})
export class ElegibilidadModule {}
