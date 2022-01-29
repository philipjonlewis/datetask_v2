const AuthenticationModel = require('../../database/dbModels/authenticationModel');
const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/errorHandler');

exports.userExistenceVerification = asyncHandler(async (req, res, next) => {
	try {
		const {
			userCredentials: { username, email },
		} = await res.locals;

		(await AuthenticationModel.exists({ username })) ||
		(await AuthenticationModel.exists({ email }))
			? (res.locals.isUserExisting = true)
			: (res.locals.isUserExisting = false);

		return next();
	} catch (error) {
		throw new ErrorHandler(500, error.message);
	}
});
