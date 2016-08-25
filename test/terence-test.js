const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const test = require('tape');

const app = require('../server');
const terence = require('../bot/terence');
const BotController = require('../api/controllers/BotController');

const botData = {
	twitterID: '12345',
	money: 0,
};

const {
	cleanup,
} = require('./helper');

test('Clean up', cleanup);

test('Let @vnglst ask Terence for a status report', asyncFn(t => {
	const tweet = {
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = awaitFn(terence.__tests.handleStatus(tweet));
	t.ok(result, 'A status reply should be tweeted');
	const tweetId = result.data.id_str;
	t.ok(tweetId, 'A tweet id should be found');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Status tweet should be deleted');
			t.end();
		});
}));

test('Let @vnglst donate Terence some money', asyncFn(t => {
	const dbBot = awaitFn(BotController.createOrFindBot(botData));
	t.ok(dbBot, 'A bot should be created in the database');
	const tweet = {
		text: '💰',
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = awaitFn(terence.__tests.handleDonation(tweet));
	t.ok(result, 'A thank you tweet should be created');
	const tweetId = result.data.id_str;
	t.ok(tweetId, 'A tweet id should be found');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Thank you tweet should be deleted');
			t.end();
		});
}));

test('Let @vnglst donate Terence some money again', asyncFn(t => {
	const dbBot = awaitFn(BotController.createOrFindBot(botData));
	t.ok(dbBot, 'A bot should be created in the database');
	const tweet = {
		text: '💰',
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = awaitFn(terence.__tests.handleDonation(tweet));

	const tweetId = result.data.id_str;
	const tweetText = result.data.text;
	t.ok(tweetText,
		'@vnglst sorry, you already donated today. I dont want you to get poor!',
		'Should be a already donated tweet');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Already donated tweet should be deleted');
			t.end();
		});
}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
