import BaseCtrl from "./BaseCtrl";
import UserModel from "../models/User";
import { Model, Document } from "mongoose";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export default class UserCtrl extends BaseCtrl {
    model = UserModel;

    bcrypt_psw: string;

    constructor(bcrypt_psw: string) {
        super();
        this.bcrypt_psw = bcrypt_psw;
    }

    login = (req: Request, resp: Response) => {
        this.model.findOne({ "username": req.body.username }, (error: any, user: any) => {
            if (!user) {
                return resp.sendStatus(403);
            }
            user.comparePassword(req.body.password, (error: Error, isMatch: boolean) => {
                if (!isMatch) {
                    return resp.sendStatus(403);
                }
                const token = jwt.sign({ user: user }, this.bcrypt_psw);
                resp.status(200).json({ token: token });
            });
        });
    }
}