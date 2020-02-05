import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosServiceModule } from 'src/services/usuarios/usuarios.module';

@Module({
  controllers: [UsuariosController],
  imports: [UsuariosServiceModule],
})
export class UsuariosModule {}
