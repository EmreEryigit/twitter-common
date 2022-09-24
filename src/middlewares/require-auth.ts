import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        throw new UnauthorizedError();
    }
    next();
};
