import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import OfferStateModel from "../models/OfferState";

export default class OfferStateCtrl extends BaseCtrl {
    model = OfferStateModel;
}