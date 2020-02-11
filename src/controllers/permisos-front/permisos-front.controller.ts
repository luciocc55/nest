import { Controller, Post, Body } from '@nestjs/common';
import { PermisosFrontServiceService } from 'src/services/permisos-front-service/permisos-front-service.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePermissions } from 'src/validators/createPermissions.validator';

@Controller('permisosFront')
export class PermisosFrontController {
    constructor(private usuariosService: PermisosFrontServiceService) {}
    @ApiTags('Crea permisos del front end')
    @Post('create')
    async create(@Body() createdPermissionFront: CreatePermissions): Promise<any> {
      return await this.usuariosService.createPermission(createdPermissionFront);
    }
}
