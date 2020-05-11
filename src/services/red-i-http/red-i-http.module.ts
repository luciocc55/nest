import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/common';
import { RedIService } from './red-i-http.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    HttpModule,
    SessionModule,
  ],
  providers: [RedIService],
  exports: [RedIService],
})
export class RedIHttpModule {}
