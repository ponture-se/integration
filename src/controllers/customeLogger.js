// import * as dotenv from 'dotenv';
const winston = require('winston');
require('winston-mongodb');
const dotenv = require('dotenv');
dotenv.config();


const dbConnString = process.env.LOG_DB_CONNECTION_STRING || "mongodb+srv://backupLogDB:9SEnbWEu2qmGRYpo@cluster0-ljo1h.mongodb.net/backupLogDB?retryWrites=true&w=majority";

const logger = winston.createLogger({
	level: 'silly',
	format: winston.format.json(),
	// defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.MongoDB({
			db: dbConnString,
			level: 'silly',
			options: {
				useUnifiedTopology: true
			},
			collection: 'generalLogs',
			storeHost: true
		})
	]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.simple()
	}));
}

module.exports = logger;