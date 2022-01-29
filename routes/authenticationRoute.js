const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const AuthenticationModel = require('../database/dbModels/authenticationModel');

const { asyncHandler } = require('../middleware/handlers/asyncHandler');
const ErrorHandler = require('../middleware/handlers/ErrorHandler');
const { signUpValidator } = require('../middleware/validators/signUpValidator');
const { logInValidator } = require('../middleware/validators/logInValidator');
const {
	userExistenceVerification,
} = require('../middleware/verification/userExistenceVerification');
const {
	editAuthValidator,
} = require('../middleware/validators/editAuthValidator');
const {
	refreshCookieAuthentication,
} = require('../middleware/authentication/refreshCookieAuthentication');
const {
	accessCookieAuthentication,
} = require('../middleware/authentication/accessCookieAuthentication');

const { refreshTokenHandler } = require('../infosec/refreshTokenHandler');
const { authRateLimiterMiddleware } = require('../infosec/rateLimiter');
const {
	refreshCookieOptions,
	accessCookieOptions,
	resetCookieOptions,
} = require('../infosec/cookieOptions');
const { jwtAccessSignOptions } = require('../infosec/jwtSignOptions');
const { accessTokenHandler } = require('../infosec/accessTokenHandler');
const {
	accessCookieRenewalHandler,
} = require('../middleware/handlers/accessCookieRenewalHandler');
const { editAuthHandler } = require('../middleware/handlers/editAuthHandler');
const { emailValidator } = require('../middleware/validators/emailValidator');

const {
	resetPasswordNodemailer,
} = require('../utilities/resetPasswordNodemailer');
const { resetPinHandler } = require('../infosec/resetPinHandler');
const {
	jwtTokenValidator,
} = require('../middleware/validators/jwtTokenValidator');

router.use(authRateLimiterMiddleware);

router.route('/user/signup').post(
	[signUpValidator, userExistenceVerification],
	asyncHandler(async (req, res) => {
		const { userCredentials, isUserExisting } = await res.locals;

		if (isUserExisting) {
			throw new ErrorHandler(409, 'Unable to process credentials');
		}

		try {
			const newUser = await new AuthenticationModel({
				...userCredentials,
				_id: uuidv4(),
			});

			await newUser.save().then(async () => {
				//email onboarding message to user
				//email hardcoded reset pins to user
				return await res
					.status(201)
					.header('Authorization', `Bearer ${await newUser.refreshTokens[0]}`)
					.cookie(
						'__Secure-datetask',
						newUser.refreshTokens[0],
						refreshCookieOptions
					)
					.cookie(
						'__Secure-datetask-access',
						accessTokenHandler(newUser),
						accessCookieOptions
					)
					.json({
						code: 201,
						status: true,
						message: 'Successfully created a new user',
					});
			});
		} catch (error) {
			throw new ErrorHandler(409, 'Unable to process credentials');
		}
	})
);

router.route('/user/login').post(
	[logInValidator, userExistenceVerification],
	asyncHandler(async (req, res) => {
		const {
			userCredentials: { username, password },
			isUserExisting,
		} = await res.locals;

		if (!isUserExisting) {
			throw new ErrorHandler(404, 'Unable to log in with given credentials');
		}

		const existingUser = await AuthenticationModel.find({
			username: await username,
		}).limit(1);

		if (await bcrypt.compare(password, existingUser[0].password)) {
			await refreshTokenHandler(existingUser[0]);

			const newAccessToken = jwt.sign(
				{ access: uuidv4() },
				await existingUser[0]._id,
				jwtAccessSignOptions(existingUser[0])
			);

			try {
				return await res
					.status(200)
					.header('Authorization', `Bearer ${existingUser[0].refreshTokens[0]}`)
					.cookie(
						'__Secure-datetask',
						existingUser[0].refreshTokens[0],
						refreshCookieOptions
					)
					.cookie(
						'__Secure-datetask-access',
						newAccessToken,
						accessCookieOptions
					)
					.json({
						code: 200,
						status: true,
						message: 'Successfully logged in',
					});
			} catch (error) {
				throw new ErrorHandler(
					400,
					'Something went wrong, try logging in again'
				);
			}
		}

		throw new ErrorHandler(401, 'Unauthorized Access');
	})
);

