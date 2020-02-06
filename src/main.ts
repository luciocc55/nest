import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { environment } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
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
  keys.forEach(element => {
    const keysElement = Object.keys(routes[element]);
    keysElement.forEach(element2 => {
      permissions.push({path: element + ':' + element2});
    });
  });
  environment.permissions = permissions
  await app.listen(4300);
}
bootstrap();
