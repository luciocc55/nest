
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
    UsersServiceModule,
  ],
})
export class AutorizacionModule {}
