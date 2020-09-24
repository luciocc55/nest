import * as mongoose from 'mongoose';
const PathAtributos = new mongoose.Schema({
    path: {
      type: String,
      required: true,
    },
    orden: {
        type: Number,
        required: true,
    },
    isEntry: {
      type: Boolean,
      required: true,
      default: false,
    },
    origen: { type: mongoose.Schema.Types.ObjectId, ref: 'Origenes', autopopulate: true },
  });
const auto = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  servicios: [PathAtributos],
});
auto.virtual('atributos', {
  ref: 'Atributos',
  foreignField: 'atributosEstaticos',
  localField: '_id',
  justOne: false,
});
auto.virtual('endpoint', {
  ref: 'Permissions',
  foreignField: 'endpoint',
  localField: 'servicios.path',
  justOne: false,
});
export const AtributosEstaticos = auto;
