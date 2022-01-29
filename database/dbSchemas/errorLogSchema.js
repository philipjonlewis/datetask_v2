const mongoose = require('mongoose');
const { Schema } = mongoose;

exports.errorLogSchema = new Schema(
	{
		authenticationIdReference: {
			type: String,
		},
		route: {
			type: String,
		},
		errorCode: {
			type: Number,
		},
		errorMessage: {
			type: String,
		},
		errorDetails: {
			type: String,
		},
		userAgentData: {
			device: String,
			browser: String,
			version: String,
			os: String,
			platform: String,
			source: String,
		},
		ipAddress: String,
		// Only decode this cookie on security admin route
		refreshCookie: String,
		accessCookie: String,
	},
	{ timestamps: true }
);

/* 
    format must be flexible for multiple types of errors so maybe not so much on requiriing multiple fields

    Maybe i should make internal error codes.

    {
        authIdReference,
        route,
        statusCode,
        message,
        details,
        userAgentData,
        IPAddress,
        refreshToken,
        accessToken,
        sessionData(if any)
    }
*/
