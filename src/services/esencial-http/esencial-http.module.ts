import { EsencialHttpService } from './esencial-http.service';
import { Module, HttpModule } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [EsencialHttpService],
  exports: [EsencialHttpService],
})
export class EsencialHttpModule {}
