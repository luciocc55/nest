import { Module } from '@nestjs/common';
import { AuthModule } from 'src/services/auth/auth.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { PrestadoresServiceModule } from 'src/services/prestadores/prestadores.module';
import { PrestadoresController } from './prestadores.controller';

@Module({
  controllers: [PrestadoresController],
  imports: [PrestadoresServiceModule, LoggerModule, AuthModule],
})
export class PrestadoresModule {}
