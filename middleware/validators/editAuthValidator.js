const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

const { asyncHandler } = require('../handlers/asyncHandler');
const ErrorHandler = require('../handlers/errorHandler');

const editAuthValidatorSchema = Joi.object({
	username: Joi.string().alphanum().lowercase().trim().min(1).max(32),
	email: Joi.string()
		.lowercase()
		.trim()
		.min(1)
		.max(256)
		.email({ minDomainSegments: 2, tlds: { allow: false } })
		.required(),
	existingPassword: Joi.string()
		.trim()
		.min(6)
		.max(32)
		.pattern(
			new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,32}$')
		)
		.required(),
	existingPasswordConfirmation: Joi.string()
		.valid(Joi.ref('existingPassword'))
		.required(),
	newUsername: Joi.string().alphanum().lowercase().trim().min(1).max(32),
	newPassword: Joi.string()
		.trim()
		.min(6)
		.max(32)
		.pattern(
			new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,32}$')
		),
	newPasswordConfirmation: Joi.string()
		.valid(Joi.ref('newPassword'))
		.required(),
});

exports.editAuthValidator = asyncHandler(async (req, res, next) => {
	if (
		Object.values(req.body).every((val) => {
			return val.length > 1;
		})
	) {
		const {
			username,
			email,
			existingPassword,
			existingPasswordConfirmation,
			newUsername,
			newPassword,
			newPasswordConfirmation,
		} = await req.body;

		const sanitizedOldUsername = sanitizeHtml(req.sanitize(username));
		const sanitizedNewUsername = sanitizeHtml(req.sanitize(newUsername));

		await editAuthValidatorSchema
			.validateAsync(
				{
					username: sanitizedOldUsername,
					email,
					existingPassword,
					existingPasswordConfirmation,
					newUsername: sanitizedNewUsername,
					newPassword,
					newPasswordConfirmation,
				},
				{
					escapeHtml: true,
					abortEarly: false,
				}
			)
			.then(async () => {
				res.locals.userCredentials = {
					username: await sanitizedOldUsername,
					email,
					existingPassword,
					newUsername: await sanitizedNewUsername,
					newPassword,
				};

				return next();
			})
			.catch(async (error) => {
				const logInValidatorErrors = error.details.map((err) => {
					return err.path[0];
				});
				throw new ErrorHandler(
					409,
					'There seems to be something wrong with the following fields',
					logInValidatorErrors
				);
			});
	}
});
