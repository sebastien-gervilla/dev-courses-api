import { CookieOptions, Request, Response } from "express";
import { isValidObjectId } from 'mongoose';
import { validationResult } from "express-validator";
import User, { hashPassword, UserModel } from '../models/user.model';
import ResetToken, { generateToken } from "../models/reset-token.model";
import { Res, MailHelper, CookieHelper } from "../helpers";
import { getDaysAfter } from "../utils/date-functions";

import messages from '../docs/res-messages.json';
const { wrongInput, notFound } = messages.user;
const { noToken, unAuth, notAllowed } = messages.defaults;

// GET

export const authenticate = async (req: Request, res: Response) => {
    try {
        if (!res.locals.user)
            return Res.send(res, 401, unAuth);

        return Res.send(res, 200, messages.defaults.auth, res.locals.user);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const user = await User.findById(id);

        if (!user) return Res.send(res, 404, notFound);

        return Res.send(res, 200, messages.user.gotOne, user);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();

        return Res.send(res, 200, messages.user.gotAll, users);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const getUserTutorials = async (req: Request, res: Response) => {
    try {
        const { _id } = res.locals.user;

        const user = await User
            .findById(_id)
            .select('_id')
            .populate([
                {
                    path: 'tutorials', 
                    populate: {
                        path: 'infos',
                        select: 'title slug technology'
                    }
                }
            ]);

        const tutorials = user?.tutorials.sort(
            (a, b) => b.startingDate.getTime() - a.startingDate.getTime()
        ) || [];

        return Res.send(res, 200, messages.user.gotTutorials, tutorials);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// CREATE

export const createUser = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return Res.send(res, 400, wrongInput);

        const { email } = req.body;
        if (await User.findOne({ email })) 
            return Res.send(res, 400, wrongInput);

        await new User({
            ...req.body,
            isAdmin: false
        }).save();

        return Res.send(res, 201, messages.user.created);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// UPDATE

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const { _id, isAdmin } = res.locals.user;
        if (!isAdmin && _id?.toString() !== id)
            return Res.send(res, 403, notAllowed);

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return Res.send(res, 400, wrongInput);

        const OldUser = await User.findById(id);
        if (!OldUser) return Res.send(res, 404, notFound);

        const updateSet = {
            fname: req.body.fname,
            lname: req.body.lname
        };
        
        await User.findByIdAndUpdate(
            id,
            { $set: updateSet },
            { new: true, runValidators: true }
        );
    
        return Res.send(res, 204, messages.user.updated);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// DELETE

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const { _id, isAdmin } = res.locals.user;
        if (!isAdmin && _id?.toString() !== id)
            return Res.send(res, 403, notAllowed);

        await User.findByIdAndDelete(id);

        return Res.send(res, 204, messages.user.deleted);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// AUTH

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return Res.send(res, 400, wrongInput);

        const user = await User.findOne({ email }).select('+password');
        if (!user) return Res.send(res, 400, wrongInput);

        const doesMatch = await user.verifyPassword(password);
        if (!doesMatch) return Res.send(res, 400, wrongInput);

        return await generateConnectionToken(user, res);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        CookieHelper.clear(res, 'token');
        return Res.send(res, 204, messages.user.logout);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword, oldPassword } = req.body;

        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        if (!newPassword || !oldPassword || (newPassword === oldPassword))
            return Res.send(res, 400, wrongInput);

        const OldUser = await User.findById(id).select('+password');
        if (!OldUser) return Res.send(res, 404, notFound);

        const doesMatch = await OldUser.verifyPassword(oldPassword);
        if (!doesMatch) return Res.send(res, 400, wrongInput);

        const updateSet = { 
            password: await hashPassword(newPassword) 
        }
        
        await User.findByIdAndUpdate(
            id,
            { $set: updateSet },
            { runValidators: true }
        );

        return Res.send(res, 204, messages.user.updated);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const requestResetPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const user = await User.findById(id);
        if (!user) return Res.send(res, 404, notFound);

        const token = await generateToken();
        const NewToken = await new ResetToken({ 
            userId: id, 
            token
        }).save();

        const link = `${process.env.BASE_URL}/user/${user._id}/reset-password/${NewToken.token}`;
        await MailHelper.send(user.email, "Password reset", "Follow this url : " + link);
        return Res.send(res, 201, messages.token.created);
    } catch (error) {
        console.log(error);
        
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        if (!newPassword)
            return Res.send(res, 400, wrongInput);

        const resetToken = await ResetToken.findOne({ userId: id, token });
        if (!resetToken) return Res.send(res, 498, noToken);

        const OldUser = await User.findById(id).select('+password');
        if (!OldUser) return Res.send(res, 404, notFound);

        const updateSet = { 
            password: await hashPassword(newPassword) 
        }
        
        await OldUser.updateOne(
            { $set: updateSet },
            { runValidators: true }
        );

        return Res.send(res, 204, messages.user.updated);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

const generateConnectionToken = async (user: UserModel, res: Response) => {
    const token = await user.generateJwt();
    const options: CookieOptions = {
        httpOnly: true,
        expires: getDaysAfter(15),
        path: '/'
    };

    CookieHelper.send(res, {
        name: 'token',
        value: token,
        options
    });

    return Res.send(res, 204, messages.user.login);
}