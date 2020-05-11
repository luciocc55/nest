import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    unique: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 10,
  },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissions', autopopulate: true }],
  permissionsFront: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PermissionsFront', autopopulate: true }],
}, { timestamps: { updatedAt: 'cambio' }});
export const Roles = auto;
