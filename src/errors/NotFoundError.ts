import { CustomError } from "./CustomError";

export class NotFoundError extends CustomError {
    statusCode: number = 404;
    constructor() {
        super("Not Found");
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{ message: "Not Found" }];
    }
}
