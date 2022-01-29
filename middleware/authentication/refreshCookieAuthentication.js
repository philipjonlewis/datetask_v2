const path = require('path');
const fs = require('fs');

const jwt = require('jsonwebtoken');

const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/ErrorHandler');
const { uuidV4Regex } = require('../../infosec/regexValidators');

const publicKey = fs.readFileSync(
	path.resolve(__dirname, '../../keys/refreshTokenKeys/refreshTokenPublic.key'),
	'utf8'
);

exports.refreshCookieAuthentication = asyncHandler(async (req, res, next) => {
	try {
		const refreshCookie = await req.signedCookies['__Secure-datetask'];

		const refreshFirstDecoding = jwt.verify(await refreshCookie, publicKey);

		const refreshSecondDecoding = jwt.verify(
			await refreshFirstDecoding.tokenOne,
			await refreshFirstDecoding.tokenTwo
		);

		if (uuidV4Regex.test(await refreshSecondDecoding.token)) {
			res.locals.accessDecoder = await refreshFirstDecoding.tokenTwo;

			return next();
		}
		throw new ErrorHandler(401, 'Unauthorized Access');
	} catch (error) {
		throw new ErrorHandler(401, 'Unauthorized Access');
	}
});
