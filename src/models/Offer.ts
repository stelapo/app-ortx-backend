import mongoose from "mongoose";
import Utils from '../utils';
import Logger from '../logger';

const arrayOfFiles = [{ type: mongoose.Schema.Types.ObjectId, ref: 'fs.file' }];
const offerSchema = new mongoose.Schema({
    year: Number,
    pgr: String,
    title: String,
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' }, //divisione
    editor: String, //compilatore dell'offerta
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, //insegna cliente
    ragsoc: String, //ragione sociale cliente aal'interno dell'insegna cliente
    totalValue: Number,
    percHdSf: Number, //percentuale valore "Hardware e software"
    percRent: Number, //percentuale valore "Canoni"
    percSrv: Number,  //percentuale valore "Servizi professionali"
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferState' }, //stato offerta
   // docs: arrayOfFiles,
    docs:[{
        year: Number,
        pgr: String,
        docType: { type: mongoose.Schema.Types.ObjectId, ref: 'DocType' },
        file: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.file' }
    }],
    //fatture: arrayOfFiles,
    acceptedAt: Date, //data accettazione
    createdAt: Date, //data creazione
    updatedAt: Date, //data ult aggiornamento
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