import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoggerService } from 'src/services/logger/logger.service';

export interface Response<T> {
  data: T;
}
@Injectable()
export class LoggingInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private logService: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    //const contexto = context.getArgs();
    // tslint:disable-next-line: one-variable-per-declaration
    //const usuario = this.jwtService.decode(contexto[0].headers.authorization.split('Bearer ')[1])
    //this.logService.create(contexto)
    return next.handle().pipe(tap((data => console.log())))
  }
}