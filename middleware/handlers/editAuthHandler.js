const bcrypt = require('bcryptjs');

const { asyncHandler } = require('./asyncHandler');
const AuthenticationModel = require('../../database/dbModels/authenticationModel');

exports.editAuthHandler = asyncHandler(async (req, res, next) => {
	const {
		accessDecoder,
		renewAccessCookie,
		isUserExisting,
		userCredentials: {
			username,
			email,
			existingPassword,
			newUsername,
			newPassword,
		},
	} = await res.locals;

	const userToBeUpdated = await AuthenticationModel.find({
		_id: accessDecoder,
		username,
		email,
	}).limit(1);

	if (
		!isUserExisting ||
		!(await bcrypt.compare(existingPassword, userToBeUpdated[0].password))
	) {
		throw new ErrorHandler(401, 'Unauthorized Access');
	}

	if (
		username !== newUsername &&
		(await AuthenticationModel.exists({ username: newUsername }))
	) {
		throw new ErrorHandler(401, 'Unauthorized Access');
	}

	await AuthenticationModel.findOneAndUpdate(
		{
			_id: accessDecoder,
			username,
			email,
		},
		{
			username: newUsername,
			password: await bcrypt.hash(await newPassword, 10),
		}
	)
		.then(() => {
			return next();
		})
		.catch((error) => {
			throw new ErrorHandler(401, 'Unauthorized Access');
		});
});
