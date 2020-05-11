import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: { updatedAt: 'cambio' }});
auto.virtual('atributos', {
  ref: 'AtributosPrestador',
  foreignField: 'prestador',
  localField: '_id',
  justOne: false,
});
export const Prestadores = auto;
