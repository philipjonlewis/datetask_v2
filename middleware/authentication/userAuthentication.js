const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

exports.userAuthentication = asyncHandler(async (req, res, next) => {
	try {
		const refreshCookie = await req.signedCookies['__Secure-datetask'];
		const accessCookie = await req.signedCookies['__Secure-datetask-access'];

		const refreshFirstDecoding = jwt.verify(refreshCookie, publicKey);

		const refreshSecondDecoding = jwt.verify(
			await refreshFirstDecoding.tokenOne,
			await refreshFirstDecoding.tokenTwo
		);

		const accessDecoded = jwt.verify(
			accessCookie,
			await refreshFirstDecoding.tokenTwo
		);

		// if both refresh and access tokens are valid
		if (refreshSecondDecoding && accessDecoded) {
			return await res.status(200).json({
				code: 200,
				status: true,
				response: 'Verified User',
			});
        }
        
        
	} catch (error) {
		return await res
			.status(400)
			.clearCookie('__Secure-datetask', { path: '/' })
			.clearCookie('__Secure-datetask-access', { path: '/' })
			.header('Authorization', `Bearer `)
			.json({
				code: 400,
				status: false,
				response: 'Unable to verify user',
			});
	}
});
