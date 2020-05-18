import { SwissMedicalHttpService } from './swiss-medical-http.service';
import { Module, HttpModule } from '@nestjs/common';
import { FunctionsService } from '../functions';

@Module({
  imports: [HttpModule],
  providers: [SwissMedicalHttpService, FunctionsService],
  exports: [SwissMedicalHttpService],
})
export class SwissMedicalHttpModule {}
