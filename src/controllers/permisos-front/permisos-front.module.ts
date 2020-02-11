import { Module } from '@nestjs/common';
import { PermisosFrontController } from './permisos-front.controller';
import { PermisosFrontServiceModule } from 'src/services/permisos-front-service/permisos-front-service.module';

@Module({
  controllers: [PermisosFrontController],
  imports: [PermisosFrontServiceModule]
})
export class PermisosFrontModule {}
