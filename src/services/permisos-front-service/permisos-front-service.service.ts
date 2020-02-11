import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePermissions } from 'src/validators/createPermissions.validator';

@Injectable()
export class PermisosFrontServiceService {
  constructor(
    @InjectModel('PermissionsFront') private readonly permissionFrontModel: Model<any>,
  ) {}
  async createPermission(permission: CreatePermissions): Promise<any> {
    const exist = await this.find(permission.endpoint);
    if (!exist) {
      const createPermission = new this.permissionFrontModel(permission);
      return await createPermission.save();
    } else {
      exist.descripcion = permission.descripcion;
      exist.save();
    }
  }
  async find(endpoint): Promise<any> {
    return await this.permissionFrontModel.findOne({ endpoint });
  }
}
