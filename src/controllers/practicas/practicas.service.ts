import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FunctionsService } from 'src/services/functions';

@Injectable()
export class PracticasService {
  serializerBusquedas = {
    _id: 0,
    slug_nombre: 0,
  };
  constructor(
    @InjectModel('Practicas')
    private readonly equipoModel: Model<any>,
    @InjectModel('MasterPracticas')
    private readonly masterEquipoModel: Model<any>,
    private functionService: FunctionsService,
  ) {}
  async getNumber(cantidad = 50): Promise<any[]> {
    return await this.equipoModel
      .find(
        { $and: [{ unificado_equip: false }, { eliminado: false }] },
        this.serializerBusquedas,
      )
      .limit(cantidad)
      .populate('origenPopulate')
      .sort({ nombre: 1 , apellido: 1})
      .lean()
      .exec();
  }
  async addEquipIntoMaster(master, id) {
    const equip = await this.equipoModel.findOne({ id });
    equip.masterEquip = master;
    equip.unificado_equip = true;
    return await equip.save();
  }
  async deleteMaster(equipo) {
    const equip = await this.equipoModel.findOne({ id: equipo });
    const master = await this.masterEquipoModel.deleteMany({
      idEquipo: equipo,
      id: equip.masterEquip,
    });
    if (master.deletedCount > 0) {
      return await this.equipoModel.updateMany(
        { masterEquip: equip.masterEquip },
        { unificado_equip: false, masterEquip: null },
      );
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Master no Encontrado!',
        },
        400,
      );
    }
  }
  async deleteEquipFromMaster(id) {
    const equip = await this.equipoModel.findOne({ id });
    const masterEquip = await this.masterEquipoModel.findOne(
      { idEquipo: id },
      { id: equip.masterEquip },
    );
    if (masterEquip) {
      return { error: 'Este equipo es el master de la colección' };
    } else {
      equip.masterEquip = null;
      equip.unificado_equip = false;
      return await equip.save();
    }
  }
  async busMasters(busqueda, cantidad = 20) {
    const regex = this.functionService.returnRegex(busqueda);
    const equipos = await this.equipoModel
      .find(
        {
          $and: [
            { unificado_equip: true },
            { eliminado: false },
            {
              $or: [
                {
                  nombre: regex,
                },
                {
                  apellido: regex,
                },
              ],
            },
          ],
        },
        { id: 1 },
      )
      .lean()
      .populate('origenPopulate')
      .populate('master')
      .exec();
    const arrayFilter = equipos.map(esp => esp.id);
    return await this.masterEquipoModel
      .find({ idEquipo: { $in: arrayFilter } })
      .populate({
        path: 'equipos',
        select: this.serializerBusquedas,
        options: { sort: { origen: 1 } },
        populate: { path: 'origenPopulate' },
      })
      .populate({
        path: 'master',
        select: this.serializerBusquedas,
        options: { sort: { origen: 1 } },
        populate: { path: 'origenPopulate' },
      })
      .sort({ master: 1 })
      .limit(cantidad)
      .lean()
      .exec();
  }
  async busMaster(id) {
    return await this.masterEquipoModel
      .findOne({ id })
      .populate({
        path: 'equipos',
        select: this.serializerBusquedas,
        options: { sort: { origen: 1 } },
        populate: { path: 'origenPopulate' },
      })
      .populate({
        path: 'master',
        select: this.serializerBusquedas,
        options: { sort: { origen: 1 } },
        populate: { path: 'origenPopulate' },
      })
      .sort({ master: 1 })
      .lean()
      .exec();
  }
  async busEquipos(busqueda, cantidad = 50): Promise<any[]> {
    const regex = this.functionService.returnRegex(busqueda);
    return await this.equipoModel
      .find(
        {
          $and: [
            { unificado_equip: false },
            { eliminado: false },
            {
              $or: [
                {
                  nombre: regex,
                },
                {
                  apellido: regex,
                },
              ],
            },
          ],
        },
        this.serializerBusquedas,
      )
      .limit(cantidad)
      .populate('origenPopulate')
      .sort({ nombre: 1 , apellido: 1 })
      .lean()
      .exec();
  }
  async deleteEquipo(id): Promise<any[]> {
    const equip = await this.equipoModel.findOne({ id }).exec();
    equip.eliminado = true;
    return await equip.save();
  }

  async migrarEquips(equips, origen) {
    let creados = 0;
    for (const equip of equips) {
      const equipEx = await this.equipoModel.findOne({ idOrigen: equip.equipo , origen }).exec();
      if (!equipEx) {
        const created = await this.createEquipo(equip, origen);
        creados = creados + 1;
      }
    }
    return creados;
  }
  async createEquipo(equip, origen) {
    let nextId = await this.equipoModel
    .findOne()
    .sort({ id: -1 })
    .limit(1)
    .lean()
    .exec();
    if (!nextId) {
      nextId = {id: 0};
    }
    const created = new this.equipoModel({
      idOrigen: equip.equipo,
      nombre: equip.nombre,
      apellido: equip.apellido,
      origen,
    });
    return await created.save();
  }
  async createMaster(idEquipo): Promise<any[]> {
    let nextId = await this.masterEquipoModel
      .findOne()
      .sort({ id: -1 })
      .limit(1)
      .lean()
      .exec();
    if (!nextId) {
      nextId = {id: 0};
    }
    const created = new this.masterEquipoModel({
      idEquipo,
    });

    return await created.save();
  }
  async updateEquip(equipo) {
    return await this.equipoModel.updateOne(
      { id: equipo.id },
      {
        $set: {
          masterEquip: equipo.masterEquip,
          unificado_equip: this.functionService.returnBoolean(
            equipo.unificado_equip,
          ),
          eliminado: this.functionService.returnBoolean(equipo.eliminado),
        },
      },
    );
  }
}
