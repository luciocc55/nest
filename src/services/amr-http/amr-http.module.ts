import { Module } from '@nestjs/common';
import { AmrHttpService } from './amr-http.service';

@Module({
  providers: [AmrHttpService]
})
export class AmrHttpModule {}
