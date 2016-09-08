module.exports = {
	db: 'mongodb://localhost/help_terence',
	twitter: {
		consumer_key: process.env.TWITTER_CONSUMER_KEY_DEV,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET_DEV,
		access_token: process.env.TWITTER_ACCESS_TOKEN_DEV,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_DEV,
		timeout_ms: 60 * 1000,
	},
};
