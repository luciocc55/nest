import { AcaHttpService } from './aca-http.service';
import { Module, HttpModule } from '@nestjs/common';
import { FunctionsService } from '../functions';
import { ErroresModule } from '../errores/errores.module';

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [AcaHttpService, FunctionsService],
  exports: [AcaHttpService],
})
export class AcaHttpModule {}
