import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FunctionsService } from 'src/services/functions';
@Injectable()
export class AtributosService {
  serializerBusquedas = {
    __v: 0,
  };
  constructor(
    @InjectModel('Atributos') private readonly atributosModel: Model<any>,
    private functionService: FunctionsService,
  ) {}
  async findAll(busqueda): Promise<any> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.atributosModel
      .find({ description: regex }, this.serializerBusquedas)
      .populate('atributosEstaticos')
      .lean()
      .exec();
  }
  async findId(id): Promise<any> {
    const valid = Types.ObjectId.isValid(id);
    if (!valid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Atributo no es valido',
        },
        400,
      );
    }
    const exist = await this.atributosModel
      .findById(id, this.serializerBusquedas)
      .populate('atributosEstaticos')
      .exec();
    if (exist) {
      return exist;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Atributo no existe',
        },
        400,
      );
    }
  }
  async create(atributo: any): Promise<any> {
    const exist = await this.find(atributo.description);
    if (!exist) {
      const createRole = new this.atributosModel(atributo);
      return await createRole.save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este Atributo ya existe',
        },
        400,
      );
    }
  }
  async find(description): Promise<any> {
    return await this.atributosModel
      .findOne({ description }, this.serializerBusquedas)
      .exec();
  }
  async findSearch(search): Promise<any> {
    return await this.atributosModel
      .findOne(search, this.serializerBusquedas)
      .exec();
  }

  async update(id, newAtri): Promise<any> {
    const atributo = await this.findId(id);
    const dicc = Object.keys(newAtri);
    for (const element of dicc) {
      atributo[element] = newAtri[element];
    }
    return await atributo.save();
  }
}
