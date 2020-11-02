import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SinonimosService {
  constructor(
    @InjectModel('Sinonimos') private readonly sinonimosModel: Model<any>,
  ) {}
  async find(search): Promise<any> {
    const searched = await this.sinonimosModel.find(search);
    return searched;
  }
  async getValue(origen, id): Promise<any> {
    const searched = await this.sinonimosModel.findById(id);
    const exist = searched.sinonimos.find(s => s.origen === origen);
    if (exist) {
      return exist.value;
    } else {
      return searched.defaultValue;
    }
  }
  async getOrCreate(description, defaultValue, tipo): Promise<any> {
    let exist = await this.sinonimosModel.findOne({ description }).exec();
    if (!exist) {
      const createSinonimo = new this.sinonimosModel({
        description,
        defaultValue,
        tipo,
      });
      exist = await createSinonimo.save();
    } else {
      if (exist.defaultValue !== defaultValue) {
        exist.defaultValue = defaultValue;
        exist.save();
      }
    }
    return exist;
  }
}
