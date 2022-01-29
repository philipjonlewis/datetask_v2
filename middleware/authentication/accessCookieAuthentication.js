const jwt = require('jsonwebtoken');

const AuthenticationModel = require('../../database/dbModels/authenticationModel');
const { uuidV4Regex } = require('../../infosec/regexValidators');
const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

exports.accessCookieAuthentication = asyncHandler(async (req, res, next) => {
	try {
		const accessCookie = await req.signedCookies['__Secure-datetask-access'];

		const accessDecoded = jwt.verify(
			await accessCookie,
			await res.locals.accessDecoder
		);

		const expirationDate = new Date(0);
		expirationDate.setUTCSeconds(accessDecoded.exp);
		const dateNow = new Date().toISOString();

		if (uuidV4Regex.test(await accessDecoded.access)) {
			if (dateNow > expirationDate.toISOString()) {
				res.locals.renewAccessCookie = true;
			}

			return next();
		} else {
			throw new ErrorHandler(401, 'Unauthorized Access');
		}
	} catch (error) {
		console.error(error);
		throw new ErrorHandler(401, 'Unauthorized Access');
	}
});
