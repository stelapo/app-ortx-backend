import mongoose from "mongoose";

const offerStateSchema = new mongoose.Schema({
    code: { type: String, unique: true, trim: true },
    description: String,
    createdBy: String, //utente creazione
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

    offerStateSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const OfferStateModel = mongoose.model('OfferState', offerStateSchema);
export default OfferStateModel;