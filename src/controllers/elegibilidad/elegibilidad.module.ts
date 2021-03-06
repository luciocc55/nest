import { ElegibilidadController } from './elegibilidad.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { AtributosEstaticosModule } from 'src/services/atributos-estaticos/atributos-estaticos.module';
import { OrigenesModule } from 'src/services/origenes/origenes.module';
import { AtributosUserModule } from 'src/services/atributos-user/atributos-user.module';
import { UsersServiceModule } from 'src/services/users/users.module';
import { FederadaHttpModule } from 'src/services/federada-http/federada-http.module';
import { EsencialHttpModule } from 'src/services/esencial-http/esencial-http.module';
import { IaposHttpModule } from 'src/services/iapos-http/iapos-http.module';
import { SwissMedicalHttpModule } from 'src/services/swiss-medical-http/swiss-medical-http.module';
import { AmrHttpModule } from 'src/services/amr-http/amr-http.module';
import { RediHttpModule } from 'src/services/redi-http/redi-http.module';
import { AcaHttpModule } from 'src/services/aca-http/aca-http.module';
import { TraditumHttpModule } from 'src/services/traditum-http/traditum-http.module';
import { ActiviaHttpModule } from 'src/services/activia-http/activia-http.module';
import { AcindarttpModule } from 'src/services/acindar-http/acindar-http.module';

@Module({
  controllers: [ElegibilidadController],
  providers: [],
  imports: [
    LoggerModule,
    AuthModule,
    AtributosEstaticosModule,
    OrigenesModule,
    AtributosUserModule,
    UsersServiceModule,
    FederadaHttpModule,
    EsencialHttpModule,
    IaposHttpModule,
    SwissMedicalHttpModule,
    AmrHttpModule,
    RediHttpModule,
    AcaHttpModule,
    TraditumHttpModule,
    ActiviaHttpModule,
    AcindarttpModule,
  ],
})
export class ElegibilidadModule {}
