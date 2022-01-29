const mongoose = require('mongoose');
const { errorLogSchema } = require('../dbSchemas/errorLogSchema');

const ErrorLog = mongoose.model('errorlog', errorLogSchema);
module.exports = ErrorLog;
