import { CustomError } from "./CustomError";


export class DatabaseConnectionError extends CustomError {
    statusCode: number = 500
    public reason = "Error connecting to Database"
    constructor() {
        super("Error connecting to Database")

        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors(){
        return [{message: this.reason}]
    }

}