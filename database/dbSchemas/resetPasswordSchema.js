const mongoose = require('mongoose');
const { Schema } = mongoose;
const { emailRegex, passwordRegex } = require('../../infosec/regexValidators');

exports.resetPasswordSchema = new Schema(
	{
		email: {
			type: String,
			required: [true, 'email is required'],
			trim: true,
			unique: true,
			max: 256,
			match: emailRegex,
		},
		password: {
			type: String,
			required: [true, 'password is required'],
			min: 6,
			max: 32,
			match: passwordRegex,
		},
		isEmailVerified: {
			type: Boolean,
		},
		userInformationReference: {
			type: Schema.Types.ObjectId,
			ref: 'users',
		},
		userRole: {
			type: String,
			default: 'free',
		},
		errorLogReference: {
			type: Schema.Types.ObjectId,
			ref: 'errorLog',
		},
		refreshTokens: {
			type: [
				{
					type: String,
				},
			],
		},
	},
	{ timestamps: true }
);

/*
Think about the format of the auth tokens.
should they have user-agent fields? possibly IP adress for additional security as well.
*/
