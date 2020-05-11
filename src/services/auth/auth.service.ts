import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUsers } from 'src/validators/users/loginUsers.validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UsersService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const result = await this.userService.findLogin(username, pass);
    if (result) {
      return result;
    } else {
      return null;
    }
  }
  getTokenRaw(token) {
    let raw;
    try {
      raw = token.split('Bearer ')[1];
    } catch (error) {
      raw = null;
    }
    return raw;
  }
  async decode(token) {
    try {
      const tokenRaw = this.getTokenRaw(token);
      return this.jwtService.decode(tokenRaw);
    } catch (error) {
      return null;
    }
  }
  async getPriority(token) {
    const decoded = await this.decode(token);
    const user = await this.userService.findUsuario(decoded['user']);
    return user.role.priority;
  }
  async getUser(token) {
    const decoded = await this.decode(token);
    const user = await this.userService.findUsuario(decoded['user']);
    return user._id;
  }
  async validatePermission(token, endpoint) {
    try {
      const verify = await this.jwtService.verify(this.getTokenRaw(token));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.name,
        },
        400,
      );
    }
    try {
      const decoded = await this.decode(token);
      const rolePermissions = await this.userService.findUsuario(
        decoded['user'],
      );
      if (rolePermissions) {
        if (rolePermissions.role.description === 'Admin') {
          if (rolePermissions.habilitado) {
            return true;
          } else {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: 'Este usuario se encuentra inhabilitado',
              },
              400,
            );
          }
        } else {
          return rolePermissions.role.permissions.some(
            (data) => data.endpoint === endpoint,
          );
        }
      } else {
        return false;
      }
    } catch (error) {
      let errorMsg = '';
      if (error.response.error) {
        errorMsg = error.response.error;
      } else {
        errorMsg = 'Usted no tiene autentificación permitida';
      }
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: errorMsg,
        },
        403,
      );
    }
  }
  async validateToken(token) {
    let tokenRaw = '';
    try {
      tokenRaw = token.split('Bearer ')[1];
    } catch (error) {
      this.permisos();
    }
    try {
      const x = this.jwtService.verify(tokenRaw);
    } catch (error) {
      this.permisos();
    }
    return true;
  }
  permisos() {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Usted no tiene permisos para esta operación',
      },
      403,
    );
  }
  async login(user: LoginUsers) {
    const validateLogin = await this.validateUser(user.user, user.password);
    if (validateLogin) {
      const payload = {
        user: validateLogin.user,
        name: validateLogin.name,
        lastName: validateLogin.lastName,
      };
      return {
        AutorizadorToken: this.jwtService.sign(payload),
      };
    }
  }
}
