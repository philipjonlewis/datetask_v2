class ErrorHandler extends Error {
	constructor(status, message, payload) {
		super(status, message);
		this.status = status;
		this.message = message;
		this.payload = payload;
	}
}
module.exports = ErrorHandler;
