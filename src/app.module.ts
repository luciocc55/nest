import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginModule } from './controllers/login/login.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './services/tasks/tasks.module';
import { UsersServiceModule } from './services/users/users.module';
import { PermissionsFrontModule } from './controllers/permission-front/permission-front.module';
import { UsersModule } from './controllers/users/users.module';
import { RolesModule } from './controllers/roles/roles.module';
import { AtributosUserModule } from './services/atributos-user/atributos-user.module';
import environment from './env';
import { AtributosModule } from './controllers/atributos/atributos.module';
import { PermisosModule } from './controllers/permission/permisos.module';
import { PrestadoresModule } from './controllers/prestadores/prestadores.module';
import { ElegibilidadModule } from './controllers/elegibilidad/elegibilidad.module';
import { AtributosEstaticosModule } from './services/atributos-estaticos/atributos-estaticos.module';
import { OrigenesContModule } from './controllers/origenes-cont/origenes-cont.module';
import { AutorizacionModule } from './controllers/autorizacion/autorizacion.module';
import { ExtrasModule } from './services/extras/extras.module';
import { SinonimosModule } from './services/sinonimos/sinonimos.module';
import { ExtrasControllerModule } from './controllers/extras-controller/extras-controller.module';
import { ErroresModule } from './services/errores/errores.module';

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
    AtributosUserModule,
    AtributosModule,
    PermisosModule,
    PrestadoresModule,
    ElegibilidadModule,
    AtributosEstaticosModule,
    OrigenesContModule,
    AutorizacionModule,
    ExtrasModule,
    SinonimosModule,
    ExtrasControllerModule,
    ErroresModule,
  ],
  controllers: [],
})
export class AppModule {}
