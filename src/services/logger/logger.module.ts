import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from 'src/schemas/logger.schema';
import { LoggerService } from './logger.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
  MongooseModule.forFeature([{ name: 'Logger', schema: Logger }]),
  AuthModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
