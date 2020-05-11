import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSession } from 'src/validators/users/createSession.validator';

@Injectable()
export class SessionService {
    constructor(@InjectModel('Session') private readonly sessionModel: Model<any>) {}

    async findAdmin(user): Promise<any> {
        return this.sessionModel.findOne({user}).exec();
    }
    async createAdmin(createSession: CreateSession): Promise<any[]> {
        const createdSession = new this.sessionModel(createSession);
        return  await createdSession.save();
    }
}
