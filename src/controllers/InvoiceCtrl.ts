import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import InvoiceModel from "../models/Invoice";
import { Request, Response } from "express";

export default class InvoiceCtrl extends BaseCtrl {
    model = InvoiceModel;
    //ObjectId = require('mongoose').Types.ObjectId;
    getPopulated = (req: Request, resp: Response) => {
        this.model.findOne({ _id: req.params.id }).populate('offer').exec((err: Error, doc: Document) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(doc);
        });
    }
    
    getAllPopulated = (req: Request, resp: Response) => {
        this.model.find({}).populate('offer').populate('offer.division').exec((err: Error, docs: Document[]) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(docs);
        });

        /*this.model.find({}, (err: Error, docs: Document[]) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(docs);
        });*/
    }
   
}