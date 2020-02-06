import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosServiceModule } from 'src/services/usuarios/usuarios.module';
import { AuthModule } from 'src/services/auth/auth.module';

@Module({
  controllers: [UsuariosController],
  imports: [UsuariosServiceModule, AuthModule],
})
export class UsuariosModule {}
