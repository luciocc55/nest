import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoggerService } from "src/services/logger/logger.service";
import { AuthService } from "src/services/auth/auth.service";
export interface Response<T> {
  data: T;
}
@Injectable()
export class LoggingInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(
    private logService: LoggerService,
    private authService: AuthService
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<Response<T>>> {
    const contexto = context.getArgs();
    // tslint:disable-next-line: one-variable-per-declaration
    const user = await this.authService.decode(
      contexto[0].headers.authorization
    );
    const method = contexto[0].method;
    const url = contexto[0].url;
    let body = "";
    if (!url.includes("/orono/usuarios/")) {
      body = JSON.stringify(contexto[0].body);
    }
    const params = JSON.stringify(contexto[0].params);
    const query = JSON.stringify(contexto[0].query);
    const ip = contexto[0].header("x-forwarded-for") || contexto[0].ip;
    const client = contexto[0].header("user-agent");
    const log = {
      method,
      url,
      params,
      query,
      body,
      ip,
      user: user["user"],
      client,
    };
    const logRegistro = await this.logService.create(log);
    const request = context.switchToHttp().getRequest();
    request.params.IdTransaccion = logRegistro['_id']
    return next.handle().pipe(
      tap(
        (data) => {
          this.logService.writeResponse(
            JSON.stringify(data),
            logRegistro["_id"]
          );
        },
        (err) => {
          this.logService.writeResponse(
            JSON.stringify(err),
            logRegistro["_id"]
          );
        }
      )
    );
  }
}
