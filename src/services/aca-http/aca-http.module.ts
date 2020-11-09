import { AcaHttpService } from './aca-http.service';
import { Module, HttpModule } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [AcaHttpService],
  exports: [AcaHttpService],
})
export class AcaHttpModule {}
