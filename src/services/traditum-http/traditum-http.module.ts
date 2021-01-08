import { Module } from '@nestjs/common';
import { TraditumHttpService } from './traditum-http.service';

@Module({
  providers: [TraditumHttpService],
  exports: [TraditumHttpService],
})
export class TraditumHttpModule {}
