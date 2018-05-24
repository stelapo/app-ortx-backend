import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import OfferModel from "../models/Offer";

export default class OfferCtrl extends BaseCtrl {
    model = OfferModel;
}