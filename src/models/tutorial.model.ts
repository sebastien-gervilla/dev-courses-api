import Mongoose from 'mongoose';

export interface TutorialModel extends Mongoose.Document {
    slug: string,
    title: string,
    description: string,
    content: string,
    technology: string,
    hoursToLearn: Date,
    isPremium: boolean
}

const TutorialSchema = new Mongoose.Schema({
    slug: {
        type: String,
        maxlength: 64,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        maxlength: 64,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 165,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    technology: {
        type: String,
        maxlength: 64,
        required: true,
        trim: true
    },
    hoursToLearn: {
        type: Number,
        required: true
    },
    isPremium: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true
});

const Tutorial = Mongoose.model<TutorialModel>("Tutorial", TutorialSchema, "tutorials");
export default Tutorial;