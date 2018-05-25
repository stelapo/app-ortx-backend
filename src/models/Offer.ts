import mongoose from "mongoose";
import Utils from '../utils';
import Logger from '../logger';

const offerSchema = new mongoose.Schema({
    year: Number,
    pgr: Number,
    title: String,
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' }, //divisione
    editor: String, //compilatore dell'offerta
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, //insegna cliente
    totalValue: Number,
    percHdSf: Number, //percentuale valore "Hardware e software"
    percRent: Number, //percentuale valore "Canoni"
    percSrv: Number,  //percentuale valore "Servizi professionali"
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferState' }, //stato offerta
    acceptedAt: Date, //data accettazione
    notes: String,
    createdBy: String, //utente creazione
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

offerSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

offerSchema.pre('save', function (next) {
    const offer: any = this;
    if (this.isNew) {
        let num = Utils.getNextOfferNum(Utils.c.sqliteFile, Utils.l);
        num.then(
            (n) => {
                offer.year = (new Date()).getFullYear();
                offer.pgr = n;
                next();
            },
            (e) => {
                next(e);
            }
        );

    } else {

    }
});

offerSchema.pre('update', function() {
    this.update({},{ $set: { updatedBy: new Date() } });
  });

const OfferModel = mongoose.model('Offer', offerSchema);
export default OfferModel;