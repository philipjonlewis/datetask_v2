const path = require('path');
const fs = require('fs');

const jwt = require('jsonwebtoken');

const { asyncHandler } = require('../middleware/handlers/asyncHandler');

const ErrorHandler = require('../middleware/handlers/errorHandler');

const AuthenticationModel = require('../database/dbModels/authenticationModel');
const { resetPinJWTOptions } = require('./resetPinJWTOptions');

const resetPasswordPinPublic = fs.readFileSync(
	path.resolve(
		__dirname,
		'../keys/resetPasswordPinKeys/resetPasswordPinPublic.key'
	),
	'utf8'
);

exports.resetPinHandler = asyncHandler(async (req, res, next) => {
	const isValidResetPin = jwt.verify(
		await res.locals.jwtToken,
		resetPasswordPinPublic,
		resetPinJWTOptions
	);
	if (isValidResetPin) {
		await AuthenticationModel.exists({ email: isValidResetPin.email })
			.then(async () => {
				res.locals.email = await isValidResetPin.email;
				return next();
			})
			.catch((error) => {
				throw new ErrorHandler(401, 'Unauthorized Access');
			});
	}
});
