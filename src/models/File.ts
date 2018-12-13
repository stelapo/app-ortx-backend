import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    length: Number,
    chunckSize: Number,
    filename: String
});

fileSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const FileModel = mongoose.model('fs.file', fileSchema);
export default FileModel;