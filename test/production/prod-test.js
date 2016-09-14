const test = require('tape');

const app = require('../../server');
const terence = require('../../bot/terence');

test('Ask Terence for a status report', async t => {
	const result = await terence.bot.tweet('@HelpTerence status?');
	t.ok(result, 'A status request should be tweeted');
	const tweetId = result.data.id_str;
	t.ok(tweetId, 'A tweet id should be found');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Status tweet should be deleted');
			t.end();
		});
});

test.onFinish(() => process.exit(0));
