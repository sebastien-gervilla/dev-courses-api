import Mongoose from 'mongoose';
import crypto from 'crypto';

export interface ResetTokenModel extends Mongoose.Document {
    userId: Mongoose.Types.ObjectId,
    token: string,
    createOne: () => Promise<string>
}

const ResetTokenSchema = new Mongoose.Schema({
    userId: {
        type: Mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

export const generateToken = async () => crypto.randomBytes(32).toString('hex');

const ResetToken = Mongoose.model<ResetTokenModel>("ResetToken", ResetTokenSchema, "reset-tokens");
export default ResetToken;