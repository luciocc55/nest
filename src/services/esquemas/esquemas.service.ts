import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class EsquemasService {
  constructor(
    @InjectModel("Esquemas") private readonly esquemasModel: Model<any>
  ) {}
  async findAll(busqueda): Promise<any> {
    return await this.esquemasModel
      .find(busqueda)
      .populate("origen")
      .populate("servicio")
      .populate("user")
      .lean()
      .exec();
  }
  async find(busqueda): Promise<any> {
    return await this.esquemasModel
      .findOne(busqueda)
      .populate("origen")
      .populate("servicio")
      .populate("user")
      .lean()
      .exec();
  }
  async findId(busqueda): Promise<any> {
    return await this.esquemasModel
      .findById(busqueda)
      .populate("origen")
      .populate("servicio")
      .lean()
      .exec();
  }
  async update(id, newElement): Promise<any> {
    const esquema = await this.esquemasModel.findById(id);
    const dicc = Object.keys(newElement);
    for (const element of dicc) {
      esquema[element] = newElement[element];
    }
    return await esquema.save();
  }
  async create(esquema: any): Promise<any> {
    const createPermission = new this.esquemasModel(esquema);
    return await createPermission.save();
  }
}
