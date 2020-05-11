import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  habilitado: {
    type: Boolean,
    default: true,
  },
  atributosEstaticos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AtributosEstaticos', autopopulate: true }],
}, { timestamps: { updatedAt: 'cambio' }});

export const Atributos = auto;
