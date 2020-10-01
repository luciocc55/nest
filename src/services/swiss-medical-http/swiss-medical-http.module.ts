import { SwissMedicalHttpService } from './swiss-medical-http.service';
import { Module, HttpModule } from '@nestjs/common';
import { FunctionsService } from '../functions';
import { ErroresModule } from '../errores/errores.module';

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [SwissMedicalHttpService, FunctionsService],
  exports: [SwissMedicalHttpService],
})
export class SwissMedicalHttpModule {}
