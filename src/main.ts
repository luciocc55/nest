import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import environment from 'src/env';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('autorizador');
  app.enableCors();
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const options = new DocumentBuilder()
  .setTitle('Autorizador')
  .setDescription('Autorizador')
  .setVersion('1.0')
  .addTag('Autorizador')
  .build();
  const document = SwaggerModule.createDocument(app, options);
  const routes = document.paths;
  const keys = Object.keys(routes);
  const permissions = [];
  const orignesPermissions = [];
  keys.forEach(element => {
    const keysElement = Object.keys(routes[element]);
    keysElement.forEach(element2 => {
      const description = routes[element][element2]['tags'].toString().split(',')
      if (description.length > 1) {
        description.slice(1).forEach(atributosElement => {
          const atributos = atributosElement.split(':')
          orignesPermissions.push({path: element + ':' + element2, origen: atributos[0] , atributos: atributos.slice(1) });
        });
      }
      permissions.push({path: element + ':' + element2, description: description[0]});
    });
  });
  environment.orignesPermissions = orignesPermissions;
  environment.permissions = permissions;
  await app.listen(8060);
}
bootstrap();
