const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { jwtSignOptions } = require('../../infosec/jwtSignOptions');
const { resetPinJWTOptions } = require('../../infosec/resetPinJWTOptions');
const { authenticationSchema } = require('../dbSchemas/authenticationSchema');
// Maybe change to uuidv4
const { randomUUID } = require('crypto');

const privateKey = fs.readFileSync(
	path.resolve(
		__dirname,
		'../../keys/refreshTokenKeys/refreshTokenPrivate.key'
	),
	'utf8'
);

const resetPasswordPinPrivate = fs.readFileSync(
	path.resolve(
		__dirname,
		'../../keys/resetPasswordPinKeys/resetPasswordPinPrivate.key'
	),
	'utf8'
);

authenticationSchema.pre('save', async function (next) {
	const token = jwt.sign({ token: randomUUID() }, await this._id);

	this.refreshTokens.push(
		jwt.sign(
			{ tokenOne: token, tokenTwo: await this._id },
			privateKey,
			jwtSignOptions(this)
		)
	);

	// for (let x = 0; x < 1; x++) {
	this.resetPins.push(
		jwt.sign(
			{ email: this.email, value: randomUUID() },
			resetPasswordPinPrivate,
			resetPinJWTOptions
		)
	);
	// }

	if (!this.isModified('password')) {
		return next();
	}

	this.password = await bcrypt.hash(await this.password, 10);
	next();
});

const Authentication = mongoose.model('authentication', authenticationSchema);
module.exports = Authentication;
