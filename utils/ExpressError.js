// Custom express error
class ExpressError extends Error {
    constructor(message, statusCode) {
        super()
        this.message = message
        this.statusCode = statusCode
    }
}
// exporting express error
module.exports  = ExpressError