import { Module, HttpModule } from '@nestjs/common';
import { ActiviaHttpService } from './activia-http.service';

@Module({
  imports: [HttpModule],
  providers: [ActiviaHttpService],
  exports: [ActiviaHttpService],
})
export class ActiviaHttpModule {}
