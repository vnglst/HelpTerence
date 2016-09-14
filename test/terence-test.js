const test = require('tape');

const app = require('../src/server');
const terence = require('../src/bot/terence');
const BotController = require('../src/api/controllers/BotController');

const botData = {
	twitterID: '12345',
	money: 0,
};

const coinTypes = ['💰', '💵', '💶', '💷', '💴', '💸', '💳'];

const {
	cleanup,
} = require('./helper');

test('Clean up', cleanup);

test('Donate Terence some money', async t => {
	const dbBot = await BotController.createOrFindBot(botData);
	t.ok(dbBot, 'A bot should be created in the database');
	const tweet = {
		text: 'here some 💰💰💰💵💶💷💴💸💳',
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = await terence.__tests.handleDonation(tweet, coinTypes);
	t.ok(result, 'A thank you tweet should be created');
	const tweetId = result.data.id_str;
	t.ok(tweetId, 'A tweet id should be found');
	const tweetText = result.data.text;
	t.comment(tweetText);
	t.ok(tweetText.includes('9'),
		'Tweet text should include number 9');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Thank you tweet should be deleted');
			t.end();
		});
});

test('Let @vnglst donate Terence some money again', async t => {
	const dbBot = await BotController.createOrFindBot(botData);
	t.ok(dbBot, 'A bot should be created in the database');
	const tweet = {
		text: '💵',
		user: {
			screen_name: 'vnglst',
		},
	};
	const result = await terence.__tests.handleDonation(tweet, coinTypes);

	const tweetId = result.data.id_str;
	const tweetText = result.data.text;
	t.ok(tweetText.includes('already donated'),
		'Should be a already donated tweet');
	terence.bot.destroy(tweetId)
		.then(delResult => {
			t.ok(delResult, 'Already donated tweet should be deleted');
			t.end();
		});
});

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
