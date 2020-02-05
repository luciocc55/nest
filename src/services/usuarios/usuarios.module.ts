import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuarios } from 'src/schemas/usuarios.schema';
import { RolesModule } from '../roles/roles.module';

@Module({
  providers: [UsuariosService],
  exports: [UsuariosService],
  imports: [MongooseModule.forFeature([{ name: 'Usuarios', schema: Usuarios }]), RolesModule],
})
export class UsuariosServiceModule {}
