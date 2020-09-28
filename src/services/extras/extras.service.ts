import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ExtrasService {
  constructor(
    @InjectModel('TiposExtras') private readonly extrasModel: Model<any>,
  ) {}
  async findOne(search): Promise<any> {
    const searched = await this.extrasModel.findOne(search);
    return searched;
  }
  async find(search): Promise<any> {
    const searched = await this.extrasModel.find(search);
    return searched;
  }
  async getOrCreate(description): Promise<any> {
    const exist = await this.findOne({ description });
    if (!exist) {
      const createExtra = new this.extrasModel({ description });
      return await createExtra.save();
    } else {
      return exist;
    }
  }
}
