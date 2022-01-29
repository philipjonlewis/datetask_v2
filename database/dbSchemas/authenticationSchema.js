const mongoose = require('mongoose');
const { Schema } = mongoose;
const { emailRegex, passwordRegex } = require('../../infosec/regexValidators');

const deviceCountLimiter = (val) => {
	if (this.userRole === 'member' && this.isEmailVerified === true) {
		return val.length <= 6;
	}

	if (this.userRole === 'premium' && this.isEmailVerified === true) {
		return val.length <= 10;
	}

	return val.length <= 3;
};

exports.authenticationSchema = new Schema(
	{
		_id: { type: String, required: true },
		username: {
			type: String,
			required: [true, 'username is required'],
			trim: true,
			unique: true,
			max: 32,
		},
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
			validate: [
				deviceCountLimiter,
				'You have exceeded the allowed number of devices',
			],
		},
		resetPins: {
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
