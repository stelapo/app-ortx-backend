import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
    code: { type: String, unique: true, trim: true },
    description: String
}, {
        timestamps: true
    });

divisionSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const DivisionModel = mongoose.model('Division', divisionSchema);
export default DivisionModel;