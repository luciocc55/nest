import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class OrigenesService {
  constructor(
    @InjectModel('Origenes')
    private readonly origenModel: Model<any>,
  ) {}
  async findAll(): Promise<any> {
    return await this.origenModel
      .find()
      .lean()
      .exec();
  }
  async validateOrigenService(origen, path) {
    let validateOrigen;
    try {
      validateOrigen = await this.findOneSearch({ _id: origen});
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este origen no existe',
        },
        400,
      );
    }
    const atr = validateOrigen.servicios.find(x => (x.path === path));
    if (!atr) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Este origen no posee este servicio',
        },
        400,
      );
    }
    return validateOrigen;
  }
  async findOne(id): Promise<any> {
    return await this.origenModel
      .findOne({ id })
      .lean()
      .exec();
  }
  async findOneSearch(search): Promise<any> {
    return await this.origenModel
      .findOne(search)
      .exec();
  }
  async create(description, servicio = null): Promise<any> {
    let exist = await this.origenModel
      .findOne({ description })
      .exec();
    if (!exist) {
      const createOrigen = new this.origenModel({description});
      createOrigen.servicios.push({ path: servicio });
      exist = await createOrigen.save();
    } else {
      if (servicio) {
        const atr = exist.servicios.find(x => (x.path === servicio));
        if (!atr) {
          exist.servicios.push({ path: servicio });
          exist.save();
        }
      }
    }
    return exist;
  }
}
