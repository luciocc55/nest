import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AtributosUserService {
    constructor(
        @InjectModel('AtributosUser') private readonly atributosModel: Model<any>,
      ) {}

      async findSearch(search): Promise<any> {
        return await this.atributosModel
          .findOne(search)
          .populate('atributo')
          .exec();
      }
}
