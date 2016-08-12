/**
 * Tests bot creation function
 */

const app = require('../server');
const test = require('tape');
const Bot = require('../api/models/Bot');
const BotController = require('../api/controllers/BotController');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

const {
	cleanup,
} = require('./helper');

const botData = {
	twitterID: '12345',
};

test('Clean up', cleanup);

test('Checking if DB is empty', asyncFn(t => {
	const bots = awaitFn(Bot.find());
	t.equal(bots.length, 0, 'There should be 0 bots in db');
	t.end();
}));

test('Creating bot', asyncFn(t => {
	const createdBot = awaitFn(BotController.createOrFindBot(botData));
	t.ok(createdBot, 'A bot should be created');
	const foundBot = awaitFn(Bot.findOne());
	t.ok(foundBot, 'A bot should be found in db');
	t.equal(foundBot.twitterID, botData.twitterID, 'Bot found in db should be saved bot');
	t.end();
}));

test('Creating bot again', asyncFn(t => {
	const createdBot = awaitFn(BotController.createOrFindBot(botData));
	t.ok(createdBot, 'A bot should be returned');
	const allBots = awaitFn(Bot.find());
	t.equal(allBots.length, 1, 'There should be only 1 bot (no new bots created)');
	t.end();
}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
