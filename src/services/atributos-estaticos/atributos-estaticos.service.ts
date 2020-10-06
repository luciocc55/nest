import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FunctionsService } from '../functions';
// tslint:disable-next-line: no-var-requires
const ObjectId = require('mongoose').Types.ObjectId;
@Injectable()
export class AtributosEstaticosService {
  constructor(
    @InjectModel('AtributosEstaticos')
    private readonly atributosEstaticosModel: Model<any>,
    private functionService: FunctionsService,
  ) {}
  async updateServicios(
    description,
    isEntry,
    isOptional,
    path,
    origen,
    orden,
  ): Promise<any> {
    const atributo = await this.create(description);
    if (atributo.servicios) {
      const atr = atributo.servicios.findIndex(
        (x) => x.path === path && x.origen.equals(origen),
      );
      if (atr === -1) {
        atributo.servicios.push({ path, orden, origen, isEntry, isOptional });
        await atributo.save();
      } else {
        atributo.servicios[atr].orden = orden;
        atributo.servicios[atr].isEntry = isEntry;
        atributo.servicios[atr].isOptional = isOptional;
        await atributo.save();
      }
    }
  }

  async findEstaticosOrigen(path, origen, isEntry = false): Promise<any> {
    return await this.atributosEstaticosModel.aggregate([
      {
        $match: {
          servicios: {
            $elemMatch: {
              $and: [{ origen: new ObjectId(origen) }, { path }, { isEntry }],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'atributos',
          localField: '_id',
          foreignField: 'atributosEstaticos',
          as: 'atributos',
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          atributos: 1,
          servicios: {
            $first: {$filter: {
              input: '$servicios',
              as: 'servicios',
              cond: {
                $and: [
                  { $eq: ['$$servicios.origen', new ObjectId(origen)] },
                  { $eq: ['$$servicios.path', path] },
                  { $eq: ['$$servicios.isEntry', isEntry] },
                ],
              },
            },
          },
        },
        },
      },
      { $sort: { 'servicios.orden': 1 } },
    ]);
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
  async findAllSearch(search): Promise<any> {
    return await this.atributosEstaticosModel
      .find(search, { servicios: 0 })
      .sort('servicios.orden')
      .exec();
  }
}
