import Mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { check } from 'express-validator';

export interface UserModel extends Mongoose.Document {
    fname: string,
    lname: string,
    email: string,
    password: string,
    isAdmin: boolean,
    courses: Array<{
        course: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "Tutorial"
        },
        startingDate: Date,
        isCompleted: boolean
    }>
    verifyPassword: (plainPassword: string) => Promise<boolean>;
    generateJwt: () => Promise<string>
}

const UserSchema = new Mongoose.Schema({
    fname: {
        type: String,
        maxlength: 32,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        maxlength: 32,
        required: true,
        trim: true
    },
    email: {
        type: String,
        maxlength: 320,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        time: true,
        select: false
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    },
    courses: {
        type: [{
            course: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "Tutorial"
            },
            startingDate: {
                type: Date,
                default: Date.now
            },
            isCompleted: {
                type: Boolean,
                default: false
            }
        }],
        default: [],
        required: true
    }
}, {
    timestamps: true,
    methods: {
        async verifyPassword(plainPassword: string) {
            return bcrypt.compare(plainPassword, this.password);
        },
        async generateJwt() {
            return jwt.sign({id: this.id}, process.env.JWT_SECRET);
        }
    }
});

UserSchema.pre('save', async function(next: Function) {
    if (!this.isModified("password"))
        return next();

    this.password = await hashPassword(this.password);
    return next();
});

export const hashPassword = (password: string, rounds: number = 10) => bcrypt.hash(password, rounds);

export const userValidations = [
    check("fname", "First name should be atleast 3 characters.").isLength({min: 3}),
    check("lname", "Last name should be atleast 2 characters.").isLength({min: 2}),
    check("email", "Invalid email.").isEmail(),
    check("password", "Password should be atleast 8 characters.").isLength({min: 8}),
]

export const updateValidations = [
    check("fname", "First name should be atleast 3 characters.").isLength({min: 3}),
    check("lname", "Last name should be atleast 2 characters.").isLength({min: 2})
]

const User = Mongoose.model<UserModel>("User", UserSchema, "users");
export default User;