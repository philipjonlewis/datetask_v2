const { accessCookieOptions } = require('../../infosec/cookieOptions');
const { asyncHandler } = require('./asyncHandler');

exports.accessCookieRenewalHandler = asyncHandler(
	async (res, accessDecoder, jsonContents) => {
		return await res
			.status(200)
			.cookie(
				'__Secure-datetask-access',
				accessTokenHandler({ _id: await accessDecoder }),
				accessCookieOptions
			)
			.json(jsonContents);
	}
);
