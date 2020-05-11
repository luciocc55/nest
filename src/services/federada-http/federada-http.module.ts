import { Module, HttpModule } from '@nestjs/common';
import { FederadaHttpService } from './federada-http.service';

@Module({
  imports: [HttpModule],
  providers: [FederadaHttpService],
  exports: [FederadaHttpService],
})
export class FederadaHttpModule {}
