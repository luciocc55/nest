import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  descripcion: {
    type: String,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
});

export const PermissionsFront = auto;
