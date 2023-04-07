import { Response } from "express";

export default class Res {
    static send(res: Response, httpCode: number, message: string, data?: any) {
        res.statusCode = httpCode;
        res.statusMessage = message;

        return res.json({
            data,
            meta: {}
        });
    }

    // wrongInput function ? for default ?

    // Error function so i can log the error
}