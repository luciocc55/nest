import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
import { UsuariosService } from '../usuarios/usuarios.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private usuarioService: UsuariosService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const result = false;
    if (result) {
      return { user: username, estado: null };
    } else {
      if (!result) {
        return { user: null, estado: false };
      } else {
        return { user: null, estado: true };
      }
    }
  }
  async decode(token) {
    try {
      const tokenRaw = token.split('Bearer ')[1];
      return this.jwtService.decode(tokenRaw);
    } catch (error) {
      return null;
    }
  }
  async validatePermission(token, endpoint) {
    try {
      const decoded = await this.decode(token);
      const rolePermissions = await this.usuarioService.findUsuario(
        decoded['user']
      );
      if (rolePermissions) {
        if (rolePermissions['role'].descripcion === 'Admin') {
          return true;
        } else {
          return rolePermissions['role'].permissions.some(
            data => data.endpoint === endpoint,
          );
        }
      } else {
        return false;
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Usted no tiene autentificación permitida',
        },
        403,
      );
    }
  }
  async login(user: CreateUsuarios) {
    const validateLogin = await this.validateUser(user.user, user.password);
    if (validateLogin) {
      const payload = {
        user: user.user,
      };
      return {
        CallCenterUnifToken: this.jwtService.sign(payload)
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
