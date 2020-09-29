import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FunctionsService } from '../functions';
import { PrestadoresService } from '../prestadores/prestadores.service';

@Injectable()
export class AtributosUserService {
    constructor(
        @InjectModel('AtributosUser') private readonly atributosModel: Model<any>,
        private prestadoresService: PrestadoresService,
        private functionService: FunctionsService,
      ) {}

      async findSearch(search): Promise<any> {
        return await this.atributosModel
          .findOne(search)
          .populate('atributo')
          .exec();
      }
      async getAtributosEntry(data, atributos) {
        const arrayValues = [];
        for (const [index, atributo] of atributos.entries()) {
          if (!data[index]) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error:
                  'Este atributo ' +
                  atributo.description +
                  ' es un atributo necesario',
              },
              400,
            );
          } else {
            arrayValues.push(data[index]);
          }
        }
        return arrayValues;
      }
      async getAtributosService(usuario, atributos) {
        const prestadores = await this.functionService.returnUniques(
          usuario['prestadores'],
          'prestador',
        );
        const arrayValues = [];
        for (const atributo of atributos) {
          const lista = this.functionService.returnUniques(
            atributo.atributos,
            '_id',
          );
          if (lista.length === 0) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error:
                  'Este atributo ' +
                  atributo.description +
                  ' no tiene ningun atributo asociado',
              },
              400,
            );
          }
          let value;
          let from = 'prestador';
          value = await this.prestadoresService.findOneSearchAtributos({
            atributo: lista,
            prestador: prestadores,
          });
          if (!value) {
            value = await this.findSearch({ atributo: lista, user: usuario._id });
            from = 'usuario';
            if (!value) {
              throw new HttpException(
                {
                  status: HttpStatus.BAD_REQUEST,
                  error:
                    'Este atributo ' +
                    atributo.description +
                    ' no esta asociado al ' +
                    from,
                },
                400,
              );
            }
          }
          if (!value.habilitado) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error:
                  'Este atributo ' +
                  atributo.description +
                  ' no esta habilitado para este ' +
                  from,
              },
              400,
            );
          }
          if (!value.atributo.habilitado) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error:
                  'Este atributo ' +
                  atributo.description +
                  ' no esta habilitado',
              },
              400,
            );
          }
          arrayValues.push(value.value);
        }
        return arrayValues;
      }
}
