
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { FunctionsService } from 'src/services/functions';
import { AutorizacionController } from './autorizacion.controller';
import { SwissMedicalHttpModule } from 'src/services/swiss-medical-http/swiss-medical-http.module';
import { OrigenesModule } from 'src/services/origenes/origenes.module';
import { AtributosEstaticosModule } from 'src/services/atributos-estaticos/atributos-estaticos.module';
import { AtributosUserModule } from 'src/services/atributos-user/atributos-user.module';
import { UsersServiceModule } from 'src/services/users/users.module';
import { SinonimosModule } from 'src/services/sinonimos/sinonimos.module';
import { EsencialHttpModule } from 'src/services/esencial-http/esencial-http.module';
import { ActiviaHttpModule } from 'src/services/activia-http/activia-http.module';
import { AcindarttpModule } from 'src/services/acindar-http/acindar-http.module';
import { AmrHttpModule } from 'src/services/amr-http/amr-http.module';
import { AcaHttpModule } from 'src/services/aca-http/aca-http.module';
import { TraditumHttpModule } from 'src/services/traditum-http/traditum-http.module';

@Module({
  controllers: [AutorizacionController],
  providers: [FunctionsService],
  imports: [
    LoggerModule,
    AuthModule,
    SwissMedicalHttpModule,
    OrigenesModule,
    AtributosEstaticosModule,
    AtributosUserModule,
    ActiviaHttpModule,
    UsersServiceModule,
    SinonimosModule,
    EsencialHttpModule,
    AcindarttpModule,
    AmrHttpModule,
    AcaHttpModule,
    TraditumHttpModule
  ],
})
export class AutorizacionModule {}
