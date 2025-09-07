export class ApiResponse {
    constructor(
        message = "Success",
        statusCode,
        data
    ){
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}