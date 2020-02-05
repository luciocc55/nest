import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
import { UsuariosService } from 'src/services/usuarios/usuarios.service';
import { Usuarios } from 'src/interfaces/usuarios-interfaz';

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}
  @Post('create')
  async create(@Body() createdUsuario: CreateUsuarios): Promise<Usuarios> {
    return await this.usuariosService.createNormal(createdUsuario);
  }
}
