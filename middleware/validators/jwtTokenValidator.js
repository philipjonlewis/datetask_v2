const Joi = require('joi');

const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/errorHandler');

const jwtTokenValidatorSchema = Joi.object({
	jwtToken: Joi.string()
		.trim()
		.pattern(new RegExp('^[A-Za-z0-9-_]*.[A-Za-z0-9-_]*.[A-Za-z0-9-_]*$'))
		.required(),
});

exports.jwtTokenValidator = asyncHandler(async (req, res, next) => {
	if (req.body.jwtToken.length > 1) {
		const { jwtToken } = await req.body;
		await jwtTokenValidatorSchema
			.validateAsync(
				{
					jwtToken,
				},
				{
					escapeHtml: true,
					abortEarly: false,
				}
			)
			.then(() => {
				res.locals.jwtToken = jwtToken;
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
