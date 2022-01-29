const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { asyncHandler } = require('../middleware/handlers/asyncHandler');

const ErrorHandler = require('../middleware/handlers/errorHandler');

const AuthenticationModel = require('../database/dbModels/authenticationModel');
const { jwtAccessSignOptions } = require('./jwtSignOptions');

exports.accessTokenHandler = asyncHandler(async (newUser) => {
	const newAccessToken = jwt.sign(
		{ access: uuidv4() },
		await newUser._id,
		jwtAccessSignOptions(await newUser)
	);

	return newAccessToken;
});
