import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, trim: true },
    email: { type: String },
    createdBy: String, //utente creazione
    updatedBy: String  //utente ultimo aggiornamento
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