const test = require('tape');

const Bot = require('../src/bot/bot');
const app = require('../src/server');

const config = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY_TEST,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET_TEST,
	access_token: process.env.TWITTER_ACCESS_TOKEN_TEST,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_TEST,
	timeout_ms: 60 * 1000,
};

let bot;

test('Creating bot', t => {
	bot = new Bot(config);
	t.pass('Bot running.');
	t.end();
});

test('prune your followers list; unfollow a friend that has not followed you back',
	t => {
		bot.prune()
			.then((result) => {
				const target = result.data.id_str;
				t.ok(target, 'should unfollow user');
				t.comment(`Unfollowing @${result.data.screen_name}`);
				return bot.twit.post('friendships/create', {
					id: target,
				});
			})
		.then((result) => {
			const target = result.data.id_str;
			t.ok(target, 'should follow user');
			t.comment(`Following @${result.data.screen_name}`);
			t.end();
		})
		.catch((err) => {
			t.notOk(err, 'there should not be an error');
			t.comment(err);
			t.end();
		});
	});


test('Choose a random friend of one of your friends, and follow that user, unfollow after that',
	t => {
		bot.mingle()
			.then((result) => {
				const target = result.data.id_str;
				t.ok(target, 'should follow user');
				t.comment(`Following @${result.data.screen_name}`);
				return bot.twit.post('friendships/destroy', {
					id: target,
				});
			})
			.then((result) => {
				t.ok(result.data, 'should unfollow user');
				t.comment(`Unfollowing @${result.data.screen_name}`);
				t.end();
			})
			.catch((err) => {
				t.notOk(err, 'there should not be an error');
				t.comment(err);
				t.end();
			});
	});

test('Creating and deleting a tweet', t => {
	let tweetId = null;
	const status = 'Hello world, this is a test tweet';

	bot.tweet(status)
		.then((result) => {
			tweetId = result.data.id_str;
			t.ok(tweetId, 'a tweet should be created');
			return bot.destroy(tweetId);
		})
		.then((result) => {
			t.ok(result, 'a tweet should be deleted');
			t.end();
		})
		.catch((err) => {
			t.notOk(err, 'there should not be an error');
			t.comment(err);
			t.end();
		});
});

test('Find a random tweet about bots and follow user, unfollow after that', t => {
	bot.searchFollow({
		q: 'bot',
		lang: 'en',
		count: 100,
	})
		.then((result) => {
			const target = result.data.id_str;
			t.ok(target, 'should follow user');
			t.comment(`Following @${result.data.screen_name}`);
			return bot.twit.post('friendships/destroy', {
				id: target,
			});
		})
		.then((result) => {
			t.ok(result.data, 'should unfollow user');
			t.comment(`Unfollowing @${result.data.screen_name}`);
			t.end();
		})
		.catch((err) => {
			t.notOk(err, 'there should not be an error');
			t.comment(err);
			t.end();
		});
});

test('Reply to someone, delete tweet after that', t => {
	let tweetId = null;
	const tweet = {
		user: {
			screen_name: 'rpi147',
		},
	};
	const message = 'hello there!';
	bot.reply(tweet, message)
		.then((result) => {
			tweetId = result.data.id_str;
			t.ok(tweetId, 'a tweet should be created');
			return bot.destroy(tweetId);
		})
		.then((result) => {
			t.ok(result, 'a tweet should be deleted');
			t.end();
		})
		.catch((err) => {
			t.notOk(err, 'there should not be an error');
			t.comment(err);
			t.end();
		});
});

test.onFinish(() => process.exit(0));
