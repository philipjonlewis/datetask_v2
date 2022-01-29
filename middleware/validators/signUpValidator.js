const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
// const { escape, unescape } = require('html-escaper');

const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/errorHandler');

const signUpValidatorSchema = Joi.object({
	username: Joi.string()
		.alphanum()
		.lowercase()
		.trim()
		.min(1)
		.max(32)
		.required(),
	email: Joi.string()
		.lowercase()
		.trim()
		.min(1)
		.max(256)
		.email({ minDomainSegments: 2, tlds: { allow: false } })
		.required(),
	password: Joi.string()
		.trim()
		.min(6)
		.max(32)
		.pattern(
			new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,32}$')
		)
		.required(),
	passwordConfirmation: Joi.string().valid(Joi.ref('password')).required(),
});

exports.signUpValidator = asyncHandler(async (req, res, next) => {
	if (
		Object.values(await req.body).every((val) => {
			return val.length > 1;
		})
	) {
		const { username, password, email, passwordConfirmation } = await req.body;
		const sanitizedData = {
			username: sanitizeHtml(req.sanitize(username)),
			email: sanitizeHtml(req.sanitize(email)),
		};
		await signUpValidatorSchema
			.validateAsync(
				{
					username: sanitizedData.username,
					email: sanitizedData.email,
					password,
					passwordConfirmation,
				},
				{
					escapeHtml: true,
					abortEarly: false,
				}
			)
			.then(() => {
				res.locals.userCredentials = {
					username: sanitizedData.username.toLowerCase(),
					email: sanitizedData.email.toLowerCase(),
					password,
				};

				return next();
			})
			.catch(async (error) => {
				const signUpValidatorErrors = await error.details.map((err) => {
					return err.path[0];
				});

				throw new ErrorHandler(
					409,
					'There seems to be something wrong with the following fields',
					await signUpValidatorErrors
				);
			});
	} else {
		throw new ErrorHandler(422, 'Unable to procees incomplete data');
	}
});
