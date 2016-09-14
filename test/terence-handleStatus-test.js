const test = require('tape');
const moment = require('moment');

const app = require('../src/server');
const terence = require('../src/bot/terence');
const BotController = require('../src/api/controllers/BotController');
const DonationController = require('../src/api/controllers/DonationController');

const donationData = {
	fromTwitterID: 'abcde',
	createdAt: moment()
		.subtract(1, 'days')
		.toDate(),
	money: 10,
};

const botData = {
	twitterID: '12345',
	money: 0,
};

const {
	cleanup,
} = require('./helper');

test('Clean up', cleanup);

test('Ask Terence for a status report', async t => {
	const dbBot = await BotController.createOrFindBot(botData);
	t.ok(dbBot, 'A bot should be created in the database');
	const donatee = await DonationController.createDonation(donationData);
	t.ok(donatee, 'A donation should be created');
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

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
