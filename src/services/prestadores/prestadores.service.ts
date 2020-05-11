import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FunctionsService } from '../functions';
import { CreatePrestadores } from 'src/validators/prestadores/createPrestador.validator';
import { AtributosUsuarios } from 'src/validators/atributos/atributos-usuarios.validator';

@Injectable()
export class PrestadoresService {
    constructor(
        @InjectModel('Prestadores') private readonly prestadorModel: Model<any>,
        @InjectModel('AtributosPrestador')
        private readonly prestadoresAtributosModel: Model<any>,
        private functions: FunctionsService,
      ) {}

      async busPrestadores(busqueda, cantidad = 50): Promise<any[]> {
        const regex = this.functions.returnRegex(busqueda);
        return await this.prestadorModel
          .find(
            {
              $or: [
                {
                  name: regex,
                },
                {
                  description: regex,
                },
              ],
            },
          )
          .limit(cantidad)
          .populate({
            path: 'atributos',
            match: { habilitado: true },
            populate: {
              path: 'atributo',
            },
          })
          .sort({ name: 1})
          .lean()
          .exec();
      }
      async create(prestador: CreatePrestadores): Promise<any> {
        const exist = await this.findPrestador(prestador.name);
        if (!exist) {
          prestador = await this.returnFormat(prestador);
          const createdPrestador = new this.prestadorModel(prestador);
          return await createdPrestador.save();
        } else {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Este nombre de prestador ya existe',
            },
            400,
          );
        }
      }
      private async returnFormat(prestador) {
        prestador.name = this.functions.titleCase(prestador.name);
        prestador.description = this.functions.titleCase(prestador.description);
        return prestador;
      }
      async findSearch(search): Promise<any> {
        return await this.prestadorModel
          .find(search)
          .populate({
            path: 'atributos',
            populate: {
              path: 'Atributos',
            },
          })
          .exec();
      }
      async findOneSearchAtributos(search): Promise<any> {
        return await this.prestadoresAtributosModel
          .findOne(search)
          .populate('atributo')
          .exec();
      }
      async findPrestador(prestador): Promise<any> {
        const userLower = prestador.toLowerCase();
        return await this.prestadorModel
          .findOne({ name: userLower })
          .populate({
            path: 'atributos',
            populate: {
              path: 'Atributos',
            },
          })
          .exec();
      }
      async addAtributos(
        prestador,
        atributos: AtributosUsuarios[],
      ): Promise<any> {
        const d = await this.createBulkAtributos(prestador, atributos);
        const usu = await this.findByIdPopulated(prestador);
        return usu;
      }
      async findByIdPopulated(id) {
        const prestador = await this.prestadorModel
          .findById(id)
          .populate({
            path: 'atributos',
            populate: {
              path: 'atributo',
            },
          })
          .lean()
          .exec();
        return prestador;
      }
      async createBulkAtributos(
        prestador,
        atributos: AtributosUsuarios[],
      ): Promise<number> {
        let creados = 0;
        for (const element of atributos) {
          try {
            const createdUsuarioAtributo = new this.prestadoresAtributosModel({
              atributo: element._id,
              prestador,
              value: element.value,
              habilitado: element.habilitado,
            });
            await createdUsuarioAtributo.save();
            creados = creados + 1;
            // tslint:disable-next-line: no-empty
          } catch (error) {}
        }
        return creados;
      }

      async findById(id) {
        return await this.prestadorModel.findById(id).exec();
      }
      async updatePrestador(id, prestadorNew) {
        const prestadorQuery = await this.findById(id);
        const dicc = Object.keys(prestadorNew);
        for (const element of dicc) {
            if (element === 'name' && prestadorQuery[element] !== prestadorNew[element]) {
              const exist = await this.findPrestador(prestadorNew[element]);
              if (!exist) {
                prestadorQuery[element] = prestadorNew[element];
              } else {
                throw new HttpException(
                  {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Este nombre de prestador ya existe',
                  },
                  400,
                );
              }
            } else {
              if (element === 'atributos') {
                await this.prestadoresAtributosModel.deleteMany({prestador: id});
                const creates = await this.createBulkAtributos(id, prestadorNew[element]);
              } else {
                prestadorQuery[element] = prestadorNew[element];
              }
            }
          }
        return await prestadorQuery.save();
      }
}
