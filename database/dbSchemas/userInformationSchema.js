const mongoose = require('mongoose');
const { Schema } = mongoose;


exports.userInformationSchema = new Schema({
	userCredentials: {
		firstName: String,
		lastName: String,
	},
	birthday: {
		type: Date,
		select: false,
	},
	industry: {
		type: String,
		select: false,
	},
	location: {
		type: String,
		select: false,
	},
	projects: {
		type: Schema.Types.ObjectId,
		ref: 'project',
	},
	securityNotifications: [{ type: String }],
	activeDeviceList: [{ type: String }],
});
