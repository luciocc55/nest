import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
  console.log(routes)
  await app.listen(4300);
}
bootstrap()
