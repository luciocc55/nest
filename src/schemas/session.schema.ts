import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export const Session = auto;
