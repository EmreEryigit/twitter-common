import { Handler, NextFunction, Request, Response } from "express";

export const asyncHandler =
    (handler: Handler): Handler =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
