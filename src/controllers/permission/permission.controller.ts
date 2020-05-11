import { Controller, UseGuards, UseInterceptors, Post, Body, Get } from '@nestjs/common';
import { PermissionsService } from 'src/services/permissions/permissions.service';
import {ApiTags} from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/role/role.guard';
import { Search } from 'src/validators/search.validator';
@Controller('permisos')
@UseGuards(RolesGuard)
export class PermissionsController {
    constructor(private permissionService: PermissionsService) {}
    @ApiTags('Lista los permisos existentes')
    @Post('list')
    async create(@Body() search: Search): Promise<any> {
      return await this.permissionService.findAll(search.search);
    }
}
