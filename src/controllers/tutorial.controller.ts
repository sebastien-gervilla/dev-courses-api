import { Request, Response } from "express";
import { isValidObjectId } from 'mongoose';
import { validationResult } from "express-validator";
import Tutorial from '../models/tutorial.model';
import { Res } from "../helpers";

import messages from '../docs/res-messages.json';
import User from "../models/user.model";
const { wrongInput, notFound } = messages.tutorial;
const { noToken, serverError } = messages.defaults;
const userNotFound = messages.user.notFound;

// GET

export const getTutorials = async (req: Request, res: Response) => {
    try {
        const tutorials = await Tutorial.find();

        return Res.send(res, 200, messages.tutorial.gotAll, tutorials);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

export const getTutorial = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        if (!slug) return Res.send(res, 404, notFound);

        const tutorial = await Tutorial.findOne({ slug });
        if (!tutorial) return Res.send(res, 404, notFound);

        return Res.send(res, 200, messages.tutorial.gotAll, tutorial);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

// CREATE

export const createTutorial = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return Res.send(res, 400, wrongInput);

        const { slug } = req.body;
        if (await Tutorial.findOne({ slug })) 
            return Res.send(res, 400, wrongInput);

        await new Tutorial(req.body).save();

        return Res.send(res, 201, messages.tutorial.created);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

export const followTutorial = async (req: Request, res: Response) => {
    try {
        const { _id } = res.locals.user;
        if (!isValidObjectId(_id))
            return Res.send(res, 404, userNotFound);

        const { tutorialId } = req.params;
        if (!isValidObjectId(_id))
            return Res.send(res, 404, notFound);

        const user = await User.findById(_id);
        if (!user) return Res.send(res, 404, userNotFound);

        const isFollowed = await User.findOne(
            { _id }, 
            { courses: { 
                $elemMatch: {
                    _id: tutorialId
                }
            }}
        );

        console.log("isFollowed : ", isFollowed);

        // await new User({
        //     ...req.body,
        //     isAdmin: false
        // }).save();

        return Res.send(res, 201, messages.user.created);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// UPDATE

export const updateTutorial = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return Res.send(res, 400, wrongInput);

        const OldTutorial = await Tutorial.findById(id);
        if (!OldTutorial) return Res.send(res, 404, notFound);
        
        await Tutorial.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
    
        return Res.send(res, 204, messages.tutorial.updated);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

// DELETE

export const deleteTutorial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return Res.send(res, 400, wrongInput);

        await Tutorial.findByIdAndDelete(id)

        return Res.send(res, 204, messages.tutorial.deleted);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}