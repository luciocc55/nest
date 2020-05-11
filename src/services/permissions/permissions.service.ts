import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FunctionsService } from '../functions';
import { CreatePermissions } from 'src/validators/users/createPermissions.validator';

@Injectable()
export class PermissionsService {
  serializerBusquedas = {
    __v: 0,
  };
  constructor(
    @InjectModel('Permissions') private readonly permissionModel: Model<any>,
    private functionService: FunctionsService,
  ) {}
  async createPermission(permission: CreatePermissions): Promise<any> {
    const exist = await this.find(permission.endpoint);
    if (!exist) {
      const createPermission = new this.permissionModel({endpoint: permission.endpoint, description: permission.description});
      return await createPermission.save();
    } else {
      exist.description = permission.description;
      exist.save();
    }
  }
  async find(endpoint): Promise<any> {
    return await this.permissionModel.findOne({ endpoint });
  }
  async findAll(busqueda): Promise<any> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.permissionModel.find({ description: regex},
      this.serializerBusquedas).lean().exec();
  }
  async findId(id): Promise<any> {
    const valid = Types.ObjectId.isValid(id);
    if (!valid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Permiso no es valido',
        },
        400,
      );
    }
    const exist = await this.permissionModel
      .findById(id, this.serializerBusquedas)
      .exec();
    if (exist) {
      return exist;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Permiso no existe',
        },
        400,
      );
    }
  }
}
