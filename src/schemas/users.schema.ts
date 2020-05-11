import * as mongoose from 'mongoose';
import { PrestadoresUser } from './users-prestadores.schema';

const auto = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles',
    autopopulate: true,
  },
  prestadores: [PrestadoresUser],
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  habilitado: {
    type: Boolean,
    default: true,
  },
}, { timestamps: { updatedAt: 'cambio' }});
auto.virtual('atributos', {
  ref: 'AtributosUser',
  foreignField: 'user',
  localField: '_id',
  justOne: false,
});
export const Users = auto;
