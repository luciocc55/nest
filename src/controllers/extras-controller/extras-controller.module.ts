import { ExtrasControllerController } from './extras-controller.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { PermissionsModule } from 'src/services/permissions/permissions.module';
import { ExtrasModule } from 'src/services/extras/extras.module';
import { SinonimosModule } from 'src/services/sinonimos/sinonimos.module';

@Module({
  controllers: [ExtrasControllerController],
  imports: [
    PermissionsModule,
    AuthModule,
    LoggerModule,
    ExtrasModule,
    SinonimosModule,
  ],
})
export class ExtrasControllerModule {}
