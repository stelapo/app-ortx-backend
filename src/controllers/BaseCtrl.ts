import { Request, Response } from "express";
import { Model, Document, SaveOptions } from "mongoose";
import Logger from '../logger';
import Utils from '../utils';

abstract class BaseCtrl {
    abstract model: Model<Document>;
    //private _logger: Logger;

    constructor(/*logger: Logger*/) {
        //this._logger = logger;
    }

    // Get All
    getAll = (req: Request, resp: Response) => {
        this.model.find({}, (err: Error, docs: Document[]) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(docs);
        });
    }

    // Get By Id
    get = (req: Request, resp: Response) => {
        this.model.findOne({ _id: req.params.id }, (err: Error, doc: Document) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(doc);
        });
    }

    // Count All
    count = (req: Request, resp: Response) => {
        this.model.count({}, (err: Error, count: number) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(count);
        });
    }

    // Insert
    insert = (req: Request, resp: Response) => {
        let obj: any = new this.model(req.body);
        obj.createdBy = req.user || 'nouser';
        obj.save((error: any, doc: any) => {
            if (error && error.code === 11000) {
                this.logError(error);
                return resp.sendStatus(400);
            }
            if (error) {
                this.logError(error);
                return resp.sendStatus(500);
            }
            resp.status(200).json(doc);
        });
    }

    // Update
    update = (req: Request, resp: Response) => {
        let obj = req.body;
        obj.updatedBy = req.user || 'nouser';
        this.model.findOneAndUpdate({ _id: req.params.id }, obj, (err: any, doc: any) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.status(200).json(doc);
        });
    }

    // Delete
    delete = (req: Request, resp: Response) => {
        this.model.findOneAndRemove({ _id: req.params.id }, (err: any) => {
            if (err) {
                this.logError(err);
                return resp.sendStatus(500);
            }
            resp.sendStatus(200);
        });
    }

    private logError(err: any) {
        /*this._logger*/Utils.l.error('code=' + err.code + "; mess=" + err.message);
    }
}

export default BaseCtrl;