import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ServiciosService {
  constructor(
    @InjectModel("Servicios") private readonly serviciosModel: Model<any>
  ) {}
  async findAll(busqueda): Promise<any> {
    return await this.serviciosModel
      .find(busqueda)
      .lean()
      .exec();
  }
  async findOneSearch(search): Promise<any> {
    return await this.serviciosModel
      .findOne(search)
      .lean()
      .exec();
  }
  async create(servicio): Promise<any> {
    let exist = await this.serviciosModel
      .findOne({ value: servicio.value })
      .exec();
    if (!exist) {
      const created = new this.serviciosModel(servicio);
      exist = await created.save();
    } else {
      if (servicio.endpoint !== exist.endpoint) {
        exist.endpoint = servicio.endpoint;
        return await exist.save();
      }
    }
    return exist;
  }
}
