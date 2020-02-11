import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
import { ApiTags } from '@nestjs/swagger';

@Controller('login')
export class LoginController {
    constructor(private authService: AuthService) {}
    @ApiTags('Devuelve el token de acceso al ingresar password y usuario')
    @Post()
    async login(@Body() createdUsuario: CreateUsuarios) {
      return this.authService.login(createdUsuario);
    }
}
