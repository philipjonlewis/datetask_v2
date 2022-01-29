const mongoose = require('mongoose');
const { userInformationSchema } = require( '../dbSchemas/userInformationSchema' );

const User = mongoose.model( 'user', userInformationSchema );

module.exports = User;
