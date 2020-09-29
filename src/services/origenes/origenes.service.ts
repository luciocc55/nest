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
      .sort({description: 1})
      .lean()
      .exec();
  }

  async findAllPopulated(): Promise<any> {
    const origenes =  await this.origenModel
      .find()
      .sort({description: 1})
      .lean()
      .populate({path: 'atributos', populate: 'endpoint'})
      .exec();
    origenes.forEach((element, index) => {
      const atr = [];
      element.atributos.forEach((atributo) => {
        if (!atr.find(x => (x._id === atributo._id))) {
          atr.push(atributo);
        }
      });
      atr.forEach((atriElement, indexAtr) => {
        const serv = [];
        atriElement.endpoint.forEach(endpoint => {
          if (!serv.find(x => (x.path === endpoint.endpoint))) {
            serv.push(endpoint);
          }
        });
        atr[indexAtr].endpoint = serv;
      });
      origenes[index].atributos = atr;
    });
    return origenes;
  }
  nExist() {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Este origen no existe',
      },
      400,
    );
  }
  async validateOrigenService(origen, path) {
    let validateOrigen;
    try {
      validateOrigen = await this.findOneSearch({ _id: origen});
      if (!validateOrigen) {
        this.nExist();
      }
    } catch (error) {
      this.nExist();
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
