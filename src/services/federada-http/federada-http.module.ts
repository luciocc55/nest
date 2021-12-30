import { Module, HttpModule } from '@nestjs/common';
import { ErroresModule } from '../errores/errores.module';
import { FunctionsService } from '../functions';
import { FederadaHttpService } from './federada-http.service';

@Module({
  imports: [HttpModule,ErroresModule],
  providers: [FederadaHttpService, FunctionsService],
  exports: [FederadaHttpService],
})
export class FederadaHttpModule {}
