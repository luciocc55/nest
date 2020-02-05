import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true,
    unique: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Permissions = auto;
