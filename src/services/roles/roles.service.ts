import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel('Roles') private readonly roleModel: Model<any>) {}
  async findNormal(): Promise<any> {
    let user = await this.find('Normal');
    if (!user) {
      user = await this.createRole({ descripcion: 'Normal' });
    }
    return user;
  }
  async find(descripcion): Promise<any> {
    return await this.roleModel.findOne({ descripcion });
  }
  async createRole(role: any): Promise<any> {
    const exist = await this.find(role.descripcion);
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
}
