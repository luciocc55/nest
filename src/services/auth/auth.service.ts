import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const result = false;
    if (result) {
      return { username, estado: null };
    } else {
      if (!result) {
        return { user: null, estado: false };
      } else {
        return { user: null, estado: true };
      }
    }

  }

  async login(user: CreateUsuarios) {
    const validateLogin = await this.validateUser(user.email, user.password);
    if (validateLogin) {
      const payload = {
        username: user.email,
      };
      return {
        CallCenterUnifToken: this.jwtService.sign(payload),
      };
    } else {
      if (validateLogin.estado === true) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Contraseña Incorrecta!',
          },
          400,
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Este Username no Existe!',
          },
          400,
        );
      }
    }
  }
}
