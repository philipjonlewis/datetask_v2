const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
// const { escape, unescape } = require('html-escaper');

const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/errorHandler');

const emailValidatorSchema = Joi.object({
	email: Joi.string()
		.lowercase()
		.trim()
		.min(1)
		.max(256)
		.email({ minDomainSegments: 2, tlds: { allow: false } })
		.required(),
});

exports.emailValidator = asyncHandler(async (req, res, next) => {
	if (req.body.email.length > 1) {
		const { email } = await req.body;
		const sanitizedEmail = sanitizeHtml(req.sanitize(email));
		
		await emailValidatorSchema
			.validateAsync(
				{
					email: sanitizedEmail,
				},
				{
					escapeHtml: true,
					abortEarly: false,
				}
			)
			.then(() => {
				res.locals.userCredentials = {
					email: sanitizedEmail.toLowerCase(),
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
