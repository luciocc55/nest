import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuarios } from 'src/interfaces/usuarios-interfaz';
import { CreateUsuarios } from 'src/validators/createUsuarios.validator';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel('Usuarios') private readonly usuarioModel: Model<any>,
    private roleService: RolesService,
  ) {}

  async createNormal(usuario: CreateUsuarios): Promise<Usuarios> {
    const exist = await this.findAny(usuario.user, usuario.email);
    const role = await this.roleService.findNormal();
    if (!exist) {
      usuario['role'] = role._id;
      const createdUsuario = new this.usuarioModel(usuario);
      return await createdUsuario.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este usuario o email ya estan registrados',
        },
        400,
      );
    }
  }
  async findLogin(user, password): Promise<Usuarios> {
    return await this.usuarioModel.findOne({ user }, { password }).exec();
  }
  async findAny(user, email): Promise<Usuarios> {
    return await this.usuarioModel
      .findOne({
        $or: [{ user }, { email }],
      })
      .exec();
  }
  async findAll(): Promise<Usuarios[]> {
    return await this.usuarioModel.find().exec();
  }
  async findUsuario(user): Promise<Usuarios> {
    return await this.usuarioModel.findOne({ user }).exec();
  }
}
