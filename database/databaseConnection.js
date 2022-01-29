const mongoose = require('mongoose');

exports.databaseConnection = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URI, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useUnifiedTopology: true,
		});
		console.log('Connected to the database');
	} catch (error) {
		console.log(error);
	}
};
