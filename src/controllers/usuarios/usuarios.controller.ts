import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
import { UsuariosService } from 'src/services/usuarios/usuarios.service';
import { Usuarios } from 'src/interfaces/usuarios-interfaz';
import { RolesGuard } from 'src/guards/role/role.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @ApiTags('Crea un Usuario con el rol de Normal')
  @UseGuards(RolesGuard)
  @Post('create')
  async create(@Body() createdUsuario: CreateUsuarios): Promise<Usuarios> {
    return await this.usuariosService.createNormal(createdUsuario);
  }
}
