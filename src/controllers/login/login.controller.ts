import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginUsers } from 'src/validators/users/loginUsers.validator';

@Controller('')
export class LoginController {
  constructor(private authService: AuthService) {}
  @ApiTags('Logueo basico que permite la autentificacion')
  @Post('autentificacion')
  async login(@Body() loginUser: LoginUsers) {
    return this.authService.login(loginUser);
  }
}
