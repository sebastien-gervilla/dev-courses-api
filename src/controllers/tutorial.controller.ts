import { Request, Response } from "express";
import { isValidObjectId } from 'mongoose';
import { validationResult } from "express-validator";
import Tutorial from '../models/tutorial.model';
import { Res } from "../helpers";

import messages from '../docs/res-messages.json';
import User from "../models/user.model";
const { wrongInput, notFound, gotOne } = messages.tutorial;
const { notAllowed, serverError } = messages.defaults;

// GET

export const getTutorials = async (req: Request, res: Response) => {
    try {
        const tutorials = await Tutorial.find().select('-content');

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
        
        const { _id, isAdmin } = res.locals.user;
        if (isAdmin) return Res.send(res, 200, gotOne, tutorial); 
        
        const user = await User.findOne({
            _id, 
            'tutorials.infos': tutorial._id
        });
        
        if (!user) return Res.send(res, 403, notAllowed);

        return Res.send(res, 200, gotOne, tutorial);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

export const getTutorialPreview = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        if (!slug) return Res.send(res, 404, notFound);

        const tutorial = await Tutorial.findOne({ slug }).select('-content');
        if (!tutorial) return Res.send(res, 404, notFound);

        return Res.send(res, 200, gotOne, tutorial);
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

export const getTutorialById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return Res.send(res, 404, notFound);

        const tutorial = await Tutorial.findById(id);
        if (!tutorial) return Res.send(res, 404, notFound);

        return Res.send(res, 200, gotOne, tutorial);
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

        const { id } = req.params;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const tutorial = await Tutorial.findById(id);
        if (!tutorial) return Res.send(res, 404, notFound);

        const followingUser = await User.findOne({ _id, 'tutorials.infos': tutorial._id });
        if (followingUser)
            return Res.send(res, 204, messages.tutorial.created);

        await User.findOneAndUpdate(
            { _id, 'tutorials.infos': { $ne: tutorial._id } },
            { $addToSet: { tutorials: { infos: tutorial._id } } },
            { new: true, upsert: true }
        );

        return Res.send(res, 204, messages.tutorial.followed);
    } catch (error) {
        return Res.send(res, 500, messages.defaults.serverError);
    }
}

export const completeTutorial = async (req: Request, res: Response) => {
    try {
        const { _id } = res.locals.user;

        const { id } = req.params;
        if (!isValidObjectId(id))
            return Res.send(res, 404, notFound);

        const tutorial = await Tutorial.findById(id);
        if (!tutorial) return Res.send(res, 404, notFound);

        await User.findOneAndUpdate(
            { _id, 'tutorials.infos': tutorial._id },
            { $set: { 'tutorials.$.isCompleted': true } },
            { new: true }
        );

        return Res.send(res, 204, messages.tutorial.completed);
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