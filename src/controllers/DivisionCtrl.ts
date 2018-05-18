import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import DivisionModel from "../models/Division";

export default class DivisionCtrl extends BaseCtrl {
    model = DivisionModel;
}