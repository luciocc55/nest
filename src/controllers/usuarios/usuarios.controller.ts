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

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}
  @UseGuards(RolesGuard)
  @Post('create')
  async create(@Body() createdUsuario: CreateUsuarios): Promise<Usuarios> {
    return await this.usuariosService.createNormal(createdUsuario);
  }
}
