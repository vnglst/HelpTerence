const app = require('../server');
const test = require('tape');
const Twit = require('twit');
// const asyncFn = require('asyncawait/async');
// const awaitFn = require('asyncawait/await');

const T = new Twit({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000,
});

test('Creating and deleting status Tweet', t => {
	let tweetId = null;
	const params = {
		status: '@helpterence status',
	};

	T.post('statuses/update', params, (err, reply, response) => {
		console.log('\ntweeted:', reply.text);
		tweetId = reply.id_str;
		t.ok(tweetId);
		t.ok(response);
		const deleteParams = {
			id: tweetId,
		};

		T.post('statuses/destroy/:id', deleteParams, (delErr, body, delResponse) => {
			t.notOk(delErr);
			t.ok(delResponse);
			t.end();
		});
	});
});

test.onFinish(() => process.exit(0));
