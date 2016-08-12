require('console.table');
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

exports.login = asyncFn(() => {
	try {
		const result = awaitFn(
			T.get('account/verify_credentials', {
				skip_status: true,
			}));
		if (result.data.errors) {
			console.table('\nError loading bot!', result.data.errors);
		} else {
			console.log(`Bot "${result.data.name}" succesfully loaded!`);
		}
	} catch (err) {
		console.log('caught error', err.stack);
	}
});
