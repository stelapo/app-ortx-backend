import BaseCtrl from "./BaseCtrl";
import { Model, Document } from "mongoose";
import CustomerModel from "../models/Customer";

export default class CustomerCtrl extends BaseCtrl {
    model = CustomerModel;
}