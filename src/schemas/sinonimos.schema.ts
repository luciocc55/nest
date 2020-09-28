import * as mongoose from 'mongoose';

const DetalleSinonimos = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  origen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Origenes',
    autopopulate: true,
  },
});
const auto = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: true,
    },
    sinonimos: [DetalleSinonimos],
    tipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiposExtras',
      autopopulate: true,
    },
  },
  { timestamps: { updatedAt: 'cambio' } },
);

export const Sinonimos = auto;
