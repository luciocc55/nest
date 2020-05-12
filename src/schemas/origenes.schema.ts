import * as mongoose from 'mongoose';
const Servicios = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
});
const auto = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    unique: true,
  },
  servicios: [Servicios],
}, { timestamps: { updatedAt: 'cambio' }});
auto.virtual('atributos', {
  ref: 'AtributosEstaticos',
  foreignField: 'servicios.origen',
  localField: '_id',
  justOne: false,
});
export const Origenes = auto;
