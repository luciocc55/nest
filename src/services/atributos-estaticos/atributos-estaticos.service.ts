import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FunctionsService } from '../functions';

@Injectable()
export class AtributosEstaticosService {
  constructor(
    @InjectModel('AtributosEstaticos')
    private readonly atributosEstaticosModel: Model<any>,
    private functionService: FunctionsService,
  ) {}
  async updateServicios(description, path, origen, orden): Promise<any> {
    const atributo = await this.create(description);
    if (atributo.servicios) {
      const atr = atributo.servicios.find(x => (x.path === path && x.origen.equals(origen) &&  x.orden === orden));
      if (!atr) {
        atributo.servicios.push({ path, orden, origen });
        atributo.save();
      }
    }
  }
  async findEstaticosOrigen(path, origen): Promise<any> {
    return await this.atributosEstaticosModel
      .find({ 'servicios.origen': origen , 'servicios.path': path})
      .populate('atributos')
      .sort({'servicios.orden': 1})
      .lean()
      .exec();
  }
  async create(description): Promise<any> {
    let exist = await this.atributosEstaticosModel
      .findOne({ description })
      .exec();
    if (!exist) {
      const created = new this.atributosEstaticosModel({ description });
      exist = await created.save();
    }
    return exist;
  }
  async findAll(busqueda): Promise<any> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.atributosEstaticosModel
      .find({ description: regex })
      .lean()
      .exec();
  }
}
