import * as mongoose from 'mongoose';

const auto = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: { updatedAt: 'cambio' } },
);

export const TiposExtras = auto;
