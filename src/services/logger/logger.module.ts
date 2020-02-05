import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from 'src/schemas/logger.schema';
import { LoggerService } from './logger.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [
  MongooseModule.forFeature([{ name: 'Logger', schema: Logger }]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60h' },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
