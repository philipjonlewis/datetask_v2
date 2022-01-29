const path = require('path');
const fs = require('fs');
const { jwtSignOptions } = require('../infosec/jwtSignOptions');
const jwt = require('jsonwebtoken');
const { randomUUID } = require( 'crypto' );

const privateKey = fs.readFileSync(
	path.resolve(__dirname, '../keys/refreshTokenKeys/refreshTokenPrivate.key'),
	'utf8'
);

const AuthenticationModel = require('../database/dbModels/authenticationModel');

exports.refreshTokenHandler = async (user) => {
	let newTokens = [];
	const token = jwt.sign({ token: randomUUID() }, await user._id);
	const newRefreshToken = jwt.sign(
		{
			tokenOne: token,
			tokenTwo: await user._id,
		},
		privateKey,
		jwtSignOptions(await user)
	);
	newTokens.push(newRefreshToken);
	await AuthenticationModel.findByIdAndUpdate(await user._id, {
		refreshTokens:  newTokens,
	});
};
