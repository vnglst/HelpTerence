const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const Twit = require('twit');

const T = new Twit({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000,
});

function handleMention(tweet) {
	console.log(`\ntweet: ${tweet.text}`);
	if (tweet.text.includes('💰')) {
		const count = tweet.text.split('💰')
			.length - 1;
		console.log(`Thanks for donating ${count} money bags! 👍 `);
	}
}

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
