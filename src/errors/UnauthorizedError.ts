import { CustomError } from "./CustomError";

export class UnauthorizedError extends CustomError {
    statusCode: number = 401;
    constructor() {
        super("Not Authorized");

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }

    serializeErrors() {
        return [{ message: "Not Authorized" }];
    }
}
