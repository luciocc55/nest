import { AmrHttpService } from './amr-http.service';
import { Module, HttpModule } from '@nestjs/common';
import { FunctionsService } from '../functions';
import { ErroresModule } from '../errores/errores.module';

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [AmrHttpService, FunctionsService],
  exports: [AmrHttpService],
})
export class AmrHttpModule {}
