import mongoose from "mongoose";

const docTypeSchema = new mongoose.Schema({
    type: { type: String, unique: true, trim: true },
    description: String,
    createdBy: String, //utente creazione
    updatedAt: Date, //data ult aggiornamento
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

    docTypeSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const DocTypeModel = mongoose.model('DocType', docTypeSchema);
export default DocTypeModel;