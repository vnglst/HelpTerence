/**
 * Tests bot creation function
 */
const test = require('tape');

const app = require('../src/server');
const Bot = require('../src/api/models/Bot');
const BotController = require('../src/api/controllers/BotController');

const {
	cleanup,
} = require('./helper');

const botData = {
	twitterID: '12345',
};

test('Clean up', cleanup);

test('Checking if DB is empty', async t => {
	const bots = await Bot.find();
	t.equal(bots.length, 0, 'There should be 0 bots in db');
	t.end();
});

test('Creating bot', async t => {
	const createdBot = await BotController.createOrFindBot(botData);
	t.ok(createdBot, 'A bot should be created');
	const foundBot = await Bot.findOne();
	t.ok(foundBot, 'A bot should be found in db');
	t.equal(foundBot.twitterID, botData.twitterID, 'Bot found in db should be saved bot');
	t.end();
});

test('Creating bot again', async t => {
	const createdBot = await BotController.createOrFindBot(botData);
	t.ok(createdBot, 'A bot should be returned');
	const allBots = await Bot.find();
	t.equal(allBots.length, 1, 'There should be only 1 bot (no new bots created)');
	t.end();
});

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
