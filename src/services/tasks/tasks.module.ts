import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PermissionsModule } from '../permissions/permissions.module';

import { BullModule } from '@nestjs/bull';
import environment from 'src/env';
import { RolesServiceModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { SessionModule } from '../session/session.module';
import { UsersServiceModule } from '../users/users.module';
import { ConsumerService } from '../consummer/consummer.service';
import { RedIHttpModule } from '../red-i-http/red-i-http.module';
import { OrigenesModule } from '../origenes/origenes.module';
import { AtributosEstaticosModule } from '../atributos-estaticos/atributos-estaticos.module';
import { SinonimosModule } from '../sinonimos/sinonimos.module';
import { ExtrasModule } from '../extras/extras.module';
import { ErroresModule } from '../errores/errores.module';

@Module({
  providers: [TasksService, ConsumerService],
  exports: [TasksService],
  imports: [
    SessionModule,
    JwtModule.register({}),
    PermissionsModule,
    RolesServiceModule,
    UsersServiceModule,
    SinonimosModule,
    ExtrasModule,
    RedIHttpModule,
    ErroresModule,
    OrigenesModule,
    AtributosEstaticosModule,
    BullModule.registerQueue({
      name: 'AutorizadorQueue',
      redis: {
        host: environment.redis,
        port: 6379,
      },
    }),
  ],
})
export class TasksModule {}
