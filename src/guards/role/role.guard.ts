import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = request.route.path;
    const method = Object.keys(request.route.methods)[0];
    const endpoint = route + ':' + method;
    const token = request.headers.authorization;
    const x = await this.authService.validatePermission(token, endpoint);
    if (x) {
      return true;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Usted no tiene permisos para esta operación',
        },
        403,
      );
    }
  }
}
