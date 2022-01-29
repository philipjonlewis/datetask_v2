const redis = require('redis');
const redisClient = redis.createClient({ enable_offline_queue: false });

const { RateLimiterRedis } = require('rate-limiter-flexible');

// It is recommended to process Redis errors and setup some reconnection strategy
redisClient.on('error', (err) => {});
redisClient.on('connect', (err) => {
	console.log('Connected to redis rate-limiter successfully');
});

const authenticationRateLimiterOptions = {
	// Basic options
	storeClient: redisClient,
	points: 10, // Number of points
	duration: 5, // Per second(s)

	// Custom
	execEvenly: false, // Do not delay actions evenly
	blockDuration: 0, // Do not block if consumed more than points
	keyPrefix: 'rlflx', // must be unique for limiters with different purpose
};

const rateLimiterRedis = new RateLimiterRedis(authenticationRateLimiterOptions);

exports.authRateLimiterMiddleware = (req, res, next) => {
	rateLimiterRedis
		.consume(req.ip)
		.then(() => {
			next();
		})
		.catch((error) => {
			const secs = Math.round(640 / 1000) || 1;
			res.set('Retry-After', String(secs));
			res.status(429).json({
				code: 429,
				status: false,
				message: 'Too Many Requests',
				details: `Try again after ${secs} seconds`,
			});

			// if (rejRes && rejRes instanceof Error) {
			// 	// Some Redis error
			// 	// Never happen if `insuranceLimiter` set up
			// 	// Decide what to do with it in other case
			// } else {
			// 	// Can't consume
			// 	// If there is no error, rateLimiterRedis promise rejected with number of ms before next request allowed
			// 	const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
			// 	res.set('Retry-After', String(secs));
			// 	res.status(429).send('Too Many Requests');
			// }
		});
};
