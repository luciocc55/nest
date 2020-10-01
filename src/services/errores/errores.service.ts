import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ErroresService {
  constructor(
    @InjectModel('ErroresEstandarizados')
    private readonly errorModel: Model<any>,
  ) {}

  async findOne(search): Promise<any> {
    return await this.errorModel
      .findOne(search)
      .lean()
      .exec();
  }
  async pushValue(valueStandard, value, origen ): Promise<any> {
    const exist = await this.errorModel
      .findOne({ valueStandard })
      .exec();
    const existValue = exist.values.find(data => exist.values[0].origen.equals(origen) && data.value === value);
    if (!existValue) {
        exist.values.push({value, origen});
    }
    return await exist.save();
  }
  async getOrCreate(valueStandard, description): Promise<any> {
    let exist = await this.errorModel
      .findOne({ valueStandard})
      .exec();
    if (!exist) {
      const createOrigen = new this.errorModel({valueStandard, description });
      exist = await createOrigen.save();
    }
    return exist;
  }
}
