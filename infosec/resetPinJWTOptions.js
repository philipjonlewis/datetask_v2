exports.resetPinJWTOptions = {
	issuer: 'Special Case',
	subject: 'Special Case',
	audience: process.env.WEBSITE_NAME,
	expiresIn: '672h',
	algorithm: 'RS256',
};
