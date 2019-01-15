import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
    code: { type: String, unique: true, trim: true },
    description: String,
    createdBy: String, //utente creazione
    updatedAt: Date, //data ult aggiornamento
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

divisionSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const DivisionModel = mongoose.model('Division', divisionSchema);
export default DivisionModel;