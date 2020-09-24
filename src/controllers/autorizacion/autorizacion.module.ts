
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { FunctionsService } from 'src/services/functions';
import { AutorizacionController } from './autorizacion.controller';

@Module({
  controllers: [AutorizacionController],
  providers: [FunctionsService],
  imports: [
    LoggerModule,
    AuthModule,
  ],
})
export class AutorizacionModule {}
