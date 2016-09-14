module.exports = {
	db: 'mongodb://localhost/help_terence',
	botName: 'HelpTerence',
	twitter: {
		consumer_key: process.env.TWITTER_CONSUMER_KEY_PROD,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET_PROD,
		access_token: process.env.TWITTER_ACCESS_TOKEN_PROD,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_PROD,
		timeout_ms: 60 * 1000,
	},
};
