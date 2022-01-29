// This should be trigger upon login only
const session = require('express-session');

const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

redisClient.on('error', (err) => {
	console.log('Redis error: ', err);
});

redisClient.on('connect', (err) => {
	console.log('Connected to redis successfully');
});

app.use(
	session({
		secret: process.env.INUMAN_SESSIONS,
		// name: 'Datetask', //When the secure flag is added, it creates a new session object
		resave: false,
		saveUninitialized: true,
		cookie: {
			signed: true,
			expires: 30000,
			maxAge: 30000,
			secure: false, //If this is true, it creates a new session object everytime
			httpOnly: true,
			sameSite: 'lax',
			overwirte: true,
		},
		store: new redisStore({
			host: 'localhost',
			port: 6379,
			client: redisClient,
			ttl: 86400,
		}),
	})
);
