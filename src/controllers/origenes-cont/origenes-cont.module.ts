import { Module } from '@nestjs/common';
import { OrigenesContController } from './origenes-cont.controller';
import { OrigenesModule } from 'src/services/origenes/origenes.module';

@Module({
  controllers: [OrigenesContController],
  imports: [OrigenesModule],
})
export class OrigenesContModule {}
