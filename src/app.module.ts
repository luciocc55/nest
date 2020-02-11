import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginModule } from './controllers/login/login.module';
import { LoggingInterceptor } from './interceptors/logger/logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './services/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { UsuariosModule } from './controllers/usuarios/usuarios.module';
import { UsuariosServiceModule } from './services/usuarios/usuarios.module';
import { RolesModule } from './services/roles/roles.module';
import { TasksModule } from './services/tasks/tasks.module';
import { PermisosFrontModule } from './controllers/permisos-front/permisos-front.module';
import { PermisosFrontServiceModule } from './services/permisos-front-service/permisos-front-service.module';

@Module({
  imports: [
    LoggerModule,
    BullModule.registerQueue({
      name: 'NestQueue',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb://mongo:27017/obras_sociales?authSource=admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: 'root',
        pass: '515149lycc',
      },
    ),
    LoginModule,
    UsuariosModule,
    UsuariosServiceModule,
    RolesModule,
    TasksModule,
    PermisosFrontModule,
    PermisosFrontServiceModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
