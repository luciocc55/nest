import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  idOrigen: {
    type: String,
    required: true,
  },
  origen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Origenes', autopopulate: true }],
  master: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MasterPracticas', autopopulate: true }],
  descripcion: {
    type: String,
  },
  unificado: {
    type: Boolean,
    default: false,
  },
  eliminado: {
    type: Boolean,
    default: false,
  },
  habilitado: {
    type: Boolean,
    default: true,
  },
}, { timestamps: { updatedAt: 'cambio' }});

export const Practicas = auto;
