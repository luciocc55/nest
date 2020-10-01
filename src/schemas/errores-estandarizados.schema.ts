import * as mongoose from 'mongoose';

const auto = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    valueStandard: {
      type: Number,
      required: true,
      unique: true,
    },
    values: [
      {
        value: {
          type: String,
          required: true,
        },
        origen: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Origenes',
          autopopulate: true,
        },
      },
    ],
  },
  { timestamps: { updatedAt: 'cambio' } },
);

export const ErroresEstandarizados = auto;
