exports.jwtSignOptions = (user) => {
	return {
		issuer: user.username,
		subject: user.email,
		audience: process.env.WEBSITE_NAME,
		expiresIn: '672h',
		algorithm: 'RS256',
	};
};

exports.jwtAccessSignOptions = (user) => {
	return {
		issuer: user.username,
		subject: user.email,
		audience: process.env.WEBSITE_NAME,
		expiresIn: '1800000',
	};
};
