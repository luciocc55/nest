import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePermissions } from 'src/validators/createPermissions.validator';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel('Permissions') private readonly permissionModel: Model<any>,
  ) {}
  async createPermission(permission: CreatePermissions): Promise<any> {
    const exist = await this.find(permission.endpoint);
    if (!exist) {
      const createPermission = new this.permissionModel({endpoint: permission.endpoint, descripcion: permission.descripcion});
      return await createPermission.save();
    } else {
      exist.descripcion = permission.descripcion;
      exist.save();
    }
  }
  async find(endpoint): Promise<any> {
    return await this.permissionModel.findOne({ endpoint });
  }
}
