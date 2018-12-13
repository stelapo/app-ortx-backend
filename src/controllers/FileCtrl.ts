import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import FileModel from "../models/File";

export default class FileCtrl extends BaseCtrl {
    model = FileModel;
}