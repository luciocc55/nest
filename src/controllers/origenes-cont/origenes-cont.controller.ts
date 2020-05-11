import { Controller, Get } from '@nestjs/common';
import { OrigenesService } from 'src/services/origenes/origenes.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('origenes')
export class OrigenesContController {
    constructor(private origenesService: OrigenesService) {}
    @ApiTags('Lista los origenes existentes')
    @Get('list')
    async all(): Promise<any> {
      return await this.origenesService.findAll();
    }
}
