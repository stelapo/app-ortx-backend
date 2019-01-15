import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }, //divisione
    year: Number,
    pgr: String,
    totalValue: Number,
    updatedAt: Date, //data ult aggiornamento
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

    invoiceSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const InvoiceModel = mongoose.model('Invoice', invoiceSchema);
export default InvoiceModel;