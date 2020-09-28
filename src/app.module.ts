import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginModule } from './controllers/login/login.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './services/tasks/tasks.module';
import { PermissionsFrontServiceModule } from './services/permission-front-service/permission-front-service.module';
import { UsersServiceModule } from './services/users/users.module';
import { PermissionsFrontModule } from './controllers/permission-front/permission-front.module';
import { UsersModule } from './controllers/users/users.module';
import { RolesModule } from './controllers/roles/roles.module';
import { FederadaHttpModule } from './services/federada-http/federada-http.module';
import { AtributosUserModule } from './services/atributos-user/atributos-user.module';
import environment from './env';
import { AtributosServiceModule } from './services/atributos/atributos.module';
import { AtributosModule } from './controllers/atributos/atributos.module';
import { PermisosModule } from './controllers/permission/permisos.module';
import { PrestadoresModule } from './controllers/prestadores/prestadores.module';
import { PrestadoresServiceModule } from './services/prestadores/prestadores.module';
import { ElegibilidadModule } from './controllers/elegibilidad/elegibilidad.module';
import { AtributosEstaticosModule } from './services/atributos-estaticos/atributos-estaticos.module';
import { OrigenesContModule } from './controllers/origenes-cont/origenes-cont.module';
import { SwissMedicalHttpModule } from './services/swiss-medical-http/swiss-medical-http.module';
import { EsencialHttpModule } from './services/esencial-http/esencial-http.module';
import { AmrHttpModule } from './services/amr-http/amr-http.module';
import { IaposHttpModule } from './services/iapos-http/iapos-http.module';
import { RediHttpModule } from './services/redi-http/redi-http.module';
import { AutorizacionModule } from './controllers/autorizacion/autorizacion.module';
import { ExtrasModule } from './services/extras/extras.module';
import { SinonimosModule } from './services/sinonimos/sinonimos.module';
import { ExtrasControllerModule } from './controllers/extras-controller/extras-controller.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb://' + environment.mongo + '/' + environment.dataBase + '?authSource=admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: environment.mongoUser,
        pass: environment.mongoPassword,
      },
    ),
    LoginModule,
    UsersModule,
    UsersServiceModule,
    RolesModule,
    TasksModule,
    PermissionsFrontModule,
    PermissionsFrontServiceModule,
    FederadaHttpModule,
    AtributosUserModule,
    AtributosModule,
    AtributosServiceModule,
    PermisosModule,
    PrestadoresModule,
    PrestadoresServiceModule,
    ElegibilidadModule,
    AtributosEstaticosModule,
    OrigenesContModule,
    SwissMedicalHttpModule,
    EsencialHttpModule,
    IaposHttpModule,
    AmrHttpModule,
    RediHttpModule,
    AutorizacionModule,
    ExtrasModule,
    SinonimosModule,
    ExtrasControllerModule,
  ],
  controllers: [],
})
export class AppModule {}
