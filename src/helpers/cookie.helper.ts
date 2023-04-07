import { CookieOptions, Response } from "express";

interface Cookie {
    name: string,
    value: string,
    options: CookieOptions
}

export default class CookieHelper {
    static send(res: Response, cookie: Cookie) {
        res.cookie(
            cookie.name,
            cookie.value,
            cookie.options
        );
    }

    static clear(res: Response, key: string) {
        res.clearCookie(key);
    }
}