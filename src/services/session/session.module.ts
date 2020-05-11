import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionService } from './session.service';
import { Session } from 'src/schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: Session }]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
