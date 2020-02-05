import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';

@Controller('login')
export class LoginController {
    constructor(private authService: AuthService) {}
    @Post()
    async login(@Body() createdUsuario: CreateUsuarios) {
      return this.authService.login(createdUsuario);
    }
}
