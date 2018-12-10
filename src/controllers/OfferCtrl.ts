import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import OfferModel from "../models/Offer";
import { Request, Response } from "express";

export default class OfferCtrl extends BaseCtrl {
    model = OfferModel;

    getPopulated = (req: Request, resp: Response) => {
        this.model.findOne({ _id: req.params.id }).populate('division').exec((err: Error, doc: Document) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(doc);
        });
    }
}