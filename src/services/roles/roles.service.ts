import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FunctionsService } from 'src/services/functions';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  serializerBusquedas = {
    __v: 0,
    permissionsFront: 0,
  };
  constructor(
    @InjectModel('Roles') private readonly roleModel: Model<any>,
    private functionService: FunctionsService,
    private permissionService: PermissionsService,
  ) {}
  async findNormal(): Promise<any> {
    const desc = 'Normal';
    let user = await this.find(desc);
    if (!user) {
      user = await this.createRole({ description: desc });
    }
    return user;
  }
  async findAdmin(): Promise<any> {
    const desc = 'Admin';
    let user = await this.find(desc);
    if (!user) {
      user = await this.createRole({ description: desc });
    }
    return user;
  }
  async find(description): Promise<any> {
    return await this.roleModel
      .findOne({ description }, this.serializerBusquedas)
      .exec();
  }
  async getRoles(priority) {
    return await this.roleModel
      .find(
        {priority: { $gte: priority}},
        { _id: 1},
      )
      .lean()
      .exec();
  }
  async getRolesDescription(description) {
    const regex = this.functionService.returnRegex(description);
    return await this.roleModel
      .find(
        {description: regex},
        { _id: 1},
      )
      .lean()
      .exec();
  }
  async getRolesIds(roles) {
    const rolesIds = roles.map(rol => rol._id);
    return rolesIds;
  }
  async findAllPriority(busqueda, priority): Promise<any> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.roleModel
      .find(
        { $and: [{ description: regex }, { priority: { $gte: priority } }] },
        this.serializerBusquedas,
      )
      .populate('permissions')
      .lean()
      .exec();
  }
  async findAll(busqueda): Promise<any> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.roleModel
      .find(
        { description: regex },
        this.serializerBusquedas,
      )
      .populate('permissions')
      .lean()
      .exec();
  }
  async updateRole(id, newRole): Promise<any> {
    const rol = await this.findId(id);
    const dicc = Object.keys(newRole);
    for (const element of dicc) {
      rol[element] = newRole[element];
    }
    return await rol.save();
  }
  async findId(id): Promise<any> {
    const valid = Types.ObjectId.isValid(id);
    if (!valid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role no es valido',
        },
        400,
      );
    }
    const exist = await this.roleModel
      .findById(id, this.serializerBusquedas)
      .populate('permissions')
      .exec();
    if (exist) {
      return exist;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role no existe',
        },
        400,
      );
    }
  }
  async findIdPriority(id, priority): Promise<any> {
    const valid = Types.ObjectId.isValid(id);
    if (!valid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role no es valido',
        },
        400,
      );
    }
    const exist = await this.roleModel
      .find({ $and: [{ _id: id }, { priority: { $gte: priority } }] }, this.serializerBusquedas)
      .populate('permissions')
      .exec();
    if (exist) {
      return exist;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role no existe',
        },
        400,
      );
    }
  }
  async createRole(role: any): Promise<any> {
    const exist = await this.find(role.description);
    if (!exist) {
      const createRole = new this.roleModel(role);
      return await createRole.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role ya existe',
        },
        400,
      );
    }
  }
  async createRolePriority(role: any, priority): Promise<any> {
    this.functionService.errorPriority(role.priority, priority);
    const exist = await this.find(role.description);
    if (!exist) {
      const createRole = new this.roleModel(role);
      return await createRole.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Role ya existe',
        },
        400,
      );
    }
  }
  async updateRolePriority(id, newRole, priority): Promise<any> {
    this.functionService.errorPriority(newRole.priority, priority);
    const rol = await this.findId(id);
    const dicc = Object.keys(newRole);
    for (const element of dicc) {
      rol[element] = newRole[element];
    }
    return await rol.save();
  }
}
