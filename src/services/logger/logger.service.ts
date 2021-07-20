import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FunctionsService } from "../functions";
import { Request } from "express";

@Injectable()
export class LoggerService {
  constructor(
    @InjectModel("Logger") private readonly loggerModel: Model<any>,
    private functionService: FunctionsService
  ) {}

  async create(log: any) {
    const createdLog = new this.loggerModel(log);
    return await createdLog.save();
  }
  async writeResponse(response, id) {
    const registro = await this.loggerModel.findById(id);
    registro.response = response;
    await registro.save();
  }
  async findAll(busqueda: any) {
    return await this.loggerModel
      .find(busqueda)
      .lean()
      .exec();
  }
  async reporte(busqueda, request: Request): Promise<any> {
    const result = await this.paginado(busqueda, request);
    return result;
  }
  async paginado(busqueda, request: Request) {
    const [cantidad, equipos] = await Promise.all([
      this.loggerModel
        .countDocuments(busqueda)
        .lean()
        .exec(),
      this.loggerModel
        .find(busqueda)
        .skip(
          ((parseInt(request.query.page?.toString()) || 1) - 1) *
            (parseInt(request.query.perPage?.toString()) || 25)
        )
        .limit(parseInt(request.query.perPage?.toString()) || 25)
        .populate("origenPopulate")
        .sort({ nombre: 1, apellido: 1 })
        .lean()
        .exec(),
    ]);
    const result = this.functionService.returnPaginado(
      request,
      cantidad,
      request.query.perPage || 25
    );
    result["results"] = equipos;
    return result;
  }
}
