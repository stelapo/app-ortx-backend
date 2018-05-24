import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    code: { type: String, unique: true, trim: true },
    description: String
}, {
        timestamps: true
    });

    customerSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const CustomerModel = mongoose.model('Customer', customerSchema);
export default CustomerModel;