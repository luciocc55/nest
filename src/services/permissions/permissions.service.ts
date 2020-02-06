import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel('Permissions') private readonly permissionModel: Model<any>,
  ) {}
  async createPermission(permission: any): Promise<any> {
    const exist = await this.find(permission.endpoint);
    if (!exist) {
      const createPermission = new this.permissionModel(permission);
      return await createPermission.save();
    }
  }
  async find(endpoint): Promise<any> {
    return await this.permissionModel.findOne({ endpoint });
  }
}
