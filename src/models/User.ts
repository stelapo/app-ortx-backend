import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, trim: true },
    email: { type: String }
}, {
        timestamps: true
    });

userSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        return ret;
    }
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;