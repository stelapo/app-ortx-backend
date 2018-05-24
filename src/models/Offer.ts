import mongoose from "mongoose";
import Utils from '../utils';
import { c } from '../config';
import Logger from '../logger';

const offerSchema = new mongoose.Schema({
    year: Number,
    pgr: Number,
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' }
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
        let num = Utils.getNextOfferNum(c.sqliteFile, new Logger('pippo', c));
        num.then(
            (n) => {
                offer.year = (new Date()).getFullYear();
                offer.pgr = n;
            },
            (e) => {
                next(e);
            }
        );

    } else {

    }
});

const OfferModel = mongoose.model('Offer', offerSchema);
export default OfferModel;