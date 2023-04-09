import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import messages from '../docs/res-messages.json';
import User from '../models/user.model';
import { Res } from '../helpers';

const { unAuth, notAllowed, serverError } = messages.defaults;

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.cookies;
    
        if (!token) return Res.send(res, 401, unAuth);
        
        const { id } = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        const user = await User.findById(id);
    
        if (!user) return Res.send(res, 401, unAuth);

        res.locals.user = user;
    
        return next();
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (res.locals.user?.isAdmin)
            return Res.send(res, 403, notAllowed);
    
        return next();
    } catch (error) {
        return Res.send(res, 500, serverError);
    }
}