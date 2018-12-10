import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import DocTypeModel from "../models/DocType";

export default class DocTypeCtrl extends BaseCtrl {
    model = DocTypeModel;
}