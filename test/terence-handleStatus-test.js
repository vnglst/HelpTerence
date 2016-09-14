const test = require('tape');

const app = require('../src/server');
const terence = require('../src/bot/terence');

test('Ask Terence for a status report', async t => {
	const tweet = {
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = await terence.__tests.handleStatus(tweet);
	t.ok(result, 'A status reply should be tweeted');
	const tweetId = result.data.id_str;
	t.ok(tweetId, 'A tweet id should be found');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Status tweet should be deleted');
			t.end();
		});
});

test.onFinish(() => process.exit(0));
