import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
    idPractica: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practicas', autopopulate: true }],
});

export const MasterPracticas = auto;
