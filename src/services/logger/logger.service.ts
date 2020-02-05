import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class LoggerService {
  constructor(@InjectModel('Logger') private readonly loggerModel: Model<any>) {}

  create(log: any) {
    console.log(log)
    //const createdLog = new this.loggerModel(log);
    //createdLog.save();
  }
}
