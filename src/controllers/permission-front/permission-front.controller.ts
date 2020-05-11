import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionsFrontServiceService } from 'src/services/permission-front-service/permission-front-service.service';
import { CreatePermissions } from 'src/validators/users/createPermissions.validator';

@Controller('permissionsFront')
export class PermissionsFrontController {
    constructor(private usuariosService: PermissionsFrontServiceService) {}
    @ApiTags('Crea permisos del front end')
    @Post('create')
    async create(@Body() createdPermissionFront: CreatePermissions): Promise<any> {
      return await this.usuariosService.createPermission(createdPermissionFront);
    }
}
