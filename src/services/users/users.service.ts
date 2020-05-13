import { Model, Types } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/interfaces/users-interfaz';
import { FunctionsService } from '../functions';
const saltRounds = 10;
import bcrypt = require('bcrypt');
import { RolesService } from '../roles/roles.service';
import { CreateUsers } from 'src/validators/users/createUsers.validator';
import { CreateUsersAny } from 'src/validators/users/createUsersAny.validator';
import { AtributosUsuarios } from 'src/validators/atributos/atributos-usuarios.validator';

@Injectable()
export class UsersService {
  serializerBusquedas = {
    __v: 0,
    password: 0,
  };
  constructor(
    @InjectModel('Users') private readonly usuarioModel: Model<any>,
    @InjectModel('AtributosUser')
    private readonly usuariosAtributosModel: Model<any>,
    private functions: FunctionsService,
    private roleService: RolesService,
  ) {}

  private async returnUsuarioFormat(usuario) {
    usuario.name = this.functions.titleCase(usuario.name);
    usuario.lastName = this.functions.titleCase(usuario.lastName);
    usuario.password = await this.getPassword(usuario.password);
    return usuario;
  }
  private async getPassword(password) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const passwordCrypted = bcrypt.hash(password, salt);
    return passwordCrypted;
  }
  async findById(id) {
    return await this.usuarioModel
      .findById(id)
      .populate('role')
      .exec();
  }
  async findByIdPopulated(id, priority) {
    const usuario = await this.usuarioModel
      .findById(id)
      .populate('role')
      .populate({
        path: 'atributos',
        populate: {
          path: 'atributo',
        },
      })
      .populate('prestadores.prestador')
      .lean()
      .exec();
    if (usuario['role'].priority) {
      this.functions.errorPriority(usuario['role'].priority, priority);
    }
    return usuario;
  }
  async findByIdSinRole(id) {
    return await this.usuarioModel.findById(id).exec();
  }
  async updateUsuario(id, usuario, priority) {
    if (usuario.role) {
      const rol = await this.roleService.findId(usuario.role);
      this.functions.errorPriority(rol.priority, priority);
    }
    const user = await this.findByIdSinRole(id);
    const dicc = Object.keys(usuario);
    for (const element of dicc) {
      if (element === 'password') {
        if (user[element] !== usuario[element]) {
          const password = await this.getPassword(usuario[element]);
          user[element] = password;
        }
      } else {
        if (element === 'user' && user[element] !== usuario[element]) {
          const exist = await this.findUsuario(usuario[element]);
          if (!exist) {
            user[element] = usuario[element];
          } else {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: 'Este nombre de usuario ya esta registrado',
              },
              400,
            );
          }
        } else {
          if (element === 'atributos') {
            await this.usuariosAtributosModel.deleteMany({user: id});
            const creates = await this.createBulkAtributos(id, usuario[element]);
          } else {
            user[element] = usuario[element];
          }
        }
      }
    }
    return await user.save();
  }
  async createNormal(usuario: CreateUsers): Promise<Users> {
    const exist = await this.findUsuario(usuario.user);
    const role = await this.roleService.findNormal();
    if (!exist) {
      usuario = await this.returnUsuarioFormat(usuario);
      usuario['role'] = role._id;
      const createdUsuario = new this.usuarioModel(usuario);
      return await createdUsuario.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este nombre de usuario ya esta registrado',
        },
        400,
      );
    }
  }
  async createBulkAtributos(
    usuario,
    atributos: AtributosUsuarios[],
  ): Promise<number> {
    let creados = 0;
    for (const element of atributos) {
      try {
        const createdUsuarioAtributo = new this.usuariosAtributosModel({
          atributo: element._id,
          user: usuario,
          value: element.value,
          habilitado: element.habilitado,
        });
        await createdUsuarioAtributo.save();
        creados = creados + 1;
        // tslint:disable-next-line: no-empty
      } catch (error) {}
    }
    return creados;
  }
  async addAtributos(
    usuario,
    atributos: AtributosUsuarios[],
    priority,
  ): Promise<any> {
    const d = await this.createBulkAtributos(usuario, atributos);
    const usu = await this.findByIdPopulated(usuario, priority);
    return usu;
  }
  async createAny(usuario: CreateUsersAny, priority = 10): Promise<Users> {
    const exist = await this.findUsuario(usuario.user);
    if (!exist) {
      const rol = await this.roleService.findId(usuario.role);
      this.functions.errorPriority(rol.priority, priority);
      usuario = await this.returnUsuarioFormat(usuario);
      const createdUsuario = new this.usuarioModel(usuario);
      return await createdUsuario.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este nombre de usuario ya esta registrado',
        },
        400,
      );
    }
  }
  async busUsers(busqueda, cantidad = 50, priority = 10): Promise<any[]> {
    const regex = this.functions.returnRegex(busqueda);
    const [roles, rolesDesc] = await Promise.all([
      this.roleService.getRoles(priority),
      this.roleService.getRolesDescription(busqueda),
    ]);
    const [rolesIds, rolesIdsDesc] = await Promise.all([
      this.roleService.getRolesIds(roles),
      this.roleService.getRolesIds(rolesDesc),
    ]);
    return await this.usuarioModel
      .find(
        {
          $or: [
            {
              name: regex,
            },
            {
              lastName: regex,
            },
            {
              user: regex,
            },
            {
              $and: [
                { role: { $in: rolesIds } },
                { role: { $in: rolesIdsDesc } },
              ],
            },
          ],
        },
        this.serializerBusquedas,
      )
      .limit(cantidad)
      .populate({
        path: 'role',
        select: { description: 1, priority: 1 },
      })
      .populate({
        path: 'atributos',
        match: { habilitado: true },
        populate: {
          path: 'atributo',
        },
      })
      .populate('prestadores.prestador')
      .sort({ name: 1, lastName: 1 })
      .lean()
      .exec();
  }
  async busUsersRoles(busqueda, cantidad = 50, priority = 10): Promise<any[]> {
    const regex = this.functions.returnRegex(busqueda);
    return await this.usuarioModel
      .find({}, this.serializerBusquedas)
      .limit(cantidad)
      .populate({
        path: 'role',
        select: { description: 1, priority: 1 },
        match: {
          $and: [{ priority: { $gte: priority } }, { description: regex }],
        },
      })
      .populate('prestadores.prestador')
      .populate({
        path: 'atributos',
        populate: {
          path: 'atributo',
        },
      })
      .sort({ name: 1, lastName: 1 })
      .lean()
      .exec();
  }
  async createAdmin(usuario: CreateUsers): Promise<Users> {
    const exist = await this.findUsuario(usuario.user);
    const role = await this.roleService.findAdmin();
    if (!exist) {
      usuario = await this.returnUsuarioFormat(usuario);
      usuario['role'] = role._id;
      const createdUsuario = new this.usuarioModel(usuario);
      return await createdUsuario.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este nombre de usuario ya esta registrado',
        },
        400,
      );
    }
  }
  async findLogin(user, password): Promise<Users> {
    const usuario = await this.usuarioModel
      .findOne({ user: { $regex: user, $options: 'i' } })
      .exec();
    if (!usuario) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Usuario no Existe!',
        },
        400,
      );
    } else {
      if (await bcrypt.compare(password, usuario.password)) {
        if (usuario.habilitado) {
          return usuario;
        } else {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Este usuario se encuentra inhabilitado',
            },
            400,
          );
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Contraseña Incorrecta!',
          },
          400,
        );
      }
    }
  }
  async findAll(): Promise<Users[]> {
    return await this.usuarioModel.find().exec();
  }
  async findUsuario(user): Promise<Users> {
    const userLower = user.toLowerCase();
    return await this.usuarioModel
      .findOne({ user: userLower })
      .populate({path: 'role', populate: 'permissions'})
      .populate('prestadores.prestador')
      .populate({
        path: 'atributos',
        populate: {
          path: 'Atributos',
        },
      })
      .exec();
  }
}
