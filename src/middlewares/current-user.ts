import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
    id: number;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.session?.jwt) {
        return next();
    }
    try {
        const payload = jwt.verify(
            req.session?.jwt,
            process.env.JWT_KEY!
        ) as UserPayload;

        req.currentUser = payload;
    } catch (err) {}

    next();
};
