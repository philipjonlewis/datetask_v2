// Fix error logging format
// Error Model logging should be here

const ErrorHandler = require('./ErrorHandler');
const ErrorLogModel = require('../../database/dbModels/errorLogModel');

exports.customErrorMiddleware = async (error, req, res, next) => {
	//Error logging should be universal here
	return await res
		.status(error.status)
		.clearCookie('__Secure-datetask', { path: '/' })
		.clearCookie('__Secure-datetask-access', { path: '/' })
		.header('Authorization', `Bearer `)
		.json({
			code: error.status,
			status: false,
			message: error.message,
			...(error.payload && { payload: error.payload }),
		});
};
