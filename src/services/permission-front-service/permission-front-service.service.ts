import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePermissions } from 'src/validators/users/createPermissions.validator';


@Injectable()
export class PermissionsFrontServiceService {
  constructor(
    @InjectModel('PermissionsFront') private readonly permissionFrontModel: Model<any>,
  ) {}
  async createPermission(permission: CreatePermissions): Promise<any> {
    const exist = await this.find(permission.endpoint);
    if (!exist) {
      const createPermission = new this.permissionFrontModel(permission);
      return await createPermission.save();
    } else {
      exist.description = permission.description;
      exist.save();
    }
  }
  async find(endpoint): Promise<any> {
    return await this.permissionFrontModel.findOne({ endpoint });
  }
}
