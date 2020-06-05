import { ElegibilidadController } from './elegibilidad.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { AtributosEstaticosModule } from 'src/services/atributos-estaticos/atributos-estaticos.module';
import { FunctionsService } from 'src/services/functions';
import { OrigenesModule } from 'src/services/origenes/origenes.module';
import { AtributosUserModule } from 'src/services/atributos-user/atributos-user.module';
import { PrestadoresServiceModule } from 'src/services/prestadores/prestadores.module';
import { UsersServiceModule } from 'src/services/users/users.module';
import { FederadaHttpModule } from 'src/services/federada-http/federada-http.module';
import { EsencialHttpModule } from 'src/services/esencial-http/esencial-http.module';
import { IaposHttpModule } from 'src/services/iapos-http/iapos-http.module';
import { SwissMedicalHttpModule } from 'src/services/swiss-medical-http/swiss-medical-http.module';
import { AmrHttpModule } from 'src/services/amr-http/amr-http.module';
import { RediHttpModule } from 'src/services/redi-http/redi-http.module';

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
    EsencialHttpModule,
    IaposHttpModule,
    SwissMedicalHttpModule,
    AmrHttpModule,
    RediHttpModule,
  ],
})
export class ElegibilidadModule {}
