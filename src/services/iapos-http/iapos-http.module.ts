import { Module, HttpModule } from '@nestjs/common';
import { IaposHttpService } from './iapos-http.service';

@Module({
  imports: [HttpModule],
  providers: [IaposHttpService],
  exports: [IaposHttpService],
})
export class IaposHttpModule {}
