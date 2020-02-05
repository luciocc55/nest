import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissions' }],
});

export const Roles = auto;
