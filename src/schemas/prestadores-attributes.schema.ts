import * as mongoose from 'mongoose';

const auto = new mongoose.Schema(
  {
    prestador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestadores',
      autopopulate: true,
    },
    atributo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Atributos',
      autopopulate: true,
    },
    value: {
      type: String,
      default: '',
    },
    habilitado: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { updatedAt: 'cambio' } },
);

export const AtributosPrestador = auto;
