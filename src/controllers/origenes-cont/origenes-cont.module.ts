import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { RolesServiceModule } from 'src/services/roles/roles.module';
import { OrigenesContController } from './origenes-cont.controller';
import { OrigenesModule } from 'src/services/origenes/origenes.module';

@Module({
  controllers: [OrigenesContController],
  imports: [
    AuthModule,
    LoggerModule,
    RolesServiceModule,
    OrigenesModule,
  ],
})
export class OrigenesContModule {}
