import { Request, Response } from "express";
import { isValidObjectId } from 'mongoose';
import { validationResult } from "express-validator";
import Tutorial from '../models/tutorial.model';
import { Res } from "../helpers";

import messages from '../docs/res-messages.json';
const { wrongInput, notFound } = messages.tutorial;
const { noToken, serverError } = messages.defaults;

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

        console.log(tutorial);
        

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

// UPDATE

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