import { Module, HttpModule } from '@nestjs/common';
import { RediHttpService } from './redi-http.service';

@Module({
  imports: [HttpModule],
  providers: [RediHttpService],
  exports: [RediHttpService],
})
export class RediHttpModule {}
