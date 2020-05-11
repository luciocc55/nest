import * as mongoose from 'mongoose';

const auto = new mongoose.Schema(
  {
    prestador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestadores',
      autopopulate: true,
    },
  },
  { timestamps: { updatedAt: 'cambio' } },
);

export const PrestadoresUser = auto;
