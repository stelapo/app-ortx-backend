import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    /*userId: { type: String, unique: true, trim: true },
    email: { type: String },*/
    username: { type: String, unique: true, lowercase: true, trim: true, required: true }, 
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    password: String,
    lastName: String,
    firstName: String,
    role: String,
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' },
    createdBy: String, //utente creazione
    updatedAt: Date, //data ult aggiornamento
    updatedBy: String  //utente ultimo aggiornamento
}, {
        timestamps: true
    });

userSchema.set('toJSON', {
    transform: function (doc: any, ret: any, options: any) {
        delete ret.password;
        return ret;
    }
});

userSchema.pre('save', function (next) {
    const user: any = this;
    if (!user.isModified('password')) {
        return next();
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                next(err);
                return;
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    next(err);
                    return;
                }
                user.password = hash;
                next();
            });
        })

    }
});

userSchema.methods.comparePassword = function (candidatePassword: string, callback: any) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) { return callback(err); }
        callback(null, isMatch);
    })
};

const UserModel = mongoose.model('User', userSchema);
export default UserModel;