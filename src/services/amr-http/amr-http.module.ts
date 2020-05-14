import { AmrHttpService } from './amr-http.service';
import { Module, HttpModule } from '@nestjs/common';
import { FunctionsService } from '../functions';

@Module({
  imports: [HttpModule],
  providers: [AmrHttpService, FunctionsService],
  exports: [AmrHttpService],
})
export class AmrHttpModule {}
