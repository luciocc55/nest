import { Controller, UseGuards, UseInterceptors, Post, Body, Get, Param } from '@nestjs/common';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import {ApiTags} from '@nestjs/swagger';
import { Search } from 'src/validators/search.validator';
import { RolesService } from 'src/services/roles/roles.service';
import { RolesGuard } from 'src/guards/role/role.guard';
import { CreateRole } from 'src/validators/users/createRole.validator';
import { Token } from 'src/decorators/token.decorator';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('roles')
@UseGuards(RolesGuard)
export class RolesController {
    constructor(private roleService: RolesService, private authService: AuthService) {}
    @ApiTags('Lista los roles existentes')
    @Post('list')
    async listsinAdmin(@Body() search: Search, @Token() token: string): Promise<any> {
      const priority = await this.authService.getPriority(token);
      return await this.roleService.findAllPriority(search.search, priority);
    }
    @ApiTags('Devuelve detalles de un rol')
    @Get('/:id')
    async getRole(@Param() params, @Token() token: string): Promise<any> {
      const priority = await this.authService.getPriority(token);
      return await this.roleService.findIdPriority(params.id, priority);
    }
    @ApiTags('Crea un nuevo Rol')
    @UseInterceptors(LoggingInterceptor)
    @Post('create')
    async createRole(@Body() role: CreateRole, @Token() token: string): Promise<any> {
      const priority = await this.authService.getPriority(token);
      return await this.roleService.createRolePriority(role, priority);
    }
    @ApiTags('Modifica los datos de un rol')
    @UseInterceptors(LoggingInterceptor)
    @Post('update/:id')
    async updateRole(@Param() params, @Body() Role: CreateRole, @Token() token: string): Promise<any> {
      const priority = await this.authService.getPriority(token);
      return await this.roleService.updateRolePriority(params.id, Role, priority);
    }
}
