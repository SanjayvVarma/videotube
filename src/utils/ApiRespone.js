class ApiResponse {
    constructor(statusCode, data, success, message) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = success < 400
    }
}

export default ApiResponse;
