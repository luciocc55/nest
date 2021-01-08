import { HttpModule, Module } from '@nestjs/common';
import { ErroresModule } from '../errores/errores.module';
import { TraditumHttpService } from './traditum-http.service';

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [TraditumHttpService],
  exports: [TraditumHttpService],
})
export class TraditumHttpModule {}
