import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrigenesService } from 'src/services/origenes/origenes.service';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/role/role.guard';

@Controller('origenes')
@UseGuards(RolesGuard)
export class OrigenesContController {
    constructor(private origenesService: OrigenesService) {}
    @ApiTags('Lista los origenes existentes')
    @Get('list')
    async all(): Promise<any> {
      return await this.origenesService.findAll();
    }
    @ApiTags('Lista los servicios y sus atributos asociados')
    @Get('services')
    async services(): Promise<any> {
      return await this.origenesService.findAllPopulated();
    }
}