router.route('/user/edit').patch(
	[
		refreshCookieAuthentication,
		accessCookieAuthentication,
		editAuthValidator,
		userExistenceVerification,
		editAuthHandler,
	],
	asyncHandler(async (req, res) => {
		try {
			const { accessDecoder, renewAccessCookie } = await res.locals;
			const jsonContents = {
				code: 200,
				status: true,
				response: 'Successfully updated credentials',
			};
			renewAccessCookie &&
				accessCookieRenewalHandler(res, accessDecoder, jsonContents);
			return await res.status(200).json(jsonContents);
		} catch (error) {
			throw new ErrorHandler(401, 'Unauthorized Access');
		}
	})
);

// this route will accept the email address to reset the password
//maybe this route needs another rate limiter
router.route('/user/reset').post(
	[emailValidator, userExistenceVerification],
	asyncHandler(async (req, res) => {
		const {
			isUserExisting,
			userCredentials: { email },
		} = await res.locals;

		if (!isUserExisting) {
			return await res.status(200).json({
				code: 200,
				status: true,
				response:
					'Instructions to reset your password have been sent to your email',
			});
		}

		const user = await AuthenticationModel.find({ email }).limit(1);
		await resetPasswordNodemailer(email, user[0].resetPins[0]);

		return await res.status(200).json({
			code: 200,
			status: true,
			response:
				'Instructions to reset your password have been sent to your email',
		});

		//send resetpin to email as well as the link to put reset pin
	})
);

// this route will accept a hardcoded pin thats already in the auth db file
router.route('/user/reset/hardcoded').post(
	[jwtTokenValidator, resetPinHandler],
	asyncHandler(async (req, res, next) => {
		const { email, jwtToken } = await res.locals;
		// log to DB reset password the email
		// send email containing reset password link to input new password
		return await res
			.status(200)
			.clearCookie('__Secure-datetask', { path: '/' })
			.clearCookie('__Secure-datetask-access', { path: '/' })
			.header('Authorization', `Bearer `)
			.cookie('__Secure-datetask-reset', jwtToken, resetCookieOptions)
			.json({
				code: 200,
				status: true,
				response:
					'Instructions to reset your password have been sent to your email',
			});
	})
);

// This is the route where they send their new password
// this link can only be accessed if cookie is present
router.route('/user/reset/newpassword').post(
	// [resetPasswordCookieAuthentication,resetPasswordContentValidation],
	asyncHandler(async (req, res) => {
		const { jwtToken, email, password, passwordConfirmation } = await req.body;

		// change reset pin,refresh,access tokens. clean everything before asking to log in
	})
);

// This route verifies logged in user without exposing user data
router.route('/user/verify').get(
	[refreshCookieAuthentication, accessCookieAuthentication],
	asyncHandler(async (req, res) => {
		try {
			const { accessDecoder, renewAccessCookie } = await res.locals;
			const jsonContents = {
				code: 200,
				status: true,
				response: 'Verified User',
			};
			renewAccessCookie &&
				accessCookieRenewalHandler(res, accessDecoder, jsonContents);
			return await res.status(200).json(jsonContents);
		} catch (error) {
			throw new ErrorHandler(401, 'Unauthorized Access');
		}
	})
);

router.route('/user/logout').get(
	asyncHandler(async (req, res) => {
		return await res
			.status(200)
			.clearCookie('__Secure-datetask', { path: '/' })
			.clearCookie('__Secure-datetask-access', { path: '/' })
			.header('Authorization', `Bearer `)
			.json({
				code: 200,
				status: true,
				response: 'Successfully logged out',
			});
	})
);

module.exports = router;
