import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(NotFoundException)
export class ExceptionNotFoundFilter extends BaseExceptionFilter  {
  catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.NOT_FOUND) {
        const message = {error: 'Recurso no encontrado'};
        return response.status(status).send(message);
    }
  }
}
