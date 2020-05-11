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

export const Origenes = auto;
