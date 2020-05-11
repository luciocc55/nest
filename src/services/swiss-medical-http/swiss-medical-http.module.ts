import { SwissMedicalHttpService } from './swiss-medical-http.service';
import { Module, HttpModule } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [SwissMedicalHttpService],
  exports: [SwissMedicalHttpService],
})
export class SwissMedicalHttpModule {}
