import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class LoggerService {
  constructor(@InjectModel('Logger') private readonly loggerModel: Model<any>) {}

  async create(log: any) {
    const createdLog = new this.loggerModel(log);
    return await createdLog.save();
  }
  async writeResponse(response, id) {
    const registro = await this.loggerModel.findById(id);
    registro.response = response;
    await registro.save();
  }
}
