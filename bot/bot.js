const Twit = require('twit');
const handlers = require('./handlers');

const T = new Twit({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000,
});

// Private functions

function handleMention(tweet) {
	const text = tweet.text;
	console.log(`[Bot] Somebody mentioned me in the following tweet:\n ${text}`);
	if (text.includes('💰')) handlers.handleDonation(tweet, T);
	if (text.includes('status')) handlers.handleStatus(tweet, T);
}

// Public functions

exports.listen = () => {
	const stream = T.stream('statuses/filter', {
		track: ['@HelpTerence'],
	});

	stream.on('connected', () => {
		console.log('[Bot] Connected to stream. Listening...');
	});

	stream.on('tweet', handleMention);

	stream.on('reconnecting', (req, res, connectInterval) => {
		console.log('[Bot] Got disconnected. Scheduling reconnect! statusCode:',
			res.statusCode,
			'connectInterval',
			connectInterval);
	});

	stream.on('error', (err) => {
		console.log('[Bot] Stream emitted an error', err);
	});

	stream.on('disconnected', () => {
		console.log('[Bot] Disconnected from stream.');
	});
};
